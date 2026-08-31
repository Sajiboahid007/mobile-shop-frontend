import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Order } from '../models/models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private apiUrl = `${environment.apiUrl}/orders`;

  constructor(private http: HttpClient) {}

  createOrder(orderData: {
    customerName: string;
    customerEmail?: string;
    customerPhone: string;
    shippingAddress: string;
    city: string;
    postalCode?: string;
    paymentMethod: string;
    subtotal: number;
    discount?: number;
    shippingFee?: number;
    totalAmount: number;
    notes?: string;
    items: Array<{
      productId?: number | null;
      productTitle: string;
      productImage?: string | null;
      price: number;
      quantity: number;
      color?: string | null;
      storage?: string | null;
    }>;
  }): Observable<Order> {
    return this.http.post<Order>(this.apiUrl, orderData);
  }

  trackOrder(orderNumber: string): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/track/${encodeURIComponent(orderNumber)}`);
  }

  getAdminOrders(params?: {
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Observable<{ orders: Order[]; pagination: any }> {
    let httpParams = new HttpParams();
    if (params?.status) httpParams = httpParams.set('status', params.status);
    if (params?.search) httpParams = httpParams.set('search', params.search);
    if (params?.page) httpParams = httpParams.set('page', params.page.toString());
    if (params?.limit) httpParams = httpParams.set('limit', params.limit.toString());

    return this.http.get<{ orders: Order[]; pagination: any }>(this.apiUrl, {
      params: httpParams,
    });
  }

  getAdminOrderById(id: number): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/${id}`);
  }

  updateOrderStatus(
    id: number,
    data: { orderStatus?: string; paymentStatus?: string }
  ): Observable<Order> {
    return this.http.put<Order>(`${this.apiUrl}/${id}/status`, data);
  }
}
