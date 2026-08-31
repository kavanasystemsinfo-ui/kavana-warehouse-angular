import { TestBed } from '@angular/core/testing';
import { HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { of } from 'rxjs';
import { AuthInterceptor } from './auth.interceptor';

describe('AuthInterceptor', () => {
  let interceptor: AuthInterceptor;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    interceptor = new AuthInterceptor();
    localStorage.clear();
  });

  function buildHandler(captured: { url?: string; headers?: Record<string, string> }): HttpHandler {
    return {
      handle: (req: HttpRequest<unknown>) => {
        captured.url = req.url;
        captured.headers = {};
        req.headers.keys().forEach((k) => (captured.headers![k] = req.headers.get(k) || ''));
        return of({} as HttpEvent<unknown>);
      },
    };
  }

  it('añade Authorization Bearer cuando hay token en localStorage', (done) => {
    localStorage.setItem('dashboard_access_token', 'abc123');
    const captured: { url?: string; headers?: Record<string, string> } = {};
    const handler = buildHandler(captured);

    interceptor.intercept(new HttpRequest('GET', '/api/v1/centros'), handler).subscribe(() => {
      expect(captured.headers!['Authorization']).toBe('Bearer abc123');
      done();
    });
  });

  it('NO añade Authorization cuando no hay token', (done) => {
    const captured: { url?: string; headers?: Record<string, string> } = {};
    const handler = buildHandler(captured);

    interceptor.intercept(new HttpRequest('GET', '/api/v1/centros'), handler).subscribe(() => {
      expect(captured.headers!['Authorization']).toBeUndefined();
      done();
    });
  });

  it('usa exactamente la clave dashboard_access_token', () => {
    localStorage.setItem('access_token', 'wrong-key');
    const captured: { headers?: Record<string, string> } = {};
    const handler = buildHandler(captured);

    interceptor.intercept(new HttpRequest('GET', '/x'), handler).subscribe();
    expect(captured.headers!['Authorization']).toBeUndefined();
  });
});