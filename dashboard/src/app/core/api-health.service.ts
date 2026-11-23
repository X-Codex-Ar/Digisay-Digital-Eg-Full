import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { catchError, of, timeout } from 'rxjs';

type ApiStatus = 'checking' | 'online' | 'offline';

declare global {
  interface Window {
    digisayRuntimeConfig?: { apiBaseUrl?: string };
  }
}

const API_BASE_URL = window.digisayRuntimeConfig?.apiBaseUrl ?? 'http://localhost:5080';

@Injectable({ providedIn: 'root' })
export class ApiHealthService {
  private readonly http = inject(HttpClient);
  readonly status = signal<ApiStatus>('checking');

  constructor() {
    this.refresh();
    window.setInterval(() => this.refresh(), 30_000);
  }

  refresh(): void {
    this.http
      .get(`${API_BASE_URL}/health/ready`)
      .pipe(
        timeout(5_000),
        catchError(() => of(null)),
      )
      .subscribe((response) => this.status.set(response ? 'online' : 'offline'));
  }
}
