import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { ButtonModule } from "primeng/button";
import { InputTextModule } from "primeng/inputtext";
import { InputTextareaModule } from "primeng/inputtextarea";
import { InputNumberModule } from "primeng/inputnumber";
import { DropdownModule } from "primeng/dropdown";
import { MultiSelectModule } from "primeng/multiselect";
import { CheckboxModule } from "primeng/checkbox";
import { FileUploadModule } from "primeng/fileupload";
import { ToastModule } from "primeng/toast";
import { ProgressSpinnerModule } from "primeng/progressspinner";
import { MessageService } from "primeng/api";

import { ProductService } from "../../../core/services/product.service";
import { BrandService } from "../../../core/services/brand.service";
import { CategoryService } from "../../../core/services/category.service";
import { ColorService } from "../../../core/services/color.service";
import {
  Brand,
  Category,
  Color,
  LaptopDetail,
  PhoneDetail,
  Product,
  ProductType,
} from "../../../core/models/models";
import { environment } from "../../../../environments/environment";

@Component({
  selector: "app-product-form",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    ButtonModule,
    InputTextModule,
    InputTextareaModule,
    InputNumberModule,
    DropdownModule,
    MultiSelectModule,
    CheckboxModule,
    FileUploadModule,
    ToastModule,
    ProgressSpinnerModule,
  ],
  providers: [MessageService],
  templateUrl: "./product-form.component.html",
  styleUrls: ["./product-form.component.scss"],
})
export class ProductFormComponent implements OnInit {
  isEditMode = false;
  productId: number | null = null;
  loading = false;
  saving = false;
  fileBase = environment.fileBaseUrl;

  typeOptions = [
    { label: "Smartphone", value: "PHONE" as ProductType },
    { label: "Laptop", value: "LAPTOP" as ProductType },
  ];

  brands: Brand[] = [];
  categories: Category[] = [];
  availableColors: Color[] = [];
  selectedColorIds: number[] = [];

  // Common fields
  type: ProductType = "PHONE";
  title = "";
  description = "";
  price: number | null = null;
  discountPrice: number | null = null;
  stock = 0;
  brandId: number | null = null;
  categoryId: number | null = null;
  isUpcoming = false;
  isFlashDeal = false;

  get calculatedDiscountPercent(): number {
    if (this.price && this.discountPrice && this.discountPrice < this.price) {
      return Math.round(((this.price - this.discountPrice) / this.price) * 100);
    }
    return 0;
  }
  isActive = true;

  // Phone-specific
  phone: PhoneDetail = {};
  // Laptop-specific
  laptop: LaptopDetail = {};

  newFiles: File[] = [];
  existingImages: { id: number; url: string }[] = [];

  constructor(
    private productService: ProductService,
    private brandService: BrandService,
    private categoryService: CategoryService,
    private colorService: ColorService,
    private route: ActivatedRoute,
    private router: Router,
    private messageService: MessageService,
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const id = params.get("id");
      this.isEditMode = !!id;
      this.productId = id ? Number(id) : null;
      this.loadBrandsAndCategories();
      if (this.isEditMode) {
        this.loadProduct();
      }
    });
  }

  onTypeChange(): void {
    this.categoryId = null;
    this.loadBrandsAndCategories();
  }

  private loadBrandsAndCategories(): void {
    this.brandService.getBrands().subscribe((b) => (this.brands = b));
    this.categoryService
      .getCategories(this.type)
      .subscribe((c) => (this.categories = c));
    this.colorService
      .getColors()
      .subscribe((c) => (this.availableColors = c));
  }

  private loadProduct(): void {
    if (!this.productId) return;
    this.loading = true;
    this.productService.getProduct(this.productId).subscribe({
      next: (p: Product) => {
        this.type = p.type;
        this.title = p.title;
        this.description = p.description || "";
        this.price = p.price;
        this.discountPrice = p.discountPrice ?? null;
        this.stock = p.stock;
        this.brandId = p.brandId;
        this.categoryId = p.categoryId;
        this.isUpcoming = p.isUpcoming;
        this.isFlashDeal = p.isFlashDeal || false;
        this.isActive = p.isActive;
        this.phone = p.phoneDetail || {};
        this.laptop = p.laptopDetail || {};
        this.existingImages = p.images.map((i) => ({ id: i.id, url: i.url }));
        this.selectedColorIds = p.colors ? p.colors.map((pc) => pc.colorId) : [];
        this.loadBrandsAndCategories();
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }

  getColorById(id: number): Color | undefined {
    return this.availableColors.find((c) => c.id === id);
  }

  onFilesSelect(event: { files: File[] | FileList }): void {
    const files = (event && (event.files as any)) || [];
    this.newFiles = Array.isArray(files) ? files : Array.from(files);
  }

  onFileRemove(event: any) {
    // Handle file removal logic here
    const removedFile = event.file;
    // If you're maintaining a list of new files to upload:
    this.newFiles = this.newFiles.filter(
      (f: File) => f.name !== removedFile.name && f.size !== removedFile.size,
    );

    // If you need to remove an existing image from the server:
    // You might call your image delete API here
  }
  removeExistingImage(imageId: number): void {
    if (!this.productId) return;
    this.productService.deleteImage(this.productId, imageId).subscribe({
      next: () => {
        this.existingImages = this.existingImages.filter(
          (i) => i.id !== imageId,
        );
        this.messageService.add({
          severity: "success",
          summary: "Removed",
          detail: "Image removed.",
        });
      },
      error: () => {
        this.messageService.add({
          severity: "error",
          summary: "Error",
          detail: "Could not remove image.",
        });
      },
    });
  }

  save(): void {
    if (!this.title || !this.price || !this.brandId || !this.categoryId) {
      this.messageService.add({
        severity: "warn",
        summary: "Missing fields",
        detail: "Title, price, brand and category are required.",
      });
      return;
    }

    const fd = new FormData();
    fd.append("title", this.title);
    fd.append("description", this.description || "");
    fd.append("price", String(this.price));
    if (this.discountPrice)
      fd.append("discountPrice", String(this.discountPrice));
    fd.append("stock", String(this.stock ?? 0));
    fd.append("type", this.type);
    fd.append("isUpcoming", String(this.isUpcoming));
    fd.append("isFlashDeal", String(this.isFlashDeal));
    fd.append("isActive", String(this.isActive));
    fd.append("brandId", String(this.brandId));
    fd.append("categoryId", String(this.categoryId));
    fd.append("colorIds", JSON.stringify(this.selectedColorIds));

    const detail = this.type === "PHONE" ? this.phone : this.laptop;
    Object.entries(detail).forEach(([key, value]) => {
      if (value !== undefined && value !== null && key !== "id") {
        fd.append(key, String(value));
      }
    });

    const filesToAppend: File[] = Array.isArray(this.newFiles)
      ? this.newFiles
      : (Array.from(this.newFiles || []) as File[]);
    filesToAppend.forEach((file: File) => fd.append("images", file));

    this.saving = true;
    const req = this.isEditMode
      ? this.productService.updateProduct(this.productId!, fd)
      : this.productService.createProduct(fd);

    req.subscribe({
      next: () => {
        this.saving = false;
        this.messageService.add({
          severity: "success",
          summary: "Saved",
          detail: "Product saved successfully.",
        });
        this.router.navigate(["/admin/products"]);
      },
      error: (err) => {
        this.saving = false;
        this.messageService.add({
          severity: "error",
          summary: "Error",
          detail: err?.error?.message || "Could not save product.",
        });
      },
    });
  }
}
