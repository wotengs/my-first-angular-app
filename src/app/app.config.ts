import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
  importProvidersFrom,
  provideAppInitializer,
  inject,
} from '@angular/core';
import { AuthService } from './core/auth.service';
import { firstValueFrom } from 'rxjs';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { routes } from './app.routes';
import { provideStore } from '@ngrx/store';
import { cartReducer } from './state/cart/cart.reducer';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { provideEffects } from '@ngrx/effects';
import { CartEffects } from './state/cart/cart.effects';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { JwtInterceptor } from './core/interceptors/auth.interceptor';
import { provideAnimations } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';
import { FilterMatchMode } from 'primeng/api';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withFetch()),
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    provideAnimations(),
    provideStore({ cart: cartReducer }),
    provideEffects([CartEffects]),
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    provideStoreDevtools({ maxAge: 25, logOnly: false }),
    importProvidersFrom(ToastrModule.forRoot()),
    provideAnimationsAsync(),
    providePrimeNG({
      inputVariant: 'filled',
      ripple: true,
      zIndex: {
        modal: 1100, // dialog, sidebar
        overlay: 1000, // dropdown, overlaypanel
        menu: 1000, // overlay menus
        tooltip: 1100, // tooltip
      },
      csp: {
        nonce: '...',
      },
      filterMatchModeOptions: {
        text: [
          FilterMatchMode.STARTS_WITH,
          FilterMatchMode.CONTAINS,
          FilterMatchMode.NOT_CONTAINS,
          FilterMatchMode.ENDS_WITH,
          FilterMatchMode.EQUALS,
          FilterMatchMode.NOT_EQUALS,
        ],
        numeric: [
          FilterMatchMode.EQUALS,
          FilterMatchMode.NOT_EQUALS,
          FilterMatchMode.LESS_THAN,
          FilterMatchMode.LESS_THAN_OR_EQUAL_TO,
          FilterMatchMode.GREATER_THAN,
          FilterMatchMode.GREATER_THAN_OR_EQUAL_TO,
        ],
        date: [
          FilterMatchMode.DATE_IS,
          FilterMatchMode.DATE_IS_NOT,
          FilterMatchMode.DATE_BEFORE,
          FilterMatchMode.DATE_AFTER,
        ],
      },
      translation: {
        accept: 'Aceptar',
        reject: 'Rechazar',
        //translations
      },
      theme: {
        preset: Aura,
        options: {
          prefix: 'p',
          darkModeSelector: 'light',
          cssLayer: false,
        },
      },
    }),
    // initialize auth from storage on app bootstrap so reloads preserve sign-in
    provideAppInitializer(async () => {
      const auth = inject(AuthService);
      try {
        // hydrate token and schedule refresh if present
        auth.initFromStorage();
        // Attempt silent refresh only if we have a refresh token available.
        // This avoids logging users out on reload when the access token is present but the demo token
        // is not a parseable JWT and no refresh token exists.
        const refreshToken = auth.getRefreshToken?.();
        if (refreshToken) {
          try {
            await firstValueFrom(auth.performRefresh());
          } catch {
            // ignore refresh failure here — navigation guards will redirect on protected routes
          }
        }
      } catch {
        /* noop */
      }
    }),
  ],
};
