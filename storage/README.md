# DigiSay Media & Static Storage Architecture

This folder defines the centralized media storage strategy for the DigiSay platform, bridging local development assets, production static content, and Supabase Storage CDN buckets.

## Overview & Architecture

DigiSay employs a **hybrid media storage architecture**:

```text
storage/
├── README.md                          # Storage architecture and engineering guidelines
├── static/                            # Local static assets fallback and source master files
│   ├── brand/                         # Official DigiSay logos, lockups, and vector marks
│   ├── images/                        # Showcase photography, team portraits, case studies
│   ├── videos/                        # Master showreels, teasers, and agency video clips
│   └── icons/                         # UI iconography and partner emblems
├── uploads/                           # Local ephemeral storage for dev/testing uploads
└── supabase/
    └── 001_storage_buckets.sql        # Supabase bucket definitions and RLS security policies
```

### Storage Boundaries

1. **SQL Server (Source of Truth for Metadata):**
   - Media file references, file sizes, MIME types, owner foreign keys, and audit history are stored in SQL Server.
   - Binary blob data is never stored in SQL Server.

2. **Supabase Storage (CDN & Binary Delivery):**
   - High-throughput binary asset hosting, global Edge CDN caching, image transformations (`/render/image`), and streaming video delivery.
   - Governed by PostgreSQL Row Level Security (RLS) on `storage.objects`.

3. **Local Static Storage (`storage/static/` & `public/static/`):**
   - Immediate offline development assets, fallback images, and application branding that load without external network dependencies.

---

## Supabase Storage Buckets

| Bucket Name | Visibility | Max File Size | Allowed MIME Types | Primary Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **`public-media`** | Public | 100 MB | JPEG, PNG, WebP, AVIF, SVG, MP4, WebM | Showreels, website illustrations, public marketing imagery |
| **`client-assets`** | Private (RLS) | 500 MB | All MIME types | Authenticated client deliverables, monthly reports, contracts |
| **`creator-submissions`** | Private (RLS) | 1 GB | MP4, MOV, MKV, PNG, JPEG | Influencer network raw video submissions and draft reviews |

To provision these buckets in Supabase, execute [`supabase/001_storage_buckets.sql`](supabase/001_storage_buckets.sql) in the Supabase SQL Editor.

---

## Developer Integration Guide

### 1. Public Frontend (`public/`)
Import the storage resolver in React components:

```typescript
import { resolveMediaUrl, resolveVideoUrl } from "@/lib/storage";

// Resolves to Supabase CDN if configured, or falls back to local static asset
const logoUrl = resolveMediaUrl("brand/Digisay-logo-transparent-1.png");

// Video showreel resolution with automatic fallback
const videoUrl = resolveVideoUrl("videos/showreel.mp4", "https://digisay.com/wp-content/uploads/2024/03/GFF-No-Logo-1.mp4");
```

### 2. Angular Dashboard (`dashboard/`)
Inject `StorageService` in Angular components:

```typescript
import { Component, inject } from '@angular/core';
import { StorageService } from './core/storage.service';

@Component({ ... })
export class OverviewComponent {
  private readonly storage = inject(StorageService);
  readonly avatarUrl = this.storage.resolve('public-media', 'images/avatar.jpg');
}
```

### 3. ASP.NET Core Backend (`backend/`)
Inject `IStorageService` into application handlers for generating signed URLs or validating file uploads:

```csharp
public interface IStorageService
{
    Task<string> GetPublicUrlAsync(string bucket, string path, CancellationToken ct = default);
    Task<string> GetSignedUrlAsync(string bucket, string path, TimeSpan expiresIn, CancellationToken ct = default);
}
```

---

## Environment Configuration

Configure the Supabase Storage CDN URL in the respective application environment:

- **Public Frontend (`public/.env`):**
  ```bash
  VITE_SUPABASE_STORAGE_URL=https://<your-supabase-project>.supabase.co/storage/v1/object/public
  ```
- **Dashboard (`dashboard/public/runtime-config.js`):**
  ```javascript
  window.digisayRuntimeConfig = {
    apiBaseUrl: 'http://localhost:5080',
    storageBaseUrl: 'https://<your-supabase-project>.supabase.co/storage/v1/object/public'
  };
  ```
- **Backend (`backend/src/DigiSay.Api/appsettings.json`):**
  ```json
  "Storage": {
    "Provider": "Supabase",
    "SupabaseUrl": "https://<your-supabase-project>.supabase.co",
    "PublicBucket": "public-media"
  }
  ```
