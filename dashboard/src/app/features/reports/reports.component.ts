import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import { AuthService } from '../../core/auth.service';
import { OrganizationSelectorComponent } from '../../shared/organization-selector/organization-selector.component';
import { ReportsApiService, WorkspaceReport } from './reports-api.service';

@Component({
  selector: 'ds-reports',
  standalone: true,
  imports: [DatePipe, OrganizationSelectorComponent],
  template: `
    <section class="grid gap-6" aria-labelledby="reports-title">
      <header class="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span class="text-[.7rem] font-bold uppercase tracking-[.14em] text-muted-foreground"
            >Analytics · CRM</span
          >
          <h1 id="reports-title" class="mb-2 mt-2 text-3xl font-bold tracking-tight">
            Workspace reports
          </h1>
          <p class="m-0 text-sm text-muted-foreground">
            Live CRM totals for the selected organization. The recent period covers the last 30
            days.
          </p>
        </div>
        <button
          class="rounded-xl border border-border px-4 py-2.5 text-sm font-bold disabled:opacity-50"
          [disabled]="busy()"
          (click)="load()"
        >
          {{ busy() ? 'Refreshing…' : 'Refresh report' }}
        </button>
      </header>
      <ds-organization-selector
        [organizations]="auth.organizations()"
        [selectedId]="auth.activeOrganizationId()"
        [showMembershipRole]="true"
        labelClass="grid max-w-xl gap-2 text-xs font-bold uppercase tracking-wide text-muted-foreground"
        (selectionChange)="selectOrganization($event)"
      />
      @if (error()) {
        <div
          class="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm"
          role="alert"
        >
          {{ error() }}
        </div>
      }
      @if (busy() && !report()) {
        <p
          class="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground"
          role="status"
        >
          Loading organization report…
        </p>
      }
      @if (report(); as data) {
        <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          @if (data.leadTotal !== null) {
            <article class="rounded-2xl border border-border bg-card p-5">
              <span class="text-xs text-muted-foreground">Total leads</span
              ><strong class="mt-2 block text-3xl">{{ data.leadTotal }}</strong
              ><small class="text-muted-foreground"
                >{{ data.leadsCreatedLast30Days }} created in 30 days</small
              >
            </article>
          }
          <article class="rounded-2xl border border-border bg-card p-5">
            <span class="text-xs text-muted-foreground">Service requests</span
            ><strong class="mt-2 block text-3xl">{{ data.serviceRequestTotal }}</strong
            ><small class="text-muted-foreground"
              >{{ data.serviceRequestsCreatedLast30Days }} created in 30 days</small
            >
          </article>
        </div>
        <div class="grid gap-4 lg:grid-cols-2">
          <article class="rounded-2xl border border-border bg-card p-5">
            <h2 class="m-0 text-base font-bold">Lead lifecycle</h2>
            @if (data.leadsByStatus.length === 0) {
              <p class="mb-0 mt-4 text-sm text-muted-foreground">
                No lead records for this organization.
              </p>
            }
            @for (item of data.leadsByStatus; track item.status) {
              <div class="mt-4 grid grid-cols-[1fr_auto] gap-2 text-sm">
                <span>{{ display(item.status) }}</span><strong>{{ item.count }}</strong>
                <div class="col-span-2 h-2 overflow-hidden rounded-full bg-muted">
                  <span
                    class="block h-full rounded-full bg-primary"
                    [style.width.%]="bar(item.count, max(data.leadsByStatus))"
                  ></span>
                </div>
              </div>
            }
          </article>
          <article class="rounded-2xl border border-border bg-card p-5">
            <h2 class="m-0 text-base font-bold">Service request lifecycle</h2>
            @if (data.serviceRequestsByStatus.length === 0) {
              <p class="mb-0 mt-4 text-sm text-muted-foreground">
                No service requests for this organization.
              </p>
            }
            @for (item of data.serviceRequestsByStatus; track item.status) {
              <div class="mt-4 grid grid-cols-[1fr_auto] gap-2 text-sm">
                <span>{{ display(item.status) }}</span><strong>{{ item.count }}</strong>
                <div class="col-span-2 h-2 overflow-hidden rounded-full bg-muted">
                  <span
                    class="block h-full rounded-full bg-primary"
                    [style.width.%]="bar(item.count, max(data.serviceRequestsByStatus))"
                  ></span>
                </div>
              </div>
            }
          </article>
        </div>
        <p class="m-0 text-xs text-muted-foreground">
          Generated {{ data.generatedAtUtc | date: 'medium' }} · data is scoped to the selected
          organization.
        </p>
      }
    </section>
  `,
})
export class ReportsComponent implements OnInit {
  readonly auth = inject(AuthService);
  private readonly api = inject(ReportsApiService);
  readonly report = signal<WorkspaceReport | null>(null);
  readonly busy = signal(false);
  readonly error = signal('');

  ngOnInit(): void {
    this.load();
  }
  selectOrganization(id: string): void {
    if (this.auth.organizations().some((item) => item.id === id)) {
      this.auth.activeOrganizationId.set(id);
      this.load();
    }
  }
  display(status: string): string {
    return status.replace(/([a-z])([A-Z])/g, '$1 $2');
  }
  max(items: { count: number }[]): number {
    return Math.max(...items.map((item) => item.count), 1);
  }
  bar(value: number, maximum: number): number {
    return Math.max((value / maximum) * 100, value > 0 ? 4 : 0);
  }

  load(): void {
    if (this.busy()) return;
    this.busy.set(true);
    this.error.set('');
    this.api.workspace().subscribe({
      next: (report) => {
        this.report.set(report);
        this.busy.set(false);
      },
      error: (error: unknown) => {
        this.error.set(
          error instanceof HttpErrorResponse && error.status === 403
            ? 'Your account cannot view this organization report.'
            : 'The workspace report could not be loaded. Check API access and retry.',
        );
        this.busy.set(false);
      },
    });
  }
}
