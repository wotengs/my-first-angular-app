import { Component, signal, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { ProductFormContainer } from './components/product-form/product-form-container';
import { ProductService } from './services/products';
import { PrimeNG } from 'primeng/config';
//import { TranslateService } from '@ngx-translate/core';
import { AuthService } from './core/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, ProductFormContainer],
  templateUrl: './app.html',
})
export class App implements OnInit {
  constructor(private primeng: PrimeNG, private auth: AuthService) {
    this.auth.initFromStorage();
  }

  //constructor(private primeng: PrimeNG, private translateService: TranslateService) {}

  ngOnInit() {
    this.primeng.ripple.set(true);
    // this.translateService.use('en');
  }

  // translate(lang: string) {
  //     this.translateService.use(lang);
  //     this.translateService.get('primeng').subscribe(res => this.primeng.setTranslation(res));
  // }

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
