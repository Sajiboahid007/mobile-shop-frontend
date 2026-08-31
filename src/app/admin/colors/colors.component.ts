import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';

import { ColorService } from '../../core/services/color.service';
import { Color } from '../../core/models/models';

@Component({
  selector: 'app-colors',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    ToastModule,
    ConfirmDialogModule,
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './colors.component.html',
  styleUrls: ['./colors.component.scss'],
})
export class ColorsComponent implements OnInit {
  colors: Color[] = [];
  loading = true;

  dialogVisible = false;
  editingColor: Color | null = null;
  formName = '';
  formHex = '#1c1c1e';
  saving = false;

  presetColors: string[] = [
    '#1c1c1e', '#2c3e50', '#4a4a4a', '#708090', '#9a9895',
    '#c4a88f', '#e2e4e1', '#f4f4f4', '#fdf7eb', '#e6ca65',
    '#3b1e54', '#4a154b', '#9bb5ce', '#1a2a3a', '#3b5346',
    '#e74c3c', '#d35400', '#16a085', '#27ae60', '#8e44ad',
  ];

  constructor(
    private colorService: ColorService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.colorService.getColors().subscribe({
      next: (c) => {
        this.colors = c;
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }

  openNew(): void {
    this.editingColor = null;
    this.formName = '';
    this.formHex = '#1c1c1e';
    this.dialogVisible = true;
  }

  openEdit(color: Color): void {
    this.editingColor = color;
    this.formName = color.name;
    this.formHex = color.hexCode || '#1c1c1e';
    this.dialogVisible = true;
  }

  selectPreset(hex: string): void {
    this.formHex = hex;
  }

  save(): void {
    if (!this.formName.trim()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Name required',
        detail: 'Please enter a color name.',
      });
      return;
    }

    this.saving = true;
    const payload = {
      name: this.formName.trim(),
      hexCode: this.formHex?.trim() || null,
    };

    const req = this.editingColor
      ? this.colorService.updateColor(this.editingColor.id, payload)
      : this.colorService.createColor(payload);

    req.subscribe({
      next: () => {
        this.saving = false;
        this.dialogVisible = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Saved',
          detail: 'Color saved successfully.',
        });
        this.load();
      },
      error: (err) => {
        this.saving = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err?.error?.message || 'Could not save color.',
        });
      },
    });
  }

  confirmDelete(color: Color): void {
    this.confirmationService.confirm({
      message: `Delete color "${color.name}"? This cannot be undone.`,
      header: 'Confirm deletion',
      icon: 'pi pi-exclamation-triangle',
      accept: () => this.delete(color),
    });
  }

  private delete(color: Color): void {
    this.colorService.deleteColor(color.id).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Deleted',
          detail: 'Color removed.',
        });
        this.load();
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err?.error?.message || 'Could not delete color.',
        });
      },
    });
  }
}
