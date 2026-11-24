import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, input, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import {
  CrmApiService,
  CrmKind,
  CrmRecord,
  LeadRecord,
  ServiceRequestRecord,
} from './crm-api.service';

const LEAD_NEXT: Record<string, string[]> = {
  New: ['Contacted', 'Lost'],
  Contacted: ['Qualified', 'Lost'],
  Qualified: ['Proposal', 'Lost'],
  Proposal: ['Negotiation', 'Lost'],
  Negotiation: ['Converted', 'Lost'],
};
const REQUEST_NEXT: Record<string, string[]> = {
  Submitted: ['UnderReview', 'Cancelled'],
  UnderReview: ['Approved', 'Declined', 'Cancelled'],
  Approved: ['InProgress', 'Cancelled'],
  InProgress: ['Completed', 'Cancelled'],
};
const LEAD_STATUSES = [
  'New',
  'Contacted',
  'Qualified',
  'Proposal',
  'Negotiation',
  'Converted',
  'Lost',
];
const REQUEST_STATUSES = [
  'Submitted',
  'UnderReview',
  'Approved',
  'InProgress',
  'Completed',
  'Declined',
  'Cancelled',
];

@Component({
  selector: 'ds-crm-workflow',
  imports: [FormsModule, DatePipe, RouterLink],
  templateUrl: './crm-workflow.component.html',
})
export class CrmWorkflowComponent implements OnInit {
  readonly kind = input.required<CrmKind>();
  private readonly api = inject(CrmApiService);
  private readonly auth = inject(AuthService);
  readonly records = signal<CrmRecord[]>([]);
  readonly loaded = signal(false);
  readonly busy = signal(false);
  readonly error = signal('');
  readonly permissionDenied = signal(false);
  readonly notice = signal('');
  readonly selected = signal<CrmRecord | null>(null);
  readonly formOpen = signal(false);
  readonly editing = signal(false);
  readonly formError = signal('');
  readonly totalCount = signal(0);
  readonly page = signal(1);
  readonly totalPages = signal(1);
  readonly query = signal('');
  readonly statusFilter = signal('');
  readonly form = this.emptyForm();
  readonly isLeads = computed(() => this.kind() === 'leads');
  readonly canMutate = computed(
    () =>
      this.auth.isAdmin() &&
      this.auth.organizations().find((org) => org.id === this.auth.activeOrganizationId())
        ?.membershipRole === 'Owner',
  );
  readonly canCreate = computed(
    () =>
      this.auth.isAdmin() &&
      (!this.isLeads() ||
        this.auth.organizations().find((org) => org.id === this.auth.activeOrganizationId())
          ?.membershipRole === 'Owner'),
  );
  readonly activeOrganizationName = computed(
    () =>
      this.auth.organizations().find((org) => org.id === this.auth.activeOrganizationId())?.name ??
      'No organization selected',
  );
  readonly statuses = computed(() => (this.isLeads() ? LEAD_STATUSES : REQUEST_STATUSES));
  readonly filteredRecords = computed(() => {
    const term = this.query().trim().toLowerCase();
    return this.records().filter((record) => {
      const matchesStatus = !this.statusFilter() || record.status === this.statusFilter();
      const text = this.isLeads()
        ? `${(record as LeadRecord).name} ${(record as LeadRecord).email} ${(record as LeadRecord).source ?? ''}`
        : `${(record as ServiceRequestRecord).title} ${(record as ServiceRequestRecord).service} ${(record as ServiceRequestRecord).description}`;
      return matchesStatus && (!term || text.toLowerCase().includes(term));
    });
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    if (this.busy()) return;
    this.busy.set(true);
    this.error.set('');
    this.permissionDenied.set(false);
    this.api.list(this.kind(), this.page()).subscribe({
      next: (result) => {
        this.records.set(result.items);
        this.totalCount.set(result.totalCount);
        this.totalPages.set(Math.max(result.totalPages, 1));
        this.loaded.set(true);
        this.busy.set(false);
      },
      error: (error: unknown) => {
        this.describeError(error);
        this.loaded.set(true);
        this.busy.set(false);
      },
    });
  }

  openCreate(): void {
    if (!this.canMutate()) return;
    this.selected.set(null);
    Object.assign(this.form, this.emptyForm());
    this.editing.set(false);
    this.formError.set('');
    this.formOpen.set(true);
  }

  openEdit(): void {
    const record = this.selected();
    if (!record || !this.canMutate()) return;
    Object.assign(
      this.form,
      this.emptyForm(),
      this.isLeads()
        ? {
            name: (record as LeadRecord).name,
            email: (record as LeadRecord).email,
            phone: (record as LeadRecord).phone ?? '',
            source: (record as LeadRecord).source ?? '',
          }
        : {
            title: (record as ServiceRequestRecord).title,
            service: (record as ServiceRequestRecord).service,
            description: (record as ServiceRequestRecord).description,
          },
    );
    this.editing.set(true);
    this.formError.set('');
    this.formOpen.set(true);
  }

  selectOrganization(id: string): void {
    if (!this.auth.organizations().some((organization) => organization.id === id)) return;
    this.auth.activeOrganizationId.set(id);
    this.selected.set(null);
    this.formOpen.set(false);
    this.editing.set(false);
    this.page.set(1);
    this.records.set([]);
    this.loaded.set(false);
    this.notice.set('');
    this.load();
  }

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages() || this.busy()) return;
    this.page.set(page);
    this.load();
  }

  closeForm(): void {
    if (!this.busy()) this.formOpen.set(false);
  }

  save(): void {
    if (this.busy() || !this.canMutate()) return;
    const payload = this.isLeads()
      ? {
          name: this.form['name'].trim(),
          email: this.form['email'].trim(),
          phone: this.form['phone'].trim(),
          source: this.form['source'].trim(),
        }
      : {
          title: this.form['title'].trim(),
          service: this.form['service'].trim(),
          description: this.form['description'].trim(),
        };
    const record = this.selected();
    this.busy.set(true);
    this.formError.set('');
    const request =
      this.editing() && record
        ? this.api.update(this.kind(), record.id, payload)
        : this.api.create(this.kind(), payload);
    request.subscribe({
      next: () => {
        this.busy.set(false);
        this.formOpen.set(false);
        this.selected.set(null);
        this.notice.set(this.editing() ? 'Record updated.' : 'Record created.');
        this.load();
      },
      error: (error: unknown) => {
        this.busy.set(false);
        this.formError.set(this.errorMessage(error));
      },
    });
  }

  inspect(record: CrmRecord): void {
    this.selected.set(record);
  }

  transition(record: CrmRecord, status: string): void {
    if (!status || this.busy() || !this.canMutate()) return;
    this.busy.set(true);
    this.error.set('');
    this.api.transition(this.kind(), record.id, status).subscribe({
      next: () => {
        this.busy.set(false);
        this.notice.set(`Status changed to ${this.displayStatus(status)}.`);
        this.load();
      },
      error: (error: unknown) => {
      error: (error: unknown) => {
        this.busy.set(false);
        this.error.set(this.errorMessage(error));
      },
    });
  }

  nextStatuses(record: CrmRecord): string[] {
    return (this.isLeads() ? LEAD_NEXT : REQUEST_NEXT)[record.status] ?? [];
  }
  displayStatus(value: string): string {
    return value.replace(/([a-z])([A-Z])/g, '$1 $2');
  }
  primary(record: CrmRecord): string {
    return this.isLeads() ? (record as LeadRecord).name : (record as ServiceRequestRecord).title;
  }
  secondary(record: CrmRecord): string {
    return this.isLeads()
      ? (record as LeadRecord).source || 'No source provided'
      : (record as ServiceRequestRecord).description;
  }
  contact(record: CrmRecord): string {
    return this.isLeads() ? (record as LeadRecord).email : (record as ServiceRequestRecord).service;
  }

  private emptyForm() {
    return { name: '', email: '', phone: '', source: '', title: '', service: '', description: '' };
  }

  private describeError(error: unknown): void {
    if (error instanceof HttpErrorResponse && error.status === 401) {
      this.permissionDenied.set(false);
      this.error.set(this.errorMessage(error));
    } else if (
      error instanceof HttpErrorResponse &&
      (error.status === 403 || error.status === 404)
    ) {
      this.permissionDenied.set(true);
      this.error.set('');
    } else this.error.set(this.errorMessage(error));
  }

  private errorMessage(error: unknown): string {
    if (!(error instanceof HttpErrorResponse)) return 'Something went wrong. Please try again.';
    if (error.status === 0) return 'Could not reach the API. Check your connection and retry.';
    if (error.status === 401) return 'Your sign-in expired. Sign in again to continue.';
    if (error.status === 403) return 'Your account is not allowed to perform this action.';
    if (error.status === 409)
      return 'That lifecycle change is no longer valid. Refresh the records and choose an available action.';
    if (error.status === 400 && error.error?.errors)
      return Object.values(error.error.errors as Record<string, string[]>)
        .flat()
        .join(' ');
    return (
      error.error?.detail ??
      error.error?.title ??
      'The API could not save this record. Retry in a moment.'
    );
  }
}
