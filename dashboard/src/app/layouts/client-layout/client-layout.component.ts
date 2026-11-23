import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

const CLIENT_NAVIGATION = [
  { label: 'Overview', path: '/client/overview', icon: 'OV' },
  { label: 'My requests', path: '/client/requests', icon: 'RQ' },
  { label: 'Projects', path: '/client/projects', icon: 'PJ' },
  { label: 'Campaigns', path: '/client/campaigns', icon: 'CP' },
  { label: 'Deliverables', path: '/client/deliverables', icon: 'DL' },
  { label: 'Activity', path: '/client/activity', icon: 'AC' },
  { label: 'Notifications', path: '/client/notifications', icon: 'NT' },
  { label: 'Support', path: '/client/support', icon: 'SP' },
  { label: 'Profile', path: '/client/profile', icon: 'PR' },
  { label: 'Organization', path: '/client/organization', icon: 'OR' },
] as const;

@Component({
  selector: 'ds-client-layout',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './client-layout.component.html',
  styleUrl: './client-layout.component.css',
})
export class ClientLayoutComponent {
  protected readonly navigation = CLIENT_NAVIGATION;
}
