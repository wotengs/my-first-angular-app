import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { defer, EMPTY, of } from 'rxjs';
import { catchError, map, mergeMap, tap, withLatestFrom } from 'rxjs/operators';
import * as CartActions from './cart.actions';
import { CartService } from '../../services/cart.service';
import { Store } from '@ngrx/store';
import { selectCartItems } from './cart.selectors';

@Injectable()
export class CartEffects {
  loadCart$;
  hydrate$;
  persist$;

  constructor(private actions$: Actions, private cartService: CartService, private store: Store) {
    this.loadCart$ = createEffect(() =>
      this.actions$.pipe(
        ofType(CartActions.loadCart),
        mergeMap(({ userId }) =>
          this.cartService.fetchCartForUser(userId).pipe(
            map((resp) => {
              const cart = resp?.carts && resp.carts.length ? resp.carts[0] : null;
              if (!cart) return CartActions.loadCartFailure({ error: 'No cart found' });
              const items = cart.products.map((p) => ({
                productId: p.id,
                product: {
                  id: p.id,
                  title: p.title,
                  price: p.price,
                  thumbnail: p.thumbnail,
                },
                quantity: p.quantity,
              }));
              return CartActions.setCartItems({ items });
            }),
            catchError((err) => of(CartActions.loadCartFailure({ error: err })))
          )
        )
      )
    );

    // Hydrate cart from localStorage when effects initialize
    this.hydrate$ = createEffect(() =>
      defer(() => {
        try {
          const raw = localStorage.getItem('cart');
          if (!raw) return EMPTY;
          const items = JSON.parse(raw);
          return of(CartActions.setCartItems({ items }));
        } catch (e) {
          return EMPTY;
        }
      })
    );

    // Persist cart to localStorage on cart mutations
    this.persist$ = createEffect(
      () =>
        this.actions$.pipe(
          ofType(
            CartActions.addProduct,
            CartActions.removeProduct,
            CartActions.updateQuantity,
            CartActions.clearCart,
            CartActions.setCartItems
          ),
          withLatestFrom(this.store.select(selectCartItems)),
          tap(([, items]) => {
            try {
              localStorage.setItem('cart', JSON.stringify(items || []));
            } catch (e) {
              // ignore
            }
          })
        ),
      { dispatch: false }
    );
  }
}
