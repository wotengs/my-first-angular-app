import { createAction, props } from '@ngrx/store';
import { CartItem } from './cart.model';
import { Product } from '../../model/product.type';

export const addProduct = createAction(
  '[Cart] Add Product',
  props<{ product: Product; quantity?: number }>()
);
export const removeProduct = createAction('[Cart] Remove Product', props<{ productId: number }>());
export const updateQuantity = createAction(
  '[Cart] Update Quantity',
  props<{ productId: number; quantity: number }>()
);
export const clearCart = createAction('[Cart] Clear');
export const setCartItems = createAction('[Cart] Set Items', props<{ items: CartItem[] }>());
export const loadCart = createAction('[Cart] Load From Remote', props<{ userId: number }>());
export const loadCartFailure = createAction('[Cart] Load Failure', props<{ error?: any }>());
