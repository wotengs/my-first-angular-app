import { Directive, effect, ElementRef, inject, input } from '@angular/core';

@Directive({
  selector: '[appHighlightCartedProduct]',
})
export class HighlightCartedProduct {
  // Input signal (boolean) to indicate carted state
  isCarted = input<boolean>(false);

  private el = inject(ElementRef<HTMLElement>);

  constructor() {}

  // Toggle a CSS class on the host element when carted state changes
  stylesEffect = effect(() => {
    const c = this.isCarted();
    const host = this.el.nativeElement;
    if (!host) return;
    if (c) {
      host.classList.add('carted');
    } else {
      host.classList.remove('carted');
    }
  });
}
