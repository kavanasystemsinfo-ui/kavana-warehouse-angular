import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardComponent } from './dashboard.component';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { PeriodoService } from '../../services/periodo.service';
import { ApiService } from '../../services/api.service';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let httpMock: HttpTestingController;
  let periodoService: PeriodoService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        PeriodoService,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    periodoService = TestBed.inject(PeriodoService);
  });

  afterEach(() => httpMock.verify());

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should start with loading=true and fetch data on init', () => {
    fixture.detectChanges();
    expect(component.loading).toBeTrue();
    // Consume pending HTTP requests
    httpMock.expectOne((req) => req.url.includes('/dashboard/consumption')).flush({
      total_consumo_unidades: 0, total_gasto_euros: 0, total_movimientos: 0,
      resumen_por_centro: [], movimientos: [],
    });
    httpMock.expectOne((req) => req.url.includes('/dashboard/alerts')).flush({
      total_alertas: 0, criticas: [], advertencias: [],
    });
    httpMock.expectOne((req) => req.url.includes('/centros')).flush({ centros: [] });
    httpMock.expectOne((req) => req.url.includes('/productos')).flush({ productos: [] });
  });

  it('should handle consumption error gracefully', () => {
    fixture.detectChanges();
    httpMock.expectOne((req) => req.url.includes('/dashboard/consumption')).flush(
      'Error', { status: 500, statusText: 'Server Error' }
    );
    httpMock.expectOne((req) => req.url.includes('/dashboard/alerts')).flush({
      total_alertas: 0, criticas: [], advertencias: [],
    });
    httpMock.expectOne((req) => req.url.includes('/centros')).flush({ centros: [] });
    httpMock.expectOne((req) => req.url.includes('/productos')).flush({ productos: [] });
    expect(component.error).toBeTruthy();
  });

  it('should reload data on period change', () => {
    fixture.detectChanges();
    httpMock.expectOne((req) => req.url.includes('/dashboard/consumption')).flush({
      total_consumo_unidades: 0, total_gasto_euros: 0, total_movimientos: 0,
      resumen_por_centro: [], movimientos: [],
    });
    httpMock.expectOne((req) => req.url.includes('/dashboard/alerts')).flush({
      total_alertas: 0, criticas: [], advertencias: [],
    });
    httpMock.expectOne((req) => req.url.includes('/centros')).flush({ centros: [] });
    httpMock.expectOne((req) => req.url.includes('/productos')).flush({ productos: [] });

    // Trigger period change
    periodoService.periodo$.next({ from: '2026-01-01', to: '2026-01-31' });
    httpMock.expectOne((req) => req.url.includes('/dashboard/consumption')).flush({
      total_consumo_unidades: 100, total_gasto_euros: 50, total_movimientos: 5,
      resumen_por_centro: [], movimientos: [],
    });
    httpMock.expectOne((req) => req.url.includes('/dashboard/alerts')).flush({
      total_alertas: 0, criticas: [], advertencias: [],
    });
    httpMock.expectOne((req) => req.url.includes('/centros')).flush({ centros: [] });
    httpMock.expectOne((req) => req.url.includes('/productos')).flush({ productos: [] });
  });

  it('should compute alertasCriticas and alertasAdvertencias getters', () => {
    component.alerts = {
      total_alertas: 3,
      criticas: [{ id_centro: 1, centro: 'A', id_producto: 1, producto: 'P1', unidad_medida: 'ud', cantidad_actual: 0, stock_minimo_alerta: 10, deficit: 10 }],
      advertencias: [
        { id_centro: 1, centro: 'A', id_producto: 2, producto: 'P2', unidad_medida: 'ud', cantidad_actual: 5, stock_minimo_alerta: 10, deficit: 5 },
        { id_centro: 1, centro: 'A', id_producto: 3, producto: 'P3', unidad_medida: 'ud', cantidad_actual: 8, stock_minimo_alerta: 10, deficit: 2 },
      ],
    };
    expect(component.alertasCriticas).toBe(1);
    expect(component.alertasAdvertencias).toBe(2);
  });

  it('should return correct porcentajeColor', () => {
    expect(component.porcentajeColor(95)).toBe('var(--danger)');
    expect(component.porcentajeColor(80)).toBe('var(--warning)');
    expect(component.porcentajeColor(50)).toBe('var(--primary)');
  });

  it('should compute evolucionBars correctly', () => {
    component.consumption = {
      total_consumo_unidades: 0, total_gasto_euros: 0, total_movimientos: 0,
      resumen_por_centro: [], movimientos: [],
      evolucion_mensual: [
        { mes: '2026-01', unidades: 100, gasto_euros: 50 },
        { mes: '2026-02', unidades: 200, gasto_euros: 100 },
      ],
    };
    const bars = component.evolucionBars();
    expect(bars.length).toBe(2);
    expect(bars[0].mes).toBe('01/2026');
    expect(bars[1].mes).toBe('02/2026');
    expect(bars[0].altura).toBeLessThan(bars[1].altura);
  });
});