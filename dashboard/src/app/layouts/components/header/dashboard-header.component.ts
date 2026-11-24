import { Component, inject, input } from '@angular/core';
import { SidebarService } from '../../../core/sidebar.service';
import { ThemeService } from '../../../core/theme.service';
import { AuthService } from '../../../core/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'ds-dashboard-header',
  standalone: true,
  templateUrl: './dashboard-header.component.html',
})
export class DashboardHeaderComponent {
  protected readonly sidebar = inject(SidebarService);
  protected readonly theme = inject(ThemeService);
  protected readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly title = input.required<string>();
  readonly category = input<string>('DIGISAY PLATFORM');
  readonly badge = input<string>('Dashboard setup');

  protected signOut(): void {
    const signInPath = this.router.url.startsWith('/client') ? '/client/sign-in' : '/admin/sign-in';
    this.auth.signOut();
    void this.router.navigateByUrl(signInPath);
  }
}
