import { Component, inject } from '@angular/core';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'ds-profile',
  standalone: true,
  template: `
    <section class="grid max-w-3xl gap-6" aria-labelledby="profile-title">
      <header>
        <span class="text-[.7rem] font-bold uppercase tracking-[.14em] text-muted-foreground"
          >Account</span
        >
        <h1 id="profile-title" class="mb-2 mt-2 text-3xl font-bold tracking-tight">Profile</h1>
        <p class="m-0 text-sm text-muted-foreground">
          Your authenticated profile information from DigiSay Identity.
        </p>
      </header>
      @if (user(); as account) {
        <article class="grid gap-4 rounded-2xl border border-border bg-card p-5">
          <div>
            <span class="text-xs font-bold uppercase tracking-wide text-muted-foreground"
              >Display name</span
            >
            <p class="mb-0 mt-1 font-semibold">{{ account.displayName || 'Not set' }}</p>
          </div>
          <div>
            <span class="text-xs font-bold uppercase tracking-wide text-muted-foreground"
              >Email</span
            >
            <p class="mb-0 mt-1 font-semibold">{{ account.email }}</p>
          </div>
          <div>
            <span class="text-xs font-bold uppercase tracking-wide text-muted-foreground"
              >Account ID</span
            >
            <p class="mb-0 mt-1 break-all font-mono text-xs">{{ account.id }}</p>
          </div>
          <div>
            <span class="text-xs font-bold uppercase tracking-wide text-muted-foreground"
              >Application roles</span
            >
            <div class="mt-2 flex flex-wrap gap-2">
              @for (role of account.roles; track role) {
                <span
                  class="rounded-full bg-accent px-3 py-1 text-xs font-bold text-accent-foreground"
                  >{{ role }}</span
                >
              }
            </div>
          </div>
          <p class="m-0 border-t border-border pt-4 text-xs text-muted-foreground">
            Profile editing is not available yet; the backend currently exposes read-only profile
            data.
          </p>
        </article>
      } @else {
        <p
          class="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm"
          role="alert"
        >
          No signed-in profile is available. Sign in again to refresh your session.
        </p>
      }
    </section>
  `,
})
export class ProfileComponent {
  private readonly auth = inject(AuthService);
  readonly user = this.auth.user;
}
