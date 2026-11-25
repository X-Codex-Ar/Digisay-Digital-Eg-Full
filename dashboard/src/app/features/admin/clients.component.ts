import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminApiService, AdminOrganization } from '../../core/admin-api.service';

@Component({
  selector: 'ds-admin-clients',
  standalone: true,
  imports: [FormsModule, DatePipe],
  template: `
    <section class="grid gap-6" aria-labelledby="clients-title">
      <header>
        <span class="text-[.7rem] font-bold uppercase tracking-[.14em] text-muted-foreground"
          >Administration · Accounts</span
        >
        <h1 id="clients-title" class="mb-2 mt-2 text-3xl font-bold tracking-tight">
          Client organizations
        </h1>
        <p class="m-0 text-sm text-muted-foreground">
          Live organization accounts and active membership totals from the administration API.
        </p>
      </header>
      <form
        class="grid gap-3 rounded-2xl border border-border bg-card p-4 sm:grid-cols-[1fr_auto]"
        (ngSubmit)="load(1)"
      >
        <label class="grid gap-2 text-xs font-bold uppercase tracking-wide text-muted-foreground"
          >Search organizations
          <input
            class="rounded-xl border border-border bg-background px-3 py-2.5 text-sm font-normal normal-case tracking-normal"
            name="search"
            [(ngModel)]="search"
            maxlength="120"
            placeholder="Organization name"
          />
        </label>
        <button
          class="self-end rounded-xl border border-border px-4 py-2.5 text-sm font-bold disabled:opacity-50"
          [disabled]="busy()"
        >
          {{ busy() ? 'Loading…' : 'Search' }}
        </button>
      </form>
      @if (error()) {
        <div
          class="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm"
          role="alert"
        >
          {{ error() }}
        </div>
      }
      @if (!loaded() && busy()) {
        <p
          class="rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground"
          role="status"
        >
          Loading organization directory…
        </p>
      }
      @if (loaded() && organizations().length === 0 && !error()) {
        <p
          class="rounded-2xl border border-border bg-card p-8 text-center text-sm text-muted-foreground"
        >
          No matching client organizations.
        </p>
      }
      @if (organizations().length > 0) {
        <div class="overflow-hidden rounded-2xl border border-border bg-card">
          <div class="overflow-x-auto">
            <table class="w-full min-w-[560px] text-left text-sm">
              <thead class="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th class="px-4 py-3">Organization</th>
                  <th class="px-4 py-3">Active members</th>
                  <th class="px-4 py-3">Created</th>
                </tr>
              </thead>
              <tbody>
                @for (organization of organizations(); track organization.id) {
                  <tr class="border-t border-border">
                    <td class="px-4 py-4">
                      <strong>{{ organization.name }}</strong><span
                        class="mt-1 block font-mono text-[.68rem] text-muted-foreground"
                        >{{ organization.id }}</span
                      >
                    </td>
                    <td class="px-4 py-4">{{ organization.activeMemberCount }}</td>
                    <td class="px-4 py-4 text-muted-foreground">
                      {{ organization.createdAtUtc | date: 'mediumDate' }}
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
          <footer
            class="flex items-center justify-between border-t border-border px-4 py-3 text-xs text-muted-foreground"
          >
            <span
              >{{ totalCount() }} organization accounts · page {{ page() }} of
              {{ totalPages() }}</span
            >
            <div class="flex gap-2">
              <button
                class="rounded-lg border border-border px-3 py-2 disabled:opacity-50"
                [disabled]="page() <= 1 || busy()"
                (click)="load(page() - 1)"
              >
                Previous</button
              ><button
                class="rounded-lg border border-border px-3 py-2 disabled:opacity-50"
                [disabled]="page() >= totalPages() || busy()"
                (click)="load(page() + 1)"
              >
                Next
              </button>
            </div>
          </footer>
        </div>
      }
    </section>
  `,
})
export class ClientsComponent implements OnInit {
  private readonly api = inject(AdminApiService);
  search = '';
  readonly organizations = signal<AdminOrganization[]>([]);
  readonly loaded = signal(false);
  readonly busy = signal(false);
  readonly error = signal('');
  readonly totalCount = signal(0);
  readonly page = signal(1);
  readonly totalPages = signal(1);

  ngOnInit(): void {
    this.load(1);
  }

  load(page: number): void {
    if (this.busy()) return;
    this.busy.set(true);
    this.error.set('');
    this.api.listOrganizations(this.search, page).subscribe({
      next: (result) => {
        this.organizations.set(result.items);
        this.totalCount.set(result.totalCount);
        this.page.set(result.page);
        this.totalPages.set(Math.max(result.totalPages, 1));
        this.loaded.set(true);
        this.busy.set(false);
      },
      error: (error: unknown) => {
        this.error.set(
          error instanceof HttpErrorResponse && error.status === 403
            ? 'Your role cannot view the organization directory.'
            : error instanceof HttpErrorResponse && error.status === 401
              ? 'Your session expired. Sign in again to continue.'
              : 'The organization directory could not be loaded. Check the API and retry.',
        );
        this.loaded.set(true);
        this.busy.set(false);
      },
    });
  }
}
