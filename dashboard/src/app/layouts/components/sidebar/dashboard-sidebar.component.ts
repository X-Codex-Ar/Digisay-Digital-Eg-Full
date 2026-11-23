import { Component, inject, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { SidebarService } from '../../../core/sidebar.service';

export interface DashboardNavItem {
  readonly label: string;
  readonly path: string;
  readonly icon: string;
}

@Component({
  selector: 'ds-dashboard-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './dashboard-sidebar.component.html',
  host: {
    class: 'shrink-0 lg:sticky lg:top-0 lg:h-screen lg:z-30 block',
  },
})
export class DashboardSidebarComponent {
  protected readonly sidebar = inject(SidebarService);

  readonly navigation = input.required<readonly DashboardNavItem[]>();
  readonly brandSubtitle = input<string>('Digital operations');
  readonly workspaceLabel = input<string>('WORKSPACE');
  readonly footerLabel = input<string>('Platform workspace');
  readonly overviewLink = input<string>('/admin/overview');
}
