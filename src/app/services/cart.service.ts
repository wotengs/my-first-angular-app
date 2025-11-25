import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface RemoteCartProduct {
  id: number;
  title: string;
  price: number;
  quantity: number;
  total: number;
  discountPercentage?: number;
  discountedTotal?: number;
  thumbnail?: string;
}

export interface RemoteCart {
  id: number;
  products: RemoteCartProduct[];
  total: number;
  discountedTotal: number;
  userId: number;
  totalProducts: number;
  totalQuantity: number;
}

export interface RemoteCartResponse {
  carts: RemoteCart[];
  total: number;
  skip: number;
  limit: number;
}

@Injectable({ providedIn: 'root' })
export class CartService {
  constructor(private http: HttpClient) {}

  fetchCartForUser(userId: number): Observable<RemoteCartResponse> {
    const url = `https://dummyjson.com/carts/user/${userId}`;
    return this.http.get<RemoteCartResponse>(url);
  }
}
