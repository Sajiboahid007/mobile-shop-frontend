import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { MessageService } from 'primeng/api';
import { WishlistService } from '../../core/services/wishlist.service';
import { CartService } from '../../core/services/cart.service';
import { CompareService } from '../../core/services/compare.service';
import { Product } from '../../core/models/models';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [CommonModule, RouterLink, ButtonModule, TagModule],
  templateUrl: './wishlist.component.html',
  styleUrls: ['./wishlist.component.scss'],
})
export class WishlistComponent {
  fileBase = environment.fileBaseUrl;
  placeholder =
    'data:image/svg+xml;charset=UTF-8,' +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300"><rect width="100%" height="100%" fill="#eef2f7"/><text x="50%" y="50%" font-size="16" fill="#94a3b8" text-anchor="middle" dy=".3em">No Image</text></svg>`
    );

  constructor(
    public wishlist: WishlistService,
    public cart: CartService,
    public compare: CompareService,
    private messageService: MessageService
  ) {}

  getImage(p: Product): string {
    const primary = p.images?.find((i) => i.isPrimary) || p.images?.[0];
    if (!primary) return this.placeholder;
    return primary.url.startsWith('http') ? primary.url : `${this.fileBase}${primary.url}`;
  }

  moveToCart(p: Product): void {
    if (p.isUpcoming || p.stock <= 0) return;
    this.cart.addToCart(p, null, null, 1);
    this.wishlist.removeFromWishlist(p.id);
    this.messageService.add({
      severity: 'success',
      summary: 'Moved to Bag',
      detail: `"${p.title}" moved to your shopping bag.`,
    });
  }

  addToCompare(p: Product): void {
    const res = this.compare.addToCompare(p);
    this.messageService.add({
      severity: res.success ? 'success' : 'warn',
      summary: res.success ? 'Added to Compare' : 'Comparison Notice',
      detail: res.message,
    });
  }

  removeItem(p: Product): void {
    this.wishlist.removeFromWishlist(p.id);
    this.messageService.add({
      severity: 'info',
      summary: 'Removed',
      detail: `"${p.title}" removed from favorites.`,
    });
  }
}
