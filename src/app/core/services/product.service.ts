import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Paginated, Product, ProductQuery } from '../models/models';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private base = `${environment.apiUrl}/products`;

  constructor(private http: HttpClient) {}

  getProducts(query: ProductQuery): Observable<Paginated<Product>> {
    let params = new HttpParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, String(value));
      }
    });
    return this.http.get<Paginated<Product>>(this.base, { params });
  }

  getProduct(idOrSlug: string | number): Observable<Product> {
    return this.http.get<Product>(`${this.base}/${idOrSlug}`);
  }

  createProduct(formData: FormData): Observable<Product> {
    return this.http.post<Product>(this.base, formData);
  }

  updateProduct(id: number, formData: FormData): Observable<Product> {
    return this.http.put<Product>(`${this.base}/${id}`, formData);
  }

  deleteProduct(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.base}/${id}`);
  }

  deleteImage(productId: number, imageId: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.base}/${productId}/images/${imageId}`);
  }
}
