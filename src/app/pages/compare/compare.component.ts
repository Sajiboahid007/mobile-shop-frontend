import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';
import { CompareService } from '../../core/services/compare.service';
import { CartService } from '../../core/services/cart.service';
import { ProductService } from '../../core/services/product.service';
import { Product } from '../../core/models/models';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-compare',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    ButtonModule,
    DialogModule,
    InputTextModule,
    TagModule,
    TooltipModule,
  ],
  templateUrl: './compare.component.html',
  styleUrls: ['./compare.component.scss'],
})
export class CompareComponent implements OnInit {
  fileBase = environment.fileBaseUrl;
  highlightDiffs = false;
  addModalOpen = false;
  searchQuery = '';
  availableProducts: Product[] = [];
  loadingProducts = false;

  placeholder =
    'data:image/svg+xml;charset=UTF-8,' +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300"><rect width="100%" height="100%" fill="#eef2f7"/><text x="50%" y="50%" font-size="16" fill="#94a3b8" text-anchor="middle" dy=".3em">No Image</text></svg>`
    );

  specCategories = [
    {
      name: 'General',
      specs: [
        { label: 'Brand', key: (p: Product) => p.brand?.name || '-' },
        { label: 'Category', key: (p: Product) => p.category?.name || '-' },
        { label: 'Product Type', key: (p: Product) => p.type || '-' },
        {
          label: 'Price',
          key: (p: Product) =>
            `৳${(p.discountPrice || p.price).toLocaleString()}` +
            (p.discountPrice ? ` (Reg: ৳${p.price.toLocaleString()})` : ''),
        },
        { label: 'Stock Status', key: (p: Product) => (p.stock > 0 ? 'In Stock' : 'Out of Stock') },
        { label: 'Warranty', key: (p: Product) => p.phoneDetail?.warranty || p.laptopDetail?.warranty || '1 Year Official' },
      ],
    },
    {
      name: 'Performance & Storage',
      specs: [
        { label: 'Processor / CPU', key: (p: Product) => p.phoneDetail?.processor || p.laptopDetail?.processor || '-' },
        { label: 'RAM', key: (p: Product) => p.phoneDetail?.ram || p.laptopDetail?.ram || '-' },
        { label: 'Internal Storage', key: (p: Product) => p.phoneDetail?.storage || p.laptopDetail?.storage || '-' },
        { label: 'Operating System', key: (p: Product) => p.phoneDetail?.os || p.laptopDetail?.os || '-' },
        { label: 'Graphics / GPU', key: (p: Product) => p.laptopDetail?.graphics || '-' },
      ],
    },
    {
      name: 'Display & Design',
      specs: [
        { label: 'Screen Size', key: (p: Product) => p.phoneDetail?.display || p.laptopDetail?.display || '-' },
        { label: 'Panel Type', key: (p: Product) => p.phoneDetail?.displayType || '-' },
        { label: 'Available Colors', key: (p: Product) => p.phoneDetail?.color || p.laptopDetail?.color || '-' },
        { label: 'Weight', key: (p: Product) => p.laptopDetail?.weight || '-' },
      ],
    },
    {
      name: 'Camera & Battery',
      specs: [
        { label: 'Main Rear Camera', key: (p: Product) => p.phoneDetail?.camera || '-' },
        { label: 'Front Selfie Camera', key: (p: Product) => p.phoneDetail?.frontCamera || '-' },
        { label: 'Battery Capacity', key: (p: Product) => p.phoneDetail?.battery || p.laptopDetail?.battery || '-' },
        { label: 'Network & 5G', key: (p: Product) => p.phoneDetail?.network || '-' },
        { label: 'Ports & I/O', key: (p: Product) => p.laptopDetail?.ports || '-' },
      ],
    },
  ];

  constructor(
    public compare: CompareService,
    public cart: CartService,
    private productService: ProductService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadAvailableProducts();
  }

  loadAvailableProducts(): void {
    this.loadingProducts = true;
    this.productService.getProducts({ limit: 40 }).subscribe({
      next: (res) => {
        this.availableProducts = res.items;
        this.loadingProducts = false;
      },
      error: () => (this.loadingProducts = false),
    });
  }

  get filteredAvailableProducts(): Product[] {
    const list = this.availableProducts.filter((p) => !this.compare.isInCompare(p.id));
    if (!this.searchQuery.trim()) return list;
    const q = this.searchQuery.toLowerCase();
    return list.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.brand.name.toLowerCase().includes(q) ||
        (p.category && p.category.name.toLowerCase().includes(q))
    );
  }

  getImage(p: Product): string {
    const primary = p.images?.find((i) => i.isPrimary) || p.images?.[0];
    if (!primary) return this.placeholder;
    return primary.url.startsWith('http') ? primary.url : `${this.fileBase}${primary.url}`;
  }

  addToCompare(p: Product): void {
    const res = this.compare.addToCompare(p);
    if (res.success) {
      this.messageService.add({
        severity: 'success',
        summary: 'Added to Compare',
        detail: res.message,
      });
      if (this.compare.items().length >= this.compare.maxLimit) {
        this.addModalOpen = false;
      }
    } else {
      this.messageService.add({
        severity: 'warn',
        summary: 'Cannot Add',
        detail: res.message,
      });
    }
  }

  quickBuy(p: Product): void {
    this.cart.addToCart(p, null, null, 1);
    this.messageService.add({
      severity: 'success',
      summary: 'Added to Bag',
      detail: `"${p.title}" added to your shopping bag.`,
    });
  }

  isSpecDifferent(specFn: (p: Product) => string): boolean {
    const items = this.compare.items();
    if (items.length < 2) return false;
    const values = items.map((p) => specFn(p));
    return new Set(values).size > 1;
  }
}
