import { describe, it, expect } from 'vitest';
import { buildPreviewMeta, buildPreviewView } from '../../lib/liquidacionPreview';
import { montoLabel, tipoLabel } from '../../lib/liquidacion';

describe('buildPreviewMeta', () => {
  it('omite el número y explicita la condición IVA faltante', () => {
    const meta = buildPreviewMeta({
      tipo: 'cliente',
      cliente: {
        id: 2,
        razon_social: 'Distribuidora Norte',
        cuit: '30-22222222-5',
        condicion_iva: null,
      },
      fecha_emision: '2026-11-20',
    });

    expect(meta).toEqual([
      { label: 'Tipo', value: 'Cliente' },
      { label: 'Nombre legal', value: 'Distribuidora Norte' },
      { label: 'CUIT', value: '30-22222222-5' },
      { label: 'Condición IVA', value: 'Sin condición IVA' },
      { label: 'Fecha emisión', value: '2026-11-20' },
    ]);
  });

  it('muestra la etiqueta legible de condición IVA conocida', () => {
    const meta = buildPreviewMeta({
      tipo: 'cliente',
      cliente: {
        id: 3,
        razon_social: 'Tabacalera del Norte SA',
        cuit: '30-50000123-9',
        condicion_iva: 'responsable_inscripto',
      },
      fecha_emision: '2026-11-20',
    });

    expect(meta.find(item => item.label === 'Condición IVA')).toEqual({
      label: 'Condición IVA',
      value: 'Responsable Inscripto',
    });
  });
});

describe('buildPreviewView', () => {
  const data = {
    tipo: 'chofer',
    chofer: {
      id: 3,
      nombre: 'Chofer',
      apellido: 'Test',
      cuil: '20-33333333-4',
      condicion_iva: 'responsable_inscripto',
    },
    fecha_emision: '2026-11-21',
    viaje_ids: [1],
    viajesData: [
      { id: 1, codigo_viaje: 'V-1', costo_viaje: '80000.00', precio_pactado: '170000.00' },
    ],
    montos: {},
  };

  it('usa costo_viaje, etiqueta Costo e IVA 21% para chofer', () => {
    const view = buildPreviewView(data);

    expect(view.amountLabel).toBe('Costo');
    expect(view.meta.find(item => item.label === 'Nombre legal')?.value).toBe('Chofer Test');
    expect(view.meta.find(item => item.label === 'CUIT')?.value).toBe('20-33333333-4');
    expect(view.rows).toEqual([
      {
        viaje: data.viajesData[0],
        monto: 80000,
        iva_monto: 16800,
        monto_final: 96800,
      },
    ]);
    expect(view.totals).toEqual({
      subtotal: 80000,
      ivaTotal: 16800,
      total: 96800,
    });
    expect(view.meta).toEqual(buildPreviewMeta(data));
    expect(view.hasWarnings).toBe(false);
  });

  it('respeta montos guardados en la vista previa', () => {
    const view = buildPreviewView({
      ...data,
      montos: { 1: { monto: 90000, iva_monto: 18900, monto_final: 108900 } },
    });

    expect(view.rows[0]).toMatchObject({
      monto: 90000,
      iva_monto: 18900,
      monto_final: 108900,
    });
    expect(view.totals.total).toBe(108900);
  });

  it('marca warning por costo negativo, no por precio', () => {
    const view = buildPreviewView({
      ...data,
      viajesData: [
        { id: 1, codigo_viaje: 'V-1', costo_viaje: -1, precio_pactado: 170000 },
      ],
    });

    expect(view.hasWarnings).toBe(true);
  });

  it('mantiene precio_pactado y etiqueta Precio para cliente', () => {
    const view = buildPreviewView({
      ...data,
      tipo: 'cliente',
      cliente: data.chofer,
      viajesData: [
        { id: 1, codigo_viaje: 'V-1', costo_viaje: 80000, precio_pactado: '170000.00' },
      ],
    });

    expect(view.amountLabel).toBe('Precio');
    expect(view.rows[0].monto).toBe(170000);
    expect(view.totals.total).toBe(205700);
  });
});

describe('etiquetas compartidas de liquidación', () => {
  it('muestra Costo/Chofer para chofer y Precio/Cliente para cliente', () => {
    expect(montoLabel('chofer')).toBe('Costo');
    expect(tipoLabel('chofer')).toBe('Chofer');
    expect(montoLabel('cliente')).toBe('Precio');
    expect(tipoLabel('cliente')).toBe('Cliente');
  });
});
