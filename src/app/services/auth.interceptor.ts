import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

// Inyecta Authorization: Bearer <token> en cada petición y, ante un 401/403,
// limpia las credenciales locales (el guard redirige a /login en la siguiente
// navegación). Sin window.alert: cada componente muestra su propio error.
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const token = localStorage.getItem('dashboard_access_token');
    if (token) {
      req = req.clone({
        setHeaders: { Authorization: `Bearer ${token}` }
      });
    }
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401 || error.status === 403) {
          localStorage.removeItem('dashboard_access_token');
          localStorage.removeItem('dashboard_refresh_token');
        }
        return throwError(() => error);
      })
    );
  }
}