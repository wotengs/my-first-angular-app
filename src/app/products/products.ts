import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '../services/products';
import { Product } from '../model/product.type';
import { catchError } from 'rxjs';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './products.html',
  styleUrls: ['./products.scss'],
})
export class Products implements OnInit{
  productService = inject(ProductService);

  ngOnInit(): void {
    // initial load (default 30)
    this.productService.loadProducts();
  }
}
