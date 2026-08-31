import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { SelectButtonModule } from 'primeng/selectbutton';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';

import { ProductService } from '../../../core/services/product.service';
import { Product, ProductType } from '../../../core/models/models';
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

  typeFilterOptions = [
    { label: 'All', value: '' },
    { label: 'Smartphones', value: 'PHONE' as ProductType },
    { label: 'Laptops', value: 'LAPTOP' as ProductType },
  ];
  typeFilter: ProductType | '' = '';

  constructor(
    private productService: ProductService,
    private router: Router,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.load();
  }

  onTypeFilterChange(): void {
    this.page = 1;
    this.load();
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
