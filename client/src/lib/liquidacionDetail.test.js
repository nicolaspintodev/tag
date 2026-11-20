import { describe, expect, it } from 'vitest';
import {
  buildDetailPayload,
  computeDetailTotals,
  normalizeDraft,
  toDetailDraft,
} from './liquidacionDetail';

const liquidacion = {
  id: 9,
  numero: 'LIQ-C-0001',
  tipo: 'cliente',
  cliente: { razon_social: 'Cliente Test', cuit: '30-11111111-1', condicion_iva: 'responsable_inscripto' },
  proveedor: null,
  fecha_emision: '2026-11-20',
  notas: 'Notas originales',
  estado: 'borrador',
  total: '1000.00',
  viajes: [
    {
      id: 12,
      codigo_viaje: 'V-1',
      fecha_salida: '2026-11-10',
      origen: 'CABA',
      destino: 'Rosario',
      estado: 'terminado',
      precio_pactado: '1000.00',
      pivot: { monto: '1000.00', iva_monto: '210.00' },
    },
  ],
};

describe('toDetailDraft', () => {
  it('adapta la respuesta show al borrador editable', () => {
    expect(toDetailDraft(liquidacion)).toEqual({
      id: 9,
      numero: 'LIQ-C-0001',
      tipo: 'cliente',
      entidad: { razon_social: 'Cliente Test', cuit: '30-11111111-1', condicion_iva: 'responsable_inscripto' },
      fecha_emision: '2026-11-20',
      notas: 'Notas originales',
      estado: 'borrador',
      viajes: [
        {
          viaje_id: 12,
          codigo_viaje: 'V-1',
          fecha_salida: '2026-11-10',
          origen: 'CABA',
          destino: 'Rosario',
          estado: 'terminado',
          monto: 1000,
          iva_monto: 210,
        },
      ],
    });
  });
});

describe('computeDetailTotals', () => {
  it('calcula neto, IVA y total a pagar con strings numéricos', () => {
    expect(computeDetailTotals([
      { monto: '1000.00', iva_monto: '210.00' },
      { monto: '500.50', iva_monto: '105.11' },
    ])).toEqual({
      subtotalNeto: 1500.5,
      ivaTotal: 315.11,
      totalGuardado: 1500.5,
      totalPagar: 1815.61,
    });
  });
});

describe('normalizeDraft', () => {
  it('ignora el orden de viajes y produce una comparación estable', () => {
    const a = { fecha_emision: '2026-11-20', notas: '', viajes: [{ viaje_id: 2, monto: 10, iva_monto: 1 }, { viaje_id: 1, monto: 20, iva_monto: 2 }] };
    const b = { fecha_emision: '2026-11-20', notas: '', viajes: [{ viaje_id: 1, monto: 20, iva_monto: 2 }, { viaje_id: 2, monto: 10, iva_monto: 1 }] };
    expect(normalizeDraft(a)).toBe(normalizeDraft(b));
  });
});

describe('buildDetailPayload', () => {
  it('omite estado en guardado normal', () => {
    const draft = toDetailDraft(liquidacion);
    expect(buildDetailPayload(draft)).toEqual({
      fecha_emision: '2026-11-20',
      notas: 'Notas originales',
      viajes: [{ viaje_id: 12, monto: 1000, iva_monto: 210 }],
    });
  });

  it('incluye estado pendiente en la transición', () => {
    const draft = toDetailDraft(liquidacion);
    expect(buildDetailPayload(draft, { estado: 'pendiente' }).estado).toBe('pendiente');
  });
});
