import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DashboardHeaderComponent } from '../components/header/dashboard-header.component';
import { DashboardSidebarComponent } from '../components/sidebar/dashboard-sidebar.component';

const CLIENT_NAVIGATION = [
  { label: 'Overview', path: '/client/overview', icon: 'OV' },
  { label: 'My requests', path: '/client/requests', icon: 'RQ' },
  { label: 'Projects', path: '/client/projects', icon: 'PJ' },
  { label: 'Campaigns', path: '/client/campaigns', icon: 'CP' },
  { label: 'Deliverables', path: '/client/deliverables', icon: 'DL' },
  { label: 'Activity', path: '/client/activity', icon: 'AC' },
  { label: 'Notifications', path: '/client/notifications', icon: 'NT' },
  { label: 'Support', path: '/client/support', icon: 'SP' },
  { label: 'AI assistant', path: '/client/ai-assistant', icon: 'AI' },
  { label: 'Profile', path: '/client/profile', icon: 'PR' },
  { label: 'Organization', path: '/client/organization', icon: 'OR' },
] as const;

@Component({
  selector: 'ds-client-layout',
  standalone: true,
  imports: [RouterOutlet, DashboardHeaderComponent, DashboardSidebarComponent],
  templateUrl: './client-layout.component.html',
})
export class ClientLayoutComponent {
  protected readonly navigation = CLIENT_NAVIGATION;
}
