import { tipoLabel, toNumber } from './liquidacion';

export const entidadNombre = (entidad, tipo) => {
  if (tipo === 'chofer' && (entidad?.nombre || entidad?.apellido)) {
    return [entidad?.nombre, entidad?.apellido].filter(Boolean).join(' ');
  }
  return entidad?.razon_social || '-';
};

export const entidadDocumento = (entidad, tipo) => (
  tipo === 'chofer' ? (entidad?.cuil ?? entidad?.cuit) : entidad?.cuit
);

export const montoLabelVista = (tipo, vista = 'general') => {
  if (tipo === 'chofer') return 'Costo';
  if (tipo === 'cliente') return 'Precio';
  return vista === 'detalle' ? 'Monto' : 'Precio';
};

export const buildPrintView = (liquidacion = {}) => {
  const destinatario = {
    cliente: liquidacion.cliente,
    chofer: liquidacion.chofer,
    proveedor: liquidacion.proveedor,
  }[liquidacion.tipo];
  const viajes = liquidacion.viajes ?? [];
  const total = viajes.reduce(
    (sum, viaje) => sum + toNumber(viaje.pivot?.monto_final ?? viaje.pivot?.monto),
    0,
  );

  return {
    destinatario,
    destinatarioNombre: entidadNombre(destinatario, liquidacion.tipo),
    destinatarioDocumento: entidadDocumento(destinatario, liquidacion.tipo),
    labelDestinatario: tipoLabel(liquidacion.tipo),
    labelMonto: montoLabelVista(liquidacion.tipo, 'impresion'),
    total,
  };
};

export const buildListRowView = (row = {}) => {
  const destinatario = {
    cliente: row.cliente,
    chofer: row.chofer,
    proveedor: row.proveedor,
  }[row.tipo];

  return {
    destinatario,
    destinatarioNombre: entidadNombre(destinatario, row.tipo),
    labelTipo: tipoLabel(row.tipo),
  };
};

export const canPersistLiquidacion = (row = {}) => Boolean(row.id) || (
  String(row.tipo ?? '').trim() !== ''
  && String(row.cliente_id ?? row.chofer_id ?? row.proveedor_id ?? '').trim() !== ''
  && String(row.fecha_emision ?? '').trim() !== ''
);

export const buildLiquidacionGridMontosView = (row = {}) => {
  const viajes = Array.isArray(row.viajes) ? row.viajes : [];

  if (viajes.length === 0) {
    return { monto: null, montoConIva: toNumber(row.total) };
  }

  const monto = viajes.reduce(
    (sum, viaje) => sum + toNumber(viaje.pivot?.monto),
    0,
  );
  const iva = viajes.reduce(
    (sum, viaje) => sum + toNumber(viaje.pivot?.iva_monto),
    0,
  );

  return { monto, montoConIva: monto + iva };
};
