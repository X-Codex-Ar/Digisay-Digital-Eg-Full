import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { AuthService } from '../../core/auth.service';
import { CrmApiService, ServiceRequestRecord } from './crm-api.service';
import { CrmWorkflowComponent } from './crm-workflow.component';

const request: ServiceRequestRecord = {
  id: 'r1',
  title: 'Logo refresh',
  description: 'Need a new logo',
  service: 'Design',
  status: 'Submitted',
  createdAtUtc: '2026-01-01T00:00:00Z',
  updatedAtUtc: '2026-01-01T00:00:00Z',
};

describe('CrmWorkflowComponent AI triage control', () => {
  const suggestRequestTriage = vi.fn();

  function render(aiTriageEnabled: boolean | undefined) {
    window.digisayRuntimeConfig = aiTriageEnabled === undefined ? {} : { aiTriageEnabled };
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        {
          provide: AuthService,
          useValue: {
            isAdmin: () => true,
            organizations: () => [],
            activeOrganizationId: () => null,
            authorizationHeaders: () => ({}),
          },
        },
        {
          provide: CrmApiService,
          useValue: {
            list: () => of({ items: [request], totalCount: 1, totalPages: 1 }),
            suggestRequestTriage,
          },
        },
      ],
    });
    const fixture = TestBed.createComponent(CrmWorkflowComponent);
    fixture.componentRef.setInput('kind', 'requests');
    fixture.detectChanges();
    fixture.componentInstance.selected.set(request);
    fixture.detectChanges();
    return fixture;
  }

  afterEach(() => {
    window.digisayRuntimeConfig = undefined;
    suggestRequestTriage.mockReset();
  });

  it('does not render the control, and never calls the API, when the flag is not set', () => {
    const fixture = render(undefined);
    expect(fixture.nativeElement.textContent).toContain('Logo refresh');
    expect(fixture.nativeElement.querySelector('#ai-triage-title')).toBeNull();
    fixture.componentInstance.suggestTriage();
    expect(suggestRequestTriage).not.toHaveBeenCalled();
  });

  it('does not render the control when the flag is false', () => {
    const fixture = render(false);
    expect(fixture.nativeElement.querySelector('#ai-triage-title')).toBeNull();
  });

  it('renders the control for an admin and calls the API when the flag is true', () => {
    suggestRequestTriage.mockReturnValue(
      of({ found: true, suggestion: null, requiresHumanReview: true }),
    );
    const fixture = render(true);
    expect(fixture.nativeElement.querySelector('#ai-triage-title')).not.toBeNull();
    fixture.componentInstance.suggestTriage();
    expect(suggestRequestTriage).toHaveBeenCalledWith('r1');
  });
});
