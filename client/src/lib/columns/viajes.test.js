import { describe, expect, it } from 'vitest';
import {
  buildViajeProcessFilterParams,
  buildViajeProcesosView,
  buildViajesDetailFields,
  buildViajesGridColumns,
} from './viajes';

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
  it('muestra badge con color y texto completo', () => {
    const column = buildViajesGridColumns().find(item => item.id === 'estado');

    expect(column.render('planificado', {}).props).toMatchObject({
      className: 'estado-badge estado-badge-planificado',
      children: 'Planificado',
    });
    expect(column.render('iniciado', {}).props).toMatchObject({
      className: 'estado-badge estado-badge-iniciado',
      children: 'Iniciado',
    });
    expect(column.render('terminado', {}).props).toMatchObject({
      className: 'estado-badge estado-badge-terminado',
      children: 'Terminado',
    });
  });

  it('muestra badge neutral y guion para estado desconocido', () => {
    const column = buildViajesGridColumns().find(item => item.id === 'estado');

    expect(column.render('', {}).props).toMatchObject({
      className: 'estado-badge',
      children: '-',
    });
  });
});

describe('buildViajeProcessFilterParams', () => {
  it('devuelve objeto vacío cuando no hay filtros', () => {
    expect(buildViajeProcessFilterParams({})).toEqual({});
    expect(buildViajeProcessFilterParams({
      liquidado_cliente: false,
      liquidado_chofer: false,
      liquidado_proveedor: false,
      facturado: false,
    })).toEqual({});
  });

  it('incluye solamente los filtros marcados', () => {
    expect(buildViajeProcessFilterParams({
      liquidado_cliente: true,
      liquidado_chofer: false,
      liquidado_proveedor: false,
      facturado: true,
    })).toEqual({
      liquidado_cliente: 'true',
      facturado: 'true',
    });
  });

  it('combina los cuatro filtros', () => {
    expect(buildViajeProcessFilterParams({
      liquidado_cliente: true,
      liquidado_chofer: true,
      liquidado_proveedor: true,
      facturado: true,
    })).toEqual({
      liquidado_cliente: 'true',
      liquidado_chofer: 'true',
      liquidado_proveedor: 'true',
      facturado: 'true',
    });
  });
});

describe('buildViajesDetailFields Comercial', () => {
  it('no expone checkboxes de facturado ni liquidado', () => {
    const fields = buildViajesDetailFields([], [], [], []);

    expect(fields.some(field => field.id === 'facturado')).toBe(false);
    expect(fields.some(field => field.id === 'liquidado')).toBe(false);
  });
});
