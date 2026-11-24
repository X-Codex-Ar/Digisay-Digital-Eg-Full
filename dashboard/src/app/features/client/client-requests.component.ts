import { HttpErrorResponse } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { CrmApiService, ServiceRequestRecord } from '../crm/crm-api.service';

@Component({
  selector: 'ds-client-requests',
  imports: [FormsModule, DatePipe, RouterLink],
  templateUrl: './client-requests.component.html',
})
export class ClientRequestsComponent implements OnInit {
  private readonly api = inject(CrmApiService);
  private readonly auth = inject(AuthService);

  readonly requests = signal<ServiceRequestRecord[]>([]);
  readonly loading = signal(false);
  readonly loaded = signal(false);
  readonly submitting = signal(false);
  readonly formOpen = signal(false);
  readonly permissionDenied = signal(false);
  readonly error = signal('');
  readonly formError = signal('');
  readonly success = signal('');
  readonly selected = signal<ServiceRequestRecord | null>(null);
  readonly query = signal('');
  readonly page = signal(1);
  readonly totalPages = signal(1);
  readonly totalCount = signal(0);
  readonly form = { title: '', service: '', description: '' };
  readonly organizations = this.auth.organizations;
  readonly activeOrganizationId = this.auth.activeOrganizationId;
  readonly organizationName = computed(
    () =>
      this.auth.organizations().find((item) => item.id === this.auth.activeOrganizationId())
        ?.name ?? 'Organization',
  );
  readonly filteredRequests = computed(() => {
    const term = this.query().trim().toLowerCase();
    return this.requests().filter(
      (request) =>
        !term ||
        `${request.title} ${request.service} ${request.description} ${request.status}`
          .toLowerCase()
          .includes(term),
    );
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    if (this.loading()) return;
    this.loading.set(true);
    this.error.set('');
    this.permissionDenied.set(false);
    this.api.listRequests(this.page()).subscribe({
      next: (result) => {
        this.requests.set(result.items);
        this.totalCount.set(result.totalCount);
        this.totalPages.set(Math.max(result.totalPages, 1));
        this.loaded.set(true);
        this.loading.set(false);
      },
      error: (error: unknown) => {
        this.handleError(error);
        this.loaded.set(true);
        this.loading.set(false);
      },
    });
  }

  submit(): void {
    if (this.submitting()) return;
    this.submitting.set(true);
    this.formError.set('');
    this.success.set('');
    this.api
      .createRequest({
        title: this.form.title.trim(),
        service: this.form.service.trim(),
        description: this.form.description.trim(),
      })
      .subscribe({
        next: (created) => {
          this.submitting.set(false);
          this.formOpen.set(false);
          this.form.title = '';
          this.form.service = '';
          this.form.description = '';
          this.success.set(`Request “${created.title}” was submitted.`);
          this.page.set(1);
          this.load();
        },
        error: (error: unknown) => {
          this.submitting.set(false);
          this.formError.set(this.errorMessage(error));
        },
      });
  }

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages() || this.loading()) return;
    this.page.set(page);
    this.load();
  }

  selectOrganization(id: string): void {
    if (!this.organizations().some((organization) => organization.id === id)) return;
    this.activeOrganizationId.set(id);
    this.page.set(1);
    this.requests.set([]);
    this.selected.set(null);
    this.loaded.set(false);
    this.load();
  }

  displayStatus(value: string): string {
    return value.replace(/([a-z])([A-Z])/g, '$1 $2');
  }

  private handleError(error: unknown): void {
    if (error instanceof HttpErrorResponse && error.status === 401) {
      this.error.set('Your sign-in expired. Sign in again to continue.');
    } else if (
      error instanceof HttpErrorResponse &&
      (error.status === 403 || error.status === 404)
    ) {
      this.permissionDenied.set(true);
    } else {
      this.error.set(this.errorMessage(error));
    }
  }

  private errorMessage(error: unknown): string {
    if (!(error instanceof HttpErrorResponse)) return 'Something went wrong. Please try again.';
    if (error.status === 0) return 'Could not reach the API. Check your connection and retry.';
    if (error.status === 401) return 'Your sign-in expired. Sign in again to continue.';
    if (error.status === 403 || error.status === 404)
      return 'This organization is no longer available to your account.';
    if (error.status === 400 && error.error?.errors)
      return Object.values(error.error.errors as Record<string, string[]>)
        .flat()
        .join(' ');
    return (
      error.error?.detail ?? error.error?.title ?? 'The request could not be submitted. Try again.'
    );
  }
}
