import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let httpMock: HttpTestingController;
  let router: Router;
  let apiService: ApiService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        FormBuilder,
        { provide: Router, useValue: { navigate: jasmine.createSpy('navigate') } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    apiService = TestBed.inject(ApiService);
    localStorage.clear();
    fixture.detectChanges();
  });

  afterEach(() => httpMock.verify());

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should redirect to /dashboard if valid session exists on init', () => {
    const user = { id_usuario: 1, nombre: 'Test', email: 't@t.com', rol: 'supervisor' };
    localStorage.setItem('dashboard_user', JSON.stringify(user));
    localStorage.setItem('dashboard_access_token', 'tok');
    localStorage.setItem('dashboard_refresh_token', 'ref');

    component.ngOnInit();
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('should NOT redirect if rol is limpiador', () => {
    const user = { id_usuario: 1, nombre: 'Test', email: 't@t.com', rol: 'limpiador' };
    localStorage.setItem('dashboard_user', JSON.stringify(user));
    localStorage.setItem('dashboard_access_token', 'tok');

    component.ngOnInit();
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should show expired session error from localStorage', () => {
    localStorage.setItem('auth_error', 'Sesión expirada');
    component.ngOnInit();
    expect(component.error).toBe('Sesión expirada');
    expect(localStorage.getItem('auth_error')).toBeNull();
  });

  it('should create form with email and password controls', () => {
    expect(component.loginForm.contains('email')).toBeTrue();
    expect(component.loginForm.contains('password')).toBeTrue();
    expect(component.loginForm.get('email')?.hasError('required')).toBeTrue();
    expect(component.loginForm.get('password')?.hasError('required')).toBeTrue();
  });

  it('should call apiService.login on submit with valid form', () => {
    component.loginForm.setValue({ email: 't@t.com', password: 'pass123' });
    const fakeRes = {
      token: 'at', refreshToken: 'rt',
      usuario: { id_usuario: 1, nombre: 'Test', email: 't@t.com', rol: 'supervisor' },
    };

    component.onSubmit();
    expect(component.loading).toBeTrue();
    const req = httpMock.expectOne('/api/v1/auth/login');
    expect(req.request.method).toBe('POST');
    req.flush(fakeRes);
  });

  it('should navigate to /dashboard on successful supervisor login', () => {
    component.loginForm.setValue({ email: 't@t.com', password: 'pass123' });
    const fakeRes = {
      token: 'at', refreshToken: 'rt',
      usuario: { id_usuario: 1, nombre: 'Test', email: 't@t.com', rol: 'supervisor' },
    };

    component.onSubmit();
    httpMock.expectOne('/api/v1/auth/login').flush(fakeRes);
    expect(component.loading).toBeFalse();
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('should show error for limpiador role on login', () => {
    component.loginForm.setValue({ email: 't@t.com', password: 'pass123' });
    const fakeRes = {
      token: 'at', refreshToken: 'rt',
      usuario: { id_usuario: 1, nombre: 'Limpia', email: 'l@t.com', rol: 'limpiador' },
    };

    component.onSubmit();
    httpMock.expectOne('/api/v1/auth/login').flush(fakeRes);
    expect(component.loading).toBeFalse();
    expect(component.error).toContain('Acceso denegado');
  });

  it('should show error on login failure (401)', () => {
    component.loginForm.setValue({ email: 't@t.com', password: 'wrong' });
    component.onSubmit();
    httpMock.expectOne('/api/v1/auth/login').flush(
      { error: 'Credenciales inválidas' },
      { status: 401, statusText: 'Unauthorized' }
    );
    expect(component.loading).toBeFalse();
    expect(component.error).toContain('Credenciales inválidas');
  });

  it('should handle network error gracefully', () => {
    component.loginForm.setValue({ email: 't@t.com', password: 'pass123' });
    component.onSubmit();
    httpMock.expectOne('/api/v1/auth/login').flush('Network error', { status: 0, statusText: 'Unknown' });
    expect(component.loading).toBeFalse();
    expect(component.error).toContain('conexión');
  });
});