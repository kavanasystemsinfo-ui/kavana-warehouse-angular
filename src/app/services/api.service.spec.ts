import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { ApiService, AuthResponse } from './api.service';

describe('ApiService', () => {
  let service: ApiService;
  let httpMock: HttpTestingController;

  const fakeAuthResponse: AuthResponse = {
    token: 'access-xyz',
    refreshToken: 'refresh-xyz',
    usuario: {
      id_usuario: 1,
      nombre: 'Demo',
      email: 'supervisor.demo@kavanawarehouse.com',
      rol: 'supervisor',
    },
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ApiService);
    httpMock = TestBed.inject(HttpTestingController);
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('login() envía POST a /api/v1/auth/login con email y password', () => {
    let received: AuthResponse | undefined;
    service.login('a@b.com', 'kavana').subscribe((r) => (received = r));

    const req = httpMock.expectOne('/api/v1/auth/login');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ email: 'a@b.com', password: 'kavana' });
    req.flush(fakeAuthResponse);

    expect(received).toEqual(fakeAuthResponse);
  });

  it('login() guarda access token, refresh token y usuario en localStorage', () => {
    service.login('a@b.com', 'kavana').subscribe();

    const req = httpMock.expectOne('/api/v1/auth/login');
    req.flush(fakeAuthResponse);

    expect(localStorage.getItem('dashboard_access_token')).toBe('access-xyz');
    expect(localStorage.getItem('dashboard_refresh_token')).toBe('refresh-xyz');
    expect(localStorage.getItem('dashboard_user')).toBeTruthy();
    expect(JSON.parse(localStorage.getItem('dashboard_user')!)).toEqual(fakeAuthResponse.usuario);
  });

  it('logout() hace POST a /api/v1/auth/logout', () => {
    service.logout().subscribe();
    const req = httpMock.expectOne('/api/v1/auth/logout');
    expect(req.request.method).toBe('POST');
    req.flush(null);
  });

  it('getCentros() devuelve la lista mapeada desde {centros}', () => {
    service.getCentros().subscribe((centros) => {
      expect(centros.length).toBe(1);
      expect(centros[0].id_centro).toBe(7);
    });
    const req = httpMock.expectOne('/api/v1/centros');
    req.flush({ centros: [{ id_centro: 7, nombre_centro: 'Centro A' }] });
  });
});