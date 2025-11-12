import { Component, signal, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../services/products';

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

  ngOnInit(): void {
    // load categories
    this.productService.getCategories().subscribe((cats) => this.categories.set(cats || []));
  }

  onSearchInput(event: Event) {
    const input = event.target as HTMLInputElement;
    const q = input.value;
    this.search.set(q);
    // load using current category (if any)
    this.productService.loadProducts({ q, category: this.selectedCategory() ?? undefined });
  }

  onCategoryChange(event: Event) {
    const sel = event.target as HTMLSelectElement;
    const category = sel.value || null;
    this.selectedCategory.set(category);
    // if category selected, load category; preserve search term if present
    this.productService.loadProducts({ category: category ?? undefined, q: this.search() || undefined });
  }
}
