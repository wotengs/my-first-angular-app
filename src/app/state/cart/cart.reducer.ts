import { createReducer, on } from '@ngrx/store';
import { CartState } from './cart.model';
import * as CartActions from './cart.actions';

export const initialState: CartState = {
  items: [],
};

// Define the cart reducer
export const cartReducer = createReducer(
  initialState,
  on(CartActions.addProduct, (state, { product, quantity }) => {
    const existing = state.items.find((i) => i.productId === product.id);
    if (existing) {
      return {
        ...state,
        items: state.items.map((it) =>
          it.productId === product.id ? { ...it, quantity: it.quantity + (quantity ?? 1) } : it
        ),
      };
    }
    return {
      ...state,
      items: [...state.items, { productId: product.id, product, quantity: quantity ?? 1 }],
    };
  }),
  on(CartActions.removeProduct, (state, { productId }) => ({
    ...state,
    items: state.items.filter((it) => it.productId !== productId),
  })),
  on(CartActions.updateQuantity, (state, { productId, quantity }) => ({
    ...state,
    items: state.items.map((it) => (it.productId === productId ? { ...it, quantity } : it)),
  })),
  on(CartActions.clearCart, (state) => ({ ...state, items: [] })),
  on(CartActions.setCartItems, (state, { items }) => ({ ...state, items }))
);
