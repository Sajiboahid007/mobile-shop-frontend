import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { FileUploadModule } from 'primeng/fileupload';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';

import { BrandService } from '../../core/services/brand.service';
import { Brand } from '../../core/models/models';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-brands',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    FileUploadModule,
    ToastModule,
    ConfirmDialogModule,
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './brands.component.html',
  styleUrls: ['./brands.component.scss'],
})
export class BrandsComponent implements OnInit {
  brands: Brand[] = [];
  loading = true;
  fileBase = environment.fileBaseUrl;

  dialogVisible = false;
  editingBrand: Brand | null = null;
  formName = '';
  selectedFile: File | null = null;
  saving = false;

  constructor(
    private brandService: BrandService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.brandService.getBrands().subscribe({
      next: (b) => {
        this.brands = b;
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }

  openNew(): void {
    this.editingBrand = null;
    this.formName = '';
    this.selectedFile = null;
    this.dialogVisible = true;
  }

  openEdit(brand: Brand): void {
    this.editingBrand = brand;
    this.formName = brand.name;
    this.selectedFile = null;
    this.dialogVisible = true;
  }

  onFileSelect(event: { files: File[] }): void {
    this.selectedFile = event.files?.[0] || null;
  }

  save(): void {
    if (!this.formName.trim()) {
      this.messageService.add({ severity: 'warn', summary: 'Name required', detail: 'Please enter a brand name.' });
      return;
    }

    const fd = new FormData();
    fd.append('name', this.formName.trim());
    if (this.selectedFile) fd.append('logo', this.selectedFile);

    this.saving = true;
    const req = this.editingBrand
      ? this.brandService.updateBrand(this.editingBrand.id, fd)
      : this.brandService.createBrand(fd);

    req.subscribe({
      next: () => {
        this.saving = false;
        this.dialogVisible = false;
        this.messageService.add({ severity: 'success', summary: 'Saved', detail: 'Brand saved successfully.' });
        this.load();
      },
      error: (err) => {
        this.saving = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err?.error?.message || 'Could not save brand.',
        });
      },
    });
  }

  confirmDelete(brand: Brand): void {
    this.confirmationService.confirm({
      message: `Delete brand "${brand.name}"? This cannot be undone.`,
      header: 'Confirm deletion',
      icon: 'pi pi-exclamation-triangle',
      accept: () => this.delete(brand),
    });
  }

  private delete(brand: Brand): void {
    this.brandService.deleteBrand(brand.id).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'Brand removed.' });
        this.load();
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err?.error?.message || 'Could not delete brand.',
        });
      },
    });
  }
}
