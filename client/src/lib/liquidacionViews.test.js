import { describe, it, expect } from 'vitest';
import {
  buildListRowView,
  buildPrintView,
  canPersistLiquidacion,
  entidadDocumento,
  entidadNombre,
  montoLabelVista,
} from './liquidacionViews';

describe('entidadNombre y entidadDocumento', () => {
  it('usa nombre/apellido y cuil para chofer', () => {
    const chofer = { nombre: 'Juan', apellido: 'Perez', cuil: '20-12345678-9' };

    expect(entidadNombre(chofer, 'chofer')).toBe('Juan Perez');
    expect(entidadDocumento(chofer, 'chofer')).toBe('20-12345678-9');
  });

  it('acepta chofer normalizado por el picker con razon_social y cuit', () => {
    const chofer = { razon_social: 'Juan Perez', cuit: '20-12345678-9' };

    expect(entidadNombre(chofer, 'chofer')).toBe('Juan Perez');
    expect(entidadDocumento(chofer, 'chofer')).toBe('20-12345678-9');
  });

  it('usa razon_social y cuit para cliente y proveedor', () => {
    const entidad = { razon_social: 'Empresa Test', cuit: '30-12345678-9' };

    expect(entidadNombre(entidad, 'cliente')).toBe('Empresa Test');
    expect(entidadDocumento(entidad, 'proveedor')).toBe('30-12345678-9');
  });
});

describe('montoLabelVista', () => {
  it('usa Costo para chofer en todas las vistas', () => {
    expect(montoLabelVista('chofer', 'preview')).toBe('Costo');
    expect(montoLabelVista('chofer', 'detalle')).toBe('Costo');
  });

  it('mantiene Precio para proveedor en las vistas originales', () => {
    expect(montoLabelVista('proveedor', 'preview')).toBe('Precio');
    expect(montoLabelVista('proveedor', 'picker')).toBe('Precio');
    expect(montoLabelVista('proveedor', 'impresion')).toBe('Precio');
    expect(montoLabelVista('proveedor', 'detalle')).toBe('Monto');
  });
});

describe('buildPrintView', () => {
  const chofer = { nombre: 'Juan', apellido: 'Perez', cuil: '20-12345678-9' };
  const liquidacion = {
    tipo: 'chofer',
    chofer,
    cliente: null,
    proveedor: null,
    estado: 'borrador',
    viajes: [{ pivot: { monto: 80000, iva_monto: 16800, monto_final: 96800 } }],
  };

  it('usa chofer, etiqueta Chofer/Costo y monto_final del pivot', () => {
    expect(buildPrintView(liquidacion)).toEqual({
      destinatario: chofer,
      destinatarioNombre: 'Juan Perez',
      destinatarioDocumento: '20-12345678-9',
      labelDestinatario: 'Chofer',
      labelMonto: 'Costo',
      total: 96800,
    });
  });

  it('cae a pivot.monto cuando no hay monto_final', () => {
    const view = buildPrintView({
      ...liquidacion,
      viajes: [{ pivot: { monto: '80000.00', iva_monto: '16800.00' } }],
    });

    expect(view.total).toBe(80000);
  });
});

describe('buildListRowView', () => {
  it('usa chofer como destinatario y etiqueta Chofer', () => {
    const row = {
      tipo: 'chofer',
      chofer: { nombre: 'Juan', apellido: 'Perez', cuil: '20-12345678-9' },
      cliente: null,
      proveedor: null,
    };

    expect(buildListRowView(row)).toEqual({
      destinatario: row.chofer,
      destinatarioNombre: 'Juan Perez',
      labelTipo: 'Chofer',
    });
  });
});

describe('canPersistLiquidacion', () => {
  it('acepta chofer_id en la fila nueva', () => {
    expect(canPersistLiquidacion({
      tipo: 'chofer',
      chofer_id: 3,
      fecha_emision: '2026-11-21',
    })).toBe(true);
  });

  it('rechaza chofer sin fecha de emisión', () => {
    expect(canPersistLiquidacion({
      tipo: 'chofer',
      chofer_id: 3,
      fecha_emision: '',
    })).toBe(false);
  });
});
