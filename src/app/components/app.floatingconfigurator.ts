import { Component, computed, inject, input } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { StyleClassModule } from 'primeng/styleclass';
import { AppConfigurator } from './app.configurator';
import { LayoutService } from '../service/layout.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-floating-configurator',
  standalone: true,
  imports: [CommonModule, ButtonModule, StyleClassModule, AppConfigurator],
  template: `
    <div class="flex gap-4 top-8 right-8" [class.fixed]="float()">
      <button
        pButton
        type="button"
        (click)="toggleDarkMode()"
        [rounded]="true"
        [icon]="isDarkTheme() ? 'pi pi-moon' : 'pi pi-sun'"
        class="p-button-secondary"
      ></button>
      <div class="relative">
        <button pButton icon="pi pi-palette" pStyleClass="@next" type="button" rounded></button>
        <app-configurator></app-configurator>
      </div>
    </div>
  `,
})
export class AppFloatingConfigurator {
  private layout = inject(LayoutService);

  float = input<boolean>(true);

  isDarkTheme = computed(() => this.layout.layoutConfig().darkTheme);

  toggleDarkMode() {
    this.layout.layoutConfig.update((state) => ({ ...state, darkTheme: !state.darkTheme }));
  }
}
