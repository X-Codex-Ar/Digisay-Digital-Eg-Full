import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { AuthService } from '../../core/auth.service';
import { apiUrl } from '../../core/api-url';

export interface StoredObject {
  id: string;
  contentType: string;
  sizeBytes: number;
  createdAtUtc: string;
}

@Injectable({ providedIn: 'root' })
export class StorageApiService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);

  list() {
    return this.http.get<StoredObject[]>(apiUrl('storage/objects'), {
      headers: this.auth.authorizationHeaders(),
    });
  }

  upload(file: File) {
    const body = new FormData();
    body.append('file', file, file.name);
    return this.http.post<StoredObject>(apiUrl('storage/objects'), body, {
      headers: this.auth.authorizationHeaders(),
    });
  }

  downloadLink(objectId: string) {
    return this.http.post<{ objectId: string; url: string; expiresAtUtc: string }>(
      apiUrl(`storage/objects/${objectId}/download-link`),
      {},
      { headers: this.auth.authorizationHeaders() },
    );
  }

  delete(objectId: string) {
    return this.http.delete<void>(apiUrl(`storage/objects/${objectId}`), {
      headers: this.auth.authorizationHeaders(),
    });
  }
}
