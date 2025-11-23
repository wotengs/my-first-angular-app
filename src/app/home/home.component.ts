import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  homeMessage = signal('Please Login to Continue');

  // Set background image via trusted style to avoid SCSS module resolution
  heroBackgroundStyle: SafeStyle;

  constructor(sanitizer: DomSanitizer) {
    this.heroBackgroundStyle = sanitizer.bypassSecurityTrustStyle(
      `background-image: url('assets/images/hero-image.jpg');`
    );
  }

  keyUpHandler(event: KeyboardEvent) {
    console.log(`User Pressed the ${event.key} key`);
  }
}
