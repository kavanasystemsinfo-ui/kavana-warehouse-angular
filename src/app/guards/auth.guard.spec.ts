import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthGuard } from './auth.guard';
import { ApiService } from '../services/api.service';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let api: ApiService;
  let router: Router;

  const routerSpy = {
    createUrlTree: jasmine.createSpy('createUrlTree').and.returnValue({ toString: () => '/login' } as unknown as ReturnType<Router['createUrlTree']>),
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthGuard,
        ApiService,
        { provide: Router, useValue: routerSpy },
      ],
    });
    localStorage.clear();
    guard = TestBed.inject(AuthGuard);
    api = TestBed.inject(ApiService);
    router = TestBed.inject(Router);
  });

  it('permite el acceso con usuario válido', () => {
    api.storeUser({ id_usuario: 1, nombre: 'Demo', email: 'demo@k.com', rol: 'oficina' });
    localStorage.setItem('dashboard_access_token', 'abc');
    expect(guard.canActivate()).toBeTrue();
  });

  it('redirige a /login sin sesión', () => {
    localStorage.clear();
    const result = guard.canActivate();
    expect(result).toBe(routerSpy.createUrlTree.calls.mostRecent().returnValue);
    expect(router.createUrlTree).toHaveBeenCalledWith(['/login']);
  });

  it('redirige a /login y limpia tokens para rol limpiador', () => {
    localStorage.setItem('dashboard_access_token', 'abc');
    api.storeUser({ id_usuario: 1, nombre: 'Limp', email: 'l@k.com', rol: 'limpiador' });
    const result = guard.canActivate();
    expect(result).toBe(routerSpy.createUrlTree.calls.mostRecent().returnValue);
    expect(localStorage.getItem('dashboard_access_token')).toBeNull();
  });
});