import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { SelectButtonModule } from 'primeng/selectbutton';
import { DropdownModule } from 'primeng/dropdown';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';

import { ProductService } from '../../../core/services/product.service';
import { BrandService } from '../../../core/services/brand.service';
import { CategoryService } from '../../../core/services/category.service';
import { Product, ProductType, Brand, Category } from '../../../core/models/models';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    TableModule,
    ButtonModule,
    TagModule,
    SelectButtonModule,
    DropdownModule,
    ToastModule,
    ConfirmDialogModule,
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss'],
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  loading = true;
  totalRecords = 0;
  page = 1;
  rows = 10;
  fileBase = environment.fileBaseUrl;

  // Type filter (select-button)
  typeFilterOptions = [
    { label: 'All', value: '' },
    { label: 'Smartphones', value: 'PHONE' as ProductType },
    { label: 'Laptops', value: 'LAPTOP' as ProductType },
  ];
  typeFilter: ProductType | '' = '';

  // Brand filter — stores numeric ID (0 = All)
  brandOptions: { label: string; value: number | null }[] = [];
  brandFilter: number | null = null;

  // Category filter — stores numeric ID (null = All)
  allCategories: Category[] = [];
  categoryOptions: { label: string; value: number | null }[] = [];
  categoryFilter: number | null = null;

  constructor(
    private productService: ProductService,
    private brandService: BrandService,
    private categoryService: CategoryService,
    private router: Router,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadBrands();
    this.loadCategories();
    this.load();
  }

  loadBrands(): void {
    this.brandService.getBrands().subscribe({
      next: (brands: Brand[]) => {
        this.brandOptions = [
          { label: 'All Brands', value: null },
          ...brands.map((b) => ({ label: b.name, value: b.id })),
        ];
      },
    });
  }

  loadCategories(type?: ProductType): void {
    this.categoryService.getCategories(type).subscribe({
      next: (cats: Category[]) => {
        this.allCategories = cats;
        this.buildCategoryOptions(cats);
      },
    });
  }

  private buildCategoryOptions(cats: Category[]): void {
    this.categoryOptions = [
      { label: 'All Categories', value: null },
      ...cats.map((c) => ({ label: c.name, value: c.id })),
    ];
  }

  onTypeFilterChange(): void {
    this.page = 1;
    this.categoryFilter = null;
    // Reload categories scoped to the selected type (or all if cleared)
    const t = this.typeFilter as ProductType | undefined;
    this.loadCategories(t || undefined);
    this.load();
  }

  onBrandFilterChange(): void {
    // PrimeNG showClear sets value to undefined; normalise to null
    if (this.brandFilter === undefined) this.brandFilter = null;
    this.page = 1;
    this.load();
  }

  onCategoryFilterChange(): void {
    if (this.categoryFilter === undefined) this.categoryFilter = null;
    this.page = 1;
    this.load();
  }

  clearFilters(): void {
    this.typeFilter = '';
    this.brandFilter = null;
    this.categoryFilter = null;
    this.page = 1;
    this.loadCategories();
    this.load();
  }

  get hasActiveFilters(): boolean {
    return !!(this.typeFilter || this.brandFilter !== null || this.categoryFilter !== null);
  }

  onPageChange(event: any): void {
    this.page = (event.first || 0) / (event.rows || this.rows) + 1;
    this.rows = event.rows || this.rows;
    this.load();
  }

  load(): void {
    this.loading = true;
    this.productService
      .getProducts({
        type: this.typeFilter || undefined,
        // Send numeric IDs — backend uses WHERE brandId IN (ids) / categoryId IN (ids)
        brand: this.brandFilter ?? undefined,
        category: this.categoryFilter ?? undefined,
        page: this.page,
        limit: this.rows,
        sort: 'newest',
      })
      .subscribe({
        next: (res) => {
          this.products = res.items;
          this.totalRecords = res.pagination.total;
          this.loading = false;
        },
        error: () => (this.loading = false),
      });
  }

  edit(product: Product): void {
    this.router.navigate(['/admin/products', product.id, 'edit']);
  }

  confirmDelete(product: Product): void {
    this.confirmationService.confirm({
      message: `Delete "${product.title}"? This cannot be undone.`,
      header: 'Confirm deletion',
      icon: 'pi pi-exclamation-triangle',
      accept: () => this.delete(product),
    });
  }

  private delete(product: Product): void {
    this.productService.deleteProduct(product.id).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'Product removed.' });
        this.load();
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err?.error?.message || 'Could not delete product.',
        });
      },
    });
  }

  imageUrl(product: Product): string {
    const primary = product.images?.find((i) => i.isPrimary) || product.images?.[0];
    return primary ? `${this.fileBase}${primary.url}` : '';
  }
}
