import { createFeatureSelector, createSelector } from '@ngrx/store';
import { CartState } from './cart.model';

export const selectCartFeature = createFeatureSelector<CartState>('cart');

export const selectCartItems = createSelector(selectCartFeature, (s) => s.items);

export const selectCartCount = createSelector(selectCartItems, (items) =>
  items.reduce((c, it) => c + it.quantity, 0)
);

export const selectCartTotal = createSelector(selectCartItems, (items) =>
  items.reduce((sum, it) => sum + (it.product?.price ?? 0) * it.quantity, 0)
);
