import { Component, signal, inject, OnInit, OnDestroy, computed } from '@angular/core';
import { AsyncPipe} from '@angular/common';
import { RouterLink, Router, NavigationEnd } from '@angular/router';
import { ProductService } from '../../services/products';
import { CartService } from '../../services/cart.service';
import { Store } from '@ngrx/store';
import { selectCartCount } from '../../state/cart/cart.selectors';
import * as CartActions from '../../state/cart/cart.actions';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil, filter } from 'rxjs/operators';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, AsyncPipe],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit, OnDestroy {
  // All properties

  title = signal('iCube Shopping Center');

  // track whether current route is home so header can hide controls on landing page
  isHome = signal<boolean>(false);

  // search and categories

  search = signal('');
  categories = signal<string[]>([]);
  selectedCategory = signal<string | null>(null);

  private productService = inject(ProductService);
  private router = inject(Router);
  private cartService = inject(CartService);
  private store = inject(Store);
  private search$ = new Subject<string>();
  private destroy$ = new Subject<void>();

  // cart count derived from product service
  // show cart count from NgRx store (falls back to productService if store not populated)
  cartCount$ = this.store.select(selectCartCount);

  //Property Functions
  ngOnInit(): void {
    // set initial route state
    this.isHome.set(this.router.url === '/' || this.router.url === '');
    // update on navigation
    this.router.events
      .pipe(
        filter((e) => e instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe((ev) => {
        const nav = ev as NavigationEnd;
        this.isHome.set(nav.urlAfterRedirects === '/' || nav.urlAfterRedirects === '');
      });
    // load categories
    this.productService.getCategories().subscribe((cats) => this.categories.set(cats || []));
    // debounced search subscription
    this.search$
      .pipe(debounceTime(350), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((q) => {
        this.productService.loadProducts({ q, category: this.selectedCategory() ?? undefined });
      });
  }

  openCart(ev?: Event) {
    ev?.preventDefault();
    // fetch example cart for user 142 and populate store
    this.cartService.fetchCartForUser(142).subscribe({
      next: (resp) => {
        const cart = resp?.carts && resp.carts.length ? resp.carts[0] : null;
        if (cart) {
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
          this.store.dispatch(CartActions.setCartItems({ items }));
        }
        this.router.navigate(['/cart']);
      },
      error: () => {
        // still navigate so user can see empty cart UI
        this.router.navigate(['/cart']);
      },
    });
  }
  // catlegory objects [{slug,label}] for filtering
  categoriesMapped = computed(() => {
    return this.categories().map((s) => ({
      slug: s,
      label: HeaderComponent.humanizeCategory(s),
    }));
  });

  private static humanizeCategory(slug: string) {
    if (!slug) return '';
    return slug
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  }

  onSearchInput(event: Event) {
    const input = event.target as HTMLInputElement;
    const q = input.value;
    this.search.set(q);
    this.search$.next(q);
  }

  onCategoryChange(category: string | null) {
    const cat = category || null;
    this.selectedCategory.set(cat);
    // reset skip and load new category while preserving search term
    this.productService.loadProducts({
      category: cat ?? undefined,
      q: this.search() || undefined,
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.search$.complete();
  }
}
