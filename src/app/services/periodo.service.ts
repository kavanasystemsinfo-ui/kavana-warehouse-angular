import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

// Periodo global del panel (mismo patrón que RouteAI / el PeriodoContext de
// React): el selector vive en el Layout y aplica a las páginas con datos
// temporales (Dashboard, Incidents...). Sirve datos con Observables para
// que cada componente se suscriba y recargue al cambiar el periodo.

export type RangeMode = 'mes_actual' | 'mes_anterior' | 'semana' | 'todo' | 'custom';

export interface Periodo {
  rangeMode: RangeMode;
  from: string;
  to: string;
}

export interface PeriodoEstado extends Periodo {
  customFrom: string;
  customTo: string;
}

export function calcRange(mode: RangeMode): { from: string; to: string } {
  const hoy = new Date();
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  if (mode === 'mes_actual') {
    const primero = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    return { from: iso(primero), to: iso(hoy) };
  }
  if (mode === 'mes_anterior') {
    const primero = new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1);
    const ultimo = new Date(hoy.getFullYear(), hoy.getMonth(), 0);
    return { from: iso(primero), to: iso(ultimo) };
  }
  if (mode === 'semana') {
    const dia = (hoy.getDay() + 6) % 7; // lunes = 0
    const lunes = new Date(hoy);
    lunes.setDate(hoy.getDate() - dia);
    return { from: iso(lunes), to: iso(hoy) };
  }
  return { from: '', to: '' }; // 'todo' y 'custom' (sin rango fijo)
}

@Injectable({ providedIn: 'root' })
export class PeriodoService {
  private readonly state$ = new BehaviorSubject<PeriodoEstado>({
    rangeMode: 'mes_actual',
    ...calcRange('mes_actual'),
    customFrom: '',
    customTo: '',
  });

  readonly periodo$ = this.state$.asObservable();

  get periodo(): PeriodoEstado {
    return this.state$.getValue();
  }

  setPeriodo(mode: RangeMode): void {
    const { from, to } = calcRange(mode);
    this.state$.next({ ...this.state$.getValue(), rangeMode: mode, from, to });
  }

  setCustom(from: string, to: string): void {
    this.state$.next({ ...this.state$.getValue(), rangeMode: 'custom', from, to, customFrom: from, customTo: to });
  }
}