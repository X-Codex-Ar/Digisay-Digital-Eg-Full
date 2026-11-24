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
    create: vi.fn(),
    update: vi.fn(),
    transition: vi.fn(),
  };
  const auth = {
    authenticated: signal(true),
    isAdmin: signal(true),
    activeOrganizationId: signal('org-1'),
    organizations: signal([{ id: 'org-1', name: 'DigiSay test org', membershipRole: 'Owner' }]),
    authorizationHeaders: vi.fn(),
    signOut: vi.fn(),
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
    auth.authenticated.set(true);
    auth.isAdmin.set(true);
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

  it('loads organization scoped leads and exposes lifecycle actions', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/admin/leads');
    expect(harness.routeNativeElement?.querySelector('h1')?.textContent?.trim()).toBe('Leads');
    expect(harness.routeNativeElement?.textContent).toContain('Ada Lovelace');
    expect(harness.routeNativeElement?.textContent).toContain('Move to');
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
