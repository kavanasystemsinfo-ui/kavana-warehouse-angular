# Kavana-Warehouse Angular

This is a migration of the original **Kavana-Warehouse** frontend from React (Vite) to Angular 18. The backend (Node.js/Express + Prisma) remains unchanged and is expected to be running at `/api/v1`.

## Purpose

This project demonstrates proficiency with Angular and serves as a portfolio piece for job applications requiring Angular experience.

## Features

- Login with JWT authentication and refresh-token rotation
- Dashboard showing costos por centro (cost vs budget)
- Inventario listing with product details
- Standalone components, reactive forms, Angular Router
- Services encapsulating all API calls (matching the original React `api.ts`)
- Basic error handling and loading states

## Prerequisites

- Node.js >= 18
- Angular CLI (`npm install -g @angular/cli`)
- Backend running (see original repo for setup)

## Getting Started

1. **Clone the repository** (if you haven't already):
   ```bash
   git clone https://github.com/kavanasystemsinfo-ui/Kavana-Warehouse.git
   cd Kavana-Warehouse
   ```

2. **Start the backend** (from the original repo):
   ```bash
   # In one terminal
   npm install
   npm start   # or whatever start script you use
   ```
   The API should be available at `http://localhost:3000/api/v1` (adjust if different).

3. **Install frontend dependencies**:
   ```bash
   cd kavana-warehouse-angular   # the Angular project we created
   npm install
   ```

4. **Run the development server**:
   ```bash
   ng serve --port 4201
   ```
   Visit `http://localhost:4201` in your browser.

5. **Login**  
   Use any valid credentials from the backend demo (e.g., supervisor/demo accounts).  
   Upon success, you'll be redirected to the Dashboard.

## Project Structure

```
src/
 ├─ app/
 │   ├─ services/
 │   │   └─ api.service.ts          # All backend API calls
 │   ├─ layout/
 │   │   └─ layout.component.*      # Router outlet container
 │   ├─ pages/
 │   │   ├─ login/
 │   │   │   ├─ login.component.*   # Login form
 │   │   │   └─ ...
 │   │   ├─ dashboard/
 │   │   │   ├─ dashboard.component.*  # Costos por centro (placeholder)
 │   │   │   └─ ...
 │   │   ├─ inventario/
 │   │   │   └─ inventario.component.*  # Inventory listing
 │   │   └─ ... (more pages to migrate)
 │   ├─ app.config.ts               # Providers (ApiService, HttpClient)
 │   ├─ app.routes.ts               # Route definitions
 │   ├─ app.html                    # <app-layout></app-layout>
 │   └─ app.ts                      # Root component
 ├─ assets/                         # Static assets (copied from React public/)
 ├─ styles.scss                     # Global styles
 └─ index.html
```

## API Service

The `ApiService` in `src/app/services/api.service.ts` mirrors the original React `dashboard/src/lib/api.ts`:

- Handles JWT storage in `localStorage`
- Automatic refresh-token rotation on 401
- Provides typed methods for every endpoint:
  - `login`, `logout`
  - `getInventario`, `getCentros`, `getCostes`, etc.
  - Mutating endpoints: `createCentro`, `updateCentro`, `setPresupuesto`, etc.
- All methods return `Observable<T>` and use `HttpClient` with proper error handling.

## State Management

- No global state library is used; each component manages its own UI state.
- Shared data (e.g., selected period) could be moved to a service with `BehaviorSubject` if needed.
- Authentication state (user, tokens) is handled within `ApiService` and persisted to `localStorage`.

## Styling

- Styles are written in SCSS (`.component.scss` files).
- The global `styles.scss` imports Bootstrap variables if needed; currently it's empty.
- Feel free to add a CSS framework (Bootstrap, Angular Material) by installing and importing in `angular.json`.

## Testing

- Unit tests were written following TDD during migration (each component has a corresponding `.spec.ts`).
- Run tests with:
  ```bash
  ng test
  ```
- End-to-end tests can be added with Cypress or Playwright if desired.

## Build for Production

```bash
ng build --configuration production
```
The output will be in `dist/kavana-warehouse-angular/`.

## Notes

- This migration focused on faithfully reproducing the functionality of the original React frontend.
- Some UI details (exact colors, spacing) may differ but the core interactions are preserved.
- The backup of the original React project is stored in `/root/backups/kavana-warehouse-backup-20260829094025/`.

## License

Original Kavana-Warehouse is presumably under some license; this Angular migration is for educational/portfolio purposes only.

---

**Happy coding!**  
*Your friendly Hermes Agent*