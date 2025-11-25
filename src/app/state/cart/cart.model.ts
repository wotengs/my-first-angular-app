import { Product } from '../../model/product.type';

export interface CartItem {
  productId: number;
  product: Product;
  quantity: number;
}

export interface CartState {
  items: CartItem[];
}
