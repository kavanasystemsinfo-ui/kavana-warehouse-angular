import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { ApiService, AuthResponse, Incidencia } from './api.service';

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

  it('logout() es local: borra tokens sin llamar a un endpoint inexistente', () => {
    localStorage.setItem('dashboard_access_token', 'access-xyz');
    localStorage.setItem('dashboard_refresh_token', 'refresh-xyz');
    localStorage.setItem('dashboard_user', JSON.stringify(fakeAuthResponse.usuario));

    service.logout();

    expect(localStorage.getItem('dashboard_access_token')).toBeNull();
    expect(localStorage.getItem('dashboard_user')).toBeNull();
    // El backend no expone /auth/logout: no debe dispararse ninguna petición.
    httpMock.expectNone('/api/v1/auth/logout');
  });

  it('esVisita() devuelve true con session_id o demo', () => {
    expect(service.esVisita()).toBeFalse();
    service.storeUser({ ...fakeAuthResponse.usuario, session_id: 'vis-123' });
    expect(service.esVisita()).toBeTrue();
    localStorage.clear();
    service.storeUser({ ...fakeAuthResponse.usuario, demo: true });
    expect(service.esVisita()).toBeTrue();
  });

  it('getCentros() devuelve la lista mapeada desde {centros}', () => {
    service.getCentros().subscribe((centros) => {
      expect(centros.length).toBe(1);
      expect(centros[0].id_centro).toBe(7);
    });
    const req = httpMock.expectOne('/api/v1/centros');
    req.flush({ centros: [{ id_centro: 7, nombre_centro: 'Centro A' }] });
  });

  it('getConsumption() pasa filtros de periodo como query params', () => {
    service.getConsumption({ centro: 3, desde: '2026-09-01', hasta: '2026-09-30' }).subscribe();
    const req = httpMock.expectOne('/api/v1/dashboard/consumption?centro=3&desde=2026-09-01&hasta=2026-09-30');
    expect(req.request.method).toBe('GET');
    req.flush({});
  });

  it('getAlerts() llama a /api/v1/dashboard/alerts', () => {
    service.getAlerts().subscribe();
    const req = httpMock.expectOne('/api/v1/dashboard/alerts');
    req.flush({ total_alertas: 0, criticas: [], advertencias: [] });
  });

  it('getSupervisoresDemo() usa el endpoint real /supervisores con session_id', () => {
    service.getSupervisoresDemo('vis-abc').subscribe();
    // NUNCA /supervisores/demo (bug de la primera versión → 404).
    const req = httpMock.expectOne('/api/v1/supervisores?session_id=vis-abc');
    expect(req.request.method).toBe('GET');
    req.flush({ supervisores: [] });
  });

  it('createSupervisorDemo() POST a /supervisores con session_id en el body', () => {
    service.createSupervisorDemo({ nombre: 'X', email: 'x@x.com', password: '123456', session_id: 'vis-abc' }).subscribe();
    const req = httpMock.expectOne('/api/v1/supervisores');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ nombre: 'X', email: 'x@x.com', password: '123456', session_id: 'vis-abc' });
    req.flush({ supervisor: { id_usuario: 1, nombre: 'X', email: 'x@x.com', rol: 'supervisor', session_id: 'vis-abc', expira_en: null } });
  });

  it('getIncidencias() calcula total cuando el backend no lo envía', () => {
    let received: { total: number; incidencias: Incidencia[] } | undefined;
    const incidencia = {
      id_incidencia: 1, id_centro: 1, id_usuario: 1, categoria: 'otros',
      titulo: 'A', descripcion: 'B', foto_url: null, estado: 'pendiente',
      fecha_creacion: '2026-09-01T10:00:00Z',
      centro: { id_centro: 1, nombre_centro: 'C1' },
      usuario: { id_usuario: 1, nombre: 'U1' },
    };
    service.getIncidencias().subscribe((r) => (received = r));
    const req = httpMock.expectOne('/api/v1/incidencias');
    req.flush({ incidencias: [incidencia] }); // sin campo total (realidad del backend)

    expect(received?.total).toBe(1);
    expect(received?.incidencias.length).toBe(1);
  });

  it('handleError NO usa window.alert y expone el mensaje del backend', () => {
    spyOn(window, 'alert');
    let error: Error | undefined;
    service.getCentros().subscribe({ error: (e) => (error = e) });

    const req = httpMock.expectOne('/api/v1/centros');
    req.flush({ error: 'Token inválido' }, { status: 401, statusText: 'Unauthorized' });

    expect(window.alert).not.toHaveBeenCalled();
    expect(error?.message).toContain('Token inválido');
  });
});