import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { catchError, of, timeout } from 'rxjs';
import { apiHealthUrl } from './api-url';

type ApiStatus = 'checking' | 'online' | 'offline';

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
      .get(apiHealthUrl())
      .pipe(
        timeout(5_000),
        catchError(() => of(null)),
      )
      .subscribe((response) => this.status.set(response ? 'online' : 'offline'));
  }
}
