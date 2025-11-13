import { inject, Injectable, signal } from '@angular/core';
import { Product } from '../model/product.type';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, tap, finalize } from 'rxjs/operators';
import { Observable } from 'rxjs';

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
  // public signal that components can read
  productItems = signal<Product[]>([]);
  loading = signal(false);
  // pagination state
  skip = signal(0);
  limit = signal(30);
  total = signal<number | null>(null);
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
   * Load products using dummyjson APIbbbbbb.
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
  loadProducts(opts?: { limit?: number; skip?: number; q?: string; category?: string }, append = false) {
    this.loading.set(true);
    const limit = opts?.limit ?? this.limit();
    const skip = opts?.skip ?? (append ? this.skip() : 0);

    this.getProductsFromApi({ limit, skip, q: opts?.q, category: opts?.category })
      .pipe(
        tap((resp) => {
          const products = resp.products || [];
          if (append) {
            this.productItems.update((curr) => curr.concat(products));
          } else {
            this.productItems.set(products);
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

  getCategories(): Observable<string[]> {
    const url = `https://dummyjson.com/products/categories`;
    return this.http.get<string[]>(url);
  }
}
