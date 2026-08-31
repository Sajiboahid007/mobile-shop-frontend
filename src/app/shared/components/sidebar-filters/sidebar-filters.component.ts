import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CheckboxModule } from 'primeng/checkbox';
import { SliderModule } from 'primeng/slider';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { Brand, Category, ProductType } from '../../../core/models/models';

export interface FilterState {
  categoryIds: number[];
  brandIds: number[];
  minPrice: number;
  maxPrice: number;
}

@Component({
  selector: 'app-sidebar-filters',
  standalone: true,
  imports: [CommonModule, FormsModule, CheckboxModule, SliderModule, AccordionModule, ButtonModule],
  templateUrl: './sidebar-filters.component.html',
  styleUrls: ['./sidebar-filters.component.scss'],
})
export class SidebarFiltersComponent {
  @Input() categories: Category[] = [];
  @Input() brands: Brand[] = [];
  @Input() productType: ProductType | '' = '';
  @Input() maxPriceLimit = 300000;

  @Output() filterChange = new EventEmitter<FilterState>();

  selectedCategoryIds: number[] = [];
  selectedBrandIds: number[] = [];
  priceRange: number[] = [0, this.maxPriceLimit];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['maxPriceLimit']) {
      this.priceRange = [0, this.maxPriceLimit];
    }
  }

  toggleCategory(id: number, checked: boolean): void {
    this.selectedCategoryIds = checked
      ? [...this.selectedCategoryIds, id]
      : this.selectedCategoryIds.filter((c) => c !== id);
    this.emitChange();
  }

  toggleBrand(id: number, checked: boolean): void {
    this.selectedBrandIds = checked
      ? [...this.selectedBrandIds, id]
      : this.selectedBrandIds.filter((b) => b !== id);
    this.emitChange();
  }

  onPriceChange(): void {
    this.emitChange();
  }

  clearFilters(): void {
    this.selectedCategoryIds = [];
    this.selectedBrandIds = [];
    this.priceRange = [0, this.maxPriceLimit];
    this.emitChange();
  }

  private emitChange(): void {
    this.filterChange.emit({
      categoryIds: this.selectedCategoryIds,
      brandIds: this.selectedBrandIds,
      minPrice: this.priceRange[0],
      maxPrice: this.priceRange[1],
    });
  }
}
