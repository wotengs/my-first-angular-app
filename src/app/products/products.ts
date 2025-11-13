import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '../services/products';
import { Product } from '../model/product.type';
import { catchError } from 'rxjs';
import { ProductItem } from '../components/product-item/product-item';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, ProductItem],
  templateUrl: './products.html',
  styleUrls: ['./products.scss'],
})
export class Products implements OnInit{
  productService = inject(ProductService);

  ngOnInit(): void {
    // initial load (default 30)
    this.productService.loadProducts();
  }

  updateCartedItem(productItem: Product){
    this.productService.productItems.update(products)=>{

      return products.map(product=>{
        if(productItem.id === productItem.id){
          return {
            ...product, 
            carted:!product.carted,
          }
        }
        return product;
      })
    }
  }
}
