import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminApiService, AdminUser } from '../../core/admin-api.service';
import { AuthService } from '../../core/auth.service';

const ROLES = [
  'SuperAdmin',
  'Admin',
  'Manager',
  'Sales',
  'ContentManager',
  'MarketingManager',
  'ProductionManager',
  'RightsManager',
  'Finance',
  'Support',
  'Client',
];

@Component({
  selector: 'ds-admin-team',
  standalone: true,
  imports: [FormsModule],
  template: `
    <section class="grid gap-6" aria-labelledby="team-title">
      <header>
        <span class="text-[.7rem] font-bold uppercase tracking-[.14em] text-muted-foreground"
          >Administration · Access</span
        >
        <h1 id="team-title" class="mb-2 mt-2 text-3xl font-bold tracking-tight">Teams & people</h1>
        <p class="m-0 text-sm text-muted-foreground">
          Manage account roles and revoke sessions. Role administration is restricted to
          SuperAdmins.
        </p>
      </header>
      @if (!isSuperAdmin()) {
        <div
          class="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 text-sm"
          role="alert"
        >
          Only a SuperAdmin can view and manage the account directory. Ask a SuperAdmin to change
          roles or revoke sessions.
        </div>
      }
      @if (notice()) {
        <p class="rounded-xl border border-primary/25 bg-primary/10 p-4 text-sm" role="status">
          {{ notice() }}
        </p>
      }
      @if (error()) {
        <p
          class="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm"
          role="alert"
        >
          {{ error() }}
        </p>
      }
      @if (isSuperAdmin()) {
        <form
          class="grid gap-3 rounded-2xl border border-border bg-card p-4 sm:grid-cols-[1fr_auto]"
          (ngSubmit)="load()"
        >
          <label class="grid gap-2 text-xs font-bold uppercase tracking-wide text-muted-foreground"
            >Search by email<input
              class="rounded-xl border border-border bg-background px-3 py-2.5 text-sm font-normal normal-case tracking-normal"
              name="search"
              [(ngModel)]="search"
              maxlength="256"
              placeholder="name@example.com" /></label
          ><button
            class="self-end rounded-xl border border-border px-4 py-2.5 text-sm font-bold"
            [disabled]="busy()"
          >
            {{ busy() ? 'Loading…' : 'Search' }}
          </button>
        </form>
        @if (!loaded() && busy()) {
          <p
            class="rounded-xl border border-border bg-card p-5 text-sm text-muted-foreground"
            role="status"
          >
            Loading accounts…
          </p>
        }
        @if (loaded() && users().length === 0 && !error()) {
          <p
            class="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground"
          >
            No accounts match this search.
          </p>
        }
        <div class="grid gap-4">
          @for (user of users(); track user.id) {
            <article class="grid gap-4 rounded-2xl border border-border bg-card p-5">
              <header class="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 class="m-0 text-base font-bold">{{ user.displayName || user.email }}</h2>
                  <p class="mb-0 mt-1 text-sm text-muted-foreground">
                    {{ user.email }} ·
                    {{ user.emailConfirmed ? 'Email confirmed' : 'Email unconfirmed' }}
                  </p>
                </div>
                <button
                  class="rounded-lg border border-border px-3 py-2 text-xs font-bold text-destructive disabled:opacity-50"
                  [disabled]="busy() || user.id === currentUserId()"
                  (click)="revoke(user)"
                >
                  Revoke sessions
                </button>
              </header>
              <div class="flex flex-wrap gap-x-5 gap-y-2">
                @for (role of roles; track role) {
                  <label class="inline-flex items-center gap-2 text-xs"
                    ><input
                      type="checkbox"
                      [checked]="hasRole(user, role)"
                      (change)="toggleRole(user, role, $any($event.target).checked)"
                    />{{ role }}</label
                  >
                }
              </div>
              <div class="flex justify-end">
                <button
                  class="rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground disabled:opacity-50"
                  [disabled]="busy() || !draftChanged(user)"
                  (click)="saveRoles(user)"
                >
                  Save roles
                </button>
              </div>
            </article>
          }
        </div>
      }
    </section>
  `,
})
export class TeamComponent implements OnInit {
  private readonly api = inject(AdminApiService);
  private readonly auth = inject(AuthService);
  readonly roles = ROLES;
  search = '';
  readonly users = signal<AdminUser[]>([]);
  readonly drafts = signal<Record<string, string[]>>({});
  readonly busy = signal(false);
  readonly loaded = signal(false);
  readonly error = signal('');
  readonly notice = signal('');
  readonly isSuperAdmin = () => this.auth.user()?.roles.includes('SuperAdmin') ?? false;
  readonly currentUserId = () => this.auth.user()?.id ?? '';

  ngOnInit(): void {
    if (this.isSuperAdmin()) this.load();
  }

  load(): void {
    if (this.busy() || !this.isSuperAdmin()) return;
    this.busy.set(true);
    this.error.set('');
    this.notice.set('');
    this.api.listUsers(this.search).subscribe({
      next: (result) => {
        this.users.set(result.users);
        this.drafts.set(Object.fromEntries(result.users.map((user) => [user.id, [...user.roles]])));
        this.loaded.set(true);
        this.busy.set(false);
      },
      error: (error: unknown) => {
        this.error.set(
          error instanceof HttpErrorResponse && error.status === 403
            ? 'Your role cannot manage accounts.'
            : 'The account directory could not be loaded. Check the API and retry.',
        );
        this.loaded.set(true);
        this.busy.set(false);
      },
    });
  }

  hasRole(user: AdminUser, role: string): boolean {
    return (this.drafts()[user.id] ?? user.roles).includes(role);
  }
  draftChanged(user: AdminUser): boolean {
    return (
      [...(this.drafts()[user.id] ?? user.roles)].sort().join('|') !==
      [...user.roles].sort().join('|')
    );
  }
  toggleRole(user: AdminUser, role: string, checked: boolean): void {
    this.drafts.update((drafts) => {
      const current = drafts[user.id] ?? [...user.roles];
      const next = checked ? [...current, role] : current.filter((item) => item !== role);
      return { ...drafts, [user.id]: next };
    });
  }

  saveRoles(user: AdminUser): void {
    if (!this.draftChanged(user) || this.busy()) return;
    this.busy.set(true);
    this.error.set('');
    this.api.replaceRoles(user.id, this.drafts()[user.id] ?? []).subscribe({
      next: (result) => {
        this.users.update((users) =>
          users.map((item) => (item.id === user.id ? { ...item, roles: result.roles } : item)),
        );
        this.notice.set(`Roles updated for ${user.email}. Active sessions were revoked.`);
        this.busy.set(false);
      },
      error: (error: unknown) => {
        this.error.set(
          error instanceof HttpErrorResponse && error.status === 409
            ? 'The last SuperAdmin role cannot be removed.'
            : 'Roles could not be saved. Check permissions and try again.',
        );
        this.busy.set(false);
      },
    });
  }

  revoke(user: AdminUser): void {
    if (this.busy() || user.id === this.currentUserId()) return;
    this.busy.set(true);
    this.error.set('');
    this.api.revokeSessions(user.id).subscribe({
      next: () => {
        this.notice.set(`All active sessions for ${user.email} were revoked.`);
        this.busy.set(false);
      },
      error: () => {
        this.error.set(`Sessions for ${user.email} could not be revoked.`);
        this.busy.set(false);
      },
    });
  }
}
