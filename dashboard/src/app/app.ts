import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  imports: [RouterOutlet],
  selector: 'ds-root',
  template: `
    <router-outlet />
    <a class="skip-link" href="#main-content">Skip to content</a>
  `,
  styles: `
    .skip-link { position: fixed; left: 1rem; top: 1rem; z-index: 100; transform: translateY(-200%); }
    .skip-link:focus { transform: translateY(0); }
  `,
})
export class App {}
