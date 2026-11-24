import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, finalize, firstValueFrom, map, shareReplay, tap } from 'rxjs';
import './runtime-config';

export interface AuthUser {
  id: string;
  email: string;
  displayName: string | null;
  roles: string[];
}

export interface OrganizationMembership {
  id: string;
  name: string;
  membershipRole: string;
}

export type PortalAudience = 'Admin' | 'Client';

interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

const apiUrl = `${window.digisayRuntimeConfig?.apiBaseUrl?.replace(/\/$/, '') ?? 'http://localhost:5080'}/api/v1`;
const ADMIN_ROLES = new Set(['SuperAdmin', 'Admin', 'Manager']);

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private refreshRequest: Observable<void> | null = null;

  readonly user = signal<AuthUser | null>(null);
  readonly organizations = signal<OrganizationMembership[]>([]);
  readonly activeOrganizationId = signal<string | null>(null);
  readonly authenticated = signal(false);
  readonly isAdmin = signal(false);
  readonly isClient = signal(false);

  async signIn(email: string, password: string, audience: PortalAudience): Promise<void> {
    const tokens = await firstValueFrom(
      this.http.post<TokenResponse>(`${apiUrl}/auth/login?useCookies=false`, {
        email,
        password,
        twoFactorCode: null,
        twoFactorRecoveryCode: null,
      }),
    );
    this.accessToken = tokens.accessToken;
    this.refreshToken = tokens.refreshToken;

    try {
      const headers = this.authorizationHeaders();
      const [user, organizations] = await Promise.all([
        firstValueFrom(this.http.get<AuthUser>(`${apiUrl}/users/me`, { headers })),
        firstValueFrom(
          this.http.get<OrganizationMembership[]>(`${apiUrl}/organizations`, { headers }),
        ),
      ]);
      this.user.set(user);
      this.organizations.set(organizations);
      this.activeOrganizationId.set(organizations[0]?.id ?? null);
      this.isAdmin.set(user.roles.some((role) => ADMIN_ROLES.has(role)));
      this.isClient.set(user.roles.includes('Client'));
      this.authenticated.set(true);
      if (audience === 'Admin' && !this.isAdmin())
        throw new Error('Your account does not have an administrator role.');
      if (audience === 'Client' && !this.isClient())
        throw new Error('Your account does not have a client role.');
      if (organizations.length === 0)
        throw new Error(
          'Your account is not a member of an organization. Ask an administrator to grant access.',
        );
    } catch (error) {
      this.clearSession();
      throw error;
    }
  }

  signOut(): void {
    if (this.accessToken) {
      this.http
        .post<void>(`${apiUrl}/auth/sessions/revoke`, null, {
          headers: this.authorizationHeaders(),
        })
        .subscribe({ error: () => undefined });
    }
    this.clearSession();
  }

  authorizationHeaders(): HttpHeaders {
    let headers = new HttpHeaders();
    if (this.accessToken) headers = headers.set('Authorization', `Bearer ${this.accessToken}`);
    if (this.activeOrganizationId())
      headers = headers.set('X-Organization-Id', this.activeOrganizationId()!);
    return headers;
  }

  refreshAccessToken(): Observable<void> {
    if (this.refreshRequest) return this.refreshRequest;
    if (!this.refreshToken) throw new Error('No refresh token is available.');
    this.refreshRequest = this.http
      .post<TokenResponse>(`${apiUrl}/auth/refresh`, { refreshToken: this.refreshToken })
      .pipe(
        tap((tokens) => {
          this.accessToken = tokens.accessToken;
          this.refreshToken = tokens.refreshToken;
        }),
        map(() => void 0),
        shareReplay(1),
        finalize(() => {
          this.refreshRequest = null;
        }),
      );
    return this.refreshRequest;
  }

  private clearSession(): void {
    this.accessToken = null;
    this.refreshToken = null;
    this.user.set(null);
    this.organizations.set([]);
    this.activeOrganizationId.set(null);
    this.authenticated.set(false);
    this.isAdmin.set(false);
    this.isClient.set(false);
  }
}
