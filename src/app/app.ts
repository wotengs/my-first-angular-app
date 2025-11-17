import { Component, signal, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { HeaderComponent } from './components/header/header.component';
import { ToastComponent } from './components/toast/toast';
import { ProductFormContainer } from './components/product-form/product-form-container';
import { ProductService } from './services/products';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, ToastComponent, ProductFormContainer],
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('my-first-angular-app');
  private ps = inject(ProductService);

  openCreateForm() {
    this.ps.openCreateForm();
  }

  scrollTop() {
    try {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      window.scrollTo(0, 0);
    }
  }
}
