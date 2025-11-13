import { Directive, effect, ElementRef, inject, input } from '@angular/core';

@Directive({
  selector: '[appHighlightCartedProduct]'
})
export class HighlightCartedProduct {
    isCarted = input(false);

    el = inject(ElementRef);

    constructor() { }

    stylesEffect = effect(() =>{
      if(this.isCarted){

      }

    })
}
