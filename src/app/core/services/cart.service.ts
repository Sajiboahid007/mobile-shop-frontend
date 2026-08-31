import { Injectable, signal, computed, effect } from '@angular/core';
import { CartItem, Product, PromoCoupon } from '../models/models';
import { environment } from '../../../environments/environment';

const STORAGE_KEY = 'mobileshop_cart';
const COUPON_KEY = 'mobileshop_coupon';

export const AVAILABLE_COUPONS: PromoCoupon[] = [
  {
    code: 'MOBILE10',
    discountPercent: 10,
    maxDiscount: 10000,
    minSpend: 15000,
    description: '10% OFF on orders over ৳15,000 (Max ৳10,000)',
  },
  {
    code: 'SAVE5',
    discountPercent: 5,
    maxDiscount: 5000,
    minSpend: 5000,
    description: '5% OFF on all smartphone orders over ৳5,000',
  },
  {
    code: 'FLAGSHIP20',
    discountPercent: 15,
    maxDiscount: 20000,
    minSpend: 50000,
    description: '15% Mega Discount for flagship orders over ৳50,000',
  },
];

@Injectable({
  providedIn: 'root',
})
export class CartService {
  items = signal<CartItem[]>(this.loadCart());
  isOpen = signal<boolean>(false);
  appliedCoupon = signal<PromoCoupon | null>(this.loadCoupon());

  itemCount = computed(() =>
    this.items().reduce((total, item) => total + item.quantity, 0)
  );

  subtotal = computed(() =>
    this.items().reduce((total, item) => total + item.price * item.quantity, 0)
  );

  discountAmount = computed(() => {
    const coupon = this.appliedCoupon();
    const sub = this.subtotal();
    if (!coupon || sub < coupon.minSpend) return 0;
    const discount = (sub * coupon.discountPercent) / 100;
    return Math.min(discount, coupon.maxDiscount);
  });

  // Free shipping threshold at ৳30,000
  shippingFee = computed(() => {
    const sub = this.subtotal();
    if (sub === 0) return 0;
    return sub >= 30000 ? 0 : 120;
  });

  freeShippingThreshold = 30000;

  freeShippingProgress = computed(() => {
    const sub = this.subtotal();
    if (sub >= this.freeShippingThreshold) return 100;
    return Math.min(100, Math.round((sub / this.freeShippingThreshold) * 100));
  });

  freeShippingRemaining = computed(() => {
    const sub = this.subtotal();
    return Math.max(0, this.freeShippingThreshold - sub);
  });

  grandTotal = computed(() => {
    const total = this.subtotal() - this.discountAmount() + this.shippingFee();
    return Math.max(0, total);
  });

  constructor() {
    effect(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.items()));
      } catch (e) {
        console.error('Failed to save cart to localStorage', e);
      }
    });

    effect(() => {
      try {
        const coupon = this.appliedCoupon();
        if (coupon) {
          localStorage.setItem(COUPON_KEY, JSON.stringify(coupon));
        } else {
          localStorage.removeItem(COUPON_KEY);
        }
      } catch (e) {
        console.error('Failed to save coupon to localStorage', e);
      }
    });
  }

  private loadCart(): CartItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private loadCoupon(): PromoCoupon | null {
    try {
      const data = localStorage.getItem(COUPON_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  open(): void {
    this.isOpen.set(true);
  }

  close(): void {
    this.isOpen.set(false);
  }

  toggle(): void {
    this.isOpen.update((v) => !v);
  }

  addToCart(
    product: Product,
    selectedColor?: string | null,
    selectedStorage?: string | null,
    quantity = 1,
    customPrice?: number
  ): void {
    const color = selectedColor || product.phoneDetail?.color || product.laptopDetail?.color || '';
    const storage = selectedStorage || product.phoneDetail?.storage || product.laptopDetail?.storage || '';
    const id = `${product.id}-${color}-${storage}`;

    const effectivePrice = customPrice !== undefined
      ? customPrice
      : (product.discountPrice != null && product.discountPrice > 0 ? product.discountPrice : product.price);

    const primaryImg = product.images?.find((i) => i.isPrimary) || product.images?.[0];
    const imageUrl = primaryImg ? (primaryImg.url.startsWith('http') ? primaryImg.url : `${environment.fileBaseUrl}${primaryImg.url}`) : '';

    const currentItems = [...this.items()];
    const index = currentItems.findIndex((i) => i.id === id);

    if (index > -1) {
      currentItems[index] = {
        ...currentItems[index],
        quantity: currentItems[index].quantity + quantity,
      };
    } else {
      currentItems.push({
        id,
        productId: product.id,
        title: product.title,
        slug: product.slug,
        price: effectivePrice,
        originalPrice: product.price,
        image: imageUrl,
        color,
        storage,
        quantity,
        stock: product.stock,
      });
    }

    this.items.set(currentItems);
    this.open();
  }

  updateQuantity(id: string, quantity: number): void {
    if (quantity <= 0) {
      this.removeItem(id);
      return;
    }
    this.items.update((items) =>
      items.map((i) => (i.id === id ? { ...i, quantity } : i))
    );
  }

  removeItem(id: string): void {
    this.items.update((items) => items.filter((i) => i.id !== id));
  }

  clearCart(): void {
    this.items.set([]);
    this.appliedCoupon.set(null);
  }

  applyCoupon(code: string): { success: boolean; message: string } {
    const cleanCode = code.trim().toUpperCase();
    const coupon = AVAILABLE_COUPONS.find((c) => c.code === cleanCode);

    if (!coupon) {
      return { success: false, message: 'Invalid promo code. Try MOBILE10 or SAVE5' };
    }

    if (this.subtotal() < coupon.minSpend) {
      return {
        success: false,
        message: `This coupon requires a minimum spend of ৳${coupon.minSpend.toLocaleString()}`,
      };
    }

    this.appliedCoupon.set(coupon);
    return {
      success: true,
      message: `Coupon "${coupon.code}" applied! You save ${coupon.discountPercent}%`,
    };
  }

  removeCoupon(): void {
    this.appliedCoupon.set(null);
  }
}
