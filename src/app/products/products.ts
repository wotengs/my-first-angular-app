import { Component, inject, OnInit, signal } from '@angular/core';

import { ProductService } from '../services/products';
import { Product } from '../model/product.type';
import { catchError } from 'rxjs';
import { ProductItem } from '../components/product-item/product-item';
import { NetworkErrorComponent } from '../core/network-error/network-error.component';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [ProductItem, NetworkErrorComponent],
  templateUrl: './products.html',
  styleUrls: ['./products.scss'],
})
export class Products implements OnInit {
  productService = inject(ProductService);

  ngOnInit(): void {
    // initial load (default 30)
    this.productService.loadProducts();
  }

  updateCartedItem(productItem: Product) {
    // delegate cart state update to ProductService so it can persist + toast
    this.productService.setCartState(productItem.id, !!productItem.carted);
  }

  onEditProduct(p: Product) {
    // open global form pre-populated
    this.productService.openEditForm(p);
  }

  onDeleteProduct(id: number) {
    // remove from in-memory list
    this.productService.deleteProduct(id);
  }

  openCreateForm() {
    this.productService.openCreateForm();
  }

  scrollTop() {
    try {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      window.scrollTo(0, 0);
    }
  }
}
