import { Component, computed, inject, input, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { catchError, forkJoin, of } from 'rxjs';
import { ApiHealthService } from '../../core/api-health.service';
import { AuthService } from '../../core/auth.service';
import { CrmApiService } from '../crm/crm-api.service';
import { OrganizationSelectorComponent } from '../../shared/organization-selector/organization-selector.component';

@Component({
  selector: 'ds-overview',
  imports: [FormsModule, RouterLink, OrganizationSelectorComponent],
  template: `
    <section class="grid gap-8" aria-labelledby="overview-title">
      <div class="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span class="text-[.7rem] font-bold uppercase tracking-[.14em] text-muted-foreground">
            {{ audience() }} WORKSPACE
          </span>
          <h1
            id="overview-title"
            class="mb-2 mt-2 text-4xl font-bold tracking-tight text-foreground max-[600px]:text-3xl"
          >
            Your work, in one place.
          </h1>
          <p class="m-0 text-muted-foreground">
            A live summary of the workspace modules currently connected to DigiSay.
          </p>
          <ds-organization-selector
            class="mt-4 block max-w-sm"
            [organizations]="organizations()"
            [selectedId]="activeOrganizationId()"
            [disabled]="summaryLoading()"
            [hint]="
              organizations().length > 1
                ? 'Dashboard totals refresh for the selected organization.'
                : 'Only one organization is assigned to this account.'
            "
            labelClass="grid gap-2 text-xs font-bold uppercase tracking-wide text-muted-foreground"
            (selectionChange)="selectOrganization($event)"
          />
        </div>
        <span
          class="flex shrink-0 items-center gap-2 rounded-full border border-border bg-card px-3 py-2 text-xs text-muted-foreground"
        >
          <span class="status-dot"></span>API {{ apiHealth.status() }}
        </span>
      </div>

      <div
        class="welcome-panel relative flex min-h-[220px] items-center justify-between overflow-hidden rounded-3xl bg-foreground px-9 py-8 text-background max-[600px]:min-h-[230px] max-[600px]:px-5"
      >
        <div class="panel-copy relative z-10 max-w-lg">
          <span class="text-[.68rem] font-bold tracking-[.16em] text-rose-300"
            >DIGISAY DIGITAL PLATFORM</span
          >
          <h2
            class="my-3 max-w-md text-4xl font-bold leading-tight tracking-tight max-[600px]:text-3xl"
          >
            A clearer view of every moving part.
          </h2>
          <p class="max-w-md text-sm leading-relaxed text-background/70">
            Your organization and CRM records are loaded from the authenticated API. Other workspace
            areas will become available as their backend workflows are delivered.
          </p>
          <a
            class="mt-4 inline-flex items-center gap-3 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground no-underline transition-transform hover:-translate-y-0.5"
            [routerLink]="audience() === 'Admin' ? '/admin/leads' : '/client/requests'"
          >
            {{ audience() === 'Admin' ? 'Open leads' : 'Open service requests' }}
            <span aria-hidden="true">→</span>
          </a>
        </div>
        <div
          class="orbit-art relative mr-[3%] grid size-[210px] shrink-0 place-items-center opacity-80 max-[850px]:mr-0 max-[850px]:scale-90 max-[600px]:absolute max-[600px]:-bottom-9 max-[600px]:-right-14 max-[600px]:opacity-30"
          aria-hidden="true"
        >
          <span class="orbit orbit-one"></span><span class="orbit orbit-two"></span
          ><span class="orbit orbit-three"></span>
          <span class="orbit-core"
            ><img src="favicon.svg" alt="" class="size-8 object-contain"
          /></span>
        </div>
      </div>

      <div>
        <div class="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <span class="text-[.7rem] font-bold uppercase tracking-[.14em] text-muted-foreground"
              >LIVE WORKSPACE DATA</span
            >
            <h2 class="mb-0 mt-1 text-xl font-bold tracking-tight text-foreground">
              Connected modules
            </h2>
          </div>
          <button
            type="button"
            class="rounded-xl border border-border bg-card px-3 py-2 text-sm font-semibold"
            (click)="loadSummary()"
            [disabled]="summaryLoading()"
          >
            {{ summaryLoading() ? 'Refreshing…' : 'Refresh' }}
          </button>
        </div>

        @if (summaryLoading() && !summaryLoaded()) {
          <div
            class="rounded-2xl border border-border bg-card p-5 text-sm text-muted-foreground"
            role="status"
          >
            Loading workspace data…
          </div>
        } @else {
          <div class="grid gap-3 sm:grid-cols-2">
            @if (audience() === 'Admin') {
              <a
                class="rounded-2xl border border-border bg-card p-5 text-foreground no-underline shadow-card transition-colors hover:border-primary/40"
                routerLink="/admin/leads"
              >
                <span class="text-sm text-muted-foreground">Organization leads</span>
                <strong class="mt-2 block text-3xl">{{ leadCount() ?? 'Unavailable' }}</strong>
                <span class="mt-2 block text-xs text-muted-foreground">Open lead management</span>
              </a>
            }
            <a
              class="rounded-2xl border border-border bg-card p-5 text-foreground no-underline shadow-card transition-colors hover:border-primary/40"
              [routerLink]="audience() === 'Admin' ? '/admin/requests' : '/client/requests'"
            >
              <span class="text-sm text-muted-foreground">Service requests</span>
              <strong class="mt-2 block text-3xl">{{
                serviceRequestCount() ?? 'Unavailable'
              }}</strong>
              <span class="mt-2 block text-xs text-muted-foreground">Open request management</span>
            </a>
          </div>
          @if (summaryError()) {
            <p class="mb-0 mt-3 text-sm text-destructive" role="status">
              Some totals could not be loaded. Use Refresh to retry; unavailable data is not shown
              as zero.
            </p>
          }
        }
      </div>

      <div>
        <span class="text-[.7rem] font-bold uppercase tracking-[.14em] text-muted-foreground"
          >WORKSPACE AREAS</span
        >
        <h2 class="mb-4 mt-1 text-xl font-bold tracking-tight text-foreground">
          Start with a section
        </h2>
        <div class="grid grid-cols-3 gap-3 max-[850px]:grid-cols-2 max-[600px]:grid-cols-1">
          @for (area of areas(); track area.path) {
            <a
              class="group flex min-h-[86px] items-center gap-3 rounded-2xl border border-border bg-card p-4 text-foreground no-underline shadow-card transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg"
              [routerLink]="area.path"
            >
              <span
                class="grid size-10 shrink-0 place-items-center rounded-xl bg-accent text-xs font-extrabold text-accent-foreground"
                >{{ area.mark }}</span
              >
              <span class="grid min-w-0 gap-1"
                ><strong class="text-sm">{{ area.title }}</strong
                ><small class="text-xs leading-snug text-muted-foreground">{{
                  area.description
                }}</small></span
              >
              <span
                class="ml-auto text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                aria-hidden="true"
                >↗</span
              >
            </a>
          }
        </div>
      </div>
    </section>
  `,
  styles: `
    .welcome-panel::before {
      position: absolute;
      inset: 0;
      content: '';
      background: radial-gradient(
        ellipse at 78% 45%,
        color-mix(in oklab, var(--color-primary) 34%, transparent),
        transparent 38%
      );
    }
    .orbit {
      position: absolute;
      border: 1px solid color-mix(in oklab, var(--color-primary) 32%, transparent);
      border-radius: 50%;
    }
    .orbit-one {
      width: 200px;
      height: 200px;
    }
    .orbit-two {
      width: 150px;
      height: 150px;
    }
    .orbit-three {
      width: 98px;
      height: 98px;
    }
    .orbit-core {
      display: grid;
      width: 58px;
      height: 58px;
      place-items: center;
      border-radius: 19px;
      background: linear-gradient(135deg, #f34868, #b10828);
      box-shadow: 0 0 45px color-mix(in oklab, var(--color-primary) 45%, transparent);
      font-size: 1.8rem;
      font-weight: 850;
    }
  `,
})
export class OverviewComponent implements OnInit {
  readonly apiHealth = inject(ApiHealthService);
  private readonly api = inject(CrmApiService);
  private readonly auth = inject(AuthService);
  readonly audience = input.required<'Client' | 'Admin'>();
  readonly areas =
    input.required<readonly { title: string; description: string; path: string; mark: string }[]>();
  readonly organizations = this.auth.organizations;
  readonly activeOrganizationId = this.auth.activeOrganizationId;
  readonly summaryLoading = signal(false);
  readonly summaryLoaded = signal(false);
  readonly summaryError = signal(false);
  readonly leadCount = signal<number | null>(null);
  readonly serviceRequestCount = signal<number | null>(null);

  ngOnInit(): void {
    this.loadSummary();
  }

  selectOrganization(organizationId: string): void {
    if (!this.organizations().some((organization) => organization.id === organizationId)) return;
    this.activeOrganizationId.set(organizationId);
    this.summaryLoaded.set(false);
    this.loadSummary();
  }

  loadSummary(): void {
    if (this.summaryLoading()) return;
    this.summaryLoading.set(true);
    this.summaryError.set(false);
    this.leadCount.set(null);
    this.serviceRequestCount.set(null);

    const requests$ = this.api.listRequests(1).pipe(catchError(() => of(null)));
    if (this.audience() === 'Admin') {
      forkJoin({
        leads: this.api.list('leads', 1).pipe(catchError(() => of(null))),
        requests: requests$,
      }).subscribe(({ leads, requests }) => {
        this.leadCount.set(leads?.totalCount ?? null);
        this.serviceRequestCount.set(requests?.totalCount ?? null);
        this.finishSummary(leads === null || requests === null);
      });
      return;
    }

    requests$.subscribe((requests) => {
      this.serviceRequestCount.set(requests?.totalCount ?? null);
      this.finishSummary(requests === null);
    });
  }

  private finishSummary(hasError: boolean): void {
    this.summaryError.set(hasError);
    this.summaryLoading.set(false);
    this.summaryLoaded.set(true);
  }
}
