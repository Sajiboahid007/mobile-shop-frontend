import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Admin } from '../models/models';

const TOKEN_KEY = 'mobileshop_admin_token';
const ADMIN_KEY = 'mobileshop_admin_info';

@Injectable({ providedIn: 'root' })
export class AuthService {
  admin = signal<Admin | null>(this.readStoredAdmin());

  constructor(private http: HttpClient) {}

  private readStoredAdmin(): Admin | null {
    const raw = localStorage.getItem(ADMIN_KEY);
    return raw ? JSON.parse(raw) : null;
  }

  login(email: string, password: string): Observable<{ token: string; admin: Admin }> {
    return this.http
      .post<{ token: string; admin: Admin }>(`${environment.apiUrl}/auth/login`, { email, password })
      .pipe(
        tap((res) => {
          localStorage.setItem(TOKEN_KEY, res.token);
          localStorage.setItem(ADMIN_KEY, JSON.stringify(res.admin));
          this.admin.set(res.admin);
        })
      );
  }

  changePassword(currentPassword: string, newPassword: string): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${environment.apiUrl}/auth/change-password`, {
      currentPassword,
      newPassword,
    });
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ADMIN_KEY);
    this.admin.set(null);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}
