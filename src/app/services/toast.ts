import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

export type ToastVariant = 'success' | 'error' | 'info';

@Injectable({ providedIn: 'root' })
export class ToastService {
  constructor(private toastr: ToastrService) {}

  show(text: string, ms = 3000, variant: ToastVariant = 'info') {
    // delegate to ngx-toastr
    const opts = { timeOut: ms, closeButton: true, progressBar: true };
    if (variant === 'success') this.toastr.success(text, undefined, opts);
    else if (variant === 'error') this.toastr.error(text, undefined, opts);
    else this.toastr.info(text, undefined, opts);
  }

  dismissAll() {
    this.toastr.clear();
  }
}
