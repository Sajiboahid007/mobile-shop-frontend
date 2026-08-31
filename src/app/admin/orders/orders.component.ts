import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { DropdownModule } from 'primeng/dropdown';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { OrderService } from '../../core/services/order.service';
import { Order } from '../../core/models/models';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    TagModule,
    DropdownModule,
    DialogModule,
    InputTextModule,
    ToastModule,
  ],
  providers: [MessageService],
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss'],
})
export class OrdersComponent implements OnInit {
  orders: Order[] = [];
  loading = false;
  totalRecords = 0;
  searchQuery = '';
  selectedStatus = 'ALL';

  statusOptions = [
    { label: 'All Statuses', value: 'ALL' },
    { label: 'Pending', value: 'PENDING' },
    { label: 'Processing', value: 'PROCESSING' },
    { label: 'Shipped', value: 'SHIPPED' },
    { label: 'Delivered', value: 'DELIVERED' },
    { label: 'Cancelled', value: 'CANCELLED' },
  ];

  selectedOrder: Order | null = null;
  detailModalOpen = false;
  modalSelectedStatus = '';

  get pendingCount(): number {
    return this.orders.filter((o) => o.orderStatus === 'PENDING').length;
  }

  get processingCount(): number {
    return this.orders.filter((o) => o.orderStatus === 'PROCESSING' || o.orderStatus === 'SHIPPED').length;
  }

  get deliveredCount(): number {
    return this.orders.filter((o) => o.orderStatus === 'DELIVERED').length;
  }

  get totalRevenue(): number {
    return this.orders
      .filter((o) => o.orderStatus !== 'CANCELLED')
      .reduce((acc, o) => acc + o.totalAmount, 0);
  }

  getInitials(name: string): string {
    if (!name) return 'C';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }

  constructor(
    private orderService: OrderService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading = true;
    this.orderService
      .getAdminOrders({
        status: this.selectedStatus !== 'ALL' ? this.selectedStatus : undefined,
        search: this.searchQuery.trim() || undefined,
        limit: 50,
      })
      .subscribe({
        next: (res: any) => {
          this.orders = res.orders;
          this.totalRecords = res.pagination.total;
          this.loading = false;
        },
        error: () => (this.loading = false),
      });
  }

  viewOrder(order: Order): void {
    this.selectedOrder = order;
    this.modalSelectedStatus = order.orderStatus;
    this.detailModalOpen = true;
  }

  saveModalStatus(): void {
    if (!this.selectedOrder || this.modalSelectedStatus === this.selectedOrder.orderStatus) {
      return;
    }
    this.updateStatus(this.selectedOrder, this.modalSelectedStatus);
  }

  updateStatus(order: Order, newStatus: string): void {
    this.orderService.updateOrderStatus(order.id, { orderStatus: newStatus }).subscribe({
      next: (updated: any) => {
        order.orderStatus = updated.orderStatus;
        this.modalSelectedStatus = updated.orderStatus;
        this.messageService.add({
          severity: 'success',
          summary: 'Status Updated',
          detail: `Order ${order.orderNumber} status changed to ${newStatus}.`,
        });
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Update Failed',
          detail: 'Could not update order status.',
        });
      },
    });
  }

  getStatusSeverity(status: string): 'success' | 'info' | 'warning' | 'danger' {
    switch (status) {
      case 'DELIVERED':
        return 'success';
      case 'SHIPPED':
      case 'PROCESSING':
        return 'info';
      case 'PENDING':
        return 'warning';
      case 'CANCELLED':
        return 'danger';
      default:
        return 'info';
    }
  }

  generateInvoicePdf(order: Order): void {
    const printWindow = window.open('', '_blank', 'width=900,height=950');
    if (!printWindow) {
      this.messageService.add({
        severity: 'error',
        summary: 'Popup Blocked',
        detail: 'Please allow popups to preview and print the Invoice PDF.',
      });
      return;
    }

    const itemsHtml = order.items
      .map(
        (item, idx) => `
        <tr>
          <td style="text-align: center; padding: 12px 10px; border-bottom: 1px solid #e2e8f0; font-size: 13px;">${idx + 1}</td>
          <td style="padding: 12px 10px; border-bottom: 1px solid #e2e8f0;">
            <div style="font-weight: 700; color: #0f172a; font-size: 14px;">${item.productTitle}</div>
            ${
              item.storage || item.color
                ? `<div style="font-size: 12px; color: #64748b; margin-top: 3px;">
                    ${item.storage ? `<span style="background: #f1f5f9; padding: 2px 6px; border-radius: 4px; margin-right: 4px;">Storage: ${item.storage}</span>` : ''}
                    ${item.color ? `<span style="background: #f1f5f9; padding: 2px 6px; border-radius: 4px;">Color: ${item.color}</span>` : ''}
                  </div>`
                : ''
            }
          </td>
          <td style="text-align: center; padding: 12px 10px; border-bottom: 1px solid #e2e8f0; font-size: 13px; font-weight: 600;">${item.quantity}</td>
          <td style="text-align: right; padding: 12px 10px; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #334155;">৳${item.price.toLocaleString()}</td>
          <td style="text-align: right; padding: 12px 10px; border-bottom: 1px solid #e2e8f0; font-size: 14px; font-weight: 700; color: #0f172a;">৳${(item.price * item.quantity).toLocaleString()}</td>
        </tr>
      `
      )
      .join('');

    const formattedDate = new Date(order.createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const invoiceHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <title>Invoice - ${order.orderNumber}</title>
        <style>
          @page {
            size: A4 portrait;
            margin: 12mm 15mm;
          }
          * {
            box-sizing: border-box;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          }
          body {
            margin: 0;
            padding: 30px;
            color: #1e293b;
            background: #ffffff;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .invoice-card {
            max-width: 820px;
            margin: 0 auto;
            background: #ffffff;
          }
          .header-row {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            padding-bottom: 20px;
            border-bottom: 3px solid #2563eb;
          }
          .brand-logo-wrap {
            display: flex;
            align-items: center;
            gap: 10px;
          }
          .brand-name {
            font-size: 26px;
            font-weight: 900;
            color: #1e3a8a;
            letter-spacing: -0.5px;
            margin: 0;
            text-transform: uppercase;
          }
          .brand-sub {
            font-size: 12px;
            color: #64748b;
            margin-top: 6px;
            line-height: 1.5;
          }
          .invoice-title-block {
            text-align: right;
          }
          .invoice-title {
            font-size: 32px;
            font-weight: 900;
            color: #2563eb;
            letter-spacing: 1px;
            margin: 0 0 6px 0;
          }
          .invoice-meta {
            font-size: 13px;
            color: #475569;
            line-height: 1.6;
          }
          .invoice-meta strong {
            color: #0f172a;
          }
          .meta-grid {
            display: grid;
            grid-template-columns: 1.2fr 1fr;
            gap: 20px;
            margin: 24px 0;
            padding: 18px 20px;
            background: #f8fafc;
            border-radius: 10px;
            border: 1px solid #e2e8f0;
          }
          .meta-block h4 {
            margin: 0 0 10px 0;
            font-size: 12px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.6px;
            color: #2563eb;
          }
          .meta-block p {
            margin: 0;
            font-size: 13px;
            line-height: 1.6;
            color: #334155;
          }
          .status-pill {
            display: inline-block;
            font-size: 11px;
            font-weight: 800;
            padding: 3px 10px;
            border-radius: 999px;
            background: #dbeafe;
            color: #1e40af;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-top: 4px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 16px 0 24px 0;
          }
          th {
            background: #0f172a;
            color: #ffffff;
            font-size: 12px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.6px;
            padding: 12px 10px;
          }
          .summary-wrap {
            display: flex;
            justify-content: flex-end;
            margin-top: 10px;
          }
          .summary-table {
            width: 340px;
            border-collapse: collapse;
          }
          .summary-table td {
            padding: 9px 12px;
            font-size: 13px;
          }
          .summary-table .label {
            color: #64748b;
          }
          .summary-table .val {
            text-align: right;
            font-weight: 600;
            color: #0f172a;
          }
          .summary-table .grand-total {
            border-top: 2px solid #0f172a;
            border-bottom: 2px solid #0f172a;
            background: #f8fafc;
          }
          .summary-table .grand-total td {
            padding: 12px;
          }
          .footer-note {
            margin-top: 50px;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            font-size: 12px;
            color: #64748b;
          }
          .terms-block {
            max-width: 480px;
            line-height: 1.5;
          }
          .sig-line {
            text-align: center;
            border-top: 1px solid #94a3b8;
            width: 200px;
            padding-top: 8px;
            font-size: 12px;
            font-weight: 600;
            color: #475569;
          }
          .print-btn-bar {
            text-align: center;
            margin-bottom: 24px;
          }
          .print-btn {
            background: #2563eb;
            color: #ffffff;
            border: none;
            padding: 12px 28px;
            font-size: 15px;
            font-weight: 700;
            border-radius: 8px;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
            transition: all 0.2s;
          }
          .print-btn:hover {
            background: #1d4ed8;
            transform: translateY(-1px);
          }
          @media print {
            .print-btn-bar {
              display: none !important;
            }
            body {
              padding: 0 !important;
            }
          }
        </style>
      </head>
      <body>
        <div class="print-btn-bar">
          <button class="print-btn" onclick="window.print()">🖨️ Print / Save as PDF</button>
        </div>

        <div class="invoice-card">
          <div class="header-row">
            <div>
              <div class="brand-logo-wrap">
                <h1 class="brand-name">MOBILESHOP</h1>
              </div>
              <div class="brand-sub">
                Official Smartphones &amp; Premium Laptops Store<br />
                Dhaka, Bangladesh &middot; Hotline: +880 1900-000000<br />
                Email: support@mobileshop.com &middot; Web: www.mobileshop.com
              </div>
            </div>
            <div class="invoice-title-block">
              <h2 class="invoice-title">INVOICE</h2>
              <div class="invoice-meta">
                <div>Invoice #: <strong>${order.orderNumber}</strong></div>
                <div>Date: <strong>${formattedDate}</strong></div>
                <div>Payment Method: <strong>${order.paymentMethod}</strong></div>
              </div>
            </div>
          </div>

          <div class="meta-grid">
            <div class="meta-block">
              <h4>Customer &amp; Shipping Details</h4>
              <p>
                <strong>${order.customerName}</strong><br />
                Phone: <strong>${order.customerPhone}</strong><br />
                ${order.customerEmail ? `Email: ${order.customerEmail}<br />` : ''}
                Delivery Address: ${order.shippingAddress}, ${order.city} ${order.postalCode || ''}
              </p>
            </div>
            <div class="meta-block">
              <h4>Order &amp; Payment Status</h4>
              <p>
                Order Status: <span class="status-pill">${order.orderStatus}</span><br />
                Payment Status: <strong>${order.paymentStatus || 'UNPAID'}</strong><br />
                ${order.notes ? `Delivery Note: <em>"${order.notes}"</em>` : 'Thank you for purchasing with MobileShop!'}
              </p>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th style="width: 40px; text-align: center;">#</th>
                <th style="text-align: left;">Item Description</th>
                <th style="width: 60px; text-align: center;">Qty</th>
                <th style="width: 120px; text-align: right;">Unit Price</th>
                <th style="width: 130px; text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <div class="summary-wrap">
            <table class="summary-table">
              <tr>
                <td class="label">Subtotal:</td>
                <td class="val">৳${order.subtotal.toLocaleString()}</td>
              </tr>
              ${
                order.discount > 0
                  ? `<tr>
                      <td class="label" style="color: #16a34a;">Discount:</td>
                      <td class="val" style="color: #16a34a;">-৳${order.discount.toLocaleString()}</td>
                     </tr>`
                  : ''
              }
              <tr>
                <td class="label">Delivery Fee:</td>
                <td class="val">৳${order.shippingFee.toLocaleString()}</td>
              </tr>
              <tr class="grand-total">
                <td style="font-weight: 800; font-size: 15px; color: #0f172a;">Grand Total:</td>
                <td class="val" style="font-size: 18px; font-weight: 900; color: #2563eb;">৳${order.totalAmount.toLocaleString()}</td>
              </tr>
            </table>
          </div>

          <div class="footer-note">
            <div class="terms-block">
              <strong>Warranty &amp; Return Terms:</strong><br />
              &bull; 7-Day hassle-free replacement on manufacturing defects.<br />
              &bull; Official brand warranty valid with original invoice and package box.<br />
              &bull; For help or inquiries, contact support@mobileshop.com
            </div>
            <div class="sig-line">
              Authorized Signature &amp; Seal
            </div>
          </div>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(invoiceHtml);
    printWindow.document.close();
  }
}

