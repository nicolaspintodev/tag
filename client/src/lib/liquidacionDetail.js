import { ivaFromMonto, montoBaseViaje, toNumber } from './liquidacion';

const fechaInputValue = (value) => String(value ?? '').slice(0, 10);

export const createDetailViaje = (viaje, tipo = 'cliente') => {
  const monto = montoBaseViaje(viaje, tipo);

  return {
    viaje_id: viaje.id,
    codigo_viaje: viaje.codigo_viaje ?? '-',
    fecha_salida: viaje.fecha_salida,
    origen: viaje.origen,
    destino: viaje.destino,
    estado: viaje.estado,
    monto,
    iva_monto: ivaFromMonto(monto),
  };
};

export const toDetailDraft = (liquidacion) => ({
  id: liquidacion.id,
  numero: liquidacion.numero,
  tipo: liquidacion.tipo,
  entidad: {
    cliente: liquidacion.cliente,
    chofer: liquidacion.chofer,
    proveedor: liquidacion.proveedor,
  }[liquidacion.tipo] ?? liquidacion.proveedor,
  fecha_emision: fechaInputValue(liquidacion.fecha_emision),
  notas: liquidacion.notas ?? '',
  estado: liquidacion.estado,
  viajes: (liquidacion.viajes ?? []).map((viaje) => {
    const monto = toNumber(viaje.pivot?.monto ?? montoBaseViaje(viaje, liquidacion.tipo));

    return {
      viaje_id: viaje.id,
      codigo_viaje: viaje.codigo_viaje ?? '-',
      fecha_salida: viaje.fecha_salida,
      origen: viaje.origen,
      destino: viaje.destino,
      estado: viaje.estado,
      monto,
      iva_monto: ivaFromMonto(monto),
    };
  }),
});

export const createDetailRequest = (open, liquidacionId) => ({
  id: liquidacionId,
  detail: null,
  draft: null,
  loading: Boolean(open && liquidacionId),
  error: '',
});

export const shouldCloseAfterSave = (estado) => estado !== 'pendiente';

export const normalizeDraft = (draft) => JSON.stringify({
  fecha_emision: draft.fecha_emision ?? '',
  notas: draft.notas ?? '',
  viajes: [...(draft.viajes ?? [])]
    .sort((a, b) => a.viaje_id - b.viaje_id)
    .map((viaje) => ({
      viaje_id: viaje.viaje_id,
      monto: toNumber(viaje.monto),
    })),
});

const isValidAmount = (value) => {
  if (typeof value === 'number') return Number.isFinite(value) && value >= 0;
  if (typeof value !== 'string' || value.trim() === '') return false;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0;
};

export const hasInvalidDetailAmount = (viajes = []) => viajes.some(
  (viaje) => !isValidAmount(viaje.monto),
);

const roundMoney = (value) => Math.round((value + Number.EPSILON) * 100) / 100;

export const computeDetailTotals = (viajes) => {
  const items = (viajes ?? []).map((viaje) => {
    const monto = toNumber(viaje.monto);
    return { monto, iva_monto: ivaFromMonto(monto) };
  });
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
    viajes: (draft.viajes ?? []).map((viaje) => {
      const monto = toNumber(viaje.monto);
      return {
        viaje_id: viaje.viaje_id,
        monto,
        iva_monto: ivaFromMonto(monto),
      };
    }),
  };
  if (estado) payload.estado = estado;
  return payload;
};
