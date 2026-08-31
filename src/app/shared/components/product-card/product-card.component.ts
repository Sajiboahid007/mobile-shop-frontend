import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';
import { Product } from '../../../core/models/models';
import { CartService } from '../../../core/services/cart.service';
import { WishlistService } from '../../../core/services/wishlist.service';
import { CompareService } from '../../../core/services/compare.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, RouterLink, CardModule, TagModule, ButtonModule, TooltipModule],
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.scss'],
})
export class ProductCardComponent {
  @Input({ required: true }) product!: Product;

  fileBase = environment.fileBaseUrl;
  placeholder =
    'data:image/svg+xml;charset=UTF-8,' +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300"><rect width="100%" height="100%" fill="#eef2f7"/><text x="50%" y="50%" font-size="16" fill="#94a3b8" text-anchor="middle" dy=".3em">No Image</text></svg>`
    );

  constructor(
    public cart: CartService,
    public wishlist: WishlistService,
    public compare: CompareService,
    private messageService: MessageService
  ) {}

  get imageUrl(): string {
    const primary = this.product.images?.find((i) => i.isPrimary) || this.product.images?.[0];
    if (!primary) return this.placeholder;
    return primary.url.startsWith('http') ? primary.url : `${this.fileBase}${primary.url}`;
  }

  get hasDiscount(): boolean {
    return !!this.product.discountPrice && this.product.discountPrice < this.product.price;
  }

  get discountPercent(): number {
    if (!this.hasDiscount) return 0;
    const diff = this.product.price - (this.product.discountPrice || this.product.price);
    return Math.round((diff / this.product.price) * 100);
  }

  get keySpecs(): string[] {
    const specs: string[] = [];
    if (this.product.type === 'PHONE' && this.product.phoneDetail) {
      if (this.product.phoneDetail.ram && this.product.phoneDetail.storage) {
        specs.push(`${this.product.phoneDetail.ram} / ${this.product.phoneDetail.storage}`);
      }
      if (this.product.phoneDetail.camera) {
        specs.push(this.product.phoneDetail.camera.split('+')[0] + ' Cam');
      }
      if (this.product.phoneDetail.battery) {
        specs.push(this.product.phoneDetail.battery);
      }
    } else if (this.product.type === 'LAPTOP' && this.product.laptopDetail) {
      if (this.product.laptopDetail.processor) {
        specs.push(this.product.laptopDetail.processor);
      }
      if (this.product.laptopDetail.ram && this.product.laptopDetail.storage) {
        specs.push(`${this.product.laptopDetail.ram} | ${this.product.laptopDetail.storage}`);
      }
    }
    return specs.slice(0, 2);
  }

  toggleWishlist(event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    const added = this.wishlist.toggleWishlist(this.product);
    this.messageService.add({
      severity: added ? 'success' : 'info',
      summary: added ? 'Saved to Wishlist' : 'Removed from Wishlist',
      detail: added
        ? `"${this.product.title}" added to your favorites.`
        : `"${this.product.title}" removed from your favorites.`,
      life: 2000,
    });
  }

  toggleCompare(event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    if (this.compare.isInCompare(this.product.id)) {
      this.compare.removeFromCompare(this.product.id);
      this.messageService.add({
        severity: 'info',
        summary: 'Removed from Comparison',
        detail: `"${this.product.title}" removed from comparison.`,
        life: 2000,
      });
    } else {
      const res = this.compare.addToCompare(this.product);
      this.messageService.add({
        severity: res.success ? 'success' : 'warn',
        summary: res.success ? 'Added to Compare' : 'Comparison Full',
        detail: res.message,
        life: 2500,
      });
    }
  }

  quickAddToCart(event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    if (this.product.isUpcoming || this.product.stock <= 0) return;
    this.cart.addToCart(this.product, null, null, 1);
    this.messageService.add({
      severity: 'success',
      summary: 'Added to Bag',
      detail: `"${this.product.title}" added to your bag.`,
      life: 2000,
    });
  }

  onCardClick(): void {
    if (this.product?.id) {
      sessionStorage.setItem('lastViewedProductId', String(this.product.id));
    }
  }
}
