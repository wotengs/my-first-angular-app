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
  // product = input.required<Product>();
  product = input<Product | null>(null);
  productToggled = output<Product>();
  productEdit = output<Product>();
  productDelete = output<number>();
  // local UI state for menu
  showMenu = false;

  productClicked() {
    const p = this.product();
    if (!p) return;
    const updated: Product = { ...p, carted: !p.carted };
    this.productToggled.emit(updated);
  }

  openMenu(ev?: Event) {
    ev?.stopPropagation();
    this.showMenu = !this.showMenu;
  }

  doEdit() {
    const p = this.product();
    if (!p) return;
    this.productEdit.emit(p);
    this.showMenu = false;
  }

  doDelete() {
    const p = this.product();
    if (!p) return;
    this.productDelete.emit(p.id);
    this.showMenu = false;
  }

  // derived values for template
  priceLabel = computed(() => {
    const p = this.product();
    if (!p) return '';
    return `$${(p.price ?? 0).toFixed(2)}`;
  });

  thumbnailUrl = computed(() => {
    const p = this.product();
    //We should prefer thumbnail from API, otherwise use a placeholder
    const base = p?.thumbnail || '';
    //console.log('Thumbnail URL:', base);
    if (base) return base;
    // use a random placeholder at a reasonable card size
    return 'https://lipsum.app/random/640x360';
  });
}
