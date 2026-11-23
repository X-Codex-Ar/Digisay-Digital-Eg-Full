import { Component, inject, input } from '@angular/core';
import { SidebarService } from '../../../core/sidebar.service';
import { ThemeService } from '../../../core/theme.service';

@Component({
  selector: 'ds-dashboard-header',
  standalone: true,
  templateUrl: './dashboard-header.component.html',
})
export class DashboardHeaderComponent {
  protected readonly sidebar = inject(SidebarService);
  protected readonly theme = inject(ThemeService);

  readonly title = input.required<string>();
  readonly category = input<string>('DIGISAY PLATFORM');
  readonly badge = input<string>('Dashboard setup');
}
