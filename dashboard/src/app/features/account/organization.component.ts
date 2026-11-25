import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/auth.service';
import { OrganizationSelectorComponent } from '../../shared/organization-selector/organization-selector.component';

@Component({
  selector: 'ds-organization-page',
  standalone: true,
  imports: [FormsModule, OrganizationSelectorComponent],
  template: `
    <section class="grid max-w-3xl gap-6" aria-labelledby="organization-title">
      <header>
        <span class="text-[.7rem] font-bold uppercase tracking-[.14em] text-muted-foreground"
          >Workspace</span
        >
        <h1 id="organization-title" class="mb-2 mt-2 text-3xl font-bold tracking-tight">
          Organization
        </h1>
        <p class="m-0 text-sm text-muted-foreground">
          Select an organization you belong to or create a new organization account.
        </p>
      </header>
      <ds-organization-selector
        class="block max-w-xl"
        [organizations]="organizations()"
        [selectedId]="activeId()"
        [showMembershipRole]="true"
        labelClass="grid gap-2 text-xs font-bold uppercase tracking-wide text-muted-foreground"
        (selectionChange)="select($event)"
      />
      @if (organizations().length === 0) {
        <p class="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm">
          This account has no active organization memberships.
        </p>
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
      <form
        class="grid gap-3 rounded-2xl border border-border bg-card p-5 sm:grid-cols-[1fr_auto]"
        (ngSubmit)="create()"
      >
        <label class="grid gap-2 text-xs font-bold uppercase tracking-wide text-muted-foreground"
          >Create organization<input
            class="rounded-xl border border-border bg-background px-3 py-2.5 text-sm font-normal normal-case tracking-normal"
            name="organizationName"
            [(ngModel)]="name"
            maxlength="120"
            minlength="2"
            required
            placeholder="Organization name" /></label
        ><button
          class="self-end rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground disabled:opacity-50"
          [disabled]="busy()"
        >
          {{ busy() ? 'Creating…' : 'Create organization' }}
        </button>
      </form>
      <p class="m-0 text-xs text-muted-foreground">
        Creating an organization makes your account its Owner. The backend does not yet expose
        membership invitations or team management for client organizations.
      </p>
    </section>
  `,
})
export class OrganizationComponent {
  private readonly auth = inject(AuthService);
  readonly organizations = this.auth.organizations;
  readonly activeId = this.auth.activeOrganizationId;
  name = '';
  readonly busy = signal(false);
  readonly error = signal('');
  readonly notice = signal('');

  select(id: string): void {
    if (this.organizations().some((item) => item.id === id)) this.activeId.set(id);
  }

  create(): void {
    const name = this.name.trim();
    if (!name || this.busy()) return;
    this.busy.set(true);
    this.error.set('');
    this.notice.set('');
    this.auth.createOrganization(name).subscribe({
      next: () => {
        this.name = '';
        this.notice.set('Organization created. Your account is its Owner, and it is now selected.');
        this.busy.set(false);
      },
      error: (error: unknown) => {
        this.error.set(
          error instanceof HttpErrorResponse && error.status === 400
            ? 'Enter an organization name between 2 and 120 characters.'
            : 'The organization could not be created. Check the API and try again.',
        );
        this.busy.set(false);
      },
    });
  }
}
