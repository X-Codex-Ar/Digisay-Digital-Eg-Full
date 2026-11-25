import { Component, input } from '@angular/core';

@Component({
  selector: 'ds-feature-page',
  template: `
    <section class="grid gap-8" aria-labelledby="page-title">
      <div>
        <span class="text-[.7rem] font-bold uppercase tracking-[.14em] text-muted-foreground">{{
          section()
        }}</span>
        <h1 id="page-title" class="mb-2 mt-2 text-3xl font-bold tracking-tight text-foreground">
          {{ title() }}
        </h1>
        <p class="m-0 text-muted-foreground">{{ description() }}</p>
      </div>
      <div
        class="flex max-w-3xl items-start gap-4 rounded-2xl border border-border bg-card p-5 shadow-card"
        role="status"
      >
        <div
          class="grid size-9 shrink-0 place-items-center rounded-xl bg-accent font-bold text-accent-foreground"
          aria-hidden="true"
        >
          i
        </div>
        <div>
          <h2 class="mb-1 mt-0 text-base font-bold text-foreground">
            Backend workflow not connected yet
          </h2>
          <p class="m-0 text-sm leading-relaxed text-muted-foreground">
            Sign-in and organization access are active, but this section does not have a matching
            backend workflow yet. It will show live data after its API, permissions, and lifecycle
            are implemented. No sample client or campaign data is shown here.
          </p>
        </div>
      </div>
    </section>
  `,
})
export class FeaturePageComponent {
  readonly title = input.required<string>();
  readonly section = input.required<string>();
  readonly description = input.required<string>();
}
