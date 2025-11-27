import { Component, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StepperModule } from 'primeng/stepper';
import { ButtonModule } from 'primeng/button';
import { CardComponent } from './cardSteps/card.component';
import { CheckoutComponent } from './cardSteps/checkout.component';
import { PaymentComponent } from './cardSteps/payment.component';
import { Store } from '@ngrx/store';
import * as CartActions from '../state/cart/cart.actions';
import { Observable } from 'rxjs';
import { selectCartItems, selectCartCount, selectCartTotal } from '../state/cart/cart.selectors';
import { CartItem } from '../state/cart/cart.model';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [
    CommonModule,
    StepperModule,
    ButtonModule,
    CardComponent,
    CheckoutComponent,
    PaymentComponent,
  ],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss'],
})
export class CartComponent implements OnInit {
  cartItems$!: Observable<CartItem[]>;
  cartCount$!: Observable<number>;
  cartTotal$!: Observable<number>;
  activeStep = 1;

  ngOnInit(): void {
    // when running standalone imported store is available via injection in providers
  }
  // Angular will inject the Store when running standalone

  constructor(private store: Store) {
    this.cartItems$ = this.store.select(selectCartItems);
    this.cartCount$ = this.store.select(selectCartCount);
    this.cartTotal$ = this.store.select(selectCartTotal);
  }

  increase(item: import('../state/cart/cart.model').CartItem) {
    // dispatch updateQuantity with +1
    this.store.dispatch(
      CartActions.updateQuantity({ productId: item.productId, quantity: item.quantity + 1 })
    );
  }

  decrease(item: import('../state/cart/cart.model').CartItem) {
    const next = item.quantity - 1;
    if (next <= 0) {
      this.store.dispatch(CartActions.removeProduct({ productId: item.productId }));
    } else {
      this.store.dispatch(
        CartActions.updateQuantity({ productId: item.productId, quantity: next })
      );
    }
  }

  remove(item: import('../state/cart/cart.model').CartItem) {
    this.store.dispatch(CartActions.removeProduct({ productId: item.productId }));
  }

  clear() {
    this.store.dispatch(CartActions.clearCart());
  }
}
