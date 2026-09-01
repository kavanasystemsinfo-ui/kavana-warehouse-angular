import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, ConsumptionData, AlertsData, Centro, Producto } from '../../services/api.service';
import { PeriodoService } from '../../services/periodo.service';
import { fmtNum, fmtEuro } from '../../lib/format';
import { downloadCsv } from '../../lib/csv';
import { GuiaAyudaComponent } from '../../components/guia-ayuda/guia-ayuda.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, GuiaAyudaComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  consumption: ConsumptionData | null = null;
  alerts: AlertsData | null = null;
  centros: Centro[] = [];
  productos: Producto[] = [];
  loading = true;
  error = '';

  filtroCentro = '';
  filtroProducto = '';

  constructor(private api: ApiService, private periodo: PeriodoService) {}

  ngOnInit(): void {
    this.periodo.periodo$.subscribe(() => this.loadData());
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.error = '';
    const { from, to } = this.periodo.periodo;
    // loadData acepta el periodo como parámetro explícito (pitfall del setState
    // asíncrono: nunca leer estado recién cambiado dentro del propio load).
    const pFrom = from || undefined;
    const pTo = to || undefined;
    this.api.getConsumption({
      centro: this.filtroCentro ? Number(this.filtroCentro) : undefined,
      producto: this.filtroProducto ? Number(this.filtroProducto) : undefined,
      desde: pFrom,
      hasta: pTo,
    }).subscribe({
      next: (cd) => { this.consumption = cd; },
      error: (err) => { this.error = err.message || 'Error al cargar datos'; }
    });
    this.api.getAlerts().subscribe({
      next: (ad) => { this.alerts = ad; },
      error: () => { /* sin alertas no rompemos el dashboard */ }
    });
    this.api.getCentros().subscribe({
      next: (c) => { this.centros = c; },
      error: () => { /* filtros opcionales */ }
    });
    this.api.getProductos().subscribe({
      next: (p) => { this.productos = p; },
      error: () => { /* filtros opcionales */ }
    });
    this.loading = false;
  }

  onFilterChange(): void {
    this.loadData();
  }

  // --- Formato numérico español (regla Jorge) ---
  fmtNum = fmtNum;
  fmtEuro = fmtEuro;

  // Angular templates no exponen Math: helper mínimo para las barras de progreso.
  MathMin = (a: number, b: number): number => Math.min(a, b);

  // Los templates strict no permiten `alerts?.criticas.length`: getters explícitos.
  get alertasCriticas(): number {
    return this.alerts?.criticas.length ?? 0;
  }

  get alertasAdvertencias(): number {
    return this.alerts?.advertencias.length ?? 0;
  }

  // --- Gráfica de evolución mensual ---
  evolucionBars(): Array<{ mes: string; unidades: number; altura: number; max: number }> {
    const evol = this.consumption?.evolucion_mensual ?? [];
    const max = Math.max(...evol.map((x) => x.unidades), 1);
    return evol.map((p) => {
      const altura = Math.max(8, Math.round((p.unidades / max) * 140));
      const [y, m] = p.mes.split('-');
      return { mes: `${m}/${y}`, unidades: p.unidades, altura, max };
    });
  }

  // --- Export CSV ---
  exportConsumoCentro(): void {
    const rows = (this.consumption?.resumen_por_centro ?? []).flatMap((g) =>
      g.productos.map((p) => ({
        centro: g.centro.nombre_centro,
        producto: p.nombre_producto,
        unidad: p.unidad_medida,
        cantidad_consumida: p.cantidad,
        gasto_euros: p.gasto_euros,
        total_consumo_centro_unidades: g.total_consumo_unidades,
        gasto_total_centro_euros: g.gasto_total_euros,
        porcentaje_presupuesto: g.porcentaje_consumido,
        movimientos: g.movimientos,
      }))
    );
    downloadCsv('consumo-por-centro', rows);
  }

  exportMovimientos(): void {
    const rows = (this.consumption?.movimientos ?? []).slice(0, 100).map((m) => ({
      fecha: new Date(m.fecha_hora).toLocaleString('es-ES'),
      centro: m.centro.nombre_centro,
      producto: m.producto.nombre_producto,
      cantidad: m.cantidad,
      gasto_euros: m.gasto_euros,
      usuario: m.usuario.nombre,
    }));
    downloadCsv('movimientos', rows);
  }

  porcentajeColor(pct: number): string {
    return pct > 90 ? 'var(--danger)' : pct > 75 ? 'var(--warning)' : 'var(--primary)';
  }

  formatFecha(fecha: string): string {
    return new Date(fecha).toLocaleString('es-ES');
  }
}