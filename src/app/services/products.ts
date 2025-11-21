import { inject, Injectable, signal } from '@angular/core';
import { Product } from '../model/product.type';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, tap, finalize } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { ToastService } from './toast';

interface ApiResponse<T> {
  products: T[];
  total: number;
  skip: number;
  limit: number;
}

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  http = inject(HttpClient);
  toast = inject(ToastService) as ToastService;
  // public signal that components can read
  productItems = signal<Product[]>([]);
  loading = signal(false);
  // form/dialog state for create/edit
  formVisible = signal(false);
  formProduct = signal<Product | null>(null);
  // pagination state
  skip = signal(0);
  limit = signal(30);
  total = signal<number | null>(null);
  // persisted cart map key
  private storageKey = 'myapp_cart_map_v1';

  constructor() {
    // hydrate any persisted cart flags
    this.loadCartFromStorage?.();
  }

  // Open the product form for creating a new product
  openCreateForm() {
    this.formProduct.set(null);
    this.formVisible.set(true);
  }

  // Open the product form for editing an existing product
  openEditForm(p: Product) {
    this.formProduct.set({ ...p });
    this.formVisible.set(true);
  }

  closeForm() {
    this.formVisible.set(false);
    this.formProduct.set(null);
  }

  private getCartMapFromStorage(): Record<number, boolean> {
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (!raw) return {};
      return JSON.parse(raw) as Record<number, boolean>;
    } catch {
      return {};
    }
  }

  private saveCartMapToStorage(map: Record<number, boolean>) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(map));
    } catch {
      // ignore
    }
  }

  private loadCartFromStorage() {
    const map = this.getCartMapFromStorage();
    // If there are existing items in productItems, apply the map
    if (this.productItems().length) {
      this.productItems.update((items) => items.map((p) => ({ ...p, carted: !!map[p.id] })));
    }
  }
  // productItems: Array<Product>=[
  //   {
  //     title: 'Groceries',
  //     id:0,
  //     userId: 1,
  //     completed: false,
  //   },
  //   {
  //     title: 'Parking Basement B4',
  //     id:1,
  //     userId: 1,
  //     completed: false,
  //   }
  // ];
  /**
   * Load products using dummyjson API.
   * If `q` is provided, uses the search endpoint.
   * If `category` is provided, uses the category endpoint.
   * Otherwise uses /products with optional limit/skip/select/sortBy/order.
   */
  getProductsFromApi(params?: {
    limit?: number;
    skip?: number;
    select?: string;
    sortBy?: string;
    order?: 'asc' | 'desc';
    q?: string;
    category?: string;
  }): Observable<ApiResponse<Product>> {
    // return the full ApiResponse so callers can get total/skip/limit
    if (params?.q) {
      const url = `https://dummyjson.com/products/search`;
      let httpParams = new HttpParams().set('q', params.q);
      if (params.limit != null) httpParams = httpParams.set('limit', String(params.limit));
      if (params.skip != null) httpParams = httpParams.set('skip', String(params.skip));
      return this.http.get<ApiResponse<Product>>(url, { params: httpParams });
    }

    if (params?.category) {
      const url = `https://dummyjson.com/products/category/${encodeURIComponent(params.category)}`;
      let httpParams = new HttpParams();
      if (params.limit != null) httpParams = httpParams.set('limit', String(params.limit));
      if (params.skip != null) httpParams = httpParams.set('skip', String(params.skip));
      return this.http.get<ApiResponse<Product>>(url, { params: httpParams });
    }

    // default products endpoint
    const url = `https://dummyjson.com/products`;
    let httpParams = new HttpParams();
    if (params?.limit != null) httpParams = httpParams.set('limit', String(params.limit));
    if (params?.skip != null) httpParams = httpParams.set('skip', String(params.skip));
    if (params?.select) httpParams = httpParams.set('select', params.select);
    if (params?.sortBy) httpParams = httpParams.set('sortBy', params.sortBy);
    if (params?.order) httpParams = httpParams.set('order', params.order);

    return this.http.get<ApiResponse<Product>>(url, { params: httpParams });
  }

  /**
   * Load products and optionally append to existing list (append=true).
   */
  loadProducts(
    opts?: { limit?: number; skip?: number; q?: string; category?: string },
    append = false
  ) {
    this.loading.set(true);
    const limit = opts?.limit ?? this.limit();
    const skip = opts?.skip ?? (append ? this.skip() : 0);

    this.getProductsFromApi({ limit, skip, q: opts?.q, category: opts?.category })
      .pipe(
        tap((resp) => {
          const stored = this.getCartMapFromStorage(); // get persisted cart map
          const products = (resp.products || []).map((p) => ({ ...p, carted: !!stored[p.id] })); // apply carted flags
          if (append) {
            this.productItems.update((curr) => curr.concat(products));
          } else {
            this.productItems.set(products);
          }
          // ensure we merge persisted carted flags if storage changes
          if (Object.keys(stored).length) {
            this.productItems.update((items) =>
              items.map((p) => ({ ...p, carted: !!stored[p.id] }))
            );
          }
          this.total.set(resp.total);
          this.skip.set(resp.skip);
          this.limit.set(resp.limit);
        }),
        finalize(() => this.loading.set(false))
      )
      .subscribe({ error: () => this.loading.set(false) });
  }

  loadMore() {
    // append next page
    const nextSkip = this.skip() + this.limit();
    // if total known and we've loaded all, skip
    if (this.total() != null && this.productItems().length >= this.total()!) return;
    this.loadProducts({ limit: this.limit(), skip: nextSkip }, true);
  }

  /**
   * Set cart state for a product id, update signals, persist and optionally show toast
   */
  setCartState(id: number, carted: boolean) {
    // update signal
    this.productItems.update((items) => items.map((p) => (p.id === id ? { ...p, carted } : p)));

    // persist map
    const map = this.getCartMapFromStorage();
    if (carted) map[id] = true;
    else delete map[id];
    this.saveCartMapToStorage(map);

    // show toast feedback: success when added, info when removed
    if (carted) {
      this.toast?.show('Added to cart', 3000, 'success');
    } else {
      this.toast?.show('Removed from cart', 3000, 'info');
    }
  }

  getCategories(): Observable<string[]> {
    // use category-list endpoint which returns an array of slugs (strings)
    const url = `https://dummyjson.com/products/category-list`;
    return this.http.get<string[]>(url);
  }

  /**
   * Create a product in-memory (simulate POST). Returns created product.
   */
  createProduct(partial: Partial<Product>): Product {
    // create new id based on highest existing id
    const items = this.productItems();
    const maxId = items.reduce((m, it) => Math.max(m, it.id ?? 0), 0);
    const newId = maxId + 1;
    const created: Product = {
      id: newId,
      title: partial.title ?? 'Untitled',
      description: partial.description ?? '',
      price: partial.price ?? 0,
      category: partial.category ?? '',
      brand: partial.brand ?? '',
      stock: partial.stock ?? 0,
      thumbnail: partial.thumbnail ?? '',
      images: (partial as any).images ?? [],
      carted: !!partial['carted'],
      rating: (partial as any).rating ?? undefined,
      discountPercentage: (partial as any).discountPercentage ?? undefined,
    } as Product;

    // add to front of list
    this.productItems.update((curr) => [created, ...curr]);
    this.toast?.show('Product created', 3000, 'success');
    return created;
  }

  /**
   * Update a product in-memory (simulate PUT/PATCH).
   */
  updateProduct(updated: Product) {
    this.productItems.update((items) =>
      items.map((p) => (p.id === updated.id ? { ...p, ...updated } : p))
    );
    this.toast?.show('Product updated', 3000, 'success');
  }

  /**
   * Delete a product from in-memory list (simulate DELETE).
   */
  deleteProduct(id: number) {
    const toDelete = this.productItems().find((p) => p.id === id);
    if (!toDelete) return;
    this.productItems.update((items) => items.filter((p) => p.id !== id));
    this.toast?.show('Product deleted', 3000, 'error');
  }
}
