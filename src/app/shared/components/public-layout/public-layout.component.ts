import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { NavbarComponent } from '../navbar/navbar.component';
import { FooterComponent } from '../footer/footer.component';
import { CartDrawerComponent } from '../cart-drawer/cart-drawer.component';
import { CompareBarComponent } from '../compare-bar/compare-bar.component';

@Component({
  selector: 'app-public-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    ToastModule,
    NavbarComponent,
    FooterComponent,
    CartDrawerComponent,
    CompareBarComponent,
  ],
  template: `
    <p-toast position="top-right" [baseZIndex]="20000"></p-toast>
    <app-navbar></app-navbar>
    <main class="public-main">
      <router-outlet></router-outlet>
    </main>
    <app-footer></app-footer>
    <app-cart-drawer></app-cart-drawer>
    <app-compare-bar></app-compare-bar>
  `,
  styles: [
    `
      .public-main {
        min-height: calc(100vh - 220px);
      }
    `,
  ],
})
export class PublicLayoutComponent {}
