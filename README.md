# MyFirstAngularApp

This workspace is an Angular (v21) application that was migrated from Angular Material to Bootstrap/ng-bootstrap with progressive enhancements: NgRx cart state, PrimeNG stepper for checkout, a JWT-based authentication flow, and proactive token refresh.

**Quick Start**
- Install dependencies:
```powershell
npm install
```
- Run dev server:
```powershell
npm start
```
- Open `http://localhost:4200/`

The project now includes the following major features and files (high-level):

- **Auth (JWT)**: `src/app/core/auth.service.ts` implements login, refresh and proactive refresh scheduling (parses `exp` in the JWT and schedules a refresh 60s before expiry). `authState$` exposes authentication state.
- **Interceptor**: `src/app/core/interceptors/auth.interceptor.ts` attaches the access token to requests and uses centralized `performRefresh()` to refresh tokens on 401, retrying the original request after success.
- **Guard**: `src/app/core/guards/auth.guard.ts` protects routes. It checks `isAuthenticated()` and attempts a refresh before returning a redirect `UrlTree` to `/login` on failure.
- **Login page**: `src/app/auth/login.component.ts` is a standalone reactive form. The success toast shows `firstName` (if returned by the API). It handles 400 responses like `{ message: 'Invalid credentials' }` and marks controls invalid.
- **Access / Error pages**: `src/app/auth/access.ts` and `src/app/auth/error.ts` provide friendly Access Denied and Error pages and are routed as `/access` and `/error`.
- **Floating configurator**: `src/app/components/app.floatingconfigurator.ts` and `src/app/components/app.configurator.ts` provide a small UI to toggle theme and presets; `src/app/service/layout.service.ts` manages layout state using Angular signals.
- **Routes**: `src/app/app.routes.ts` includes protected routes (e.g. `/products`, `/cart` use `canActivate: [AuthGuard]`) and a wildcard route `{ path: '**', redirectTo: '/login' }` so client-side unknown paths redirect once the SPA is loaded.
- **NgRx Cart**: `src/app/state/cart/*` implements cart actions/reducer/selectors; `CartEffects` persists the cart to `localStorage` and hydrates it on startup.

**Important behaviors**
- Proactive refresh: when a token is issued the app schedules a refresh 60 seconds before expiry. This avoids most 401 race conditions.
- Centralized refresh: `AuthService.performRefresh()` queues concurrent refresh callers so only one HTTP refresh runs at a time; the interceptor relies on this and retries requests automatically.
- SSR safety: `AuthService` guards `localStorage` access with `isPlatformBrowser(...)` so server-side rendering or dev server processes won't crash when `localStorage` is unavailable.
- Demo API notes: for the DummyJSON demo the client sends `expiresInMins` with login/refresh requests (default 60). The demo endpoint must honor that field for TTL control; in production you should implement a dedicated `/api/refresh` endpoint and prefer HttpOnly secure cookies for refresh tokens.

**Files / places to inspect**
- Authentication: `src/app/core/auth.service.ts`, `src/app/core/interceptors/auth.interceptor.ts`, `src/app/core/guards/auth.guard.ts`
- UI: `src/app/auth/login.component.ts`, `src/app/auth/access.ts`, `src/app/auth/error.ts`
- Floating configurator: `src/app/components/app.floatingconfigurator.ts`, `src/app/components/app.configurator.ts`, `src/app/service/layout.service.ts`
- Routes: `src/app/app.routes.ts`
- NgRx cart: `src/app/state/cart/` and `src/app/cart/` components

**Run & test**
- Start dev server:
```powershell
npm start
```
- Try direct navigation (refresh) to a protected route like `/cart`:
  - If you use `ng serve` the dev server handles SPA fallback and the router/guards will run.
  - If you serve a production build with Express, ensure the server returns `index.html` for unknown paths (see `src/server.ts` pattern) so the SPA can boot and the guard can redirect.