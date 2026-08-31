import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { OrderService } from '../../core/services/order.service';
import { Order } from '../../core/models/models';

@Component({
  selector: 'app-order-track',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, ButtonModule, InputTextModule, TagModule],
  templateUrl: './order-track.component.html',
  styleUrls: ['./order-track.component.scss'],
})
export class OrderTrackComponent implements OnInit {
  trackingInput = '';
  loading = false;
  order: Order | null = null;
  errorMsg = '';

  steps = [
    { key: 'PENDING', label: 'Order Placed', desc: 'Received & verified by store team', icon: 'pi pi-shopping-bag' },
    { key: 'CONFIRMED', label: 'Confirmed', desc: 'Payment & inventory allocated', icon: 'pi pi-check-circle' },
    { key: 'PROCESSING', label: 'Processing', desc: 'Packed & dispatched to courier', icon: 'pi pi-box' },
    { key: 'SHIPPED', label: 'Out for Delivery', desc: 'Courier agent is on the way', icon: 'pi pi-truck' },
    { key: 'DELIVERED', label: 'Delivered', desc: 'Handed over to customer', icon: 'pi pi-home' },
  ];

  constructor(
    private route: ActivatedRoute,
    private orderService: OrderService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      if (params['code']) {
        this.trackingInput = params['code'];
        this.trackOrder();
      }
    });
  }

  trackOrder(): void {
    const code = this.trackingInput.trim();
    if (!code) return;

    this.loading = true;
    this.errorMsg = '';
    this.order = null;

    this.orderService.trackOrder(code).subscribe({
      next: (res) => {
        this.order = res;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.errorMsg = err?.error?.message || `No active order found with tracking code: ${code}`;
      },
    });
  }

  getStepIndex(status: string): number {
    const s = (status || 'PENDING').toUpperCase();
    if (s === 'CANCELLED') return -1;
    if (s === 'DELIVERED') return 4;
    if (s === 'SHIPPED') return 3;
    if (s === 'PROCESSING') return 2;
    if (s === 'CONFIRMED') return 1;
    return 0;
  }

  isStepCompleted(stepIdx: number): boolean {
    if (!this.order) return false;
    const currentIdx = this.getStepIndex(this.order.orderStatus);
    return currentIdx >= stepIdx;
  }

  isStepActive(stepIdx: number): boolean {
    if (!this.order) return false;
    const currentIdx = this.getStepIndex(this.order.orderStatus);
    return currentIdx === stepIdx;
  }

  printInvoice(): void {
    window.print();
  }
}
