import { CONDICION_IVA_LABELS } from './columns/clientes';
import { montoBaseViaje, montoViaje, tipoLabel, computeTotals } from './liquidacion';
import { entidadDocumento, entidadNombre, montoLabelVista } from './liquidacionViews';

export const formatCuit = (value) => {
  const digits = String(value ?? '').replace(/\D/g, '');
  if (!digits) return '-';
  if (digits.length <= 2) return digits;
  if (digits.length <= 10) return `${digits.slice(0, 2)}-${digits.slice(2)}`;
  return `${digits.slice(0, 2)}-${digits.slice(2, 10)}-${digits.slice(10, 11)}`;
};

export const buildPreviewMeta = ({ tipo, cliente, proveedor, chofer, fecha_emision }) => {
  let destinatario;
  if (tipo === 'cliente') destinatario = cliente;
  else if (tipo === 'chofer') destinatario = chofer;
  else destinatario = proveedor;

  const condicionIva = destinatario?.condicion_iva;
  const condicionIvaLabel = condicionIva
    ? CONDICION_IVA_LABELS[condicionIva] ?? 'Sin condición IVA'
    : 'Sin condición IVA';

  return [
    { label: 'Tipo', value: tipoLabel(tipo) },
    { label: 'Nombre legal', value: entidadNombre(destinatario, tipo) },
    { label: 'CUIT', value: formatCuit(entidadDocumento(destinatario, tipo)) },
    { label: 'Condición IVA', value: condicionIvaLabel },
    { label: 'Fecha emisión', value: fecha_emision },
  ];
};

export const buildPreviewView = (data = {}) => {
  const { tipo, viaje_ids = [], viajesData = [], montos = {} } = data;
  const selectedViajes = viaje_ids
    .map(id => viajesData.find(viaje => viaje.id === id))
    .filter(Boolean);
  const rows = selectedViajes.map(viaje => ({
    viaje,
    ...montoViaje(viaje, tipo, montos),
  }));

  return {
    meta: buildPreviewMeta(data),
    amountLabel: montoLabelVista(tipo, 'preview'),
    rows,
    totals: computeTotals(selectedViajes, tipo, montos),
    hasWarnings: selectedViajes.some(viaje => montoBaseViaje(viaje, tipo) < 0),
  };
};
