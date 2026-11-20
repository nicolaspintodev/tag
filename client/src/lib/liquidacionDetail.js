import { toNumber } from './liquidacion';

export const toDetailDraft = (liquidacion) => ({
  id: liquidacion.id,
  numero: liquidacion.numero,
  tipo: liquidacion.tipo,
  entidad: liquidacion.tipo === 'cliente' ? liquidacion.cliente : liquidacion.proveedor,
  fecha_emision: liquidacion.fecha_emision,
  notas: liquidacion.notas ?? '',
  estado: liquidacion.estado,
  viajes: (liquidacion.viajes ?? []).map((viaje) => ({
    viaje_id: viaje.id,
    codigo_viaje: viaje.codigo_viaje ?? '-',
    fecha_salida: viaje.fecha_salida,
    origen: viaje.origen,
    destino: viaje.destino,
    estado: viaje.estado,
    monto: toNumber(viaje.pivot?.monto ?? viaje.precio_pactado),
    iva_monto: toNumber(viaje.pivot?.iva_monto),
  })),
});

export const normalizeDraft = (draft) => JSON.stringify({
  fecha_emision: draft.fecha_emision ?? '',
  notas: draft.notas ?? '',
  viajes: [...(draft.viajes ?? [])]
    .sort((a, b) => a.viaje_id - b.viaje_id)
    .map((viaje) => ({
      viaje_id: viaje.viaje_id,
      monto: toNumber(viaje.monto),
      iva_monto: toNumber(viaje.iva_monto),
    })),
});

const roundMoney = (value) => Math.round((value + Number.EPSILON) * 100) / 100;

export const computeDetailTotals = (viajes) => {
  const items = (viajes ?? []).map((viaje) => ({
    monto: toNumber(viaje.monto),
    iva_monto: toNumber(viaje.iva_monto),
  }));
  const subtotalNeto = roundMoney(items.reduce((sum, viaje) => sum + viaje.monto, 0));
  const ivaTotal = roundMoney(items.reduce((sum, viaje) => sum + viaje.iva_monto, 0));
  return {
    subtotalNeto,
    ivaTotal,
    totalGuardado: subtotalNeto,
    totalPagar: roundMoney(subtotalNeto + ivaTotal),
  };
};

export const buildDetailPayload = (draft, { estado } = {}) => {
  const payload = {
    fecha_emision: draft.fecha_emision,
    notas: draft.notas ?? '',
    viajes: (draft.viajes ?? []).map((viaje) => ({
      viaje_id: viaje.viaje_id,
      monto: toNumber(viaje.monto),
      iva_monto: toNumber(viaje.iva_monto),
    })),
  };
  if (estado) payload.estado = estado;
  return payload;
};
