import { TestBed } from '@angular/core/testing';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { routes } from './app.routes';
import { AuthService } from './core/auth.service';
import { CrmApiService } from './features/crm/crm-api.service';

describe('Dashboard route boundaries', () => {
  const crmApi = {
    list: vi.fn(),
    listRequests: vi.fn(),
    create: vi.fn(),
    createRequest: vi.fn(),
    update: vi.fn(),
    transition: vi.fn(),
  };
  const auth = {
    authenticated: signal(true),
    isAdmin: signal(true),
    isClient: signal(true),
    activeOrganizationId: signal('org-1'),
    organizations: signal([{ id: 'org-1', name: 'DigiSay test org', membershipRole: 'Owner' }]),
    authorizationHeaders: vi.fn(),
    signOut: vi.fn(),
    signIn: vi.fn(),
  };

  beforeEach(() => {
    crmApi.list.mockReset().mockReturnValue(
      of({
        items: [
          {
            id: 'lead-1',
            name: 'Ada Lovelace',
            email: 'ada@example.test',
            phone: null,
            source: 'Website',
            status: 'New',
            createdAtUtc: '2026-01-01T00:00:00Z',
            updatedAtUtc: '2026-01-01T00:00:00Z',
          },
        ],
        page: 1,
        pageSize: 100,
        totalCount: 1,
        totalPages: 1,
      }),
    );
    crmApi.transition.mockReset().mockReturnValue(of({}));
    crmApi.listRequests.mockReset().mockReturnValue(
      of({
        items: [
          {
            id: 'request-1',
            title: 'Campaign planning',
            description: 'Plan a launch campaign.',
            service: 'Marketing',
            status: 'Submitted',
            createdAtUtc: '2026-01-01T00:00:00Z',
            updatedAtUtc: '2026-01-01T00:00:00Z',
          },
        ],
        page: 1,
        pageSize: 100,
        totalCount: 1,
        totalPages: 1,
      }),
    );
    crmApi.createRequest.mockReset().mockReturnValue(of({ title: 'Campaign planning' }));
    auth.signIn.mockReset().mockResolvedValue(undefined);
    auth.authenticated.set(true);
    auth.isAdmin.set(true);
    auth.organizations.set([{ id: 'org-1', name: 'DigiSay test org', membershipRole: 'Owner' }]);
    auth.isClient.set(true);
    TestBed.configureTestingModule({
      providers: [
        provideRouter(routes, withComponentInputBinding()),
        { provide: AuthService, useValue: auth },
        { provide: CrmApiService, useValue: crmApi },
      ],
    });
  });

  it('renders the separate administrative layout and overview route', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/admin/overview');
    expect(harness.routeNativeElement?.textContent).toContain('Administration');
    expect(harness.routeNativeElement?.querySelector('h1')?.textContent).toContain('Your work');
  });

  it('renders the separate client portal and overview route', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/client/overview');
    expect(harness.routeNativeElement?.textContent).toContain('Client portal');
    expect(harness.routeNativeElement?.textContent).toContain('WORKSPACE AREAS');
  });

  it('signs clients in through the client audience and signs them out to client sign-in', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/client/sign-in');
    const email = harness.routeNativeElement?.querySelector(
      'input[name="email"]',
    ) as HTMLInputElement;
    const password = harness.routeNativeElement?.querySelector(
      'input[name="password"]',
    ) as HTMLInputElement;
    email.value = 'client@example.test';
    email.dispatchEvent(new Event('input'));
    password.value = 'Example-Password!2026';
    password.dispatchEvent(new Event('input'));
    harness.routeNativeElement
      ?.querySelector('form[aria-labelledby="sign-in-title"]')
      ?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await harness.fixture.whenStable();
    expect(auth.signIn).toHaveBeenCalledWith(
      'client@example.test',
      'Example-Password!2026',
      'Client',
    );
    expect(harness.routeNativeElement?.textContent).toContain('Client portal');

    const signOut = Array.from(harness.routeNativeElement?.querySelectorAll('button') ?? []).find(
      (button) => button.textContent?.includes('Sign out'),
    );
    signOut?.dispatchEvent(new Event('click'));
    await harness.fixture.whenStable();
    expect(auth.signOut).toHaveBeenCalled();
    expect(harness.routeNativeElement?.textContent).toContain('Sign in');
  });

  it('shows client request history and submits a request', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/client/requests');
    expect(harness.routeNativeElement?.textContent).toContain('Campaign planning');
    expect(harness.routeNativeElement?.textContent).not.toContain('Move to');

    const newRequest = Array.from(
      harness.routeNativeElement?.querySelectorAll('button') ?? [],
    ).find((button) => button.textContent?.includes('New request'));
    newRequest?.dispatchEvent(new Event('click'));
    await harness.fixture.detectChanges();
    const title = harness.routeNativeElement?.querySelector(
      'input[name="title"]',
    ) as HTMLInputElement;
    const service = harness.routeNativeElement?.querySelector(
      'input[name="service"]',
    ) as HTMLInputElement;
    const description = harness.routeNativeElement?.querySelector(
      'textarea[name="description"]',
    ) as HTMLTextAreaElement;
    title.value = 'New brand launch';
    title.dispatchEvent(new Event('input'));
    service.value = 'Marketing';
    service.dispatchEvent(new Event('input'));
    description.value = 'Plan a product launch campaign.';
    description.dispatchEvent(new Event('input'));
    harness.routeNativeElement
      ?.querySelector('form[aria-labelledby="new-request-title"]')
      ?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await harness.fixture.whenStable();
    expect(crmApi.createRequest).toHaveBeenCalledWith({
      title: 'New brand launch',
      service: 'Marketing',
      description: 'Plan a product launch campaign.',
    });
  });

  it('requires the Client role for client request routes', async () => {
    auth.authenticated.set(false);
    auth.isClient.set(false);
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/client/requests');
    expect(harness.routeNativeElement?.querySelector('h1')?.textContent).toContain('Sign in');
    expect(harness.routeNativeElement?.textContent).toContain('Client portal');
  });

  it('shows an access-denied state when the organization is not authorized', async () => {
    crmApi.listRequests.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 404 })));
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/client/requests');
    expect(harness.routeNativeElement?.textContent).toContain('Organization access denied');
  });

  it('loads organization scoped leads and exposes lifecycle actions', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/admin/leads');
    expect(harness.routeNativeElement?.querySelector('h1')?.textContent?.trim()).toBe('Leads');
    expect(harness.routeNativeElement?.textContent).toContain('Ada Lovelace');
    expect(harness.routeNativeElement?.textContent).toContain('Change status…');
  });

  it('submits only an allowed lead lifecycle transition', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/admin/leads');
    const selects = harness.routeNativeElement?.querySelectorAll('select');
    const action = selects?.[1] as HTMLSelectElement;
    action.value = 'Contacted';
    action.dispatchEvent(new Event('change'));
    await harness.fixture.whenStable();
    expect(crmApi.transition).toHaveBeenCalledWith('leads', 'lead-1', 'Contacted');
  });

  it('allows non-owner organization members to create service requests', async () => {
    auth.organizations.set([{ id: 'org-1', name: 'DigiSay test org', membershipRole: 'Member' }]);
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/admin/requests');
    const createButton = [...(harness.routeNativeElement?.querySelectorAll('button') ?? [])].find(
      (button) => button.textContent?.includes('Create request'),
    );
    expect(createButton?.disabled).toBe(false);
  });

  it('keeps the CRM workspace available when a record transition is forbidden', async () => {
    crmApi.transition.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 403 })));
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/admin/leads');
    const action = harness.routeNativeElement?.querySelectorAll('select')[1] as HTMLSelectElement;
    action.value = 'Contacted';
    action.dispatchEvent(new Event('change'));
    await harness.fixture.whenStable();
    expect(harness.routeNativeElement?.textContent).toContain('not allowed to perform this action');
    expect(harness.routeNativeElement?.textContent).not.toContain('Access denied');
    expect(harness.routeNativeElement?.textContent).toContain('Ada Lovelace');
  });

  it('shows API failure state with a retry action', async () => {
    crmApi.list.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 0 })));
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/admin/requests');
    expect(harness.routeNativeElement?.textContent).toContain('Could not reach the API');
    expect(harness.routeNativeElement?.textContent).toContain('Retry');
  });

  it('offers sign in again when the API rejects an expired session', async () => {
    crmApi.list.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 401 })));
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/admin/requests');
    expect(harness.routeNativeElement?.textContent).toContain('Your sign-in expired');
    expect(harness.routeNativeElement?.textContent).toContain('Sign in');
  });

  it('redirects accounts without an administrator role to sign in', async () => {
    auth.authenticated.set(true);
    auth.isAdmin.set(false);
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/admin/leads');
    expect(harness.routeNativeElement?.querySelector('h1')?.textContent).toContain('Sign in');
  });
});
