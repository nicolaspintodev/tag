import { describe, it, expect } from 'vitest';
import { deriveMontos, computeTotals, computeSelectionSubtotal, toNumber } from './liquidacion';

describe('toNumber', () => {
  it('convierte strings numéricos y valores nulos', () => {
    expect(toNumber('170000.00')).toBe(170000);
    expect(toNumber(null)).toBe(0);
    expect(toNumber(undefined)).toBe(0);
    expect(toNumber('abc')).toBe(0);
  });
});

describe('deriveMontos', () => {
  it('convierte precios string a número y suma IVA', () => {
    expect(deriveMontos([{ id: 1, precio_pactado: '170000.00' }])).toEqual({
      1: { monto: 170000, iva_monto: 35700, monto_final: 205700 },
    });
  });
});

describe('computeTotals', () => {
  it('suma precios string numéricamente', () => {
    const viajes = [
      { id: 1, precio_pactado: '170000.00' },
      { id: 2, precio_pactado: '150000.00' },
    ];

    expect(computeTotals(viajes)).toEqual({
      subtotal: 320000,
      ivaTotal: 67200,
      total: 387200,
    });
  });
});

describe('computeSelectionSubtotal', () => {
  it('suma precio + IVA de cada viaje', () => {
    const viajes = [
      { id: 1, precio_pactado: 100000 },
      { id: 2, precio_pactado: 50000, monto_final: 60500 },
    ];

    expect(computeSelectionSubtotal(viajes)).toBe(181500);
  });

  it('convierte precios string y monto_final string sin concatenar', () => {
    const viajes = [
      { id: 1, precio_pactado: '170000.00', monto_final: '205700.00' },
      { id: 2, precio_pactado: '150000.00', monto_final: '181500.00' },
    ];

    expect(computeSelectionSubtotal(viajes)).toBe(387200);
  });
});
