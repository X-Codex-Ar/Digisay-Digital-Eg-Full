import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { AuthService } from '../../core/auth.service';
import '../../core/runtime-config';

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

const apiUrl = `${window.digisayRuntimeConfig?.apiBaseUrl?.replace(/\/$/, '') ?? 'http://localhost:5080'}/api/v1/crm`;

@Injectable({ providedIn: 'root' })
export class CrmApiService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);

  list(kind: CrmKind, page = 1) {
    return this.http.get<CrmPage<CrmRecord>>(`${apiUrl}/${kind}?page=${page}&pageSize=100`, {
      headers: this.auth.authorizationHeaders(),
    });
  }

  create(kind: CrmKind, value: CrmInput) {
    return this.http.post<CrmRecord>(
      `${apiUrl}/${kind === 'leads' ? 'leads' : 'service-requests'}`,
      value,
      { headers: this.auth.authorizationHeaders() },
    );
  }

  update(kind: CrmKind, id: string, value: CrmInput) {
    const endpoint = kind === 'leads' ? 'leads' : 'service-requests';
    return this.http.put<CrmRecord>(`${apiUrl}/${endpoint}/${id}`, value, {
      headers: this.auth.authorizationHeaders(),
    });
  }

  transition(kind: CrmKind, id: string, status: string) {
    const endpoint = kind === 'leads' ? 'leads' : 'service-requests';
    return this.http.post<CrmRecord>(
      `${apiUrl}/${endpoint}/${id}/transitions`,
      { status },
      { headers: this.auth.authorizationHeaders() },
    );
  }
}
