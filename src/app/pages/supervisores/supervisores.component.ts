import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, SupervisorDemo } from '../../services/api.service';

@Component({
  selector: 'app-supervisores',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './supervisores.component.html',
  styleUrls: ['./supervisores.component.scss']
})
export class SupervisoresComponent implements OnInit {
  supervisores: SupervisorDemo[] = [];
  loading = true;
  showForm = false;
  msg = '';
  form = { nombre: '', email: '', password: '' };

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    // In a real app we would get sessionId from localStorage or auth.
    // For demo, we'll use a fixed session id or get from ApiService.getSessionId().
    const sessionId = this.apiService.getSessionId(); // we have this method in ApiService
    this.apiService.getSupervisoresDemo(sessionId).subscribe({
      next: (data) => {
        this.supervisores = data;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.msg = err.message || 'Error al cargar supervisores';
      }
    });
  }

  handleCreate(): void {
    if (!this.form.nombre || !this.form.email || !this.form.password) {
      this.msg = 'Todos los campos son requeridos';
      return;
    }
    const sessionId = this.apiService.getSessionId();
    this.apiService.createSupervisorDemo({ ...this.form, session_id: sessionId }).subscribe({
      next: () => {
        this.showForm = false;
        this.msg = 'Supervisor de prueba creado. Caduca en 24h.';
        this.form = { nombre: '', email: '', password: '' };
        this.load();
      },
      error: (err) => {
        this.msg = err.message || 'Error al crear supervisor';
      }
    });
  }



  formatDate(dateString: string | null): string {
    if (!dateString) return '—';
    const d = new Date(dateString);
    return isNaN(d.getTime()) ? '—' : d.toLocaleString('es-ES');
  }

}
