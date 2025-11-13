import { Component, input, computed, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../../model/product.type';
import { HighlightCartedProduct } from '../../directives/highlight-carted-product';

@Component({
  selector: 'app-product-item',
  standalone: true,
  imports: [CommonModule, HighlightCartedProduct],
  templateUrl: './product-item.html',
  styleUrls: ['./product-item.scss'],
})

export class ProductItem {
  /** receives a product object from parent */
  product = input.required<Product>();
  //product = input<Product | null>(null);
  productToggled = output<Product>();

  productClicked(){
    this.productToggled.emit(this.product());
  }

  // derived values for template
  priceLabel = computed(() => {
    const p = this.product();
    if (!p) return '';
    return `$${(p.price ?? 0).toFixed(2)}`;
  });

  thumbnailUrl = computed(() => {
    const p = this.product();
    // prefer thumbnail from API, otherwise use placeholder
    const base = p?.thumbnail || '';
    if (base) return base;
    // use a random placeholder at a reasonable card size
    return 'https://lipsum.app/random/640x360';
  });

}
