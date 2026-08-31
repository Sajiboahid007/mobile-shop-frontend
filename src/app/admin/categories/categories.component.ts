import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';

import { CategoryService } from '../../core/services/category.service';
import { Category, ProductType } from '../../core/models/models';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    DropdownModule,
    ToastModule,
    ConfirmDialogModule,
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss'],
})
export class CategoriesComponent implements OnInit {
  categories: Category[] = [];
  loading = true;

  typeOptions = [
    { label: 'Smartphone', value: 'PHONE' as ProductType },
    { label: 'Laptop', value: 'LAPTOP' as ProductType },
  ];

  dialogVisible = false;
  editingCategory: Category | null = null;
  formName = '';
  formType: ProductType = 'PHONE';
  saving = false;

  constructor(
    private categoryService: CategoryService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.categoryService.getCategories().subscribe({
      next: (c) => {
        this.categories = c;
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }

  openNew(): void {
    this.editingCategory = null;
    this.formName = '';
    this.formType = 'PHONE';
    this.dialogVisible = true;
  }

  openEdit(cat: Category): void {
    this.editingCategory = cat;
    this.formName = cat.name;
    this.formType = cat.type;
    this.dialogVisible = true;
  }

  save(): void {
    if (!this.formName.trim()) {
      this.messageService.add({ severity: 'warn', summary: 'Name required', detail: 'Please enter a category name.' });
      return;
    }

    this.saving = true;
    const req = this.editingCategory
      ? this.categoryService.updateCategory(this.editingCategory.id, this.formName.trim(), this.formType)
      : this.categoryService.createCategory(this.formName.trim(), this.formType);

    req.subscribe({
      next: () => {
        this.saving = false;
        this.dialogVisible = false;
        this.messageService.add({ severity: 'success', summary: 'Saved', detail: 'Category saved successfully.' });
        this.load();
      },
      error: (err) => {
        this.saving = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err?.error?.message || 'Could not save category.',
        });
      },
    });
  }

  confirmDelete(cat: Category): void {
    this.confirmationService.confirm({
      message: `Delete category "${cat.name}"? This cannot be undone.`,
      header: 'Confirm deletion',
      icon: 'pi pi-exclamation-triangle',
      accept: () => this.delete(cat),
    });
  }

  private delete(cat: Category): void {
    this.categoryService.deleteCategory(cat.id).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'Category removed.' });
        this.load();
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err?.error?.message || 'Could not delete category.',
        });
      },
    });
  }
}
