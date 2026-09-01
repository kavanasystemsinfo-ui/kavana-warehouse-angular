import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { fmtNum, fmtEuro } from '../../lib/format';
import { GuiaAyudaComponent } from '../../components/guia-ayuda/guia-ayuda.component';

interface Responsable {
  id_usuario: number;
  nombre: string;
  email: string;
  telefono?: string | null;
  rol: string;
  centros_asignados?: Array<{ id_centro: number; nombre_centro: string }>;
}

interface Centro {
  id_centro: number;
  nombre_centro: string;
  // other fields not needed
}

interface Recuento {
  id_movimiento: number;
  fecha_hora: string;
  responsable: { id_usuario: number; nombre: string };
  centro: { id_centro: number; nombre_centro: string };
  producto: { id_producto: number; nombre_producto: string; unidad_medida: string };
  cantidad_nueva: number;
}

@Component({
  selector: 'app-responsables',
  standalone: true,
  imports: [CommonModule, FormsModule, GuiaAyudaComponent],
  templateUrl: './responsables.component.html',
  styleUrls: ['./responsables.component.scss']
})
export class ResponsablesComponent implements OnInit {
  responsables: Responsable[] = [];
  centros: Centro[] = [];
  recuentos: Recuento[] = [];
  filtroCentro = '';
  loading = true;
  showForm = false;
  msg = '';
  form = { nombre: '', email: '', password: '', telefono: '' };
  editId: number | null = null;
  selected: number[] = [];

  // Formato numérico español (regla Jorge).
  fmtNum = fmtNum;
  fmtEuro = fmtEuro;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.msg = '';
    // We'll call three observables and wait for all
    const responsables$ = this.apiService.getResponsables();
    const centros$ = this.apiService.getCentros();
    const recuentos$ = this.apiService.getRecuentos();
    // Since we don't have forkJoin imported simply, we can subscribe sequentially but better to use forkJoin.
    // For simplicity, we'll do three separate calls and set flags.
    let done = 0;
    const checkDone = () => {
      done++;
      if (done === 3) {
        this.loading = false;
      }
    };
    responsables$.subscribe({
      next: (resp) => { this.responsables = resp; checkDone(); },
      error: (err: any) => { this.msg = err.message || 'Error al cargar responsables'; checkDone(); }
    });
    centros$.subscribe({
      next: (ctrs) => { this.centros = ctrs; checkDone(); },
      error: (err: any) => { this.msg = err.message || 'Error al cargar centros'; checkDone(); }
    });
    recuentos$.subscribe({
      next: (rec) => { this.recuentos = rec; checkDone(); },
      error: (err: any) => { this.msg = err.message || 'Error al cargar recuentos'; checkDone(); }
    });
  }

  handleCreate(): void {
    // La contraseña es obligatoria (regla Jorge: nada de contraseñas por defecto
    // conocidas como 'kavanawarehouse' — bug de la versión React).
    if (!this.form.nombre || !this.form.email || !this.form.password) {
      this.msg = 'Nombre, email y contraseña son obligatorios';
      return;
    }
    if (this.form.password.length < 6) {
      this.msg = 'La contraseña debe tener al menos 6 caracteres';
      return;
    }
    this.apiService.createResponsable({ ...this.form, password: this.form.password }).subscribe({
      next: () => {
        this.showForm = false;
        this.msg = 'Responsable creado';
        this.form = { nombre: '', email: '', password: '', telefono: '' };
        this.load();
      },
      error: (err: any) => {
        this.msg = err.message || 'Error al crear';
      }
    });
  }

  abrirEdicion(r: Responsable): void {
    this.editId = r.id_usuario;
    this.selected = (r.centros_asignados?.map(c => c.id_centro) || []).slice();
  }

  toggleCentro(id: number): void {
    if (this.selected.includes(id)) {
      this.selected = this.selected.filter(x => x !== id);
    } else {
      this.selected = [...this.selected, id];
    }
  }

  guardarCentros(): void {
    if (this.editId === null) return;
    this.apiService.assignCentrosToResponsable(this.editId, this.selected).subscribe({
      next: () => {
        this.msg = 'Centros actualizados';
        this.editId = null;
        this.load();
      },
      error: (err: any) => {
        this.msg = err.message || 'Error al guardar';
      }
    });
  }

  get recuentosFiltrados(): Recuento[] {
    if (!this.filtroCentro) {
      return this.recuentos;
    }
    return this.recuentos.filter(r => r.centro.id_centro === +this.filtroCentro);
  }

  trackById(index: number, item: any): number {
    return item.id ?? index;
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleString("es-ES");
  }


  trackByRecId(index: number, item: any): number {
    return item.id_recuento ?? index;
  }
}
