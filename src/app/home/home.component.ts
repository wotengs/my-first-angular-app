import { Component, signal } from '@angular/core';
import { Greeting } from '../components/greeting/greeting';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [Greeting],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
 homeMessage = signal('Please Login to Continue');

 keyUpHandler(event: KeyboardEvent ){
  console.log(`User Pressed the ${event.key} key`)
 }
}
