import { Component, input } from '@angular/core';

@Component({
  selector: 'app-greeting',
  imports: [],
  templateUrl: './greeting.html',
  styleUrls: ['./greeting.scss'],
})
export class Greeting {
  message = input('Default Greeting message');
}
