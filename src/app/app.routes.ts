import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

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
    loadComponent: () => import('./products/products').then((m) => m.Products),
    canActivate: [AuthGuard],
  },
  {
    path: 'login',
    loadComponent: () => import('./auth/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'access',
    loadComponent: () => import('./auth/access').then((m) => m.Access),
  },
  {
    path: 'error',
    loadComponent: () => import('./auth/error').then((m) => m.Error),
  },
  {
    path: 'cart',
    loadComponent: () => import('./cart/cart.component').then((m) => m.CartComponent),
    canActivate: [AuthGuard],
  },
  // Wildcard route - redirect any unknown paths to /login so the router can handle redirects/guards
  { path: '**', redirectTo: '/login' },
];
