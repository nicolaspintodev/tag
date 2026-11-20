export const IVA_DEFAULT = 0.21;

export function deriveMontos(viajes) {
  return viajes.reduce((acc, v) => {
    const precio = v.precio_pactado ?? 0;
    const iva = Math.round(precio * IVA_DEFAULT);
    acc[v.id] = { monto: precio, iva_monto: iva, monto_final: precio + iva };
    return acc;
  }, {});
}

export function computeTotals(viajes) {
  const subtotal = viajes.reduce((s, v) => s + (v.precio_pactado ?? 0), 0);
  const ivaTotal = viajes.reduce((s, v) => s + Math.round((v.precio_pactado ?? 0) * IVA_DEFAULT), 0);
  return { subtotal, ivaTotal, total: subtotal + ivaTotal };
}