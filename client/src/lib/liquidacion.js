export const IVA_DEFAULT = 0.21;

export const toNumber = (value) => Number(value ?? 0) || 0;

export const ivaFromMonto = (monto) => Math.round(toNumber(monto) * IVA_DEFAULT);

export function montoBaseViaje(viaje, tipo = 'cliente') {
  if (tipo === 'chofer') return toNumber(viaje?.costo_viaje);
  if (tipo === 'proveedor') return toNumber(viaje?.costo_proveedor_ajustado ?? viaje?.costo_proveedor);
  return toNumber(viaje?.precio_pactado);
}

export function montoLabel(tipo = 'cliente') {
  if (tipo === 'chofer') return 'Costo';
  if (tipo === 'proveedor') return 'Costo Proveedor';
  return 'Precio';
}

export function tipoLabel(tipo = 'cliente') {
  if (tipo === 'chofer') return 'Chofer';
  if (tipo === 'cliente') return 'Cliente';
  return 'Proveedor';
}

const calcularMontos = (viaje, tipo) => {
  const monto = montoBaseViaje(viaje, tipo);
  const iva_monto = ivaFromMonto(monto);
  return { monto, iva_monto, monto_final: monto + iva_monto };
};

export function montoViaje(viaje, tipo = 'cliente', montos = {}) {
  const calculado = calcularMontos(viaje, tipo);
  const guardado = montos?.[viaje?.id];

  if (!guardado || typeof guardado !== 'object') {
    return {
      ...calculado,
      monto_final: toNumber(viaje?.monto_final ?? calculado.monto_final),
    };
  }

  return {
    monto: toNumber(guardado.monto),
    iva_monto: toNumber(guardado.iva_monto),
    monto_final: toNumber(
      guardado.monto_final ?? toNumber(guardado.monto) + toNumber(guardado.iva_monto),
    ),
  };
}

export function deriveMontos(viajes, tipo = 'cliente') {
  return viajes.reduce((acc, v) => {
    acc[v.id] = calcularMontos(v, tipo);
    return acc;
  }, {});
}

export function deriveMontosSeleccion(viajes, ids, tipo) {
  return deriveMontos(viajes.filter(v => ids.includes(v.id)), tipo);
}

export function computeTotals(viajes, tipo = 'cliente', montos = {}) {
  const items = viajes.map(viaje => montoViaje(viaje, tipo, montos));
  const subtotal = items.reduce((sum, item) => sum + item.monto, 0);
  const ivaTotal = items.reduce((sum, item) => sum + item.iva_monto, 0);
  const total = items.reduce((sum, item) => sum + item.monto_final, 0);
  return { subtotal, ivaTotal, total };
}

export function computeSelectionSubtotal(viajes, tipo = 'cliente', montos = {}) {
  return viajes.reduce(
    (sum, viaje) => sum + montoViaje(viaje, tipo, montos).monto_final,
    0,
  );
}
