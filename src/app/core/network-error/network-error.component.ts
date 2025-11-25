import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-network-error',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './network-error.component.html',
  styleUrls: ['./network-error.component.scss'],
})
export class NetworkErrorComponent {
  @Input() message: string | null = null;
  @Output() retry = new EventEmitter<void>();

  onRetry() {
    this.retry.emit();
  }

  onReload() {
    try {
      location.reload();
    } catch {
      // fallback
      window.location.href = window.location.href;
    }
  }
}
