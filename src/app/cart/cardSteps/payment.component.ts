import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-payment-step',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  template: `
    <div class="p-4">
      <h5>Payment</h5>
      <p class="text-muted">Payment collection and confirmation goes here.</p>
      <div class="d-flex pt-4 justify-content-start">
        <button class="btn btn-outline-secondary" (click)="$emitBack()">Back</button>
      </div>
    </div>
  `,
})
export class PaymentComponent {
  @Output() back = new EventEmitter<number>();

  $emitBack() {
    this.back.emit(2);
  }
}
