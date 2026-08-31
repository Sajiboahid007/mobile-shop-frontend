import { Injectable, signal, computed, effect } from '@angular/core';
import { Product } from '../models/models';

const STORAGE_KEY = 'mobileshop_wishlist';

@Injectable({
  providedIn: 'root',
})
export class WishlistService {
  items = signal<Product[]>(this.loadWishlist());
  count = computed(() => this.items().length);

  constructor() {
    effect(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.items()));
      } catch (e) {
        console.error('Failed to save wishlist', e);
      }
    });
  }

  private loadWishlist(): Product[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  isInWishlist(productId: number): boolean {
    return this.items().some((p) => p.id === productId);
  }

  toggleWishlist(product: Product): boolean {
    const exists = this.isInWishlist(product.id);
    if (exists) {
      this.items.update((list) => list.filter((p) => p.id !== product.id));
      return false;
    } else {
      this.items.update((list) => [...list, product]);
      return true;
    }
  }

  removeFromWishlist(productId: number): void {
    this.items.update((list) => list.filter((p) => p.id !== productId));
  }

  clearWishlist(): void {
    this.items.set([]);
  }
}
