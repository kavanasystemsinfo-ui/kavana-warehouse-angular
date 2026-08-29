import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, Centro, Producto } from '../../services/api.service';

@Component({
  selector: 'app-centros',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './centros.component.html',
  styleUrls: ['./centros.component.scss']
})
export class CentrosComponent implements OnInit {
  centros: Centro[] = [];
  loading = true;
  msg = '';

  // Modal nuevo
  showForm = false;
  form = { nombre: '', direccion: '', presupuesto: '' };

  // Modal editar
  editando: Centro | null = null;
  editForm = { nombre_centro: '', direccion: '', presupuesto_mensual: '' };
  guardando = false;

  // Modal añadir producto a centro
  showAddProd = false;
  addCentroId: number | null = null;
  catalogo: Producto[] = [];
  addProdId = '';
  addCantidad = '';
  addMinimo = '';
  addLoading = false;
  addError = '';
  addSuccess = '';

  // For expanded row
  centroAbierto: number | null = null;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.msg = '';
    this.apiService.getCentros().subscribe({
      next: (data) => {
        this.centros = data;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.msg = err.message || 'Error al cargar centros';
      }
    });
  }

  handleCreate(): void {
    if (!this.form.nombre.trim()) {
      this.msg = 'El nombre es requerido';
      return;
    }
    this.apiService.createCentro({ nombre: this.form.nombre, direccion: this.form.direccion }).subscribe({
      next: () => {
        this.showForm = false;
        this.msg = 'Centro creado';
        this.form = { nombre: '', direccion: '', presupuesto: '' };
        this.load();
      },
      error: (err) => {
        this.msg = err.message || 'Error al crear';
      }
    });
  }

  abrirEditar(c: Centro): void {
    this.editando = c;
    this.editForm = {
      nombre_centro: c.nombre_centro || '',
      direccion: c.direccion || '',
      presupuesto_mensual: String(c.presupuesto_mensual ?? '')
    };
    this.msg = '';
  }

  cerrarEditar(): void {
    this.editando = null;
    this.msg = '';
  }

  handleUpdate(): void {
    if (!this.editando) return;
    const v = Number(this.editForm.presupuesto_mensual);
    if (!Number.isFinite(v) || v < 0) {
      this.msg = 'Presupuesto inválido';
      return;
    }
    this.guardando = true;
    this.msg = '';
    this.apiService.updateCentro(this.editando.id_centro, {
      nombre_centro: this.editForm.nombre_centro,
      direccion: this.editForm.direccion,
      presupuesto_mensual: v
    }).subscribe({
      next: () => {
        this.cerrarEditar();
        this.msg = 'Centro actualizado';
        this.load();
      },
      error: (err) => {
        this.msg = err.message || 'Error al actualizar';
      },
      complete: () => {
        this.guardando = false;
      }
    });
  }

  abrirAddProd(idCentro: number): void {
    this.addCentroId = idCentro;
    this.addProdId = '';
    this.addCantidad = '';
    this.addMinimo = '';
    this.addError = '';
    this.addSuccess = '';
    this.showAddProd = true;
    this.apiService.getCatalogoProductos().subscribe({
      next: (data) => {
        this.catalogo = data;
      },
      error: (err) => {
        this.addError = err.message || 'Error al cargar catálogo';
      }
    });
  }

  guardarAddProd(): void {
    if (!this.addCentroId || !this.addProdId) {
      this.addError = 'Elige un producto del catálogo.';
      return;
    }
    const cantidad = parseInt(this.addCantidad) || 0;
    const minimo = parseInt(this.addMinimo) || 0;
    this.addLoading = true;
    this.addError = '';
    this.addSuccess = '';
    this.apiService.addProductoCentro({
      id_centro: this.addCentroId,
      id_producto: Number(this.addProdId),
      cantidad_actual: cantidad,
      stock_minimo: minimo
    }).subscribe({
      next: () => {
        this.addSuccess = 'Producto añadido al centro.';
        // Reload centros to reflect changes
        this.load();
        setTimeout(() => {
          this.showAddProd = false;
          this.addSuccess = '';
        }, 1500);
      },
      error: (err) => {
        this.addError = err.message || 'Error al añadir el producto.';
      },
      complete: () => {
        this.addLoading = false;
      }
    });
  }

  // For tracking in ngFor
  trackById(_: number, item: { id_centro: number }): number {
    return item.id_centro;
  }
  getCentroById(id: number): Centro | undefined {
    return this.centros.find(c => c.id_centro === id);
  }
  trackByInvId(_: number, inv: { id_centro: number; id_producto: number }): number {
    return inv.id_producto;
  }

  getBarWidth(value: number | null): number {
    return value !== null ? Math.min(value, 100) : 0;
  }
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleString("es-ES");
  }

}
