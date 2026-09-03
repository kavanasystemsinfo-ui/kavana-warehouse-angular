import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CostesComponent } from './costes.component';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { ApiService } from '../../services/api.service';

describe('CostesComponent', () => {
  let component: CostesComponent;
  let fixture: ComponentFixture<CostesComponent>;
  let httpMock: HttpTestingController;

  const fakeCostes = {
    mes: '2026-09',
    total_coste: 1500,
    total_presupuesto: 5000,
    centros: [
      {
        centro: { id_centro: 1, nombre_centro: 'Centro A' },
        coste_material: 800,
        presupuesto_mensual: 2500,
        porcentaje_usado: 32,
        diferencia: 1700,
        estado: 'verde' as const,
      },
      {
        centro: { id_centro: 2, nombre_centro: 'Centro B' },
        coste_material: 2200,
        presupuesto_mensual: 2500,
        porcentaje_usado: 88,
        diferencia: 300,
        estado: 'ambar' as const,
      },
    ],
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CostesComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(CostesComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should create', () => {
    fixture.detectChanges();
    httpMock.expectOne((req) => req.url.includes('/dashboard/costes')).flush(fakeCostes);
    expect(component).toBeTruthy();
  });

  it('should load costes on init', () => {
    fixture.detectChanges();
    expect(component.loading).toBeTrue();
    httpMock.expectOne((req) => req.url.includes('/dashboard/costes')).flush(fakeCostes);
    expect(component.data).toBeTruthy();
    expect(component.data!.centros.length).toBe(2);
    expect(component.loading).toBeFalse();
  });

  it('should handle load error', () => {
    fixture.detectChanges();
    httpMock.expectOne((req) => req.url.includes('/dashboard/costes')).flush(
      'Error', { status: 500, statusText: 'Server Error' }
    );
    expect(component.error).toBeTruthy();
    expect(component.loading).toBeFalse();
  });

  it('should open edit modal with current value', () => {
    fixture.detectChanges();
    httpMock.expectOne((req) => req.url.includes('/dashboard/costes')).flush(fakeCostes);

    component.abrir(fakeCostes.centros[0]);
    expect(component.editando).toBe(fakeCostes.centros[0]);
    expect(component.valor).toBe('2500');
  });

  it('should close edit modal', () => {
    component.editando = fakeCostes.centros[0];
    component.valor = '2500';
    component.cerrar();
    expect(component.editando).toBeNull();
    expect(component.valor).toBe('');
  });

  it('should validate non-negative value on guardar', () => {
    component.editando = fakeCostes.centros[0];
    component.valor = '-100';
    component.guardar();
    expect(component.error).toContain('válido');
  });

  it('should save presupuesto and reload', () => {
    fixture.detectChanges();
    httpMock.expectOne((req) => req.url.includes('/dashboard/costes')).flush(fakeCostes);

    component.abrir(fakeCostes.centros[0]);
    component.valor = '3000';
    component.guardar();
    const req = httpMock.expectOne((r) => r.url.includes('/centros/1/presupuesto') && r.method === 'POST');
    expect(req.request.body.presupuesto_mensual).toBe(3000);
    req.flush({ ok: true, presupuesto_mensual: 3000 });
    httpMock.expectOne((req) => req.url.includes('/dashboard/costes')).flush(fakeCostes);
    expect(component.editando).toBeNull();
  });

  it('should return correct barColor for each estado', () => {
    expect(component.barColor('rojo')).toBe('var(--danger)');
    expect(component.barColor('ambar')).toBe('var(--warning)');
    expect(component.barColor('verde')).toBe('var(--success)');
    expect(component.barColor('sin_presupuesto')).toBe('var(--gray-300)');
  });

  it('should return correct badgeText for each estado', () => {
    expect(component.badgeText('rojo')).toContain('pasas');
    expect(component.badgeText('ambar')).toContain('justo');
    expect(component.badgeText('verde')).toContain('Controlado');
    expect(component.badgeText('sin_presupuesto')).toContain('Sin presupuesto');
  });

  it('should return correct getBarWidth', () => {
    expect(component.getBarWidth(88)).toBe(88);
    expect(component.getBarWidth(150)).toBe(100);
    expect(component.getBarWidth(null)).toBe(0);
  });

  it('should return correct getAbsDiff', () => {
    expect(component.getAbsDiff(-500)).toBe(500);
    expect(component.getAbsDiff(300)).toBe(300);
    expect(component.getAbsDiff(null)).toBe(0);
  });
});