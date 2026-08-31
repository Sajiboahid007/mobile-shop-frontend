export type ProductType = 'PHONE' | 'LAPTOP';

export interface Brand {
  id: number;
  name: string;
  logo?: string | null;
  _count?: { products: number };
  createdAt?: string;
}

export interface Category {
  id: number;
  name: string;
  type: ProductType;
  _count?: { products: number };
}

export interface Color {
  id: number;
  name: string;
  hexCode?: string | null;
  _count?: { products: number };
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductColor {
  id?: number;
  productId?: number;
  colorId: number;
  color: Color;
}

export interface ProductImage {
  id: number;
  url: string;
  isPrimary: boolean;
}

export interface PhoneDetail {
  id?: number;
  ram?: string | null;
  storage?: string | null;
  display?: string | null;
  displayType?: string | null;
  camera?: string | null;
  frontCamera?: string | null;
  battery?: string | null;
  processor?: string | null;
  os?: string | null;
  network?: string | null;
  color?: string | null;
  warranty?: string | null;
}

export interface LaptopDetail {
  id?: number;
  processor?: string | null;
  ram?: string | null;
  storage?: string | null;
  storageType?: string | null;
  display?: string | null;
  graphics?: string | null;
  os?: string | null;
  battery?: string | null;
  weight?: string | null;
  color?: string | null;
  warranty?: string | null;
  ports?: string | null;
}

export interface Product {
  id: number;
  title: string;
  slug: string;
  description?: string | null;
  price: number;
  discountPrice?: number | null;
  stock: number;
  views?: number;
  type: ProductType;
  isUpcoming: boolean;
  isFlashDeal?: boolean;
  isActive: boolean;
  brandId: number;
  categoryId: number;
  brand: Brand;
  category: Category;
  images: ProductImage[];
  colors?: ProductColor[];
  phoneDetail?: PhoneDetail | null;
  laptopDetail?: LaptopDetail | null;
  rating?: number;
  reviewCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Paginated<T> {
  items: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ProductQuery {
  type?: ProductType;
  category?: number | string;  // numeric ID or comma-separated IDs — backend parses via split(',')
  brand?: number | string;     // numeric ID or comma-separated IDs — backend parses via split(',')
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  upcoming?: boolean;
  isFlashDeal?: boolean;
  onSale?: boolean;
  inStock?: boolean;
  ram?: string;
  storage?: string;
  page?: number;
  limit?: number;
  sort?: 'newest' | 'price_asc' | 'price_desc';
}

export interface Admin {
  id: number;
  name: string;
  email: string;
  role: string;
}

export interface DashboardStats {
  totalPhones: number;
  totalLaptops: number;
  totalProducts: number;
  totalBrands: number;
  totalCategories: number;
  upcomingCount: number;
  outOfStock: number;
  totalOrders?: number;
  totalRevenue?: number;
  pendingOrders?: number;
  totalReviews?: number;
  recentOrders?: Order[];
  recentProducts: Product[];
  orderStatusCounts?: { [status: string]: number };
  salesTrend?: { label: string; orders: number; revenue: number }[];
  topVisitedPhones?: Product[];
}

export interface Review {
  id: number;
  productId: number;
  product?: { id: number; title: string; slug: string };
  name: string;
  email: string;
  rating: number;
  title?: string | null;
  comment: string;
  isVerified: boolean;
  createdAt: string;
}

export interface ReviewSummary {
  total: number;
  average: number;
  distribution: { [stars: number]: number };
}

export interface CartItem {
  id: string; // unique item key e.g. `${product.id}-${color}-${storage}`
  productId: number;
  title: string;
  slug: string;
  price: number;
  originalPrice: number;
  image?: string;
  color?: string;
  storage?: string;
  quantity: number;
  stock: number;
}

export interface OrderItem {
  id?: number;
  orderId?: number;
  productId?: number | null;
  productTitle: string;
  productImage?: string | null;
  price: number;
  quantity: number;
  color?: string | null;
  storage?: string | null;
}

export interface Order {
  id: number;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  city: string;
  postalCode?: string | null;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string; // PENDING, PROCESSING, SHIPPED, DELIVERED, CANCELLED
  subtotal: number;
  discount: number;
  shippingFee: number;
  totalAmount: number;
  notes?: string | null;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface PromoCoupon {
  code: string;
  discountPercent: number;
  maxDiscount: number;
  minSpend: number;
  description: string;
}

export interface Banner {
  id: number;
  title: string;
  tagline?: string | null;
  badge?: string | null;
  description?: string | null;
  phoneTag?: string | null;
  ctaText?: string | null;
  ctaLink?: string | null;
  image?: string | null;
  bgGradient?: string | null;
  order?: number;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ShopSettings {
  id: number;
  shopName: string;
  tagline?: string | null;
  address?: string | null;
  city?: string | null;
  email?: string | null;
  phone?: string | null;
  facebookUrl?: string | null;
  twitterUrl?: string | null;
  instagramUrl?: string | null;
  youtubeUrl?: string | null;
  copyrightText?: string | null;
  updatedAt?: string;
}
