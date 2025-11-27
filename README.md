# MyFirstAngularApp

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 20.3.9.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## MyFirstAngularApp — Project Notes

**Summary:** This README documents the work done converting an Angular app from Angular Material to Bootstrap/ng-bootstrap + bootstrap-icons, adding improved loading/error UX, implementing a cart page with NgRx and a PrimeNG stepper, and breaking the cart steps into standalone components.

**Key goals achieved**
- Replaced Angular Material usage with Bootstrap CSS and `bootstrap-icons`.
- Implemented a blurred hero on the Home page using `src/assets/images/hero-image.jpg` and a CTA to `/products`.
- Redesigned the header (`src/app/components/header/*`) to a fixed top header with logo, search and cart button, hiding controls on home.
- Reworked product grid and `product-item` markup: smaller thumbnails, truncated descriptions, price/rating/stock shown, menu floats above cards and only one menu opens at a time.
- Added loading skeletons and animated loading image while products load; added a `NetworkError` overlay to prompt retry when offline.
- Introduced NgRx store for cart state (actions, reducer, selectors) and registered it in `src/app/app.config.ts`.
- Implemented `CartService` to fetch an example cart from `https://dummyjson.com/carts/user/142` and populated the store when the header cart button is clicked.
- Built a `Cart` page with a PrimeNG stepper and separated steps under `src/app/cart/cardSteps/`:
	- `card.component.ts` — Cart step (shows cart items, qty controls, remove, promo input, summary)
	- `checkout.component.ts` — Checkout step (placeholder)
	- `payment.component.ts` — Payment step (placeholder)
- Converted critical templates to native Angular control-flow (`@if` / `@for`) where requested to avoid deprecation warnings.

**Files / features of note**
- `src/styles.scss`
	- Imports compiled Bootstrap CSS and `bootstrap-icons` and sets global theme variables.
- `src/app/services/products.ts`
	- Adds an `error` signal and `retryLoad()` helper to provide friendly network error handling.
- `src/app/core/network-error/` — standalone `NetworkError` component.
- `src/app/state/cart/` — NgRx cart feature (models, actions, reducer, selectors).
- `src/app/services/cart.service.ts` — fetches sample cart JSON and maps it to cart items.
- `src/app/cart/cart.component.ts` — parent stepper component wiring to NgRx selectors and handling cart actions.
- `src/app/cart/cardSteps/card.component.ts` — presentational cart step implemented with Bootstrap classes and PrimeNG `p-card` + `p-panel`. Uses Bootstrap Icons for controls and honors the light card/panel background even when PrimeNG global theme is set.

Running the app
 - Install dependencies (if needed):
```powershell
npm install
```
 - Start dev server:
```powershell
npm run start
```
 - Open `http://localhost:4200/` and navigate to `/cart` to review the cart step UI.

What to check after running
- Header: fixed top with logo and cart badge (count from NgRx `selectCartCount`).
- Products page: skeletons while loading, animated loading image, product cards with floating menus.
- Cart page (`/cart`): left column shows cart items as rounded Bootstrap/PrimeNG cards with image, title, brand (brand is shown below title in muted gray), centered qty controls with Bootstrap Icons, price right-aligned; right column shows promo input with a light gray background, subtotal/discount/total and a full-width dark CTA.
- Network error: when offline, `NetworkError` overlay with retry/reload appears.

Developer notes and rationale
- Bootstrap CSS is imported as compiled CSS to avoid SCSS mixin issues and ensure compatibility with the app build.
- PrimeNG is used only for the Stepper, Card and Panel components — styling is scoped in the cart step component so cards/panels render with white backgrounds even if a global PrimeNG theme is dark.
- NgRx store is used for cart state; actions include `addProduct`, `removeProduct`, `updateQuantity`, `clearCart`, and `setCartItems` (used when loading the sample cart from the remote API).
- Templates were progressively converted to the native `@if` / `@for` syntax where requested to avoid future deprecation issues.

Remaining tasks / suggestions
- Run a full lint/build to catch any AOT/template warnings and fix them: `npm run build`.
- Consider moving cart population (fetching `dummyjson` cart) into an NgRx Effect so side-effects are in the store layer.
- Add persistence (localStorage) for the cart to keep user items across reloads.
- Replace remaining `*ngIf`/`*ngFor` instances across the project with `@if`/`@for` if you want to fully remove deprecated usages (I can do this in a controlled sweep).
- Visual polish: tune spacing, colors and border radii to precisely match the design — I can iterate on the cart CSS to reach pixel-perfect alignment.

Contact / next steps
- Tell me which of the remaining tasks you'd like me to do next: run build and fix remaining template errors, move cart fetch into NgRx Effects, persist cart to localStorage, or fine-tune visual styles (I can apply exact spacing/colors).

---
Generated/updated by the development agent working in this workspace.
