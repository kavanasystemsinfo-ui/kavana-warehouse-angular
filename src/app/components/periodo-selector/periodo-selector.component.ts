import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PeriodoService, RangeMode } from '../../services/periodo.service';

// Selector de periodo global: vive en el Layout y aplica a las páginas con
// datos temporales (Dashboard, Incidents). Mismo patrón que RouteAI / React.
@Component({
  selector: 'app-periodo-selector',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './periodo-selector.component.html',
  styleUrls: ['./periodo-selector.component.scss']
})
export class PeriodoSelectorComponent {
  readonly opciones: Array<{ key: RangeMode; label: string }> = [
    { key: 'mes_actual', label: 'Mes actual' },
    { key: 'mes_anterior', label: 'Mes anterior' },
    { key: 'semana', label: 'Esta semana' },
    { key: 'todo', label: 'Todo el histórico' },
    { key: 'custom', label: 'Personalizado' },
  ];

  constructor(public periodo: PeriodoService) {}

  setPeriodo(mode: RangeMode): void {
    this.periodo.setPeriodo(mode);
  }

  aplicarCustom(): void {
    const s = this.periodo.periodo;
    this.periodo.setCustom(s.customFrom, s.customTo);
  }
}