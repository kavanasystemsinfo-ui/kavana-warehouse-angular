import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { Router } from '@angular/router';
import { AssistantWidgetComponent } from '../../components/assistant-chat/assistant-widget.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, AssistantWidgetComponent],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    // Si ya hay sesión válida, saltar directo al panel (mismo comportamiento
    // que el Login.tsx de React: redirige si el rol no es limpiador).
    const existing = this.apiService.getStoredUser();
    if (existing && existing.rol !== 'limpiador') {
      this.router.navigate(['/dashboard']);
      return;
    }
    // Mostrar error de sesión expirada si lo dejó el flujo de 401.
    const expired = localStorage.getItem('auth_error');
    if (expired) {
      this.error = expired;
      localStorage.removeItem('auth_error');
    }
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.loading = true;
      this.error = null;
      const { email, password } = this.loginForm.value;
      this.apiService.login(email, password).subscribe({
        next: (response) => {
          this.loading = false;
          if (response.usuario.rol === 'limpiador') {
            this.error = 'Acceso denegado. Este panel es para oficina y supervisores.';
            return;
          }
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          this.loading = false;
          this.error = err.message || 'Error al iniciar sesión';
        }
      });
    }
  }
}