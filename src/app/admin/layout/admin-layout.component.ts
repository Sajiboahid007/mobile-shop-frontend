import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet, ButtonModule],
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.scss'],
})
export class AdminLayoutComponent {
  sidebarOpen = false;

  navItems = [
    { label: 'Dashboard', icon: 'pi pi-th-large', link: '/admin/dashboard' },
    { label: 'Orders', icon: 'pi pi-shopping-bag', link: '/admin/orders' },
    { label: 'Products', icon: 'pi pi-box', link: '/admin/products' },
    { label: 'Reviews', icon: 'pi pi-star', link: '/admin/reviews' },
    { label: 'Brands', icon: 'pi pi-tags', link: '/admin/brands' },
    { label: 'Categories', icon: 'pi pi-sitemap', link: '/admin/categories' },
    { label: 'Colors', icon: 'pi pi-palette', link: '/admin/colors' },
    { label: 'Banners', icon: 'pi pi-images', link: '/admin/banners' },
  ];

  constructor(public auth: AuthService, private router: Router) {}

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/admin/login']);
  }
}
