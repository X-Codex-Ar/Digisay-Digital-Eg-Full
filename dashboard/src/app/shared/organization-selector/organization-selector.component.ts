import { Component, computed, input, output } from '@angular/core';
import { OrganizationMembership } from '../../core/auth.service';
import { DropdownComponent, DropdownOption } from '../dropdown/dropdown.component';

@Component({
  selector: 'ds-organization-selector',
  imports: [DropdownComponent],
  template: `
    @if (organizations().length > 0) {
      <label [class]="labelClass()">
        {{ label() }}
        <ds-dropdown
          [options]="dropdownOptions()"
          [value]="selectedId()"
          [ariaLabel]="label()"
          [disabled]="disabled() || organizations().length < 2"
          (valueChange)="selectionChange.emit($event)"
        />
        @if (hint()) {
          <span class="text-xs font-normal normal-case tracking-normal text-muted-foreground">
            {{ hint() }}
          </span>
        }
      </label>
    }
  `,
})
export class OrganizationSelectorComponent {
  readonly organizations = input.required<readonly OrganizationMembership[]>();
  readonly selectedId = input.required<string | null>();
  readonly label = input('Organization');
  readonly hint = input('');
  readonly disabled = input(false);
  readonly showMembershipRole = input(false);
  readonly dropdownOptions = computed<DropdownOption[]>(() =>
    this.organizations().map((organization) => ({
      value: organization.id,
      label: this.showMembershipRole()
        ? `${organization.name} · ${organization.membershipRole}`
        : organization.name,
    })),
  );
  readonly labelClass = input(
    'grid gap-2 text-xs font-bold uppercase tracking-wide text-muted-foreground',
  );
  readonly selectionChange = output<string>();
}
