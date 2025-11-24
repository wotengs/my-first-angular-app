import { Component, EventEmitter, input, output, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Product } from '../../model/product.type';
import { ProductService } from '../../services/products';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './product-form.html',
  styleUrls: ['./product-form.scss'],
})
export class ProductForm {
  product = input<Product | null>(null);
  saved = output<Product>();
  cancelled = output<void>();

  fb = new FormBuilder();
  form = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(2)]],
    description: [''],
    price: [0, [Validators.required, Validators.min(0)]],
    category: [''],
    brand: [''],
    stock: [0, [Validators.min(0)]],
    thumbnail: [''],
  });

  private ps = inject(ProductService);
  categories = signal<string[]>([]);

  constructor() {
    // fetch categories for the select
    this.ps.getCategories().subscribe({ next: (list) => this.categories.set(list || []) });
  }

  ngOnChanges() {
    const p = this.product();
    if (p) {
      this.form.patchValue({
        title: p.title ?? '',
        description: p.description ?? '',
        price: p.price ?? 0,
        category: p.category ?? '',
        brand: p.brand ?? '',
        stock: p.stock ?? 0,
        thumbnail: p.thumbnail ?? '',
      });
    } else {
      this.form.reset({ price: 0, stock: 0 });
    }
  }

  humanizeCategory(slug: string) {
    if (!slug) return '';
    return String(slug)
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }

  submit() {
    if (this.form.invalid) return;
    const data = { ...(this.product() ?? {}), ...this.form.value } as Product;
    this.saved.emit(data);
  }

  close() {
    this.cancelled.emit();
  }
}
