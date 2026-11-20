export const IVA_DEFAULT = 0.21;

export const toNumber = (value) => Number(value ?? 0) || 0;

export function deriveMontos(viajes) {
  return viajes.reduce((acc, v) => {
    const precio = toNumber(v.precio_pactado);
    const iva = Math.round(precio * IVA_DEFAULT);
    acc[v.id] = { monto: precio, iva_monto: iva, monto_final: precio + iva };
    return acc;
  }, {});
}

export function computeTotals(viajes) {
  const subtotal = viajes.reduce((s, v) => s + toNumber(v.precio_pactado), 0);
  const ivaTotal = viajes.reduce((s, v) => s + Math.round(toNumber(v.precio_pactado) * IVA_DEFAULT), 0);
  return { subtotal, ivaTotal, total: subtotal + ivaTotal };
}

export function computeSelectionSubtotal(viajes) {
  return viajes.reduce((s, v) => {
    const precio = toNumber(v.precio_pactado);
    const montoFinal = toNumber(v.monto_final ?? precio + Math.round(precio * IVA_DEFAULT));
    return s + montoFinal;
  }, 0);
}
