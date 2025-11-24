import { Component } from '@angular/core';
import { ProductForm } from './product-form';
import { ProductService } from '../../services/products';
import { Product } from '../../model/product.type';

@Component({
  selector: 'app-product-form-container',
  standalone: true,
  imports: [ProductForm],
  template: `
    @if (ps.formVisible()) {
    <div class="overlay">
      <div class="backdrop" (click)="ps.closeForm()"></div>
      <div class="panel">
        <app-product-form
          [product]="ps.formProduct()"
          (saved)="onSaved($event)"
          (cancelled)="ps.closeForm()"
        ></app-product-form>
      </div>
    </div>
    }
  `,
  styles: [
    `
      :host {
        position: fixed;
        inset: 0;
        pointer-events: none;
        z-index: 100000;
      }
      .overlay {
        position: fixed;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        pointer-events: auto;
        z-index: 100000;
      }
      .backdrop {
        position: absolute;
        inset: 0;
        background: rgba(0, 0, 0, 0.48);
        z-index: 100000;
      }
      .panel {
        position: relative;
        z-index: 100001;
      }
    `,
  ],
})
export class ProductFormContainer {
  constructor(public ps: ProductService) {}

  onSaved(p: Product) {
    if (p.id && this.ps.productItems().some((it) => it.id === p.id)) {
      this.ps.updateProduct(p);
    } else {
      this.ps.createProduct(p);
    }
    this.ps.closeForm();
  }
}
