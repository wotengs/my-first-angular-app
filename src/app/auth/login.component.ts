import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DividerModule } from 'primeng/divider';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, DividerModule, ButtonModule, InputTextModule],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  username = '';
  password = '';
}
