import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';
import { ClientLayoutComponent } from './layouts/client-layout/client-layout.component';
import { adminGuard } from './core/admin.guard';
import { clientGuard } from './core/client.guard';

const adminAreas = [
  {
    title: 'Clients',
    description: 'Client accounts and organization access',
    path: '/admin/clients',
    mark: 'CL',
  },
  {
    title: 'Leads',
    description: 'Inbound opportunities and follow-up',
    path: '/admin/leads',
    mark: 'LE',
  },
  {
    title: 'Requests',
    description: 'Service requests and approvals',
    path: '/admin/requests',
    mark: 'RQ',
  },
  {
    title: 'Projects',
    description: 'Delivery plans and progress',
    path: '/admin/projects',
    mark: 'PJ',
  },
  {
    title: 'Campaigns',
    description: 'Campaign schedules and outcomes',
    path: '/admin/campaigns',
    mark: 'CP',
  },
  { title: 'Reports', description: 'Operational reporting', path: '/admin/reports', mark: 'RP' },
] as const;

const clientAreas = [
  {
    title: 'Requests',
    description: 'Ask DigiSay for support',
    path: '/client/requests',
    mark: 'RQ',
  },
  {
    title: 'Projects',
    description: 'Follow project milestones',
    path: '/client/projects',
    mark: 'PJ',
  },
  {
    title: 'Campaigns',
    description: 'Review your campaign work',
    path: '/client/campaigns',
    mark: 'CP',
  },
  {
    title: 'Deliverables',
    description: 'Access shared outputs',
    path: '/client/deliverables',
    mark: 'DL',
  },
  {
    title: 'Notifications',
    description: 'Keep up with workspace updates',
    path: '/client/notifications',
    mark: 'NT',
  },
  {
    title: 'Support',
    description: 'Get help from the delivery team',
    path: '/client/support',
    mark: 'SP',
  },
] as const;

const feature = (title: string, section: string, description: string) => ({
  path: title.toLowerCase().replaceAll(' ', '-'),
  loadComponent: () =>
    import('./shared/feature-page/feature-page.component').then(
      (module) => module.FeaturePageComponent,
    ),
  data: { title, section, description },
});

export const routes: Routes = [
  {
    path: 'admin/sign-in',
    loadComponent: () =>
      import('./features/auth/portal-sign-in.component').then(
        (module) => module.PortalSignInComponent,
      ),
    data: { audience: 'Admin' },
  },
  {
    path: 'client/sign-in',
    loadComponent: () =>
      import('./features/auth/portal-sign-in.component').then(
        (module) => module.PortalSignInComponent,
      ),
    data: { audience: 'Client' },
  },
  { path: '', pathMatch: 'full', redirectTo: 'client/overview' },
  {
    path: 'client',
    component: ClientLayoutComponent,
    canActivate: [clientGuard],
    canActivateChild: [clientGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'overview' },
      {
        path: 'overview',
        loadComponent: () =>
          import('./features/overview/overview.component').then((m) => m.OverviewComponent),
        data: { audience: 'Client', areas: clientAreas },
      },
      {
        path: 'requests',
        loadComponent: () =>
          import('./features/client/client-requests.component').then(
            (module) => module.ClientRequestsComponent,
          ),
      },
      feature('Projects', 'Client portal', 'Project plans, milestones, and progress updates.'),
      feature('Campaigns', 'Client portal', 'Campaign schedules, objectives, and deliverables.'),
      feature(
        'Deliverables',
        'Client portal',
        'Approved files and work shared by your delivery team.',
      ),
      feature('Activity', 'Client portal', 'Recent changes across your organization workspace.'),
      feature('Notifications', 'Client portal', 'Updates and notification preferences.'),
      feature('Support', 'Client portal', 'Support conversations and open service tickets.'),
      feature('Profile', 'Client portal', 'Your account profile and preferences.'),
      feature('Organization', 'Client portal', 'Organization members and workspace settings.'),
    ],
  },
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [adminGuard],
    canActivateChild: [adminGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'overview' },
      {
        path: 'overview',
        loadComponent: () =>
          import('./features/overview/overview.component').then((m) => m.OverviewComponent),
        data: { audience: 'Admin', areas: adminAreas },
      },
      feature('Clients', 'Administration', 'Client organizations, contacts, and membership.'),
      {
        path: 'leads',
        loadComponent: () =>
          import('./features/crm/crm-workflow.component').then(
            (module) => module.CrmWorkflowComponent,
          ),
        data: { kind: 'leads' },
      },
      {
        path: 'requests',
        loadComponent: () =>
          import('./features/crm/crm-workflow.component').then(
            (module) => module.CrmWorkflowComponent,
          ),
        data: { kind: 'requests' },
      },
      feature('Services', 'Administration', 'DigiSay service catalog and availability.'),
      feature('Projects', 'Administration', 'Project ownership, assignments, and milestones.'),
      feature('Tasks', 'Administration', 'Team task assignments and due dates.'),
      feature('Campaigns', 'Administration', 'Campaign calendars, objectives, and outcomes.'),
      feature('Content', 'Administration', 'Media assets, review, and delivery.'),
      feature('Team', 'Administration', 'Employees, teams, roles, and permissions.'),
      feature('Reports', 'Administration', 'Operational and campaign reporting.'),
      feature('Audit logs', 'Administration', 'Administrative actions and system history.'),
      feature('Notifications', 'Administration', 'Delivery status and notification settings.'),
      feature('Settings', 'Administration', 'Platform and workspace configuration.'),
    ],
  },
  { path: '**', redirectTo: 'client/overview' },
];
