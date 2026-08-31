import { Routes } from '@angular/router';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./shared/components/public-layout/public-layout.component').then((m) => m.PublicLayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/home/home.component').then((m) => m.HomeComponent),
      },
      {
        path: 'products/:idOrSlug',
        loadComponent: () =>
          import('./pages/product-details/product-details.component').then((m) => m.ProductDetailsComponent),
      },
      {
        path: 'upcoming',
        loadComponent: () => import('./pages/upcoming/upcoming.component').then((m) => m.UpcomingComponent),
      },
      {
        path: 'compare',
        loadComponent: () => import('./pages/compare/compare.component').then((m) => m.CompareComponent),
      },
      {
        path: 'wishlist',
        loadComponent: () => import('./pages/wishlist/wishlist.component').then((m) => m.WishlistComponent),
      },
      {
        path: 'track-order',
        loadComponent: () => import('./pages/order-track/order-track.component').then((m) => m.OrderTrackComponent),
      },
    ],
  },
  {
    path: 'admin/login',
    loadComponent: () => import('./admin/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'admin',
    loadComponent: () => import('./admin/layout/admin-layout.component').then((m) => m.AdminLayoutComponent),
    canActivate: [adminGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./admin/dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },
      {
        path: 'orders',
        loadComponent: () => import('./admin/orders/orders.component').then((m) => m.OrdersComponent),
      },
      {
        path: 'reviews',
        loadComponent: () => import('./admin/reviews/reviews.component').then((m) => m.ReviewsComponent),
      },
      {
        path: 'brands',
        loadComponent: () => import('./admin/brands/brands.component').then((m) => m.BrandsComponent),
      },
      {
        path: 'categories',
        loadComponent: () =>
          import('./admin/categories/categories.component').then((m) => m.CategoriesComponent),
      },
      {
        path: 'colors',
        loadComponent: () =>
          import('./admin/colors/colors.component').then((m) => m.ColorsComponent),
      },
      {
        path: 'banners',
        loadComponent: () =>
          import('./admin/banners/banners.component').then((m) => m.BannersComponent),
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./admin/settings/settings.component').then((m) => m.SettingsComponent),
      },
      {
        path: 'products',
        loadComponent: () =>
          import('./admin/products/product-list/product-list.component').then((m) => m.ProductListComponent),
      },
      {
        path: 'products/new',
        loadComponent: () =>
          import('./admin/products/product-form/product-form.component').then((m) => m.ProductFormComponent),
      },
      {
        path: 'products/:id/edit',
        loadComponent: () =>
          import('./admin/products/product-form/product-form.component').then((m) => m.ProductFormComponent),
      },
    ],
  },
  {
    path: '**',
    loadComponent: () => import('./pages/not-found/not-found.component').then((m) => m.NotFoundComponent),
  },
];
