import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { HeaderComponent } from './components/header/header.component';
import { ToastComponent } from './components/toast/toast';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, ToastComponent],
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('my-first-angular-app');
}
