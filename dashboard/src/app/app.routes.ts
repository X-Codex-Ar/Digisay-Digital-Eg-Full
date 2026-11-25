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
      {
        path: 'deliverables',
        loadComponent: () =>
          import('./features/storage/storage-library.component').then(
            (m) => m.StorageLibraryComponent,
          ),
      },
      feature('Activity', 'Client portal', 'Recent changes across your organization workspace.'),
      feature('Notifications', 'Client portal', 'Updates and notification preferences.'),
      feature('Support', 'Client portal', 'Support conversations and open service tickets.'),
      {
        path: 'profile',
        loadComponent: () =>
          import('./features/account/profile.component').then((m) => m.ProfileComponent),
      },
      {
        path: 'organization',
        loadComponent: () =>
          import('./features/account/organization.component').then((m) => m.OrganizationComponent),
      },
      {
        path: 'ai-assistant',
        loadComponent: () =>
          import('./features/ai/ai-assistant.component').then((m) => m.AiAssistantComponent),
      },
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
      {
        path: 'clients',
        loadComponent: () =>
          import('./features/admin/clients.component').then((m) => m.ClientsComponent),
      },
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
      {
        path: 'content',
        loadComponent: () =>
          import('./features/storage/storage-library.component').then(
            (m) => m.StorageLibraryComponent,
          ),
      },
      {
        path: 'team',
        loadComponent: () => import('./features/admin/team.component').then((m) => m.TeamComponent),
      },
      {
        path: 'reports',
        loadComponent: () =>
          import('./features/reports/reports.component').then((m) => m.ReportsComponent),
      },
      feature('Audit logs', 'Administration', 'Administrative actions and system history.'),
      feature('Notifications', 'Administration', 'Delivery status and notification settings.'),
      feature('Settings', 'Administration', 'Platform and workspace configuration.'),
      {
        path: 'ai-assistant',
        loadComponent: () =>
          import('./features/ai/ai-assistant.component').then((m) => m.AiAssistantComponent),
      },
    ],
  },
  { path: '**', redirectTo: 'client/overview' },
];
