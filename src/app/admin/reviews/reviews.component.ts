import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { MessageService } from 'primeng/api';
import { ReviewService } from '../../core/services/review.service';
import { Review } from '../../core/models/models';

@Component({
  selector: 'app-reviews',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule, TagModule],
  templateUrl: './reviews.component.html',
  styleUrls: ['./reviews.component.scss'],
})
export class ReviewsComponent implements OnInit {
  reviews: Review[] = [];
  loading = false;

  constructor(
    private reviewService: ReviewService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadReviews();
  }

  loadReviews(): void {
    this.loading = true;
    this.reviewService.getAllReviews().subscribe({
      next: (res: Review[]) => {
        this.reviews = res;
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }

  deleteReview(review: Review): void {
    this.reviewService.deleteReview(review.id).subscribe({
      next: () => {
        this.reviews = this.reviews.filter((r) => r.id !== review.id);
        this.messageService.add({
          severity: 'success',
          summary: 'Review Deleted',
          detail: 'The customer review has been removed.',
        });
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Could not delete review.',
        });
      },
    });
  }
}
