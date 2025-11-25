import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-checkout-step',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  template: `
    <div class="p-4">
      <h5>Checkout</h5>
      <p class="text-muted">Checkout form / address collection goes here.</p>
      <div class="d-flex pt-4 justify-content-between">
        <button class="btn btn-outline-secondary" (click)="$emitBack()">Back</button>
        <button class="btn btn-primary" (click)="$emitNext()">Next</button>
      </div>
    </div>
  `,
})
export class CheckoutComponent {
  @Output() back = new EventEmitter<number>();
  @Output() next = new EventEmitter<number>();

  $emitBack() {
    this.back.emit(1);
  }

  $emitNext() {
    this.next.emit(3);
  }
}
