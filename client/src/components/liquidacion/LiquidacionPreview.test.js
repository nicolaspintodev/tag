import { describe, it, expect } from 'vitest';
import { buildPreviewMeta } from '../../lib/liquidacionPreview';

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
