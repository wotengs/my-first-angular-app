import { Component, OnInit } from '@angular/core';

import { ToastService } from '../../services/toast';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [],
  templateUrl: './toast.html',
  styleUrls: ['./toast.scss'],
})
export class ToastComponent implements OnInit {
  constructor(public toast: ToastService) {}
  ngOnInit(): void {}
}
