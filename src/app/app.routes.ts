import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => {
      return import('./home/home.component').then((m) => m.HomeComponent);
    },
  },
  {
    path: 'products',
    loadComponent: () => {
      return import('./products/products').then((m) => m.Products);
    },
  },
  {
    path: 'login',
    loadComponent: () => import('./auth/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'cart',
    loadComponent: () => import('./cart/cart.component').then((m) => m.CartComponent),
  },
];
