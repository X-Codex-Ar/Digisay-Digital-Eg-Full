import {
  Component,
  DestroyRef,
  ElementRef,
  HostListener,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';

export interface DropdownOption {
  value: string;
  label: string;
  disabled?: boolean;
}

@Component({
  selector: 'ds-dropdown',
  template: `
    <div class="dropdown" [class.compact]="compact()">
      <button
        class="trigger"
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        [attr.aria-label]="ariaLabel()"
        [attr.aria-expanded]="open()"
        [attr.aria-controls]="listboxId"
        [attr.aria-activedescendant]="open() ? optionId(activeIndex()) : null"
        [disabled]="disabled()"
        (click)="toggle()"
        (keydown)="onKeydown($event)"
      >
        <span class="trigger-label">{{ selectedOption()?.label ?? placeholder() }}</span>
        <svg
          class="chevron"
          [class.rotated]="open()"
          aria-hidden="true"
          viewBox="0 0 20 20"
          fill="none"
        >
          <path d="m5 7.5 5 5 5-5" stroke="currentColor" stroke-width="1.8" />
        </svg>
      </button>

      @if (open()) {
        <div
          class="panel"
          [id]="listboxId"
          [style.top.px]="panelPosition().top"
          [style.left.px]="panelPosition().left"
          [style.width.px]="panelPosition().width"
          [style.max-height.px]="panelPosition().maxHeight"
          role="listbox"
          [attr.aria-label]="ariaLabel()"
        >
          @for (option of options(); track option.value; let index = $index) {
            <div
              class="option"
              [class.active]="index === activeIndex()"
              [id]="optionId(index)"
              role="option"
              [attr.aria-selected]="option.value === value()"
              [attr.aria-disabled]="option.disabled || null"
              (mouseenter)="setActiveIndex(index)"
              (click)="choose(option)"
            >
              <span>{{ option.label }}</span>
              @if (option.value === value()) {
                <span class="check" aria-hidden="true">✓</span>
              }
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: `
    :host {
      display: block;
      width: 100%;
      min-width: 0;
      position: relative;
    }

    .dropdown {
      position: relative;
      width: 100%;
    }

    .trigger {
      display: flex;
      width: 100%;
      min-height: 2.625rem;
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem;
      border: 1px solid var(--color-border);
      border-radius: 0.875rem;
      background: var(--color-background);
      padding: 0.625rem 0.75rem;
      color: var(--color-foreground);
      text-align: left;
      font-size: 0.875rem;
      font-weight: 400;
      line-height: 1.25rem;
      cursor: pointer;
      transition: border-color 140ms ease, background-color 140ms ease;
    }

    .trigger:hover:not(:disabled) {
      border-color: color-mix(in oklab, var(--color-border) 35%, var(--color-foreground));
    }

    .trigger:disabled {
      cursor: not-allowed;
      opacity: 0.55;
    }

    .trigger-label {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .chevron {
      width: 1rem;
      height: 1rem;
      flex: 0 0 1rem;
      transition: transform 140ms ease;
    }

    .chevron.rotated {
      transform: rotate(180deg);
    }

    .panel {
      position: fixed;
      z-index: 1000;
      overflow-y: auto;
      border: 1px solid var(--color-border);
      border-radius: 0.5rem;
      background: var(--color-background);
      padding: 0.25rem;
      box-shadow: 0 12px 28px rgb(0 0 0 / 42%);
    }

    .option {
      display: flex;
      min-height: 2.125rem;
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem;
      border-radius: 0.25rem;
      padding: 0.375rem 0.625rem;
      color: var(--color-foreground);
      font-size: 0.875rem;
      line-height: 1.25rem;
      cursor: pointer;
    }

    .option.active:not([aria-disabled='true']),
    .option:hover:not([aria-disabled='true']) {
      background: #1769cc;
      color: #fff;
    }

    .option[aria-disabled='true'] {
      cursor: not-allowed;
      opacity: 0.5;
    }

    .check {
      color: currentColor;
      font-size: 0.75rem;
      font-weight: 800;
    }

    .compact .trigger {
      min-height: 2rem;
      border-radius: 0.625rem;
      padding: 0.375rem 0.5rem;
      font-size: 0.75rem;
      line-height: 1rem;
    }

    @media (prefers-reduced-motion: reduce) {
      .trigger,
      .chevron {
        transition: none;
      }
    }
  `,
})
export class DropdownComponent {
  private static nextId = 0;
  private readonly element = inject(ElementRef<HTMLElement>);

  readonly options = input.required<readonly DropdownOption[]>();
  readonly value = input<string | null>(null);
  readonly placeholder = input('Select an option');
  readonly ariaLabel = input('Select an option');
  readonly disabled = input(false);
  readonly compact = input(false);
  readonly valueChange = output<string>();
  readonly open = signal(false);
  readonly activeIndex = signal(0);
  readonly panelPosition = signal({ top: 0, left: 0, width: 0, maxHeight: 288 });
  readonly listboxId = `digisay-dropdown-${++DropdownComponent.nextId}`;
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);
  readonly selectedOption = computed(
    () => this.options().find((option) => option.value === this.value()) ?? null,
  );

  constructor() {
    const closeOnScroll = (event: Event) => {
      const panel = this.element.nativeElement.querySelector('.panel');
      if (!(event.target instanceof Node) || !panel?.contains(event.target)) this.close();
    };
    this.document.addEventListener('scroll', closeOnScroll, true);
    this.destroyRef.onDestroy(() => this.document.removeEventListener('scroll', closeOnScroll, true));
  }

  toggle(): void {
    if (this.disabled()) return;
    this.open() ? this.close() : this.show();
  }

  onKeydown(event: KeyboardEvent): void {
    if (this.disabled()) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (this.open()) this.moveActive(1);
        else this.show();
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (this.open()) this.moveActive(-1);
        else this.show(true);
        break;
      case 'Home':
        if (this.open()) {
          event.preventDefault();
          this.setFirstEnabled();
        }
        break;
      case 'End':
        if (this.open()) {
          event.preventDefault();
          this.setLastEnabled();
        }
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (!this.open()) this.show();
        else this.choose(this.options()[this.activeIndex()]);
        break;
      case 'Escape':
        if (this.open()) {
          event.preventDefault();
          this.close();
        }
        break;
      case 'Tab':
        this.close();
        break;
    }
  }

  choose(option: DropdownOption | undefined): void {
    if (!option || option.disabled) return;
    this.valueChange.emit(option.value);
    this.close();
  }

  setActiveIndex(index: number): void {
    if (!this.options()[index]?.disabled) this.activeIndex.set(index);
  }

  optionId(index: number): string {
    return `${this.listboxId}-option-${index}`;
  }

  @HostListener('document:click', ['$event'])
  closeOnOutsideClick(event: MouseEvent): void {
    if (!(event.target instanceof Node) || !this.element.nativeElement.contains(event.target)) {
      this.close();
    }
  }

  @HostListener('window:resize')
  repositionOnResize(): void {
    if (this.open()) this.positionPanel();
  }

  private show(fromEnd = false): void {
    this.open.set(true);
    const selectedIndex = this.options().findIndex(
      (option) => option.value === this.value() && !option.disabled,
    );
    if (selectedIndex >= 0) this.activeIndex.set(selectedIndex);
    else if (fromEnd) this.setLastEnabled();
    else this.setFirstEnabled();
    this.positionPanel();
  }

  private positionPanel(): void {
    const trigger = this.element.nativeElement.querySelector('.trigger');
    const view = this.document.defaultView;
    if (!(trigger instanceof HTMLElement) || !view) return;

    const bounds = trigger.getBoundingClientRect();
    const edge = 8;
    const gap = 4;
    const maxHeight = 288;
    const below = Math.max(0, view.innerHeight - bounds.bottom - gap - edge);
    const above = Math.max(0, bounds.top - gap - edge);
    const estimatedHeight = Math.min(maxHeight, this.options().length * 34 + 8);
    const opensBelow = below >= Math.min(estimatedHeight, 120) || below >= above;
    const availableHeight = opensBelow ? below : above;
    const panelHeight = Math.max(80, Math.min(maxHeight, availableHeight));
    const width = Math.min(
      this.compact() ? Math.max(bounds.width, 192) : bounds.width,
      Math.max(0, view.innerWidth - edge * 2),
    );
    const left = Math.min(Math.max(edge, bounds.left), view.innerWidth - width - edge);
    const top = opensBelow
      ? bounds.bottom + gap
      : Math.max(edge, bounds.top - gap - panelHeight);

    this.panelPosition.set({ top, left, width, maxHeight: panelHeight });
  }

  private close(): void {
    this.open.set(false);
  }

  private moveActive(direction: 1 | -1): void {
    const options = this.options();
    if (options.length === 0) return;
    let index = this.activeIndex();
    for (let attempt = 0; attempt < options.length; attempt += 1) {
      index = (index + direction + options.length) % options.length;
      if (!options[index].disabled) {
        this.activeIndex.set(index);
        return;
      }
    }
  }

  private setFirstEnabled(): void {
    const index = this.options().findIndex((option) => !option.disabled);
    if (index >= 0) this.activeIndex.set(index);
  }

  private setLastEnabled(): void {
    const options = this.options();
    for (let index = options.length - 1; index >= 0; index -= 1) {
      if (!options[index].disabled) {
        this.activeIndex.set(index);
        return;
      }
    }
  }
}
