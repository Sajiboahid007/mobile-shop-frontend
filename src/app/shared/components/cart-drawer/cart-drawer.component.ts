import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { SidebarModule } from 'primeng/sidebar';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { DialogModule } from 'primeng/dialog';
import { RadioButtonModule } from 'primeng/radiobutton';
import { ProgressBarModule } from 'primeng/progressbar';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { CartService } from '../../../core/services/cart.service';
import { OrderService } from '../../../core/services/order.service';
import { Order } from '../../../core/models/models';

@Component({
  selector: 'app-cart-drawer',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    SidebarModule,
    ButtonModule,
    InputTextModule,
    InputTextareaModule,
    DialogModule,
    RadioButtonModule,
    ProgressBarModule,
    ToastModule,
  ],
  templateUrl: './cart-drawer.component.html',
  styleUrls: ['./cart-drawer.component.scss'],
})
export class CartDrawerComponent {
  couponInput = '';
  checkoutModalOpen = false;
  orderSuccessModalOpen = false;
  createdOrder: Order | null = null;
  submittingOrder = false;

  checkoutForm = {
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    shippingAddress: '',
    city: 'Dhaka',
    postalCode: '',
    paymentMethod: 'COD',
    notes: '',
  };

  cityOptions = ['Dhaka', 'Chattogram', 'Sylhet', 'Rajshahi', 'Khulna', 'Barishal', 'Rangpur', 'Mymensingh'];

  constructor(
    public cart: CartService,
    private orderService: OrderService,
    private messageService: MessageService,
    private router: Router
  ) {}

  applyCoupon(): void {
    if (!this.couponInput.trim()) return;
    const res = this.cart.applyCoupon(this.couponInput);
    if (res.success) {
      this.messageService.add({
        severity: 'success',
        summary: 'Discount Applied!',
        detail: res.message,
      });
      this.couponInput = '';
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Coupon Error',
        detail: res.message,
      });
    }
  }

  removeCoupon(): void {
    this.cart.removeCoupon();
    this.messageService.add({
      severity: 'info',
      summary: 'Coupon Removed',
      detail: 'The promotional discount has been removed.',
    });
  }

  proceedToCheckout(): void {
    if (this.cart.items().length === 0) return;
    this.cart.close();
    this.checkoutModalOpen = true;
  }

  submitOrder(): void {
    if (
      !this.checkoutForm.customerName.trim() ||
      !this.checkoutForm.customerPhone.trim() ||
      !this.checkoutForm.shippingAddress.trim() ||
      !this.checkoutForm.city.trim()
    ) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Missing Fields',
        detail: 'Please fill in your name, phone, city, and shipping address.',
      });
      return;
    }

    this.submittingOrder = true;

    const payload = {
      customerName: this.checkoutForm.customerName,
      customerEmail: this.checkoutForm.customerEmail,
      customerPhone: this.checkoutForm.customerPhone,
      shippingAddress: this.checkoutForm.shippingAddress,
      city: this.checkoutForm.city,
      postalCode: this.checkoutForm.postalCode,
      paymentMethod: this.checkoutForm.paymentMethod,
      subtotal: this.cart.subtotal(),
      discount: this.cart.discountAmount(),
      shippingFee: this.cart.shippingFee(),
      totalAmount: this.cart.grandTotal(),
      notes: this.checkoutForm.notes,
      items: this.cart.items().map((i) => ({
        productId: i.productId,
        productTitle: i.title,
        productImage: i.image,
        price: i.price,
        quantity: i.quantity,
        color: i.color,
        storage: i.storage,
      })),
    };

    this.orderService.createOrder(payload).subscribe({
      next: (order) => {
        this.submittingOrder = false;
        this.createdOrder = order;
        this.cart.clearCart();
        this.checkoutModalOpen = false;
        this.orderSuccessModalOpen = true;
      },
      error: (err) => {
        this.submittingOrder = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Order Failed',
          detail: err?.error?.message || 'Could not place order. Please try again.',
        });
      },
    });
  }

  goToTrackOrder(): void {
    if (this.createdOrder) {
      this.orderSuccessModalOpen = false;
      this.router.navigate(['/track-order'], {
        queryParams: { code: this.createdOrder.orderNumber },
      });
    }
  }
}
