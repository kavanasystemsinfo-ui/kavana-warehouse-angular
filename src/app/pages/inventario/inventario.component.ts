import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, Producto } from '../../services/api.service';
import { fmtNum, fmtEuro } from '../../lib/format';
import { downloadCsv } from '../../lib/csv';
import { GuiaAyudaComponent } from '../../components/guia-ayuda/guia-ayuda.component';

@Component({
  selector: 'app-inventario',
  standalone: true,
  imports: [CommonModule, FormsModule, GuiaAyudaComponent],
  templateUrl: './inventario.component.html',
  styleUrls: ['./inventario.component.scss']
})
export class InventarioComponent implements OnInit {
  productos: Producto[] = [];
  loading = false;
  error: string | null = null;
  success: string | null = null;
  visita = false;

  // Modal nuevo producto
  showNuevo = false;
  npNombre = '';
  npUnidad = 'unidades';
  npCoste = '';
  npMinimo = '';
  npLoading = false;
  npError = '';

  // Modal editar producto
  showEdit = false;
  editId: number | null = null;
  editNombre = '';
  editUnidad = 'unidades';
  editCoste = '';
  editMinimo = '';
  editLoading = false;
  editError = '';

  // Borrar
  borrando: number | null = null;

  // Formato numérico español (regla Jorge).
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
    this.success = '';
    this.apiService.getProductos().subscribe({
      next: (prods) => {
        this.productos = prods;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.error = err.message || 'Error al cargar productos';
      }
    });
  }

  openNuevo(): void {
    this.npNombre = '';
    this.npUnidad = 'unidades';
    this.npCoste = '';
    this.npMinimo = '';
    this.npError = '';
    this.showNuevo = true;
  }

  handleCrear(): void {
    if (!this.npNombre.trim()) {
      this.npError = 'Escribe el nombre del producto.';
      return;
    }
    const coste = parseFloat(this.npCoste);
    const minimo = parseInt(this.npMinimo) || 0;
    if (isNaN(coste) || coste < 0) {
      this.npError = 'El coste debe ser un número válido.';
      return;
    }
    this.npLoading = true;
    this.npError = '';
    this.apiService.createProducto({
      nombre_producto: this.npNombre.trim(),
      unidad_medida: this.npUnidad,
      coste_unitario: coste,
      stock_minimo_alerta: minimo,
    }).subscribe({
      next: () => {
        this.success = `"${this.npNombre.trim()}" creado en el catálogo.`;
        this.showNuevo = false;
        this.loadData();
      },
      error: (err) => {
        this.npError = err?.message || 'Error al crear el producto.';
      },
      complete: () => {
        this.npLoading = false;
      }
    });
  }

  openEdit(p: Producto): void {
    this.editId = p.id_producto;
    this.editNombre = p.nombre_producto;
    this.editUnidad = p.unidad_medida;
    this.editCoste = String(p.coste_unitario);
    this.editMinimo = String(p.stock_minimo_alerta ?? 0);
    this.editError = '';
    this.showEdit = true;
  }

  handleEdit(): void {
    if (!this.editId) return;
    const coste = parseFloat(this.editCoste);
    const minimo = parseInt(this.editMinimo) || 0;
    if (isNaN(coste) || coste < 0) {
      this.editError = 'El coste debe ser un número válido.';
      return;
    }
    this.editLoading = true;
    this.editError = '';
    this.apiService.updateProducto(this.editId, {
      nombre_producto: this.editNombre.trim(),
      unidad_medida: this.editUnidad,
      coste_unitario: coste,
      stock_minimo_alerta: minimo,
    }).subscribe({
      next: () => {
        this.success = 'Producto actualizado.';
        this.showEdit = false;
        this.loadData();
      },
      error: (err) => {
        this.editError = err?.message || 'Error al editar el producto.';
      },
      complete: () => {
        this.editLoading = false;
      }
    });
  }

  handleDelete(p: Producto): void {
    if (!confirm(`¿Borrar "${p.nombre_producto}" del catálogo?`)) return;
    this.borrando = p.id_producto;
    this.apiService.deleteProducto(p.id_producto).subscribe({
      next: () => {
        this.success = `"${p.nombre_producto}" borrado.`;
        this.loadData();
      },
      error: (err) => {
        this.error = err?.message || 'No se pudo borrar.';
      },
      complete: () => {
        this.borrando = null;
      }
    });
  }

  handleGenerateProposal(): void {
    this.loading = true;
    this.error = '';
    this.success = '';
    this.apiService.getPurchaseProposal().subscribe({
      next: (proposal) => {
        if (!proposal || !proposal.propuestas || proposal.propuestas.length === 0) {
          this.success = 'No hay productos por debajo del stock mínimo. No se requiere compra.';
          setTimeout(() => (this.success = ''), 4000);
          return;
        }
        // Export CSV real (mismo comportamiento que Inventario.tsx de React).
        const rows = proposal.propuestas.map((p) => ({
          centro: p.centro.nombre_centro,
          producto: p.producto.nombre_producto,
          unidad: p.producto.unidad_medida,
          coste_unitario: p.producto.coste_unitario,
          stock_actual: p.stock_actual,
          stock_minimo: p.stock_minimo,
          deficit: p.deficit,
          cantidad_pedido: p.cantidad_pedido,
          coste_estimado: p.coste_estimado,
        }));
        downloadCsv('propuesta-compra', rows);
        this.success = `Propuesta generada (${proposal.propuestas.length} artículos, total ${fmtEuro(proposal.total_coste_estimado)} €). Descargada como CSV.`;
        setTimeout(() => (this.success = ''), 6000);
      },
      error: (err) => {
        this.error = err instanceof Error ? err.message : 'Error al generar propuesta';
      },
      complete: () => {
        this.loading = false;
      }
    });
  }
}