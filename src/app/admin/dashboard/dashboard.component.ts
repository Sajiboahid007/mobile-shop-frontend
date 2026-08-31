import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { ChartModule } from 'primeng/chart';
import { DashboardService } from '../../core/services/dashboard.service';
import { DashboardStats } from '../../core/models/models';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ProgressSpinnerModule,
    TagModule,
    ButtonModule,
    ChartModule,
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  stats: DashboardStats | null = null;
  loading = true;
  fileBase = environment.fileBaseUrl;

  // Chart 1: Order Sales & Volume Analysis
  orderChartData: any;
  orderChartOptions: any;

  // Chart 2: Most Visited Smartphones
  phoneVisitsData: any;
  phoneVisitsOptions: any;

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.dashboardService.getStats().subscribe({
      next: (s) => {
        this.stats = s;
        this.setupCharts(s);
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }

  setupCharts(stats: DashboardStats): void {
    // 1. Order Sales & Volume Trend (Past 7 Days)
    const salesLabels = stats.salesTrend?.map((t) => t.label) || [
      'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun',
    ];
    const salesRevenue = stats.salesTrend?.map((t) => t.revenue) || [0, 0, 0, 0, 0, 0, 0];
    const orderCounts = stats.salesTrend?.map((t) => t.orders) || [0, 0, 0, 0, 0, 0, 0];

    this.orderChartData = {
      labels: salesLabels,
      datasets: [
        {
          type: 'line',
          label: 'Revenue (৳)',
          borderColor: '#2563eb',
          backgroundColor: 'rgba(37, 99, 235, 0.08)',
          borderWidth: 3,
          fill: true,
          tension: 0.35,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: '#2563eb',
          data: salesRevenue,
          yAxisID: 'y',
        },
        {
          type: 'bar',
          label: 'Orders Count',
          backgroundColor: '#93c5fd',
          hoverBackgroundColor: '#60a5fa',
          borderRadius: 6,
          barThickness: 24,
          data: orderCounts,
          yAxisID: 'y1',
        },
      ],
    };

    this.orderChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            usePointStyle: true,
            font: { family: '-apple-system, sans-serif', weight: '600' },
            padding: 15,
          },
        },
        tooltip: {
          backgroundColor: '#0f172a',
          padding: 12,
          cornerRadius: 8,
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { font: { weight: '500' }, color: '#64748b' },
        },
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          grid: { color: '#f1f5f9' },
          ticks: {
            callback: (val: number) => '৳' + val.toLocaleString(),
            color: '#64748b',
          },
        },
        y1: {
          type: 'linear',
          display: true,
          position: 'right',
          grid: { drawOnChartArea: false },
          ticks: { stepSize: 1, color: '#94a3b8' },
        },
      },
    };

    // 2. Most Visited Smartphones Horizontal Bar Chart
    const phones = stats.topVisitedPhones || [];
    const phoneLabels = phones.map((p) =>
      p.title.length > 20 ? p.title.substring(0, 20) + '...' : p.title
    );
    const phoneViews = phones.map((p) => p.views || 0);

    this.phoneVisitsData = {
      labels: phoneLabels,
      datasets: [
        {
          label: 'Customer Views',
          data: phoneViews,
          backgroundColor: [
            '#2563eb',
            '#4f46e5',
            '#7c3aed',
            '#059669',
            '#d97706',
            '#0891b2',
          ],
          borderRadius: 8,
          borderSkipped: false,
          barThickness: 22,
        },
      ],
    };

    this.phoneVisitsOptions = {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#0f172a',
          padding: 12,
          cornerRadius: 8,
          callbacks: {
            label: (ctx: any) => ` ${ctx.raw} Page Views`,
          },
        },
      },
      scales: {
        x: {
          grid: { color: '#f1f5f9' },
          ticks: { font: { weight: '500' }, color: '#64748b' },
        },
        y: {
          grid: { display: false },
          ticks: { font: { weight: '600' }, color: '#1e293b' },
        },
      },
    };
  }

  get cards() {
    if (!this.stats) return [];
    return [
      { label: 'Customer Orders', value: this.stats.totalOrders || 0, icon: 'pi pi-shopping-bag', color: '#2563eb', link: '/admin/orders' },
      { label: 'Pending Shipments', value: this.stats.pendingOrders || 0, icon: 'pi pi-truck', color: '#f59e0b', link: '/admin/orders' },
      { label: 'Smartphones', value: this.stats.totalPhones, icon: 'pi pi-mobile', color: '#059669', link: '/admin/products' },
      { label: 'Laptops', value: this.stats.totalLaptops, icon: 'pi pi-desktop', color: '#7c3aed', link: '/admin/products' },
      { label: 'Customer Reviews', value: this.stats.totalReviews || 0, icon: 'pi pi-star', color: '#d97706', link: '/admin/reviews' },
      { label: 'Total Brands', value: this.stats.totalBrands, icon: 'pi pi-tags', color: '#0891b2', link: '/admin/brands' },
      { label: 'Upcoming Phones', value: this.stats.upcomingCount, icon: 'pi pi-clock', color: '#6366f1', link: '/admin/products' },
      { label: 'Out of Stock', value: this.stats.outOfStock, icon: 'pi pi-exclamation-triangle', color: '#dc2626', link: '/admin/products' },
    ];
  }

  imageUrl(product: any): string {
    const primary = product.images?.find((i: any) => i.isPrimary) || product.images?.[0];
    return primary ? `${this.fileBase}${primary.url}` : '';
  }
}
