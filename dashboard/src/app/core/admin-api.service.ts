import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { AuthService } from './auth.service';
import { apiUrl } from './api-url';

export interface AdminOrganization {
  id: string;
  name: string;
  createdAtUtc: string;
  activeMemberCount: number;
}

export interface AdminOrganizationPage {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  items: AdminOrganization[];
}

export interface AdminUser {
  id: string;
  email: string;
  displayName: string | null;
  emailConfirmed: boolean;
  roles: string[];
}

@Injectable({ providedIn: 'root' })
export class AdminApiService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);

  listOrganizations(search = '', page = 1) {
    const query = new URLSearchParams({ page: String(page), pageSize: '25' });
    if (search.trim()) query.set('search', search.trim());
    return this.http.get<AdminOrganizationPage>(apiUrl(`admin/organizations?${query}`), {
      headers: this.auth.authorizationHeaders(),
    });
  }

  listUsers(search = '') {
    const query = new URLSearchParams({ page: '1', pageSize: '50' });
    if (search.trim()) query.set('search', search.trim());
    return this.http.get<{ users: AdminUser[] }>(apiUrl(`admin/users?${query}`), {
      headers: this.auth.authorizationHeaders(),
    });
  }

  replaceRoles(userId: string, roles: string[]) {
    return this.http.put<{ userId: string; roles: string[] }>(
      apiUrl(`admin/users/${userId}/roles`),
      { roles },
      { headers: this.auth.authorizationHeaders() },
    );
  }

  revokeSessions(userId: string) {
    return this.http.post<void>(apiUrl(`admin/users/${userId}/revoke-sessions`), null, {
      headers: this.auth.authorizationHeaders(),
    });
  }
}
