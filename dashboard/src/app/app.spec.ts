import { TestBed } from '@angular/core/testing';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from './app.routes';

describe('Dashboard route boundaries', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter(routes, withComponentInputBinding())],
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

  it('loads feature routes on demand and labels unavailable data honestly', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/admin/leads');
    expect(harness.routeNativeElement?.querySelector('h1')?.textContent).toBe('Leads');
    expect(harness.routeNativeElement?.textContent).toContain('Workspace connected after API setup');
  });
});
