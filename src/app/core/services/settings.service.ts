import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ShopSettings } from '../models/models';

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private base = `${environment.apiUrl}/settings`;

  /** Cached settings so footer & other components share a single request */
  private _settings$ = new BehaviorSubject<ShopSettings | null>(null);
  readonly settings$ = this._settings$.asObservable();

  constructor(private http: HttpClient) {}

  load(): Observable<ShopSettings> {
    return this.http.get<ShopSettings>(this.base).pipe(
      tap((s) => this._settings$.next(s))
    );
  }

  get(): Observable<ShopSettings> {
    return this.http.get<ShopSettings>(this.base);
  }

  update(data: Partial<ShopSettings>): Observable<ShopSettings> {
    return this.http.put<ShopSettings>(this.base, data).pipe(
      tap((s) => this._settings$.next(s))
    );
  }
}
