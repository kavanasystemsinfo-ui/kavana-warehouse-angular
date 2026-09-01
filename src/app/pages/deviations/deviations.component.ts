import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { fmtNum, fmtEuro } from '../../lib/format';
import { GuiaAyudaComponent } from '../../components/guia-ayuda/guia-ayuda.component';

interface Centro {
  id_centro: number;
  nombre_centro: string;
}

interface Producto {
  id_producto: number;
  nombre_producto: string;
  unidad_medida: string;
  coste_unitario: number;
}

interface DeviationItem {
  centro: { id_centro: number; nombre_centro: string };
  producto: { id_producto: number; nombre_producto: string; unidad_medida: string; coste_unitario: number };
  cantidad_actual: number;
  stock_fisico: number | null;
  desviacion: number | null;
  porcentaje_desviacion: number | null;
  coste_desviacion: number;
  estado: 'falta' | 'sobra' | 'pendiente' | 'normal';
}

interface DeviationsData {
  mes: string;
  total_desviaciones: number;
  desviaciones: DeviationItem[];
}

@Component({
  selector: 'app-deviations',
  standalone: true,
  imports: [CommonModule, FormsModule, GuiaAyudaComponent],
  templateUrl: './deviations.component.html',
  styleUrls: ['./deviations.component.scss']
})
export class DeviationsComponent implements OnInit {
  data: DeviationsData | null = null;
  centros: Centro[] = [];
  filtroCentro = '';
  loading = true;
  error: string | null = null;
  editando: DeviationItem | null = null;
  valorConteo = '';
  guardando = false;
  resetMsg = '';
  visita = false;

  // Formato numérico español (regla Jorge): punto de miles, coma decimal.
  fmtNum = fmtNum;
  fmtEuro = fmtEuro;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.visita = this.apiService.esVisita();
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.error = '';
    this.resetMsg = '';
    const filt = this.filtroCentro ? Number(this.filtroCentro) : undefined;
    const deviations$ = this.apiService.getDeviations(filt ? { centro: filt } : undefined);
    const centros$ = this.apiService.getCentros();
    let done = 0;
    const checkDone = () => {
      done++;
      if (done === 2) {
        this.loading = false;
      }
    };
    deviations$.subscribe({
      next: (d) => { this.data = d; checkDone(); },
      error: (err) => { this.error = err.message || 'Error al cargar datos'; checkDone(); }
    });
    centros$.subscribe({
      next: (c) => { this.centros = c; checkDone(); },
      error: (err) => { this.error = err.message || 'Error al cargar centros'; checkDone(); }
    });
  }

  handleFilter(): void {
    this.loadData();
  }

  abrirConteo(d: DeviationItem): void {
    this.editando = d;
    this.valorConteo = d.stock_fisico !== null ? String(d.stock_fisico) : '';
  }

  cerrarConteo(): void {
    this.editando = null;
    this.valorConteo = '';
  }

  guardar(): void {
    if (!this.editando) return;
    const v = Number(this.valorConteo);
    if (!Number.isFinite(v) || v < 0) {
      this.error = 'Introduce un número válido (0 o superior)';
      return;
    }
    this.error = '';
    this.guardando = true;
    this.apiService.guardarConteo(this.editando.centro.id_centro, this.editando.producto.id_producto, v).subscribe({
      next: () => {
        this.cerrarConteo();
        this.loadData();
      },
      error: (err) => {
        this.error = err.message || 'Error al guardar conteo';
      },
      complete: () => {
        this.guardando = false;
      }
    });
  }

  limpiarDemo(): void {
    if (!confirm('¿Borrar todos los datos de demostración? El panel quedará vacío para empezar con tu empresa.')) return;
    this.guardando = true;
    this.error = '';
    this.resetMsg = '';
    this.apiService.resetDemo().subscribe({
      next: (r) => {
        this.resetMsg = r.mensaje;
        this.loadData();
      },
      error: (err) => {
        this.error = err.message || 'Error al limpiar demo';
      },
      complete: () => {
        this.guardando = false;
      }
    });
  }

  badgeClass(estado: string): string {
    return estado === 'falta' ? 'badge-danger' : estado === 'sobra' ? 'badge-info' : 'badge-warning';
  }

  badgeText(estado: string): string {
    return estado === 'falta' ? '⚠️ Falta material' : estado === 'sobra' ? '✅ Sobra' : '⏳ Pendiente de contar';
  }

  // For tracking in ngFor

  abs(v: number): number {
    return Math.abs(v);
  }




}
