import { Injectable, inject, signal } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SidebarService {
  private readonly router = inject(Router);
  readonly isCollapsed = signal(false);
  readonly isMobileOpen = signal(false);

  constructor() {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.closeMobile();
      });
  }

  toggle() {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      this.isMobileOpen.update((open) => !open);
    } else {
      this.isCollapsed.update((collapsed) => !collapsed);
    }
  }

  closeMobile() {
    this.isMobileOpen.set(false);
  }
}
