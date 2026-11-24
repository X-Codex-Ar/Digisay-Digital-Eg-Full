import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, PortalAudience } from '../../core/auth.service';

@Component({
  selector: 'ds-portal-sign-in',
  imports: [FormsModule],
  template: `
    <main class="grid min-h-screen place-items-center bg-background p-5 text-foreground">
      <form
        class="grid w-full max-w-md gap-5 rounded-3xl border border-border bg-card p-7 shadow-card"
        (ngSubmit)="submit()"
        aria-labelledby="sign-in-title"
      >
        <div>
          <span class="text-xs font-bold uppercase tracking-[.14em] text-primary"
            >DigiSay {{ audience() }} portal</span
          >
          <h1 id="sign-in-title" class="mb-2 mt-3 text-3xl font-bold">Sign in</h1>
          <p class="m-0 text-sm text-muted-foreground">
            Use your {{ audience().toLowerCase() }} account to open the workspace.
          </p>
        </div>
        @if (error()) {
          <p
            class="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
            role="alert"
          >
            {{ error() }}
          </p>
        }
        <label class="grid gap-2 text-sm font-semibold"
          >Email<input
            class="rounded-xl border border-border bg-background px-3 py-3 font-normal"
            type="email"
            name="email"
            [(ngModel)]="email"
            autocomplete="username"
            required
        /></label>
        <label class="grid gap-2 text-sm font-semibold"
          >Password<input
            class="rounded-xl border border-border bg-background px-3 py-3 font-normal"
            type="password"
            name="password"
            [(ngModel)]="password"
            autocomplete="current-password"
            required
        /></label>
        <button
          class="rounded-xl bg-primary px-4 py-3 font-bold text-primary-foreground disabled:opacity-60"
          type="submit"
          [disabled]="busy()"
        >
          {{ busy() ? 'Signing in…' : 'Sign in securely' }}
        </button>
        <p class="m-0 text-xs leading-relaxed text-muted-foreground">
          Access tokens stay in memory and are cleared when this page is reloaded.
        </p>
      </form>
    </main>
  `,
})
export class PortalSignInComponent {
  readonly audience = input.required<PortalAudience>();
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  email = '';
  password = '';
  readonly busy = signal(false);
  readonly error = signal('');

  async submit(): Promise<void> {
    if (this.busy()) return;
    this.busy.set(true);
    this.error.set('');
    try {
      await this.auth.signIn(this.email.trim(), this.password, this.audience());
      await this.router.navigateByUrl(
        this.audience() === 'Admin' ? '/admin/overview' : '/client/overview',
      );
    } catch (error) {
      this.error.set(
        error instanceof HttpErrorResponse
          ? error.status === 401
            ? 'Email or password is incorrect, or the account is not confirmed.'
            : error.status === 403
              ? `Your account does not have permission to use the ${this.audience().toLowerCase()} portal.`
              : 'The API could not complete sign in. Check the connection and try again.'
          : error instanceof Error
            ? error.message
            : 'Sign in failed. Please try again.',
      );
    } finally {
      this.busy.set(false);
    }
  }
}
