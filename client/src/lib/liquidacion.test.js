import { describe, it, expect } from 'vitest';
import {
  computeSelectionSubtotal,
  computeTotals,
  deriveMontos,
  deriveMontosSeleccion,
  ivaFromMonto,
  montoBaseViaje,
  montoLabel,
  montoViaje,
  tipoLabel,
  toNumber,
} from './liquidacion';

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

  it('usa costo_viaje para liquidaciones de chofer', () => {
    const viajes = [
      { id: 1, costo_viaje: '80000.00', precio_pactado: '170000.00' },
      { id: 2, costo_viaje: 50000, precio_pactado: '170000.00' },
    ];

    expect(deriveMontos(viajes, 'chofer')).toEqual({
      1: { monto: 80000, iva_monto: 16800, monto_final: 96800 },
      2: { monto: 50000, iva_monto: 10500, monto_final: 60500 },
    });
  });

  it('usa costo_proveedor ajustado para liquidaciones de proveedor', () => {
    const viajes = [
      {
        id: 3,
        costo_proveedor: 70000,
        costo_proveedor_ajustado: '65000.00',
        precio_pactado: '170000.00',
      },
      { id: 4, costo_proveedor: '40000.00', precio_pactado: '170000.00' },
    ];

    expect(deriveMontos(viajes, 'proveedor')).toEqual({
      3: { monto: 65000, iva_monto: 13650, monto_final: 78650 },
      4: { monto: 40000, iva_monto: 8400, monto_final: 48400 },
    });
  });
});

describe('deriveMontosSeleccion', () => {
  it('deriva montos de chofer solo para los viajes seleccionados', () => {
    const viajes = [
      { id: 1, costo_viaje: '80000.00', precio_pactado: '170000.00' },
      { id: 2, costo_viaje: 50000, precio_pactado: '170000.00' },
      { id: 3, costo_viaje: 30000, precio_pactado: '170000.00' },
    ];

    expect(deriveMontosSeleccion(viajes, [1, 3], 'chofer')).toEqual({
      1: { monto: 80000, iva_monto: 16800, monto_final: 96800 },
      3: { monto: 30000, iva_monto: 6300, monto_final: 36300 },
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

  it('suma costo_viaje + IVA para chofer, ignorando precio_pactado', () => {
    const viajes = [
      { id: 1, costo_viaje: '80000.00', precio_pactado: '170000.00' },
      { id: 2, costo_viaje: 50000, precio_pactado: '170000.00' },
    ];

    expect(computeTotals(viajes, 'chofer')).toEqual({
      subtotal: 130000,
      ivaTotal: 27300,
      total: 157300,
    });
  });

  it('respeta montos guardados con monto_final en cero', () => {
    const viajes = [{ id: 1, costo_viaje: 80000, precio_pactado: 170000 }];
    const montos = { 1: { monto: 0, iva_monto: 0, monto_final: 0 } };

    expect(computeTotals(viajes, 'chofer', montos)).toEqual({
      subtotal: 0,
      ivaTotal: 0,
      total: 0,
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

  it('suma costo_viaje + IVA para chofer con montos derivados', () => {
    const viajes = [
      { id: 1, costo_viaje: '80000.00', precio_pactado: '170000.00' },
      { id: 2, costo_viaje: 50000, precio_pactado: '170000.00' },
    ];

    expect(computeSelectionSubtotal(viajes, 'chofer')).toBe(157300);
  });

  it('usa montos guardados de chofer en lugar de precio_pactado', () => {
    const viajes = [{ id: 1, costo_viaje: 80000, precio_pactado: 170000 }];
    const montos = { 1: { monto: 90000, iva_monto: 18900, monto_final: 108900 } };

    expect(computeSelectionSubtotal(viajes, 'chofer', montos)).toBe(108900);
  });
});

describe('montoBaseViaje y etiquetas', () => {
  it('usa costo_viaje y etiqueta Costo para chofer', () => {
    const viaje = { costo_viaje: '80000.00', precio_pactado: '170000.00' };

    expect(montoBaseViaje(viaje, 'chofer')).toBe(80000);
    expect(montoLabel('chofer')).toBe('Costo');
    expect(tipoLabel('chofer')).toBe('Chofer');
  });

  it('usa precio_pactado y etiqueta Precio para cliente', () => {
    const viaje = { costo_viaje: '80000.00', precio_pactado: '170000.00' };

    expect(montoBaseViaje(viaje, 'cliente')).toBe(170000);
    expect(montoLabel('cliente')).toBe('Precio');
    expect(tipoLabel('cliente')).toBe('Cliente');
  });

  it('mantiene costo ajustado de proveedor', () => {
    const viaje = {
      costo_proveedor: 70000,
      costo_proveedor_ajustado: '65000.00',
      precio_pactado: '170000.00',
    };

    expect(montoBaseViaje(viaje, 'proveedor')).toBe(65000);
    expect(montoLabel('proveedor')).toBe('Costo Proveedor');
    expect(tipoLabel('proveedor')).toBe('Proveedor');
  });
});

describe('montoViaje', () => {
  const viaje = { id: 1, costo_viaje: '80000.00', precio_pactado: '170000.00' };

  it('deriva IVA 21% desde costo_viaje para chofer', () => {
    expect(montoViaje(viaje, 'chofer')).toEqual({
      monto: 80000,
      iva_monto: 16800,
      monto_final: 96800,
    });
  });

  it('prefiere montos guardados cuando existen', () => {
    const montos = { 1: { monto: '90000.00', iva_monto: '18900.00', monto_final: '108900.00' } };

    expect(montoViaje(viaje, 'chofer', montos)).toEqual({
      monto: 90000,
      iva_monto: 18900,
      monto_final: 108900,
    });
  });
});

describe('ivaFromMonto', () => {
  it('deriva IVA 21% redondeado al entero más cercano', () => {
    expect(ivaFromMonto('1000.00')).toBe(210);
    expect(ivaFromMonto(1002.38)).toBe(210);
    expect(ivaFromMonto(1002.39)).toBe(211);
    expect(ivaFromMonto('abc')).toBe(0);
  });
});
