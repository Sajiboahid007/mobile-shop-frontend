import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Brand, ProductType } from '../models/models';

@Injectable({ providedIn: 'root' })
export class BrandService {
  private base = `${environment.apiUrl}/brands`;

  constructor(private http: HttpClient) {}

  getBrands(type?: ProductType): Observable<Brand[]> {
    let params = new HttpParams();
    if (type) params = params.set('type', type);
    return this.http.get<Brand[]>(this.base, { params });
  }

  createBrand(formData: FormData): Observable<Brand> {
    return this.http.post<Brand>(this.base, formData);
  }

  updateBrand(id: number, formData: FormData): Observable<Brand> {
    return this.http.put<Brand>(`${this.base}/${id}`, formData);
  }

  deleteBrand(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.base}/${id}`);
  }
}
