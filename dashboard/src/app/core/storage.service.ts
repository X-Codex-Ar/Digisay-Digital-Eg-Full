import { Injectable } from '@angular/core';
import './runtime-config';

export const DEFAULT_PUBLIC_BUCKET = 'public-media';

@Injectable({ providedIn: 'root' })
export class StorageService {
  private readonly storageBaseUrl =
    window.digisayRuntimeConfig?.storageBaseUrl?.replace(/\/$/, '') ?? '';

  /**
   * Resolves a media asset URL against Supabase Storage or falls back to local assets.
   */
  resolve(bucket: string = DEFAULT_PUBLIC_BUCKET, path: string = '', fallbackUrl: string = ''): string {
    const cleanPath = path.replace(/^\/+/, '');

    if (this.storageBaseUrl) {
      return `${this.storageBaseUrl}/${bucket}/${cleanPath}`;
    }

    return fallbackUrl || `/assets/${cleanPath}`;
  }

  /**
   * Returns a resolved public media URL.
   */
  getPublicMediaUrl(path: string, fallbackUrl: string = ''): string {
    return this.resolve(DEFAULT_PUBLIC_BUCKET, path, fallbackUrl);
  }
}
