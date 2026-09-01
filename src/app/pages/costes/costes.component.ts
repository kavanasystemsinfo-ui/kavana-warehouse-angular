import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { fmtNum, fmtEuro } from '../../lib/format';
import { GuiaAyudaComponent } from '../../components/guia-ayuda/guia-ayuda.component';

interface CosteCentro {
  centro: { id_centro: number; nombre_centro: string };
  coste_material: number;
  presupuesto_mensual: number;
  porcentaje_usado: number | null;
  diferencia: number | null;
  estado: 'verde' | 'ambar' | 'rojo' | 'sin_presupuesto';
}

interface CostesData {
  mes: string;
  total_coste: number;
  total_presupuesto: number;
  centros: CosteCentro[];
}

@Component({
  selector: 'app-costes',
  standalone: true,
  imports: [CommonModule, FormsModule, GuiaAyudaComponent],
  templateUrl: './costes.component.html',
  styleUrls: ['./costes.component.scss']
})
export class CostesComponent implements OnInit {
  data: CostesData | null = null;
  loading = false;
  error: string | null = null;
  editando: CosteCentro | null = null;
  valor = '';

  // Formato numérico español (regla Jorge): punto de miles, coma decimal.
  fmtNum = fmtNum;
  fmtEuro = fmtEuro;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = null;
    this.apiService.getCostes().subscribe({
      next: (d) => {
        this.data = d;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.error = err.message || 'Error al cargar costes';
      }
    });
  }

  abrir(c: CosteCentro): void {
    this.editando = c;
    this.valor = String(c.presupuesto_mensual);
  }

  cerrar(): void {
    this.editando = null;
    this.valor = '';
  }

  guardar(): void {
    if (!this.editando) return;
    const v = Number(this.valor);
    if (!Number.isFinite(v) || v < 0) {
      this.error = 'Introduce un importe válido';
      return;
    }
    this.error = null;
    this.apiService.setPresupuesto(this.editando.centro.id_centro, v).subscribe({
      next: () => {
        this.cerrar();
        this.load();
      },
      error: (err) => {
        this.error = err.message || 'Error al guardar';
      }
    });
  }

  barColor(e: string): string {
    return e === 'rojo' ? 'var(--danger)' : e === 'ambar' ? 'var(--warning)' : e === 'verde' ? 'var(--success)' : 'var(--gray-300)';
  }

  badgeText(e: string): string {
    return e === 'rojo' ? '🔴 Te pasas' : e === 'ambar' ? '🟡 Vas justo' : e === 'verde' ? '🟢 Controlado' : '⚪ Sin presupuesto';
  }

  // Helper methods for template

  getBarWidth(porcentaje: number | null): number {
    return porcentaje !== null ? Math.min(porcentaje, 100) : 0;
  }
  getAbsDiff(dif: number | null): number {
    return dif !== null ? Math.abs(dif) : 0;
  }



}
