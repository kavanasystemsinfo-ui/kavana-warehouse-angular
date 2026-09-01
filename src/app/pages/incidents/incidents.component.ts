import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { GuiaAyudaComponent } from '../../components/guia-ayuda/guia-ayuda.component';

interface Centro {
  id_centro: number;
  nombre_centro: string;
}

interface Incidencia {
  id_incidencia: number;
  id_centro: number;
  id_usuario: number;
  categoria: string;
  titulo: string;
  descripcion: string;
  foto_url: string | null;
  estado: string;
  fecha_creacion: string;
  centro: { id_centro: number; nombre_centro: string };
  usuario: { id_usuario: number; nombre: string };
}

interface IncidenciasResponse {
  total: number;
  incidencias: Incidencia[];
}

@Component({
  selector: 'app-incidents',
  standalone: true,
  imports: [CommonModule, FormsModule, GuiaAyudaComponent],
  templateUrl: './incidents.component.html',
  styleUrls: ['./incidents.component.scss']
})
export class IncidentsComponent implements OnInit {
  incidencias: Incidencia[] = [];
  centros: Centro[] = [];
  total = 0;
  loading = true;
  error: string | null = null;
  filtroCentro = '';
  filtroEstado = '';
  filtroCategoria = '';
  visita = false;
  // We don't have periodo from context; we'll ignore for now (show all time)
  // In a real app, we'd have a date range service or use a separate servicio.

  // Static data for badges (mirroring React)
  readonly CATEGORIAS = [
    { value: '', label: 'Todas' },
    { value: 'limpieza', label: '🧼 Limpieza' },
    { value: 'fontaneria', label: '🚰 Fontanería' },
    { value: 'electricidad', label: '⚡ Electricidad' },
    { value: 'cerrajeria', label: '🔑 Cerrajeria' },
    { value: 'otros', label: '❓ Otros' }
  ];
  readonly ESTADOS = [
    { value: '', label: 'Todos' },
    { value: 'pendiente', label: 'Pendiente' },
    { value: 'en_proceso', label: 'En Proceso' },
    { value: 'resuelta', label: 'Resuelta' }
  ];
  readonly CATEGORIA_ICONS: { [key: string]: string } = {
    limpieza: '🧼',
    fontaneria: '🚰',
    electricidad: '⚡',
    cerrajeria: '🔑',
    otros: '❓'
  };

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.visita = this.apiService.esVisita();
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.error = '';
    const filt = this.filtroCentro ? Number(this.filtroCentro) : undefined;
    const est = this.filtroEstado || undefined;
    const cat = this.filtroCategoria || undefined;
    // Since we don't have periodo, we pass undefined for desde/hasta.
    this.apiService.getIncidencias({ centro: filt, estado: est, categoria: cat }).subscribe({
      next: (res) => {
        this.incidencias = res.incidencias;
        this.total = res.total;
        // We don't get centros from this endpoint; we need to fetch them separately for the filter dropdown.
        this.apiService.getCentros().subscribe({
          next: (data) => { this.centros = data; },
          error: (err) => { /* ignore error, we can still show incidences */ }
        });
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.error = err.message || 'Error al cargar incidencias';
      }
    });
  }

  handleFilter(): void {
    this.loadData();
  }

  handleChangeEstado(id: number, nuevoEstado: string): void {
    this.apiService.updateIncidencia(id, { estado: nuevoEstado }).subscribe({
      next: () => {
        this.loadData();
      },
      error: (err) => {
        this.error = err.message || 'Error al actualizar estado';
      }
    });
  }

  // Helper methods for template
  pendientes(): number {
    return this.incidencias.filter(i => i.estado === 'pendiente').length;
  }
  enProceso(): number {
    return this.incidencias.filter(i => i.estado === 'en_proceso').length;
  }
  resueltas(): number {
    return this.incidencias.filter(i => i.estado === 'resuelta').length;
  }

  getCategoriaIcon(categoria: string): string {
    return this.CATEGORIA_ICONS[categoria] || '❓';
  }

  badgeEstado(estado: string): string {
    return estado === 'pendiente' ? 'badge-danger' : estado === 'en_proceso' ? 'badge-warning' : 'badge-success';
  }

  textoEstado(estado: string): string {
    return estado === 'pendiente' ? '🔴 Pendiente' : estado === 'en_proceso' ? '🟡 En proceso' : '🟢 Resuelta';
  }

  // For tracking in ngFor
  trackById(_: number, inc: { id_incidencia: number }): number {
    return inc.id_incidencia;
  }


  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleString("es-ES");
  }

}
