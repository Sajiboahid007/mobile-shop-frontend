import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SettingsService } from '../../../core/services/settings.service';
import { ShopSettings } from '../../../core/models/models';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
})
export class FooterComponent implements OnInit {
  year = new Date().getFullYear();
  settings: ShopSettings | null = null;

  constructor(private settingsService: SettingsService) {}

  ngOnInit(): void {
    this.settingsService.load().subscribe({
      next: (s) => (this.settings = s),
    });
  }

  get shopName(): string {
    return this.settings?.shopName || 'MobileShop';
  }

  get tagline(): string {
    return this.settings?.tagline || "Bangladesh's premier destination for official smartphones, flagship devices, laptops, and authentic tech accessories.";
  }

  get address(): string {
    return this.settings?.address || 'Level 4, Jamuna Future Park, Dhaka';
  }

  get email(): string {
    return this.settings?.email || 'support@mobileshop.com';
  }

  get phone(): string {
    return this.settings?.phone || '+880 1700-000000';
  }

  get copyright(): string {
    return this.settings?.copyrightText || 'MobileShop Ltd. All rights reserved.';
  }
}
