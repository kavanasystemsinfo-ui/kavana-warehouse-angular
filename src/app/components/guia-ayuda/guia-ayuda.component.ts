import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

// Botón "❓ Ayuda" + modal con la guía de la página (portado de GuiaAyuda.tsx).
@Component({
  selector: 'app-guia-ayuda',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './guia-ayuda.component.html',
  styleUrls: ['./guia-ayuda.component.scss']
})
export class GuiaAyudaComponent {
  @Input() titulo = '';
  abierto = false;
}