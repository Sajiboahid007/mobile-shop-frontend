import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Banner } from '../models/models';

@Injectable({ providedIn: 'root' })
export class BannerService {
  private base = `${environment.apiUrl}/banners`;

  constructor(private http: HttpClient) {}

  getBanners(all: boolean = false): Observable<Banner[]> {
    let params = new HttpParams();
    if (all) {
      params = params.set('all', 'true');
    }
    return this.http.get<Banner[]>(this.base, { params });
  }

  getBanner(id: number): Observable<Banner> {
    return this.http.get<Banner>(`${this.base}/${id}`);
  }

  createBanner(formData: FormData): Observable<Banner> {
    return this.http.post<Banner>(this.base, formData);
  }

  updateBanner(id: number, formData: FormData): Observable<Banner> {
    return this.http.put<Banner>(`${this.base}/${id}`, formData);
  }

  deleteBanner(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.base}/${id}`);
  }
}
