import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Category, ProductType } from '../models/models';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private base = `${environment.apiUrl}/categories`;

  constructor(private http: HttpClient) {}

  getCategories(type?: ProductType): Observable<Category[]> {
    let params = new HttpParams();
    if (type) params = params.set('type', type);
    return this.http.get<Category[]>(this.base, { params });
  }

  createCategory(name: string, type: ProductType): Observable<Category> {
    return this.http.post<Category>(this.base, { name, type });
  }

  updateCategory(id: number, name: string, type: ProductType): Observable<Category> {
    return this.http.put<Category>(`${this.base}/${id}`, { name, type });
  }

  deleteCategory(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.base}/${id}`);
  }
}
