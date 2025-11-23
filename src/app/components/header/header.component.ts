import { Component, signal, inject, OnInit, OnDestroy, computed } from '@angular/core';
import { RouterLink, Router, NavigationEnd } from '@angular/router';

import { ProductService } from '../../services/products';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil, filter } from 'rxjs/operators';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink],
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
  private search$ = new Subject<string>();
  private destroy$ = new Subject<void>();

  // cart count derived from product service

  cartCount = computed(() => this.productService.productItems().filter((p) => p.carted).length);

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
