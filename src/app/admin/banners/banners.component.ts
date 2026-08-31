import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { InputNumberModule } from 'primeng/inputnumber';
import { CheckboxModule } from 'primeng/checkbox';
import { FileUploadModule } from 'primeng/fileupload';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';

import { BannerService } from '../../core/services/banner.service';
import { Banner } from '../../core/models/models';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-banners',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    InputTextareaModule,
    InputNumberModule,
    CheckboxModule,
    FileUploadModule,
    TagModule,
    ToastModule,
    ConfirmDialogModule,
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './banners.component.html',
  styleUrls: ['./banners.component.scss'],
})
export class BannersComponent implements OnInit {
  banners: Banner[] = [];
  loading = true;
  saving = false;
  dialogVisible = false;
  fileBase = environment.fileBaseUrl;

  editingBanner: Banner | null = null;

  // Form Fields
  formTitle = '';
  formTagline = '';
  formBadge = '';
  formDesc = '';
  formPhoneTag = '';
  formCtaText = 'Shop Now';
  formCtaLink = '/';
  formBgGradient = 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)';
  formOrder = 1;
  formIsActive = true;
  selectedFile: File | null = null;

  gradientPresets: { label: string; value: string }[] = [
    {
      label: 'Deep Midnight Indigo',
      value: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)',
    },
    {
      label: 'Emerald Tech Glow',
      value: 'linear-gradient(135deg, #030712 0%, #064e3b 50%, #0f766e 100%)',
    },
    {
      label: 'Cyber Violet Neon',
      value: 'linear-gradient(135deg, #1e1b4b 0%, #4c1d95 50%, #831843 100%)',
    },
    {
      label: 'Royal Crimson Blaze',
      value: 'linear-gradient(135deg, #450a0a 0%, #881337 50%, #4c0519 100%)',
    },
    {
      label: 'Titanium Dark Slate',
      value: 'linear-gradient(135deg, #18181b 0%, #27272a 50%, #3f3f46 100%)',
    },
    {
      label: 'Oceanic Sapphire',
      value: 'linear-gradient(135deg, #082f49 0%, #0369a1 50%, #1e40af 100%)',
    },
  ];

  constructor(
    private bannerService: BannerService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.bannerService.getBanners(true).subscribe({
      next: (res) => {
        this.banners = res;
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }

  openNew(): void {
    this.editingBanner = null;
    this.formTitle = '';
    this.formTagline = '';
    this.formBadge = 'New Arrival';
    this.formDesc = '';
    this.formPhoneTag = '';
    this.formCtaText = 'Explore Deals';
    this.formCtaLink = '/';
    this.formBgGradient = this.gradientPresets[0].value;
    this.formOrder = this.banners.length + 1;
    this.formIsActive = true;
    this.selectedFile = null;
    this.dialogVisible = true;
  }

  openEdit(banner: Banner): void {
    this.editingBanner = banner;
    this.formTitle = banner.title;
    this.formTagline = banner.tagline || '';
    this.formBadge = banner.badge || '';
    this.formDesc = banner.description || '';
    this.formPhoneTag = banner.phoneTag || '';
    this.formCtaText = banner.ctaText || 'Shop Now';
    this.formCtaLink = banner.ctaLink || '/';
    this.formBgGradient = banner.bgGradient || this.gradientPresets[0].value;
    this.formOrder = banner.order || 0;
    this.formIsActive = banner.isActive !== false;
    this.selectedFile = null;
    this.dialogVisible = true;
  }

  onFileSelect(event: { files: File[] }): void {
    this.selectedFile = event.files?.[0] || null;
  }

  selectGradient(val: string): void {
    this.formBgGradient = val;
  }

  save(): void {
    if (!this.formTitle.trim()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Title required',
        detail: 'Please enter a banner title.',
      });
      return;
    }

    const fd = new FormData();
    fd.append('title', this.formTitle.trim());
    fd.append('tagline', this.formTagline.trim());
    fd.append('badge', this.formBadge.trim());
    fd.append('description', this.formDesc.trim());
    fd.append('phoneTag', this.formPhoneTag.trim());
    fd.append('ctaText', this.formCtaText.trim() || 'Shop Now');
    fd.append('ctaLink', this.formCtaLink.trim() || '/');
    fd.append('bgGradient', this.formBgGradient);
    fd.append('order', String(this.formOrder ?? 0));
    fd.append('isActive', String(this.formIsActive));
    if (this.selectedFile) {
      fd.append('image', this.selectedFile);
    }

    this.saving = true;
    const req = this.editingBanner
      ? this.bannerService.updateBanner(this.editingBanner.id, fd)
      : this.bannerService.createBanner(fd);

    req.subscribe({
      next: () => {
        this.saving = false;
        this.dialogVisible = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Saved',
          detail: 'Banner saved successfully.',
        });
        this.load();
      },
      error: (err) => {
        this.saving = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err?.error?.message || 'Could not save banner.',
        });
      },
    });
  }

  confirmDelete(banner: Banner): void {
    this.confirmationService.confirm({
      message: `Delete banner "${banner.title}"? This cannot be undone.`,
      header: 'Confirm deletion',
      icon: 'pi pi-exclamation-triangle',
      accept: () => this.delete(banner),
    });
  }

  private delete(banner: Banner): void {
    this.bannerService.deleteBanner(banner.id).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Deleted',
          detail: 'Banner removed.',
        });
        this.load();
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err?.error?.message || 'Could not delete banner.',
        });
      },
    });
  }
}
