import { Injectable, signal } from '@angular/core';

export type ToastMessage = {
  id: number;
  text: string;
};

@Injectable({ providedIn: 'root' })
export class ToastService {
  private counter = 0;
  toasts = signal<ToastMessage[]>([]);

  show(text: string, ms = 3000) {
    const id = ++this.counter;
    const message: ToastMessage = { id, text };
    this.toasts.update((t) => [...t, message]);
    setTimeout(() => this.dismiss(id), ms);
  }

  dismiss(id: number) {
    this.toasts.update((t) => t.filter((m) => m.id !== id));
  }
}
