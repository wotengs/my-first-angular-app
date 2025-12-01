import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DividerModule } from 'primeng/divider';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../core/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DividerModule, ButtonModule, InputTextModule],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.pattern('^[a-zA-Z0-9]*$')]],
      password: ['', [Validators.required]],
    });
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    // clear previous credential errors
    this.username?.setErrors(null);
    this.password?.setErrors(null);

    const { username, password } = this.loginForm.value;
    this.auth.login({ username, password }).subscribe({
      next: (res: any) => {
        this.loading = false;
        // Some backends may return an object with `message` on failure.
        if (res && typeof res === 'object' && res.message) {
          const msg = res.message || 'Invalid credentials';
          this.toastr.error(msg, 'Login failed');
          this.username?.setErrors({ invalidCredentials: true });
          this.password?.setErrors({ invalidCredentials: true });
          this.username?.markAsTouched();
          this.password?.markAsTouched();
          return;
        }

        this.toastr.success(
          'Signed in successfully',
          'Welcome ' + res?.firstName + ' ' + res?.lastName || username
        );
        this.router.navigate(['/products']);
      },
      error: (err) => {
        this.loading = false;
        // If server returns a structured error (e.g. 400 with { message }), treat as invalid credentials
        const message = err?.error?.message || err?.message || 'Login failed';
        if (err?.status === 400 && message) {
          this.toastr.error(message, 'Login failed');
          this.username?.setErrors({ invalidCredentials: true });
          this.password?.setErrors({ invalidCredentials: true });
          this.username?.markAsTouched();
          this.password?.markAsTouched();
          return;
        }

        // Other errors: show a toast and mark fields as invalid for visibility
        this.toastr.error(message, 'Login failed');
        this.username?.setErrors({ invalidCredentials: true });
        this.password?.setErrors({ invalidCredentials: true });
        this.username?.markAsTouched();
        this.password?.markAsTouched();
      },
    });
  }

  // convenience getters for template type-safety
  get username() {
    return this.loginForm.get('username');
  }

  get password() {
    return this.loginForm.get('password');
  }
}
