import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';

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
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  costesData: CostesData | null = null;
  loading = false;
  error: string | null = null;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadCostes();
  }

  loadCostes(): void {
    this.loading = true;
    this.error = null;
    this.apiService.getCostes().subscribe({
      next: (data) => {
        this.costesData = data;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.error = err.message || 'Error al cargar los datos';
      }
    });
  }

  trackById(index: number, item: any): number {
    return item.id ?? index;
  }
  getBarWidth(value: number | null): number {
    return value !== null ? Math.min(value, 100) : 0;
  }
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleString("es-ES");
  }

}
