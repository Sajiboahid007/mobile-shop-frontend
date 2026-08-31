import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="not-found">
      <h1>404</h1>
      <p>Page not found.</p>
      <a routerLink="/">Go back home</a>
    </div>
  `,
  styles: [
    `
      .not-found {
        text-align: center;
        padding: 6rem 1rem;
      }
      .not-found h1 {
        font-size: 4rem;
        margin: 0;
        color: #1e293b;
      }
      .not-found a {
        color: #2563eb;
        font-weight: 500;
      }
    `,
  ],
})
export class NotFoundComponent {}
