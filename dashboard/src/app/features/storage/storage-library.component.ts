import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import { AuthService } from '../../core/auth.service';
import { StorageApiService, StoredObject } from './storage-api.service';

@Component({
  selector: 'ds-storage-library',
  standalone: true,
  imports: [DatePipe],
  template: `
    <section class="grid gap-6" aria-labelledby="storage-title">
      <header class="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span class="text-[.7rem] font-bold uppercase tracking-[.14em] text-muted-foreground">{{
            adminMode() ? 'Administration · Content' : 'Client portal · Deliverables'
          }}</span>
          <h1 id="storage-title" class="mb-2 mt-2 text-3xl font-bold tracking-tight">
            {{ adminMode() ? 'Organization content' : 'Your deliverables' }}
          </h1>
          <p class="m-0 text-sm text-muted-foreground">
            Private files in {{ organizationName() }}. Only validated PDF, JPEG, and PNG files up to
            10 MB are accepted.
          </p>
        </div>
        <button
          class="rounded-xl border border-border px-4 py-2.5 text-sm font-bold disabled:opacity-50"
          [disabled]="busy()"
          (click)="load()"
        >
          {{ busy() ? 'Refreshing…' : 'Refresh files' }}
        </button>
      </header>
      @if (canManage()) {
        <form
          class="flex flex-wrap items-end gap-3 rounded-2xl border border-border bg-card p-4"
          (submit)="$event.preventDefault(); upload()"
        >
          <label
            class="grid min-w-0 flex-1 gap-2 text-xs font-bold uppercase tracking-wide text-muted-foreground"
            >Upload file<input
              class="rounded-xl border border-border bg-background px-3 py-2.5 text-sm font-normal normal-case tracking-normal"
              type="file"
              accept=".pdf,image/jpeg,image/png"
              (change)="choose($event)" /></label
          ><button
            class="rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground disabled:opacity-50"
            [disabled]="busy() || !selectedFile()"
          >
            {{ busy() ? 'Working…' : 'Upload' }}
          </button>
        </form>
      }
      @if (!canManage()) {
        <p class="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm">
          Your membership is read-only for files. An organization Owner can upload or delete files.
        </p>
      }
      @if (notice()) {
        <p class="rounded-xl border border-primary/25 bg-primary/10 p-4 text-sm" role="status">
          {{ notice() }}
        </p>
      }
      @if (error()) {
        <p
          class="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm"
          role="alert"
        >
          {{ error() }}
        </p>
      }
      @if (!loaded() && busy()) {
        <p
          class="rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground"
          role="status"
        >
          Loading private files…
        </p>
      }
      @if (loaded() && files().length === 0 && !error()) {
        <div class="rounded-2xl border border-border bg-card p-8 text-center">
          <h2 class="m-0 text-lg font-bold">No files yet</h2>
          <p class="mb-0 mt-2 text-sm text-muted-foreground">
            Files uploaded for this organization will appear here.
          </p>
        </div>
      }
      @if (files().length > 0) {
        <div class="overflow-hidden rounded-2xl border border-border bg-card">
          <div class="overflow-x-auto">
            <table class="w-full min-w-[720px] text-left text-sm">
              <thead class="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th class="px-4 py-3">File ID</th>
                  <th class="px-4 py-3">Type</th>
                  <th class="px-4 py-3">Size</th>
                  <th class="px-4 py-3">Uploaded</th>
                  <th class="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                @for (file of files(); track file.id) {
                  <tr class="border-t border-border">
                    <td class="px-4 py-4 font-mono text-xs">{{ file.id }}</td>
                    <td class="px-4 py-4">{{ file.contentType }}</td>
                    <td class="px-4 py-4">{{ formatSize(file.sizeBytes) }}</td>
                    <td class="px-4 py-4 text-muted-foreground">
                      {{ file.createdAtUtc | date: 'mediumDate' }}
                    </td>
                    <td class="px-4 py-4">
                      <div class="flex gap-3">
                        <button
                          class="font-bold text-primary underline underline-offset-2"
                          [disabled]="busy()"
                          (click)="download(file)"
                        >
                          Create download link
                        </button>
                        @if (canManage()) {
                          <button
                            class="font-bold text-destructive underline underline-offset-2"
                            [disabled]="busy()"
                            (click)="remove(file)"
                          >
                            Delete
                          </button>
                        }
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }
      @if (downloadUrl(); as link) {
        <a
          class="w-fit rounded-xl border border-primary/30 px-4 py-3 text-sm font-bold text-primary underline underline-offset-2"
          [href]="link"
          target="_blank"
          rel="noopener noreferrer"
          >Open secure download link</a
        >
        <p class="-mt-4 text-xs text-muted-foreground">This link expires after five minutes.</p>
      }
      <p class="m-0 text-xs text-muted-foreground">
        Files are isolated by the API using the verified organization. The current storage contract
        provides IDs and technical metadata; human-readable filenames and deliverable approvals are
        not stored yet.
      </p>
    </section>
  `,
})
export class StorageLibraryComponent implements OnInit {
  readonly adminMode = () => window.location.pathname.startsWith('/admin/');
  private readonly auth = inject(AuthService);
  private readonly api = inject(StorageApiService);
  readonly organizationName = () =>
    this.auth.organizations().find((item) => item.id === this.auth.activeOrganizationId())?.name ??
    'this organization';
  readonly canManage = () =>
    this.auth.organizations().find((item) => item.id === this.auth.activeOrganizationId())
      ?.membershipRole === 'Owner';
  readonly files = signal<StoredObject[]>([]);
  readonly selectedFile = signal<File | null>(null);
  readonly downloadUrl = signal<string | null>(null);
  readonly busy = signal(false);
  readonly loaded = signal(false);
  readonly error = signal('');
  readonly notice = signal('');

  ngOnInit(): void {
    this.load();
  }
  choose(event: Event): void {
    this.selectedFile.set((event.target as HTMLInputElement).files?.[0] ?? null);
  }
  formatSize(bytes: number): string {
    return bytes < 1024 * 1024
      ? `${Math.max(1, Math.round(bytes / 1024))} KB`
      : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  load(): void {
    if (this.busy()) return;
    this.busy.set(true);
    this.error.set('');
    this.downloadUrl.set(null);
    this.api.list().subscribe({
      next: (files) => {
        this.files.set(files);
        this.loaded.set(true);
        this.busy.set(false);
      },
      error: (error: unknown) => {
        this.error.set(this.errorMessage(error));
        this.loaded.set(true);
        this.busy.set(false);
      },
    });
  }

  upload(): void {
    const file = this.selectedFile();
    if (!file || !this.canManage() || this.busy()) return;
    this.busy.set(true);
    this.error.set('');
    this.notice.set('');
    this.downloadUrl.set(null);
    this.api.upload(file).subscribe({
      next: (stored) => {
        this.selectedFile.set(null);
        this.notice.set(`File uploaded as ${stored.id}.`);
        this.busy.set(false);
        this.load();
      },
      error: (error: unknown) => {
        this.error.set(this.errorMessage(error));
        this.busy.set(false);
      },
    });
  }

  download(file: StoredObject): void {
    if (this.busy()) return;
    this.busy.set(true);
    this.error.set('');
    this.downloadUrl.set(null);
    this.api.downloadLink(file.id).subscribe({
      next: (link) => {
        this.downloadUrl.set(link.url);
        this.busy.set(false);
      },
      error: (error: unknown) => {
        this.error.set(this.errorMessage(error));
        this.busy.set(false);
      },
    });
  }

  remove(file: StoredObject): void {
    if (
      !this.canManage() ||
      this.busy() ||
      !window.confirm('Delete this organization file permanently?')
    )
      return;
    this.busy.set(true);
    this.error.set('');
    this.notice.set('');
    this.api.delete(file.id).subscribe({
      next: () => {
        this.notice.set('File deleted.');
        this.busy.set(false);
        this.load();
      },
      error: (error: unknown) => {
        this.error.set(this.errorMessage(error));
        this.busy.set(false);
      },
    });
  }

  private errorMessage(error: unknown): string {
    if (!(error instanceof HttpErrorResponse)) return 'The file operation could not be completed.';
    if (error.status === 0) return 'Could not reach the API. Check your connection and retry.';
    if (error.status === 401) return 'Your sign-in expired. Sign in again to continue.';
    if (error.status === 403) return 'Your organization role does not allow this file operation.';
    if (error.status === 404) return 'The file or selected organization could not be found.';
    if (error.status === 400)
      return error.error?.errors?.file?.[0] ?? 'Choose a valid PDF, JPEG, or PNG file up to 10 MB.';
    if (error.status === 502 || error.status === 503)
      return 'Private storage is unavailable. Check the Supabase storage configuration.';
    return 'The file operation failed. Please retry.';
  }
}
