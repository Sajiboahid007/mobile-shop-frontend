import { Injectable, signal, computed, effect } from '@angular/core';
import { Product } from '../models/models';

const STORAGE_KEY = 'mobileshop_compare';
const MAX_COMPARE_LIMIT = 4;

@Injectable({
  providedIn: 'root',
})
export class CompareService {
  items = signal<Product[]>(this.loadCompare());
  count = computed(() => this.items().length);
  maxLimit = MAX_COMPARE_LIMIT;

  constructor() {
    effect(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.items()));
      } catch (e) {
        console.error('Failed to save comparison list', e);
      }
    });
  }

  private loadCompare(): Product[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  isInCompare(productId: number): boolean {
    return this.items().some((p) => p.id === productId);
  }

  addToCompare(product: Product): { success: boolean; message: string } {
    if (this.isInCompare(product.id)) {
      return { success: false, message: 'This device is already in your comparison list.' };
    }

    if (this.items().length >= MAX_COMPARE_LIMIT) {
      return {
        success: false,
        message: `You can compare a maximum of ${MAX_COMPARE_LIMIT} devices at a time. Remove one to add this.`,
      };
    }

    this.items.update((list) => [...list, product]);
    return {
      success: true,
      message: `"${product.title}" added to device comparison!`,
    };
  }

  removeFromCompare(productId: number): void {
    this.items.update((list) => list.filter((p) => p.id !== productId));
  }

  clearCompare(): void {
    this.items.set([]);
  }
}
