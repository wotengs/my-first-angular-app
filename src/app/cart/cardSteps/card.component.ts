import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { PanelModule } from 'primeng/panel';
import { CartItem } from '../../state/cart/cart.model';

@Component({
  selector: 'app-card-step',
  standalone: true,
  imports: [CommonModule, RouterLink, ButtonModule, CardModule, PanelModule],
  template: `
    <div class="container py-4">
      <div class="row g-4">
        <div class="col-md-8">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h4 class="mb-0">
              Cart <small class="text-muted">({{ count }} products)</small>
            </h4>
            <button
              class="btn btn-link text-danger d-flex align-items-center"
              (click)="$emitClear()"
            >
              <i class="bi bi-x-square me-1" aria-hidden="true"></i>
              Clear cart
            </button>
          </div>

          <div class="p-3 rounded-4 border bg-white">
            <div class="row fw-semibold text-muted small mb-3 px-2">
              <div class="col-7">Product</div>
              <div class="col-3 text-center">Count</div>
              <div class="col-2 text-end">Price</div>
            </div>
            @if (items && items.length > 0) { @for (it of items; track it.productId) {
            <div class="mb-3">
              <p-card class="shadow-sm rounded-3 border" [style]="{ 'border-radius': '12px' }">
                <ng-template pTemplate="content">
                  <div class="row align-items-center gx-2">
                    <div class="col-auto">
                      <img
                        [src]="it.product.thumbnail || 'assets/images/placeholder.png'"
                        class="rounded-3"
                        style="width:72px;height:72px;object-fit:cover;"
                      />
                    </div>
                    <div class="col">
                      <div class="fw-semibold">{{ it.product.title }}</div>
                      <div class="text-muted small">{{ it.product.brand }}</div>
                    </div>

                    <div class="col-3 d-flex justify-content-center">
                      <div class="d-flex align-items-center">
                        <button
                          class="btn btn-outline-secondary btn-sm rounded-circle me-2"
                          (click)="$emitDecrease(it)"
                        >
                          <i class="bi bi-dash-lg"></i>
                        </button>
                        <div class="px-3">{{ it.quantity }}</div>
                        <button
                          class="btn btn-outline-secondary btn-sm rounded-circle ms-2"
                          (click)="$emitIncrease(it)"
                        >
                          <i class="bi bi-plus-lg"></i>
                        </button>
                      </div>
                    </div>

                    <div class="col-2 text-end">
                      <div class="fw-bold">\${{ it.product.price }}</div>
                      <button class="btn btn-link text-danger small" (click)="$emitRemove(it)">
                        <i class="bi bi-x-lg"></i>
                      </button>
                    </div>
                  </div>
                </ng-template>
              </p-card>
            </div>
            }} @else {
            <div class="p-4 text-center border rounded-3 bg-white">
              <p class="mb-2">Your cart is empty.</p>
              <a routerLink="/products" class="btn btn-outline-primary"
                ><i class="bi bi-arrow-left" aria-hidden="true"></i> Continue shopping</a
              >
            </div>
            }
          </div>
        </div>

        <div class="col-md-4 ">
          <p-panel class="p-3 rounded-3 bg-light" header="Promo code">
            <div class="mb-3">
              <div class="input-group rounded-pill overflow-hidden">
                <input type="text" class="form-control border-0" placeholder="Type here..." />
                <button class="btn btn-dark">Apply</button>
              </div>
            </div>

            <div class="mt-3">
              <div class="d-flex justify-content-between small text-muted mb-2">
                <div>Subtotal</div>
                <div>\${{ total }}</div>
              </div>
              <div class="d-flex justify-content-between small text-muted mb-2">
                <div>Discount</div>
                <div>-$0.00</div>
              </div>
              <hr />
              <div class="d-flex justify-content-between fw-bold mb-3">
                <div>Total</div>
                <div>\${{ total }}</div>
              </div>

              <button class="btn btn-dark w-100 rounded-3" (click)="$emitContinue()">
                Continue to checkout
              </button>
            </div>
          </p-panel>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      :host ::ng-deep .p-card,
      :host ::ng-deep .p-panel {
        background: #ffffff !important;
        color: #212529 !important;
      }
      :host ::ng-deep .p-card {
        border-radius: 12px !important;
      }
      :host ::ng-deep .p-panel {
        border-radius: 12px !important;
      }
      :host .p-3.rounded-4 {
        border-radius: 12px;
      }
      :host img {
        border-radius: 8px;
      }
      :host .qty-btn {
        width: 36px;
        height: 36px;
        padding: 0;
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }
      :host .product-title {
        font-size: 0.95rem;
      }
      :host .product-brand {
        color: #6c757d;
        font-size: 0.8rem;
      }
      :host .cart-row {
        padding: 8px;
      }
      :host .summary-panel {
        background-color: #f8f9fa;
        border-radius: 12px;
      }
    `,
  ],
})
export class CardComponent {
  @Input() items: CartItem[] | null = [];
  @Input() count = 0;
  @Input() total = 0;

  trackByProduct(_: number, item: CartItem) {
    return item.productId;
  }

  @Output() increase = new EventEmitter<CartItem>();
  @Output() decrease = new EventEmitter<CartItem>();
  @Output() remove = new EventEmitter<CartItem>();
  @Output() clear = new EventEmitter<void>();
  @Output() cont = new EventEmitter<number>();

  $emitIncrease(it: CartItem) {
    this.increase.emit(it);
  }

  $emitDecrease(it: CartItem) {
    this.decrease.emit(it);
  }

  $emitRemove(it: CartItem) {
    this.remove.emit(it);
  }

  $emitClear() {
    this.clear.emit();
  }

  $emitContinue() {
    this.cont.emit(2);
  }
}
