import { fmtNum, fmtEuro } from './format';

describe('fmtNum', () => {
  it('formatea miles con punto y decimales con coma (español)', () => {
    expect(fmtNum(12415)).toBe('12.415');
    expect(fmtNum(43.5)).toBe('43,5');
  });

  it('NO omite el punto de miles cuando el grupo más alto tiene 1 dígito', () => {
    // toLocaleString('es-ES') devuelve "5314" aquí (bug CLDR); nuestro helper no.
    expect(fmtNum(5314)).toBe('5.314');
    expect(fmtNum(999)).toBe('999');
  });

  it('sin decimales si no los tiene (43, no 43,0)', () => {
    expect(fmtNum(43)).toBe('43');
  });

  it('parsea strings (PostgreSQL NUMERIC devuelve strings)', () => {
    expect(fmtNum('43.000')).toBe('43'); // 43 con 3 decimales
    expect(fmtNum('12415.5')).toBe('12.415,5');
  });

  it('devuelve — para null/undefined/NaN', () => {
    expect(fmtNum(null)).toBe('—');
    expect(fmtNum(undefined)).toBe('—');
    expect(fmtNum('abc')).toBe('—');
  });
});

describe('fmtEuro', () => {
  it('formatea con 2 decimales y coma', () => {
    expect(fmtEuro(1234.5)).toBe('1.234,50');
    expect(fmtEuro(0)).toBe('0,00');
  });

  it('parsea strings', () => {
    expect(fmtEuro('14600')).toBe('14.600,00');
  });

  it('devuelve — para null/undefined/NaN', () => {
    expect(fmtEuro(null)).toBe('—');
    expect(fmtEuro(undefined)).toBe('—');
  });
});