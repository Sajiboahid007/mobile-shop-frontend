import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SidebarModule } from 'primeng/sidebar';
import { BadgeModule } from 'primeng/badge';
import { TooltipModule } from 'primeng/tooltip';
import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../core/services/cart.service';
import { WishlistService } from '../../../core/services/wishlist.service';
import { CompareService } from '../../../core/services/compare.service';
import { ProductService } from '../../../core/services/product.service';
import { Product } from '../../../core/models/models';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    RouterLinkActive,
    ButtonModule,
    InputTextModule,
    SidebarModule,
    BadgeModule,
    TooltipModule,
  ],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent {
  searchTerm = '';
  mobileMenuOpen = false;
  searchResults: Product[] = [];
  searchDropdownOpen = false;
  fileBase = environment.fileBaseUrl;

  constructor(
    private router: Router,
    public auth: AuthService,
    public cart: CartService,
    public wishlist: WishlistService,
    public compare: CompareService,
    private productService: ProductService
  ) {}

  onSearchInput(): void {
    const term = this.searchTerm.trim();
    if (term.length >= 2) {
      this.productService.getProducts({ search: term, limit: 5 }).subscribe({
        next: (res) => {
          this.searchResults = res.items;
          this.searchDropdownOpen = this.searchResults.length > 0;
        },
        error: () => {
          this.searchResults = [];
          this.searchDropdownOpen = false;
        },
      });
    } else {
      this.searchResults = [];
      this.searchDropdownOpen = false;
    }
  }

  selectProduct(p: Product): void {
    this.searchDropdownOpen = false;
    this.searchTerm = '';
    this.router.navigate(['/products', p.slug]);
  }

  search(): void {
    this.searchDropdownOpen = false;
    const term = this.searchTerm.trim();
    this.router.navigate(['/'], { queryParams: term ? { search: term } : {} });
    this.mobileMenuOpen = false;
  }

  closeMenu(): void {
    this.mobileMenuOpen = false;
  }

  getImage(p: Product): string {
    const primary = p.images?.find((i) => i.isPrimary) || p.images?.[0];
    if (!primary) return '';
    return primary.url.startsWith('http') ? primary.url : `${this.fileBase}${primary.url}`;
  }
}
