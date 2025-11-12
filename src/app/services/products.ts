import { inject, Injectable, signal } from '@angular/core';
import { Product } from '../model/product.type';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, tap } from 'rxjs/operators';
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
  }): Observable<Product[]> {
    if (params?.q) {
      const url = `https://dummyjson.com/products/search`;
      const httpParams = new HttpParams().set('q', params.q);
      return this.http
        .get<ApiResponse<Product>>(url, { params: httpParams })
        .pipe(map((r) => r.products));
    }

    if (params?.category) {
      const url = `https://dummyjson.com/products/category/${encodeURIComponent(
        params.category
      )}`;
      const httpParams = new HttpParams()
        .set('limit', String(params.limit ?? 30))
        .set('skip', String(params.skip ?? 0));
      return this.http
        .get<ApiResponse<Product>>(url, { params: httpParams })
        .pipe(map((r) => r.products));
    }

    // default products endpoint
    const url = `https://dummyjson.com/products`;
    let httpParams = new HttpParams();
    if (params?.limit != null) httpParams = httpParams.set('limit', String(params.limit));
    if (params?.skip != null) httpParams = httpParams.set('skip', String(params.skip));
    if (params?.select) httpParams = httpParams.set('select', params.select);
    if (params?.sortBy) httpParams = httpParams.set('sortBy', params.sortBy);
    if (params?.order) httpParams = httpParams.set('order', params.order);

    return this.http
      .get<ApiResponse<Product>>(url, { params: httpParams })
      .pipe(map((r) => r.products));
  }

  loadProducts(opts?: { limit?: number; skip?: number; q?: string; category?: string }) {
    this.getProductsFromApi({ limit: opts?.limit, skip: opts?.skip, q: opts?.q, category: opts?.category })
      .pipe(
        tap((products) => {
          this.productItems.set(products || []);
        })
      )
      .subscribe();
  }

  getCategories(): Observable<string[]> {
    const url = `https://dummyjson.com/products/categories`;
    return this.http.get<string[]>(url);
  }
}
