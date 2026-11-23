import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly isDark = signal(true);

  constructor() {
    this.init();
  }

  private init() {
    if (typeof window === 'undefined') return;
    const saved = localStorage.getItem('digisay_theme');
    const isDark = saved ? saved === 'dark' : document.documentElement.classList.contains('dark') || true;
    this.isDark.set(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  toggle() {
    const next = !this.isDark();
    this.isDark.set(next);
    if (typeof window !== 'undefined') {
      if (next) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('digisay_theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('digisay_theme', 'light');
      }
    }
  }
}
