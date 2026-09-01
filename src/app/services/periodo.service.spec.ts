import { calcRange, type Periodo } from './periodo.service';

describe('calcRange', () => {
  const iso = (d: Date) => d.toISOString().slice(0, 10);

  it('mes_actual va del día 1 de este mes a hoy', () => {
    const hoy = new Date();
    const primero = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    const r = calcRange('mes_actual');
    expect(r.from).toBe(iso(primero));
    expect(r.to).toBe(iso(hoy));
  });

  it('mes_anterior va del día 1 al último día del mes previo', () => {
    const hoy = new Date();
    const primero = new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1);
    const ultimo = new Date(hoy.getFullYear(), hoy.getMonth(), 0);
    const r = calcRange('mes_anterior');
    expect(r.from).toBe(iso(primero));
    expect(r.to).toBe(iso(ultimo));
  });

  it('semana empieza en lunes', () => {
    const r = calcRange('semana');
    const from = new Date(r.from + 'T00:00:00');
    expect(from.getDay()).toBe(1); // lunes
  });

  it('todo el histórico no tiene from/to', () => {
    expect(calcRange('todo')).toEqual({ from: '', to: '' });
  });

  it('modo desconocido cae a todo el histórico', () => {
    expect(calcRange('custom')).toEqual({ from: '', to: '' });
  });
});

describe('Periodo interface', () => {
  it('es compatible con el estado', () => {
    const p: Periodo = { rangeMode: 'mes_actual', from: '2026-09-01', to: '2026-09-30' };
    expect(p.rangeMode).toBe('mes_actual');
  });
});