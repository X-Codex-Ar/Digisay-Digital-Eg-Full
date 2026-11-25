import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { AuthService } from '../../core/auth.service';
import { CrmApiService } from './crm-api.service';

describe('CrmApiService', () => {
  let api: CrmApiService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: { authorizationHeaders: vi.fn(() => ({})) } },
      ],
    });
    api = TestBed.inject(CrmApiService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('loads admin service requests from the backend service-requests route', () => {
    api.list('requests', 2).subscribe();

    const request = http.expectOne(
      'http://localhost:5080/api/v1/crm/service-requests?page=2&pageSize=100',
    );
    expect(request.request.method).toBe('GET');
    request.flush({ items: [], page: 2, pageSize: 100, totalCount: 0, totalPages: 0 });
  });
});
