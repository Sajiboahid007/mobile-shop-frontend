import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Color } from '../models/models';

@Injectable({ providedIn: 'root' })
export class ColorService {
  private base = `${environment.apiUrl}/colors`;

  constructor(private http: HttpClient) {}

  getColors(): Observable<Color[]> {
    return this.http.get<Color[]>(this.base);
  }

  getColor(id: number): Observable<Color> {
    return this.http.get<Color>(`${this.base}/${id}`);
  }

  createColor(data: { name: string; hexCode?: string | null }): Observable<Color> {
    return this.http.post<Color>(this.base, data);
  }

  updateColor(id: number, data: { name?: string; hexCode?: string | null }): Observable<Color> {
    return this.http.put<Color>(`${this.base}/${id}`, data);
  }

  deleteColor(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.base}/${id}`);
  }
}
