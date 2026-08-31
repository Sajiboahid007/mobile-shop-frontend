import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { GalleriaModule } from 'primeng/galleria';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { TooltipModule } from 'primeng/tooltip';
import { ProgressBarModule } from 'primeng/progressbar';
import { MessageService, SharedModule } from 'primeng/api';

import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { WishlistService } from '../../core/services/wishlist.service';
import { CompareService } from '../../core/services/compare.service';
import { ReviewService } from '../../core/services/review.service';
import { Product, Review, ReviewSummary } from '../../core/models/models';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    GalleriaModule,
    TagModule,
    ButtonModule,
    ProgressSpinnerModule,
    DialogModule,
    InputTextModule,
    InputTextareaModule,
    TooltipModule,
    ProgressBarModule,
    SharedModule,
    ProductCardComponent,
  ],
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.scss'],
})
export class ProductDetailsComponent implements OnInit {
  product: Product | null = null;
  loading = true;
  notFound = false;
  fileBase = environment.fileBaseUrl;
  galleryImages: { url: string }[] = [];

  // Variants
  selectedStorage = '';
  selectedColor = '';
  storageOptions: { label: string; priceDiff: number }[] = [];
  colorOptions: string[] = [];
  quantity = 1;

  // Modals & Tools
  emiModalOpen = false;
  tradeInModalOpen = false;
  writeReviewModalOpen = false;
  activeTab: 'specs' | 'reviews' | 'emi' = 'specs';

  // Trade-In State
  tradeInForm = {
    brand: 'Apple',
    model: 'iPhone 13 Pro',
    condition: 'Good',
  };
  estimatedTradeInValue = 32000;

  // Reviews
  reviews: Review[] = [];
  reviewSummary: ReviewSummary = {
    total: 0,
    average: 4.8,
    distribution: { 5: 12, 4: 4, 3: 1, 2: 0, 1: 0 },
  };
  loadingReviews = false;
  reviewForm = {
    name: '',
    email: '',
    rating: 5,
    title: '',
    comment: '',
  };
  submittingReview = false;

  // Similar Products
  similarProducts: Product[] = [];

  responsiveOptions = [
    { breakpoint: '768px', numVisible: 4 },
    { breakpoint: '560px', numVisible: 3 },
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    public cart: CartService,
    public wishlist: WishlistService,
    public compare: CompareService,
    private reviewService: ReviewService,
    private messageService: MessageService
  ) {}

  goBackToCatalog(): void {
    if (this.product) {
      sessionStorage.setItem('lastViewedProductId', String(this.product.id));
      this.router.navigate(['/'], { fragment: `product-${this.product.id}` });
    } else {
      this.router.navigate(['/']);
    }
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const idOrSlug = params.get('idOrSlug');
      if (!idOrSlug) return;
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      this.loadProduct(idOrSlug);
    });
  }

  loadProduct(idOrSlug: string): void {
    this.loading = true;
    this.notFound = false;
    this.quantity = 1;

    this.productService.getProduct(idOrSlug).subscribe({
      next: (p) => {
        this.product = p;
        this.galleryImages = (p.images.length
          ? p.images
          : [{ url: '' } as any]
        ).map((img) => ({ url: img.url ? `${this.fileBase}${img.url}` : this.placeholder() }));

        this.setupVariants(p);
        this.loadReviews(p.id);
        this.loadSimilarProducts(p);
        this.loading = false;
      },
      error: () => {
        this.notFound = true;
        this.loading = false;
      },
    });
  }

  setupVariants(p: Product): void {
    const rawStorage = p.phoneDetail?.storage || p.laptopDetail?.storage || '128GB';

    if (rawStorage.includes('/') || rawStorage.includes(',')) {
      const parts = rawStorage.split(/[/,]/).map((s) => s.trim());
      this.storageOptions = parts.map((st, i) => ({ label: st, priceDiff: i * 8000 }));
      this.selectedStorage = parts[0];
    } else {
      this.storageOptions = [
        { label: rawStorage, priceDiff: 0 },
        { label: '256GB', priceDiff: 10000 },
        { label: '512GB', priceDiff: 22000 },
      ];
      this.selectedStorage = rawStorage;
    }

    if (p.colors && p.colors.length > 0) {
      this.colorOptions = p.colors.map((pc) => pc.color.name);
      this.selectedColor = this.colorOptions[0];
    } else {
      const rawColor = p.phoneDetail?.color || p.laptopDetail?.color || 'Midnight Black';
      if (rawColor.includes('/') || rawColor.includes(',')) {
        this.colorOptions = rawColor.split(/[/,]/).map((c) => c.trim());
        this.selectedColor = this.colorOptions[0];
      } else {
        this.colorOptions = [rawColor, 'Titanium Gray', 'Ocean Blue'].filter(
          (v, i, a) => a.indexOf(v) === i
        );
        this.selectedColor = rawColor;
      }
    }
  }

  getColorHex(colorName: string): string {
    if (this.product?.colors) {
      const matched = this.product.colors.find(
        (pc) => pc.color.name.toLowerCase() === colorName.toLowerCase()
      );
      if (matched?.color.hexCode) return matched.color.hexCode;
    }
    const lower = colorName.toLowerCase();
    if (lower.includes('black')) return '#1c1c1e';
    if (lower.includes('white')) return '#f4f4f4';
    if (lower.includes('blue')) return '#2563eb';
    if (lower.includes('purple')) return '#7c3aed';
    if (lower.includes('green')) return '#16a34a';
    if (lower.includes('gold')) return '#eab308';
    if (lower.includes('silver') || lower.includes('gray') || lower.includes('grey')) return '#94a3b8';
    return '#475569';
  }

  loadReviews(productId: number): void {
    this.loadingReviews = true;
    this.reviewService.getProductReviews(productId).subscribe({
      next: (res) => {
        this.reviews = res.reviews;
        if (res.summary && res.summary.total > 0) {
          this.reviewSummary = res.summary;
        }
        this.loadingReviews = false;
      },
      error: () => (this.loadingReviews = false),
    });
  }

  loadSimilarProducts(p: Product): void {
    this.productService.getProducts({ brand: p.brandId.toString(), limit: 4 }).subscribe({
      next: (res) => {
        this.similarProducts = res.items.filter((item) => item.id !== p.id).slice(0, 3);
      },
    });
  }

  placeholder(): string {
    return (
      'data:image/svg+xml;charset=UTF-8,' +
      encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" width="500" height="500"><rect width="100%" height="100%" fill="#eef2f7"/><text x="50%" y="50%" font-size="20" fill="#94a3b8" text-anchor="middle" dy=".3em">No Image</text></svg>`
      )
    );
  }

  get storagePriceDiff(): number {
    const found = this.storageOptions.find((s) => s.label === this.selectedStorage);
    return found ? found.priceDiff : 0;
  }

  get finalPrice(): number {
    if (!this.product) return 0;
    const base = this.product.discountPrice && this.product.discountPrice < this.product.price
      ? this.product.discountPrice
      : this.product.price;
    return base + this.storagePriceDiff;
  }

  get originalCalculatedPrice(): number {
    if (!this.product) return 0;
    return this.product.price + this.storagePriceDiff;
  }

  get hasDiscount(): boolean {
    return !!this.product?.discountPrice && this.product.discountPrice < this.product.price;
  }

  get discountPercent(): number {
    if (!this.hasDiscount || !this.product) return 0;
    const diff = this.originalCalculatedPrice - this.finalPrice;
    return Math.round((diff / this.originalCalculatedPrice) * 100);
  }

  get emi3Months(): number {
    return Math.round(this.finalPrice / 3);
  }

  get emi6Months(): number {
    return Math.round(this.finalPrice / 6);
  }

  get emi12Months(): number {
    return Math.round(this.finalPrice / 12);
  }

  get emi24Months(): number {
    return Math.round(this.finalPrice / 24);
  }

  calculateTradeIn(): void {
    let base = 25000;
    if (this.tradeInForm.brand === 'Apple') base = 35000;
    else if (this.tradeInForm.brand === 'Samsung') base = 28000;
    else if (this.tradeInForm.brand === 'Google') base = 24000;

    let multiplier = 1.0;
    if (this.tradeInForm.condition === 'Flawless') multiplier = 1.25;
    else if (this.tradeInForm.condition === 'Good') multiplier = 1.0;
    else multiplier = 0.75;

    this.estimatedTradeInValue = Math.round(base * multiplier);
  }

  addToBag(): void {
    if (!this.product || this.product.isUpcoming || this.product.stock <= 0) return;
    this.cart.addToCart(
      this.product,
      this.selectedColor,
      this.selectedStorage,
      this.quantity,
      this.finalPrice
    );
    this.messageService.add({
      severity: 'success',
      summary: 'Added to Shopping Bag',
      detail: `"${this.product.title}" (${this.selectedStorage}) added to bag.`,
    });
  }

  buyNow(): void {
    if (!this.product || this.product.isUpcoming || this.product.stock <= 0) return;
    this.addToBag();
  }

  toggleWishlist(): void {
    if (!this.product) return;
    const added = this.wishlist.toggleWishlist(this.product);
    this.messageService.add({
      severity: added ? 'success' : 'info',
      summary: added ? 'Saved to Wishlist' : 'Removed',
      detail: added ? 'Device saved to your favorites.' : 'Device removed from favorites.',
    });
  }

  toggleCompare(): void {
    if (!this.product) return;
    if (this.compare.isInCompare(this.product.id)) {
      this.compare.removeFromCompare(this.product.id);
      this.messageService.add({
        severity: 'info',
        summary: 'Removed from Comparison',
        detail: `"${this.product.title}" removed.`,
      });
    } else {
      const res = this.compare.addToCompare(this.product);
      this.messageService.add({
        severity: res.success ? 'success' : 'warn',
        summary: res.success ? 'Added to Compare' : 'Comparison Full',
        detail: res.message,
      });
    }
  }

  submitReview(): void {
    if (!this.product) return;
    if (!this.reviewForm.name.trim() || !this.reviewForm.email.trim() || !this.reviewForm.comment.trim()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Missing Fields',
        detail: 'Please fill in your name, email, and review comment.',
      });
      return;
    }

    this.submittingReview = true;
    this.reviewService
      .createReview({
        productId: this.product.id,
        name: this.reviewForm.name,
        email: this.reviewForm.email,
        rating: this.reviewForm.rating,
        title: this.reviewForm.title,
        comment: this.reviewForm.comment,
      })
      .subscribe({
        next: (created) => {
          this.submittingReview = false;
          this.reviews.unshift(created);
          this.writeReviewModalOpen = false;
          this.reviewForm = { name: '', email: '', rating: 5, title: '', comment: '' };
          this.messageService.add({
            severity: 'success',
            summary: 'Review Submitted!',
            detail: 'Thank you for sharing your verified review.',
          });
        },
        error: (err) => {
          this.submittingReview = false;
          this.messageService.add({
            severity: 'error',
            summary: 'Review Failed',
            detail: err?.error?.message || 'Could not submit review.',
          });
        },
      });
  }

  getStarPercentage(stars: number): number {
    const total = this.reviewSummary.total || 1;
    const count = this.reviewSummary.distribution[stars] || 0;
    return Math.round((count / total) * 100);
  }

  get specRows(): { label: string; value: string }[] {
    if (!this.product) return [];
    const rows: { label: string; value: string | null | undefined }[] =
      this.product.type === 'PHONE'
        ? [
            { label: 'Processor / Chipset', value: this.product.phoneDetail?.processor },
            { label: 'RAM', value: this.product.phoneDetail?.ram },
            { label: 'Internal Storage', value: this.selectedStorage || this.product.phoneDetail?.storage },
            { label: 'Display Screen', value: this.product.phoneDetail?.display },
            { label: 'Display Panel Type', value: this.product.phoneDetail?.displayType },
            { label: 'Rear Camera System', value: this.product.phoneDetail?.camera },
            { label: 'Front Selfie Camera', value: this.product.phoneDetail?.frontCamera },
            { label: 'Battery & Power', value: this.product.phoneDetail?.battery },
            { label: 'Operating System', value: this.product.phoneDetail?.os },
            { label: 'Network & Connectivity', value: this.product.phoneDetail?.network },
            { label: 'Available Colors', value: this.product.phoneDetail?.color },
            { label: 'Official Warranty', value: this.product.phoneDetail?.warranty || '1 Year Official' },
          ]
        : [
            { label: 'Processor', value: this.product.laptopDetail?.processor },
            { label: 'RAM', value: this.product.laptopDetail?.ram },
            { label: 'Storage', value: this.selectedStorage || this.product.laptopDetail?.storage },
            { label: 'Storage Type', value: this.product.laptopDetail?.storageType },
            { label: 'Display Screen', value: this.product.laptopDetail?.display },
            { label: 'Graphics / GPU', value: this.product.laptopDetail?.graphics },
            { label: 'Operating System', value: this.product.laptopDetail?.os },
            { label: 'Battery Capacity', value: this.product.laptopDetail?.battery },
            { label: 'Weight', value: this.product.laptopDetail?.weight },
            { label: 'Ports & I/O', value: this.product.laptopDetail?.ports },
            { label: 'Colors', value: this.product.laptopDetail?.color },
            { label: 'Warranty', value: this.product.laptopDetail?.warranty || '1 Year Official' },
          ];

    return rows.filter((r) => r.value) as { label: string; value: string }[];
  }
}
