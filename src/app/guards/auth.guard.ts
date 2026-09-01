import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { ApiService } from '../services/api.service';

// Protege las rutas del panel: sin sesión (o rol limpiador) → /login.
@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private api: ApiService, private router: Router) {}

  canActivate(): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const user = this.api.getStoredUser();
    if (!user || user.rol === 'limpiador') {
      this.api.clearTokens();
      return this.router.createUrlTree(['/login']);
    }
    return true;
  }
}