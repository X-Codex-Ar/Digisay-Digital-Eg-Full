import { Component, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiHealthService } from '../../core/api-health.service';

@Component({
  selector: 'ds-overview',
  imports: [RouterLink],
  template: `
    <section class="grid gap-8" aria-labelledby="overview-title">
      <div class="flex items-end justify-between gap-4 max-[600px]:items-start max-[600px]:flex-col">
        <div><span class="text-[.7rem] font-bold uppercase tracking-[.14em] text-muted-foreground">{{ audience() }} WORKSPACE</span><h1 id="overview-title" class="mb-2 mt-2 text-4xl font-bold tracking-tight text-foreground max-[600px]:text-3xl">Your work, in one place.</h1><p class="m-0 text-muted-foreground">Projects, requests, and updates will appear here when your workspace is connected.</p></div>
        <span class="flex shrink-0 items-center gap-2 rounded-full border border-border bg-card px-3 py-2 text-xs text-muted-foreground"><span class="status-dot"></span>API {{ apiHealth.status() }}</span>
      </div>
      <div class="welcome-panel relative flex min-h-[248px] items-center justify-between overflow-hidden rounded-3xl bg-foreground px-9 py-8 text-background max-[600px]:min-h-[230px] max-[600px]:px-5">
        <div class="panel-copy relative z-10 max-w-lg">
          <span class="text-[.68rem] font-bold tracking-[.16em] text-rose-300">DIGISAY DIGITAL PLATFORM</span>
          <h2 class="my-3 max-w-md text-4xl font-bold leading-tight tracking-tight max-[600px]:text-3xl">A clearer view of every moving part.</h2>
          <p class="max-w-md text-sm leading-relaxed text-background/70">The dashboard is ready for live workspace data. This preview does not contain sample or shared client information.</p>
          <p class="mt-2 text-xs text-background/65">Live API connection: {{ apiHealth.status() }}. Business records will appear after authenticated API modules are enabled.</p>
          <a class="mt-3 inline-flex items-center gap-3 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground no-underline transition-transform hover:-translate-y-0.5" [routerLink]="audience() === 'Admin' ? '/admin/leads' : '/client/requests'">Explore workspace <span aria-hidden="true">→</span></a>
        </div>
        <div class="orbit-art relative mr-[3%] grid size-[210px] shrink-0 place-items-center opacity-80 max-[850px]:mr-0 max-[850px]:scale-90 max-[600px]:absolute max-[600px]:-bottom-9 max-[600px]:-right-14 max-[600px]:opacity-30" aria-hidden="true"><span class="orbit orbit-one"></span><span class="orbit orbit-two"></span><span class="orbit orbit-three"></span><span class="orbit-core"><img src="favicon.svg" alt="DigiSay" class="size-8 object-contain" /></span></div>
      </div>
      <div><span class="text-[.7rem] font-bold uppercase tracking-[.14em] text-muted-foreground">WORKSPACE AREAS</span><h2 class="mb-4 mt-1 text-xl font-bold tracking-tight text-foreground">Start with a section</h2>
      <div class="grid grid-cols-3 gap-3 max-[850px]:grid-cols-2 max-[600px]:grid-cols-1">
        @for (area of areas(); track area.path) {
          <a class="group flex min-h-[86px] items-center gap-3 rounded-2xl border border-border bg-card p-4 text-foreground no-underline shadow-card transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg" [routerLink]="area.path"><span class="grid size-10 shrink-0 place-items-center rounded-xl bg-accent text-xs font-extrabold text-accent-foreground">{{ area.mark }}</span><span class="grid min-w-0 gap-1"><strong class="text-sm">{{ area.title }}</strong><small class="text-xs leading-snug text-muted-foreground">{{ area.description }}</small></span><span class="ml-auto text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true">↗</span></a>
        }
      </div>
      </div>
    </section>
  `,
  styles: `
    .welcome-panel::before { position:absolute; inset:0; content:""; background:radial-gradient(ellipse at 78% 45%, color-mix(in oklab, var(--color-primary) 34%, transparent), transparent 38%); }
    .orbit { position:absolute; border:1px solid color-mix(in oklab, var(--color-primary) 32%, transparent); border-radius:50%; }
    .orbit-one { width:200px; height:200px; }
    .orbit-two { width:150px; height:150px; }
    .orbit-three { width:98px; height:98px; }
    .orbit-core { display:grid; width:58px; height:58px; place-items:center; border-radius:19px; background:linear-gradient(135deg, #f34868, #b10828); box-shadow:0 0 45px color-mix(in oklab, var(--color-primary) 45%, transparent); font-size:1.8rem; font-weight:850; }
  `,
})
export class OverviewComponent {
  readonly apiHealth = inject(ApiHealthService);
  readonly audience = input.required<'Client' | 'Admin'>();
  readonly areas = input.required<readonly { title: string; description: string; path: string; mark: string }[]>();
}
