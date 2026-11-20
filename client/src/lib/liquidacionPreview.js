import { CONDICION_IVA_LABELS } from './columns/clientes';

export const formatCuit = (value) => {
  const digits = String(value ?? '').replace(/\D/g, '');
  if (!digits) return '-';
  if (digits.length <= 2) return digits;
  if (digits.length <= 10) return `${digits.slice(0, 2)}-${digits.slice(2)}`;
  return `${digits.slice(0, 2)}-${digits.slice(2, 10)}-${digits.slice(10, 11)}`;
};

export const buildPreviewMeta = ({ tipo, cliente, proveedor, fecha_emision }) => {
  const destinatario = tipo === 'cliente' ? cliente : proveedor;
  const condicionIva = destinatario?.condicion_iva;
  const condicionIvaLabel = condicionIva
    ? CONDICION_IVA_LABELS[condicionIva] ?? 'Sin condición IVA'
    : 'Sin condición IVA';

  return [
    { label: 'Tipo', value: tipo === 'cliente' ? 'Cliente' : 'Proveedor' },
    { label: 'Nombre legal', value: destinatario?.razon_social || '-' },
    { label: 'CUIT', value: formatCuit(destinatario?.cuit) },
    { label: 'Condición IVA', value: condicionIvaLabel },
    { label: 'Fecha emisión', value: fecha_emision },
  ];
};
