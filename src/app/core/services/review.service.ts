import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Review, ReviewSummary } from '../models/models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ReviewService {
  private apiUrl = `${environment.apiUrl}/reviews`;

  constructor(private http: HttpClient) {}

  getProductReviews(productId: number): Observable<{ reviews: Review[]; summary: ReviewSummary }> {
    return this.http.get<{ reviews: Review[]; summary: ReviewSummary }>(
      `${this.apiUrl}/product/${productId}`
    );
  }

  createReview(data: {
    productId: number;
    name: string;
    email: string;
    rating: number;
    title?: string;
    comment: string;
  }): Observable<Review> {
    return this.http.post<Review>(this.apiUrl, data);
  }

  getAllReviews(): Observable<Review[]> {
    return this.http.get<Review[]>(this.apiUrl);
  }

  deleteReview(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }
}
