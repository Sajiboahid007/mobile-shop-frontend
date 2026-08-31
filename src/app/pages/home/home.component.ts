import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { SelectButtonModule } from 'primeng/selectbutton';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { SidebarModule } from 'primeng/sidebar';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';

import { ProductService } from '../../core/services/product.service';
import { BrandService } from '../../core/services/brand.service';
import { CategoryService } from '../../core/services/category.service';
import { CartService } from '../../core/services/cart.service';
import { BannerService } from '../../core/services/banner.service';
import { Banner, Brand, Category, Product, ProductType } from '../../core/models/models';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import {
  SidebarFiltersComponent,
  FilterState,
} from '../../shared/components/sidebar-filters/sidebar-filters.component';
import { environment } from '../../../environments/environment';

interface HeroSlide {
  title: string;
  tagline?: string;
  badge?: string;
  desc?: string;
  description?: string;
  ctaText?: string;
  ctaLink?: string;
  bgGradient?: string;
  phoneTag?: string;
  image?: string | null;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    SelectButtonModule,
    PaginatorModule,
    ProgressSpinnerModule,
    SidebarModule,
    ButtonModule,
    DropdownModule,
    TagModule,
    TooltipModule,
    ProductCardComponent,
    SidebarFiltersComponent,
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, OnDestroy {
  typeOptions = [
    { label: 'Smartphones', value: 'PHONE' as ProductType },
    { label: 'Laptops', value: 'LAPTOP' as ProductType },
  ];
  selectedType: ProductType = 'PHONE';

  sortOptions = [
    { label: 'Newest Arrivals', value: 'newest' },
    { label: 'Price: Low to High', value: 'price_asc' },
    { label: 'Price: High to Low', value: 'price_desc' },
  ];
  selectedSort = 'newest';

  quickFilterPills = [
    { label: 'All Devices', filter: {} },
    { label: '⚡ Flash Deals', filter: { onSale: true } },
    { label: '🚀 5G Flagships', filter: { minPrice: 60000 } },
    { label: '🎮 Budget Gaming', filter: { minPrice: 20000, maxPrice: 45000 } },
    { label: '💰 Under ৳25,000', filter: { maxPrice: 25000 } },
    { label: '💎 Premium Laptops', filter: { type: 'LAPTOP' } },
  ];
  activePillIndex = 0;

  banners: Banner[] = [];
  fallbackSlides: HeroSlide[] = [
    {
      title: 'iPhone 16 Pro Max',
      tagline: 'Titanium. So Strong. So Light. So Pro.',
      badge: 'New Flagship Arrival',
      desc: 'Powered by the groundbreaking A18 Pro chip with Apple Intelligence and next-gen 48MP Fusion camera.',
      ctaText: 'Explore iPhone Deals',
      ctaLink: '/',
      bgGradient: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)',
      phoneTag: 'From ৳165,000 | 0% EMI Available',
    },
    {
      title: 'Samsung Galaxy S24 Ultra',
      tagline: 'Galaxy AI is Here',
      badge: 'Special Cashback',
      desc: 'Unleash unprecedented creativity and productivity with 200MP camera, built-in S-Pen, and Titanium frame.',
      ctaText: 'Shop Galaxy Series',
      ctaLink: '/',
      bgGradient: 'linear-gradient(135deg, #030712 0%, #064e3b 50%, #0f766e 100%)',
      phoneTag: 'Save up to ৳15,000 + Free Buds',
    },
    {
      title: 'Flash Tech Festival',
      tagline: 'Mega Discounts Across Top Brands',
      badge: 'Limited Time',
      desc: 'Use promo code MOBILE10 at checkout to unlock an extra 10% instant discount on smartphones & laptops.',
      ctaText: 'Claim Promo Code',
      ctaLink: '/',
      bgGradient: 'linear-gradient(135deg, #1e1b4b 0%, #4c1d95 50%, #831843 100%)',
      phoneTag: 'Use Code: MOBILE10',
    },
  ];
  currentSlide = 0;
  slideTimer: any;

  // Flash Deals Countdown Timer
  hours = 7;
  minutes = 42;
  seconds = 19;
  countdownTimer: any;

  // Newsletter
  newsletterEmail = '';

  categories: Category[] = [];
  brands: Brand[] = [];
  allBrands: Brand[] = [];
  products: Product[] = [];
  flashDealProducts: Product[] = [];

  loading = false;
  searchTerm = '';
  filter: FilterState = {
    categoryIds: [],
    brandIds: [],
    minPrice: 0,
    maxPrice: 300000,
  };

  page = 1;
  rows = 12;
  totalRecords = 0;
  mobileFiltersOpen = false;

  fileBase = environment.fileBaseUrl;

  get activeSlides(): any[] {
    return this.banners.length > 0 ? this.banners : this.fallbackSlides;
  }

  get currentBanner(): any {
    const slides = this.activeSlides;
    if (slides.length === 0) return this.fallbackSlides[0];
    return slides[this.currentSlide % slides.length];
  }

  constructor(
    private productService: ProductService,
    private brandService: BrandService,
    private categoryService: CategoryService,
    private bannerService: BannerService,
    public cart: CartService,
    private messageService: MessageService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.startSlideShow();
    this.startCountdown();
    this.loadBanners();

    this.brandService.getBrands(this.selectedType).subscribe((b) => {
      this.allBrands = b;
      this.brands = b;
    });

    this.route.queryParamMap.subscribe((params) => {
      this.searchTerm = params.get('search') || '';
      if (params.get('brand')) {
        const bId = Number(params.get('brand'));
        if (bId) this.filter.brandIds = [bId];
      }
      this.page = 1;
      this.loadCategoriesAndBrands();
      this.loadProducts();
      this.loadFlashDeals();
    });
  }

  loadBanners(): void {
    this.bannerService.getBanners().subscribe({
      next: (b) => {
        if (b && b.length > 0) {
          this.banners = b;
          this.currentSlide = 0;
        }
      },
    });
  }

  ngOnDestroy(): void {
    if (this.slideTimer) clearInterval(this.slideTimer);
    if (this.countdownTimer) clearInterval(this.countdownTimer);
  }

  startSlideShow(): void {
    this.slideTimer = setInterval(() => {
      const total = this.activeSlides.length;
      if (total > 0) {
        this.currentSlide = (this.currentSlide + 1) % total;
      }
    }, 6000);
  }

  startCountdown(): void {
    this.countdownTimer = setInterval(() => {
      if (this.seconds > 0) {
        this.seconds--;
      } else {
        this.seconds = 59;
        if (this.minutes > 0) {
          this.minutes--;
        } else {
          this.minutes = 59;
          if (this.hours > 0) this.hours--;
        }
      }
    }, 1000);
  }

  setSlide(index: number): void {
    this.currentSlide = index;
    clearInterval(this.slideTimer);
    this.startSlideShow();
  }

  onTypeChange(): void {
    this.filter = {
      categoryIds: [],
      brandIds: [],
      minPrice: 0,
      maxPrice: 300000,
    };
    this.page = 1;
    this.loadCategoriesAndBrands();
    this.loadProducts();
  }

  applyQuickPill(index: number, pill: any): void {
    this.activePillIndex = index;
    if (pill.filter.type) {
      this.selectedType = pill.filter.type;
    }
    if (pill.filter.minPrice !== undefined) this.filter.minPrice = pill.filter.minPrice;
    else this.filter.minPrice = 0;

    if (pill.filter.maxPrice !== undefined) this.filter.maxPrice = pill.filter.maxPrice;
    else this.filter.maxPrice = 300000;

    this.page = 1;
    this.loadProducts();
  }

  filterByBrand(brand: Brand): void {
    this.filter.brandIds = [brand.id];
    this.page = 1;
    this.loadProducts();
    window.scrollTo({ top: 750, behavior: 'smooth' });
  }

  private loadCategoriesAndBrands(): void {
    this.categoryService
      .getCategories(this.selectedType)
      .subscribe((c) => (this.categories = c));
    // Load brands scoped to the selected type so sidebar only shows relevant brands
    this.brandService.getBrands(this.selectedType).subscribe((b) => {
      this.allBrands = b;
      this.brands = b;
    });
  }

  loadFlashDeals(): void {
    this.productService.getProducts({ isFlashDeal: true, limit: 4, sort: 'newest' }).subscribe({
      next: (res) => {
        if (res.items && res.items.length > 0) {
          this.flashDealProducts = res.items.slice(0, 4);
          this.scrollToLastViewedProduct();
        } else {
          this.productService.getProducts({ onSale: true, limit: 4, sort: 'newest' }).subscribe({
            next: (discountRes) => {
              this.flashDealProducts = discountRes.items.slice(0, 4);
              this.scrollToLastViewedProduct();
            },
          });
        }
      },
    });
  }

  onFilterChange(filter: FilterState): void {
    this.filter = filter;
    this.page = 1;
    this.loadProducts();
  }

  onSortChange(): void {
    this.page = 1;
    this.loadProducts();
  }

  onPageChange(event: PaginatorState): void {
    this.page = (event.page || 0) + 1;
    this.rows = event.rows || 12;
    this.loadProducts();
    window.scrollTo({ top: 600, behavior: 'smooth' });
  }

  private loadProducts(): void {
    this.loading = true;
    this.productService
      .getProducts({
        type: this.selectedType,
        category: this.filter.categoryIds.join(',') || undefined,
        brand: this.filter.brandIds.join(',') || undefined,
        minPrice: this.filter.minPrice || undefined,
        maxPrice: this.filter.maxPrice || undefined,
        search: this.searchTerm || undefined,
        page: this.page,
        limit: this.rows,
        sort: this.selectedSort as any,
      })
      .subscribe({
        next: (res) => {
          this.products = res.items;
          this.totalRecords = res.pagination.total;
          this.loading = false;
          this.scrollToLastViewedProduct();
        },
        error: () => (this.loading = false),
      });
  }

  private scrollToLastViewedProduct(): void {
    const lastId = sessionStorage.getItem('lastViewedProductId');
    const fragment = this.route.snapshot.fragment;
    const targetId = fragment || (lastId ? `product-${lastId}` : null);

    if (targetId) {
      setTimeout(() => {
        const el = document.getElementById(targetId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.classList.add('highlight-pulse');
          setTimeout(() => el.classList.remove('highlight-pulse'), 2500);
          sessionStorage.removeItem('lastViewedProductId');
        }
      }, 150);
    }
  }

  clearSearch(): void {
    this.router.navigate(['/']);
  }

  subscribeNewsletter(): void {
    if (!this.newsletterEmail.trim()) return;
    this.messageService.add({
      severity: 'success',
      summary: 'Promo Code Unlocked! 🎉',
      detail: `Welcome! Use code SAVE5 at checkout for 5% off your first purchase.`,
      life: 6000,
    });
    this.newsletterEmail = '';
  }
}
