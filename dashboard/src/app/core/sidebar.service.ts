import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SidebarService {
  readonly isCollapsed = signal(false);
  readonly isMobileOpen = signal(false);

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
