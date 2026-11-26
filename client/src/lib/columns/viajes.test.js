import { describe, expect, it } from 'vitest';
import { buildViajeProcesosView, buildViajesDetailFields, buildViajesGridColumns } from './viajes';

describe('buildViajeProcesosView', () => {
  it('arma procesos con flags, documentos y proveedor', () => {
    const row = {
      proveedor_id: 7,
      proveedor: { razon_social: 'Proveedor Test' },
      liquidado_cliente: true,
      liquidado_proveedor: false,
      liquidado_chofer: true,
      facturado: true,
      liquidado: true,
      liquidaciones: [
        { tipo: 'cliente', numero: 'LIQ-C-0001', factura: { numero: 'FACT-0001' } },
        { tipo: 'chofer', numero: 'LIQ-CH-0001', factura: null },
      ],
    };

    expect(buildViajeProcesosView(row)).toEqual([
      { proceso: 'Cliente Liquidado', completo: true, documento: 'LIQ-C-0001' },
      { proceso: 'Proveedor Liquidado', completo: false, documento: '—' },
      { proceso: 'Chofer Liquidado', completo: true, documento: 'LIQ-CH-0001' },
      { proceso: 'Facturado', completo: true, documento: 'FACT-0001' },
    ]);
  });

  it('omite proveedor cuando no hay proveedor_id ni relacion', () => {
    const procesos = buildViajeProcesosView({
      proveedor_id: null,
      proveedor: null,
      liquidado_cliente: false,
      liquidado_chofer: false,
      facturado: false,
      liquidaciones: [],
    });

    expect(procesos.map(proceso => proceso.proceso)).toEqual([
      'Cliente Liquidado',
      'Chofer Liquidado',
      'Facturado',
    ]);
  });

  it('no usa el agregado legacy para pintar', () => {
    const procesos = buildViajeProcesosView({
      liquidado: true,
      liquidado_cliente: false,
      liquidado_chofer: false,
      facturado: false,
      liquidaciones: [{ tipo: 'cliente', numero: 'LIQ-C-0002' }],
    });

    expect(procesos[0]).toEqual({
      proceso: 'Cliente Liquidado',
      completo: false,
      documento: 'LIQ-C-0002',
    });
  });

  it('usa guion cuando no hay documento', () => {
    const procesos = buildViajeProcesosView({
      liquidado_cliente: true,
      liquidado_chofer: true,
      facturado: true,
      liquidaciones: [],
    });

    expect(procesos.every(proceso => proceso.documento === '—')).toBe(true);
  });

  it('usa la factura de cliente aunque haya factura de otro tipo', () => {
    const procesos = buildViajeProcesosView({
      liquidado_cliente: true,
      liquidado_chofer: true,
      facturado: true,
      liquidaciones: [
        { tipo: 'chofer', numero: 'LIQ-CH-0009', factura: { numero: 'FACT-CH-0009' } },
        { tipo: 'cliente', numero: 'LIQ-C-0009', factura: { numero: 'FACT-C-0009' } },
      ],
    });

    expect(procesos.find(proceso => proceso.proceso === 'Facturado')).toEqual({
      proceso: 'Facturado',
      completo: true,
      documento: 'FACT-C-0009',
    });
  });
});

describe('buildViajesGridColumns estado', () => {
  it('muestra texto completo y no badges', () => {
    const column = buildViajesGridColumns().find(item => item.id === 'estado');
    const result = column.render('terminado', { facturado: true, liquidado: true });

    expect(result.props.className).toBe('estado-texto');
    expect(result.props.children).toBe('Terminado');
  });
});

describe('buildViajesDetailFields Comercial', () => {
  it('no expone checkboxes de facturado ni liquidado', () => {
    const fields = buildViajesDetailFields([], [], [], []);

    expect(fields.some(field => field.id === 'facturado')).toBe(false);
    expect(fields.some(field => field.id === 'liquidado')).toBe(false);
  });
});
