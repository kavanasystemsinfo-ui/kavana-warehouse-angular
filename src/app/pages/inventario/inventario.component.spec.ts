import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InventarioComponent } from './inventario.component';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { ApiService } from '../../services/api.service';

describe('InventarioComponent', () => {
  let component: InventarioComponent;
  let fixture: ComponentFixture<InventarioComponent>;
  let httpMock: HttpTestingController;

  const fakeProductos = [
    { id_producto: 1, nombre_producto: 'Jabón', unidad_medida: 'litros', coste_unitario: 3.5, stock_minimo_alerta: 10 },
    { id_producto: 2, nombre_producto: 'Papel', unidad_medida: 'rollos', coste_unitario: 2.0, stock_minimo_alerta: 5 },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InventarioComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(InventarioComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    localStorage.clear();
  });

  afterEach(() => httpMock.verify());

  it('should create', () => {
    fixture.detectChanges();
    httpMock.expectOne((req) => req.url.includes('/productos')).flush({ productos: fakeProductos });
    expect(component).toBeTruthy();
  });

  it('should load products on init', () => {
    fixture.detectChanges();
    expect(component.loading).toBeTrue();
    httpMock.expectOne((req) => req.url.includes('/productos')).flush({ productos: fakeProductos });
    expect(component.productos.length).toBe(2);
    expect(component.loading).toBeFalse();
  });

  it('should handle load error', () => {
    fixture.detectChanges();
    httpMock.expectOne((req) => req.url.includes('/productos')).flush(
      'Error', { status: 500, statusText: 'Server Error' }
    );
    expect(component.error).toBeTruthy();
    expect(component.loading).toBeFalse();
  });

  it('should open and close new product modal', () => {
    fixture.detectChanges();
    httpMock.expectOne((req) => req.url.includes('/productos')).flush({ productos: [] });

    component.openNuevo();
    expect(component.showNuevo).toBeTrue();
    expect(component.npNombre).toBe('');
    expect(component.npUnidad).toBe('unidades');
  });

  it('should validate name required on handleCrear', () => {
    fixture.detectChanges();
    httpMock.expectOne((req) => req.url.includes('/productos')).flush({ productos: [] });

    component.npNombre = '';
    component.handleCrear();
    expect(component.npError).toContain('nombre');
  });

  it('should validate coste on handleCrear', () => {
    fixture.detectChanges();
    httpMock.expectOne((req) => req.url.includes('/productos')).flush({ productos: [] });

    component.npNombre = 'Test';
    component.npCoste = '-5';
    component.handleCrear();
    expect(component.npError).toContain('coste');
  });

  it('should create product and reload on handleCrear success', () => {
    fixture.detectChanges();
    httpMock.expectOne((req) => req.url.includes('/productos')).flush({ productos: fakeProductos });

    component.npNombre = 'Nuevo';
    component.npCoste = '5.5';
    component.npMinimo = '10';
    component.handleCrear();
    const req = httpMock.expectOne((r) => r.url.includes('/productos') && r.method === 'POST');
    expect(req.request.body.nombre_producto).toBe('Nuevo');
    req.flush({ producto: { id_producto: 3, nombre_producto: 'Nuevo', unidad_medida: 'unidades', coste_unitario: 5.5, stock_minimo_alerta: 10 } });
    httpMock.expectOne((req) => req.url.includes('/productos')).flush({ productos: fakeProductos });
    expect(component.showNuevo).toBeFalse();
  });

  it('should open edit modal with product data', () => {
    fixture.detectChanges();
    httpMock.expectOne((req) => req.url.includes('/productos')).flush({ productos: fakeProductos });

    component.openEdit(fakeProductos[0]);
    expect(component.showEdit).toBeTrue();
    expect(component.editId).toBe(1);
    expect(component.editNombre).toBe('Jabón');
  });

  it('should call confirm and delete on handleDelete', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    fixture.detectChanges();
    httpMock.expectOne((req) => req.url.includes('/productos')).flush({ productos: fakeProductos });

    component.handleDelete(fakeProductos[0]);
    const req = httpMock.expectOne((r) => r.url.includes('/productos/1') && r.method === 'DELETE');
    req.flush({ ok: true });
    httpMock.expectOne((req) => req.url.includes('/productos')).flush({ productos: fakeProductos });
    expect(component.success).toContain('borrado');
  });

  it('should not delete when confirm is cancelled', () => {
    spyOn(window, 'confirm').and.returnValue(false);
    fixture.detectChanges();
    httpMock.expectOne((req) => req.url.includes('/productos')).flush({ productos: fakeProductos });

    component.handleDelete(fakeProductos[0]);
    httpMock.expectNoneMatching((r) => r.url.includes('/productos/1') && r.method === 'DELETE');
  });
});