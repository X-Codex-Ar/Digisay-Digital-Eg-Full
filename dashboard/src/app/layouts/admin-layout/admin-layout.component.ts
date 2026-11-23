import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

const ADMIN_NAVIGATION = [
  { label: 'Overview', path: '/admin/overview', icon: 'OV' },
  { label: 'Clients', path: '/admin/clients', icon: 'CL' },
  { label: 'Leads', path: '/admin/leads', icon: 'LE' },
  { label: 'Requests', path: '/admin/requests', icon: 'RQ' },
  { label: 'Services', path: '/admin/services', icon: 'SV' },
  { label: 'Projects', path: '/admin/projects', icon: 'PJ' },
  { label: 'Tasks', path: '/admin/tasks', icon: 'TK' },
  { label: 'Campaigns', path: '/admin/campaigns', icon: 'CP' },
  { label: 'Content', path: '/admin/content', icon: 'CT' },
  { label: 'Teams & people', path: '/admin/team', icon: 'TM' },
  { label: 'Reports', path: '/admin/reports', icon: 'RP' },
  { label: 'Audit log', path: '/admin/audit-logs', icon: 'AU' },
  { label: 'Notifications', path: '/admin/notifications', icon: 'NT' },
  { label: 'Settings', path: '/admin/settings', icon: 'ST' },
] as const;

@Component({
  selector: 'ds-admin-layout',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.css',
})
export class AdminLayoutComponent {
  protected readonly navigation = ADMIN_NAVIGATION;
}
