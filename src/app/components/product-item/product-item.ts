import { Component, input, computed, output, OnInit, OnDestroy, inject } from '@angular/core';

import { Product } from '../../model/product.type';
import { HighlightCartedProduct } from '../../directives/highlight-carted-product';
import { Store } from '@ngrx/store';
import * as CartActions from '../../state/cart/cart.actions';

@Component({
  selector: 'app-product-item',
  standalone: true,
  imports: [HighlightCartedProduct],
  templateUrl: './product-item.html',
  styleUrls: ['./product-item.scss'],
})
export class ProductItem implements OnInit, OnDestroy {
  /** receives a product object from parent */
  // product = input.required<Product>();
  product = input<Product | null>(null);
  productToggled = output<Product>();
  productEdit = output<Product>();
  productDelete = output<number>();
  // local UI state for menu
  showMenu = false;

  // event handlers (arrow functions keep `this` binding)
  private onGlobalMenuOpen = (e: Event) => {
    const detail = (e as CustomEvent)?.detail;
    const openId = detail?.id;
    const p = this.product();
    if (!p) return;
    if (openId !== p.id) {
      this.showMenu = false;
    }
  };

  private onDocumentClick = () => {
    this.showMenu = false;
  };

  productClicked() {
    const p = this.product();
    if (!p) return;
    const updated: Product = { ...p, carted: !p.carted };
    this.productToggled.emit(updated);
    // update NgRx cart as well
    try {
      const store = inject(Store);
      if (!p.carted) {
        // adding
        store.dispatch(CartActions.addProduct({ product: { ...p, carted: true }, quantity: 1 }));
      } else {
        store.dispatch(CartActions.removeProduct({ productId: p.id }));
      }
    } catch {
      // ignore if store not available
    }
  }

  openMenu(ev?: Event) {
    ev?.stopPropagation();
    this.showMenu = !this.showMenu;
    // notify other product items that a menu opened so they can close
    if (this.showMenu) {
      const id = this.product()?.id;
      window.dispatchEvent(new CustomEvent('product-menu-open', { detail: { id } }));
    }
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

  ngOnInit(): void {
    window.addEventListener('product-menu-open', this.onGlobalMenuOpen as EventListener);
    document.addEventListener('click', this.onDocumentClick as EventListener);
  }

  ngOnDestroy(): void {
    window.removeEventListener('product-menu-open', this.onGlobalMenuOpen as EventListener);
    document.removeEventListener('click', this.onDocumentClick as EventListener);
  }

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
