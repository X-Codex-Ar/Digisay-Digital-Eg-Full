import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { AuthService } from '../../core/auth.service';
import { apiUrl } from '../../core/api-url';

export interface WorkspaceReport {
  organizationId: string;
  periodStartUtc: string;
  generatedAtUtc: string;
  leadTotal: number | null;
  leadsCreatedLast30Days: number | null;
  leadsByStatus: { status: string; count: number }[];
  serviceRequestTotal: number;
  serviceRequestsCreatedLast30Days: number;
  serviceRequestsByStatus: { status: string; count: number }[];
}

@Injectable({ providedIn: 'root' })
export class ReportsApiService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);

  workspace() {
    return this.http.get<WorkspaceReport>(apiUrl('reports/workspace'), {
      headers: this.auth.authorizationHeaders(),
    });
  }
}
