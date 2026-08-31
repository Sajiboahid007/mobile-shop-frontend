import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { SettingsService } from '../../core/services/settings.service';
import { ShopSettings } from '../../core/models/models';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    InputTextModule,
    InputTextareaModule,
    ButtonModule,
    ToastModule,
  ],
  providers: [MessageService],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent implements OnInit {
  loading = true;
  saving = false;

  form: Partial<ShopSettings> = {
    shopName: '',
    tagline: '',
    address: '',
    city: '',
    email: '',
    phone: '',
    facebookUrl: '',
    twitterUrl: '',
    instagramUrl: '',
    youtubeUrl: '',
    copyrightText: '',
  };

  constructor(
    private settingsService: SettingsService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.settingsService.get().subscribe({
      next: (s) => {
        this.form = { ...s };
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load settings.' });
      },
    });
  }

  save(): void {
    this.saving = true;
    this.settingsService.update(this.form).subscribe({
      next: (s) => {
        this.form = { ...s };
        this.saving = false;
        this.messageService.add({ severity: 'success', summary: 'Saved', detail: 'Shop settings updated successfully.' });
      },
      error: (err) => {
        this.saving = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err?.error?.message || 'Failed to save settings.',
        });
      },
    });
  }
}
