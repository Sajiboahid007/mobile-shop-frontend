import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ProductService } from '../../core/services/product.service';
import { Product } from '../../core/models/models';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';

@Component({
  selector: 'app-upcoming',
  standalone: true,
  imports: [CommonModule, ProgressSpinnerModule, ProductCardComponent],
  templateUrl: './upcoming.component.html',
  styleUrls: ['./upcoming.component.scss'],
})
export class UpcomingComponent implements OnInit {
  products: Product[] = [];
  loading = true;

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.productService.getProducts({ upcoming: true, limit: 48, sort: 'newest' }).subscribe({
      next: (res) => {
        this.products = res.items;
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }
}
