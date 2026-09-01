import { toCsv } from './csv';

describe('toCsv', () => {
  it('genera cabeceras + filas separadas por coma', () => {
    const csv = toCsv('x', [
      { nombre: 'A', valor: 1 },
      { nombre: 'B', valor: 2 },
    ]);
    expect(csv).toBe('nombre,valor\nA,1\nB,2');
  });

  it('escapa valores con coma, comillas o saltos de línea', () => {
    const csv = toCsv('x', [{ nombre: 'Hola, mundo', nota: 'dijo "hola"' }]);
    expect(csv).toBe('nombre,nota\n"Hola, mundo","dijo ""hola"""');
  });

  it('devuelve string vacío con filas vacías', () => {
    expect(toCsv('x', [])).toBe('');
  });
});