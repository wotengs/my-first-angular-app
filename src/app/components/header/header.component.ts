import { Component, signal, inject, OnInit, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../services/products';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  title = signal('iCube Shopping Center');
  // search and categories
  search = signal('');
  categories = signal<string[]>([]);
  selectedCategory = signal<string | null>(null);

  private productService = inject(ProductService);
  private search$ = new Subject<string>();
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    // load categories
    this.productService.getCategories().subscribe((cats) => this.categories.set(cats || []));
    // debounced search subscription
    this.search$
      .pipe(debounceTime(350), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((q) => {
        this.productService.loadProducts({ q, category: this.selectedCategory() ?? undefined });
      });
  }

  onSearchInput(event: Event) {
    const input = event.target as HTMLInputElement;
    const q = input.value;
    this.search.set(q);
    this.search$.next(q);
  }

  onCategoryChange(event: Event) {
    const sel = event.target as HTMLSelectElement;
    const category = sel.value || null;
    this.selectedCategory.set(category);
    // reset skip and load new category while preserving search term
    this.productService.loadProducts({ category: category ?? undefined, q: this.search() || undefined });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.search$.complete();
  }
}
