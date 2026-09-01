import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

// Asistente técnico de KAVANA WAREHOUSE: chat que responde con la documentación
// real del proyecto (README, DECISIONS, ADRs, docs técnicos) vía POST /api/v1/assistant.
// Reutilizado en el widget flotante del login y en la página /asistente.
interface Mensaje {
  role: 'user' | 'bot';
  text: string;
  error?: boolean;
}

@Component({
  selector: 'app-assistant-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './assistant-chat.component.html',
  styleUrls: ['./assistant-chat.component.scss']
})
export class AssistantChatComponent {
  readonly sugerencias = [
    '¿Qué problema resuelve Kavana Warehouse?',
    '¿Cómo funciona el control de stock por centros?',
    '¿Cómo se calculan los costes reales?',
    '¿Qué decisiones técnicas tiene documentadas?',
  ];

  q = '';
  msgs: Mensaje[] = [];
  loading = false;

  constructor(private http: HttpClient) {}

  enviar(prompt?: string): void {
    const pregunta = (prompt ?? this.q).trim();
    if (!pregunta || this.loading) return;
    this.msgs = [...this.msgs, { role: 'user', text: pregunta }];
    this.q = '';
    this.loading = true;

    this.http.post<{ respuesta: string; fuentes?: string[]; error?: string }>('/api/v1/assistant', { question: pregunta })
      .subscribe({
        next: (data) => {
          if (data.error) {
            this.msgs = [...this.msgs, { role: 'bot', text: data.error, error: true }];
          } else {
            const fuentes = data.fuentes?.length ? `\n\n📄 ${data.fuentes.join(' · ')}` : '';
            this.msgs = [...this.msgs, { role: 'bot', text: data.respuesta + fuentes }];
          }
          this.loading = false;
        },
        error: () => {
          this.msgs = [...this.msgs, { role: 'bot', text: 'No se pudo contactar con el asistente. Inténtalo de nuevo.', error: true }];
          this.loading = false;
        }
      });
  }
}