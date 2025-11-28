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
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DividerModule,
    ButtonModule,
    InputTextModule,

  ],
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
        // Some backends may return { message: 'Invalid credentials' } with 200
        if (res && typeof res === 'object' && res.message === 'Invalid credentials') {
          this.toastr.error('Invalid credentials', 'Login failed');
          this.username?.setErrors({ invalidCredentials: true });
          this.password?.setErrors({ invalidCredentials: true });
          this.username?.markAsTouched();
          this.password?.markAsTouched();
          return;
        }

        // success
        this.toastr.success('Signed in successfully', 'Welcome');
        this.router.navigate(['/products']);
      },
      error: (err) => {
        this.loading = false;
        // show error toast and mark fields invalid
        const message = err?.error?.message || err?.message || 'Login failed';
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
