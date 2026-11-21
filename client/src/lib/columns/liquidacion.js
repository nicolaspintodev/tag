import React from 'react';

const dateRender = (v) => {
  if (!v) return '-';
  const date = new Date(v);
  return date.toLocaleDateString('es-AR');
};

const precioRender = (v) => {
  if (!v && v !== 0) return '-';
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(v);
};

const origenDestinoRender = (v, row) => {
  const o = row.origen || '-';
  const d = row.destino || '-';
  return `${o} → ${d}`;
};

const ESTADO_TONE = {
  planificado: 'warning',
  iniciado: 'info',
  terminado: 'success',
};

const estadoRender = (v) => {
  if (!v) return '-';
  const label = String(v).charAt(0).toUpperCase() + String(v).slice(1);
  return React.createElement('span', { className: `badge ${ESTADO_TONE[v] || ''}`.trim() }, label);
};

export const buildSelectionGridColumns = (tipo = 'cliente') => {
  let priceAccessor = 'precio_pactado';
  let priceHeader = 'Precio';
  if (tipo === 'chofer') {
    priceAccessor = 'costo_viaje';
    priceHeader = 'Costo Viaje';
  } else if (tipo === 'proveedor') {
    priceAccessor = 'costo_proveedor';
    priceHeader = 'Costo Proveedor';
  }

  return [
    { id: 'select', accessor: 'select', header: '', type: 'checkbox', width: '44px', className: 'checkbox-col' },
    { id: 'estado', accessor: 'estado', header: 'Estado', type: 'text', width: '130px', render: estadoRender, sortable: true },
    { id: 'codigo_viaje', accessor: 'codigo_viaje', header: 'Código', type: 'text', width: '110px', className: 'mono', sortable: true },
    { id: 'fecha_salida', accessor: 'fecha_salida', header: 'Fecha Salida', type: 'date', width: '120px', className: 'mono', render: dateRender, sortable: true },
    { id: 'origen_destino', accessor: 'origen_destino', header: 'Origen → Destino', type: 'text', width: '250px', className: 'truncate', render: origenDestinoRender, sortable: true },
    { id: 'peso_carga', accessor: 'peso_carga', header: 'Peso (kg)', type: 'number', width: '100px', className: 'mono', render: (v) => v ? new Intl.NumberFormat('es-AR').format(v) : '-', sortable: true },
    { id: priceAccessor, accessor: priceAccessor, header: priceHeader, type: 'currency', width: '130px', className: 'mono', render: precioRender, sortable: true },
    { id: 'iva_monto', accessor: 'iva_monto', header: 'IVA $', type: 'currency', width: '120px', className: 'mono', render: precioRender },
    { id: 'monto_final', accessor: 'monto_final', header: 'Subtotal', type: 'currency', width: '140px', className: 'mono', render: precioRender },
  ];
};

export const buildMontosGridColumns = () => [
  { id: 'codigo_viaje', accessor: 'codigo_viaje', header: 'Código', type: 'text', width: '110px', className: 'mono' },
  { id: 'precio_sugerido', accessor: 'precio_sugerido', header: 'Precio Sugerido', type: 'currency', width: '140px', className: 'mono readonly', render: precioRender },
  { id: 'iva_monto', accessor: 'iva_monto', header: 'IVA $', type: 'currency', width: '120px', className: 'mono', editable: true, render: precioRender },
  { id: 'monto_final', accessor: 'monto_final', header: 'Monto Final', type: 'currency', width: '140px', className: 'mono', editable: true, render: precioRender },
  { id: 'peso_carga', accessor: 'peso_carga', header: 'Peso (kg)', type: 'number', width: '100px', className: 'mono', render: (v) => v ? new Intl.NumberFormat('es-AR').format(v) : '-' },
];

export { dateRender, precioRender, origenDestinoRender };