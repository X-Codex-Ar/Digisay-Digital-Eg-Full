import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { AuthService } from '../../core/auth.service';
import { apiUrl } from '../../core/api-url';

export type CrmKind = 'leads' | 'requests';

export interface LeadRecord {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  source: string | null;
  status: string;
  createdAtUtc: string;
  updatedAtUtc: string;
}

export interface ServiceRequestRecord {
  id: string;
  title: string;
  description: string;
  service: string;
  status: string;
  createdAtUtc: string;
  updatedAtUtc: string;
}

export interface ServiceRequestTriage {
  found: boolean;
  suggestion: { category: string; urgency: 'Low' | 'Normal' | 'High'; rationale: string } | null;
  requiresHumanReview: boolean;
}

export type CrmRecord = LeadRecord | ServiceRequestRecord;
export type CrmInput =
  | { name: string; email: string; phone: string; source: string }
  | { title: string; service: string; description: string };

export interface CrmPage<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

@Injectable({ providedIn: 'root' })
export class CrmApiService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);

  list(kind: CrmKind, page = 1) {
    const resource = kind === 'leads' ? 'leads' : 'service-requests';
    return this.http.get<CrmPage<CrmRecord>>(apiUrl(`crm/${resource}?page=${page}&pageSize=100`), {
      headers: this.auth.authorizationHeaders(),
    });
  }

  listRequests(page = 1) {
    return this.http.get<CrmPage<ServiceRequestRecord>>(
      apiUrl(`crm/service-requests?page=${page}&pageSize=100`),
      {
        headers: this.auth.authorizationHeaders(),
      },
    );
  }

  createRequest(value: { title: string; service: string; description: string }) {
    return this.http.post<ServiceRequestRecord>(apiUrl('crm/service-requests'), value, {
      headers: this.auth.authorizationHeaders(),
    });
  }

  create(kind: CrmKind, value: CrmInput) {
    return this.http.post<CrmRecord>(
      apiUrl(`crm/${kind === 'leads' ? 'leads' : 'service-requests'}`),
      value,
      { headers: this.auth.authorizationHeaders() },
    );
  }

  update(kind: CrmKind, id: string, value: CrmInput) {
    const resource = kind === 'leads' ? 'leads' : 'service-requests';
    return this.http.put<CrmRecord>(apiUrl(`crm/${resource}/${id}`), value, {
      headers: this.auth.authorizationHeaders(),
    });
  }

  transition(kind: CrmKind, id: string, status: string) {
    const resource = kind === 'leads' ? 'leads' : 'service-requests';
    return this.http.post<CrmRecord>(
      apiUrl(`crm/${resource}/${id}/transitions`),
      { status },
      { headers: this.auth.authorizationHeaders() },
    );
  }

  suggestRequestTriage(id: string) {
    return this.http.post<ServiceRequestTriage>(
      apiUrl(`crm/service-requests/${id}/ai-triage`),
      {},
      { headers: this.auth.authorizationHeaders() },
    );
  }
}
