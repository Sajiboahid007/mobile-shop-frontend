import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CompareService } from '../../../core/services/compare.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-compare-bar',
  standalone: true,
  imports: [CommonModule, RouterLink, ButtonModule],
  templateUrl: './compare-bar.component.html',
  styleUrls: ['./compare-bar.component.scss'],
})
export class CompareBarComponent {
  fileBase = environment.fileBaseUrl;

  constructor(public compare: CompareService, private router: Router) {}

  getImage(product: any): string {
    const primary = product.images?.find((i: any) => i.isPrimary) || product.images?.[0];
    if (!primary) return '';
    return primary.url.startsWith('http') ? primary.url : `${this.fileBase}${primary.url}`;
  }

  goToCompare(): void {
    this.router.navigate(['/compare']);
  }
}
