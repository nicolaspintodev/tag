/* eslint-disable react-refresh/only-export-components */

const PROPIO_OPTION = { value: '', label: 'Propio' };

export const buildProveedorOptions = (proveedores = []) => [
  PROPIO_OPTION,
  ...proveedores.map((p) => ({ value: p.id, label: p.razon_social ?? `Proveedor ${p.id}` })),
];

const TIPO_OPTIONS = [
  { value: 'fija', label: 'Fija' },
];

const ESTADO_OPTIONS = [
  { value: 'planificado', label: 'Planificado' },
  { value: 'iniciado', label: 'Iniciado' },
  { value: 'terminado', label: 'Terminado' },
];

const dateRender = (v) => {
  if (!v) return '-';
  const date = new Date(v);
  return date.toLocaleDateString('es-AR');
};

const tractoraRender = (v, row) => {
  if (row.tractora) {
    const label = [row.tractora.marca, row.tractora.modelo].filter(Boolean).join(' ');
    return row.tractora.patente ? `${label} (${row.tractora.patente})` : label || '-';
  }
  return '-';
};

const choferRender = (v, row) => {
  if (row.chofer) {
    return `${row.chofer.nombre} ${row.chofer.apellido}`;
  }
  return '-';
};

const clienteRender = (v, row) => {
  if (row.cliente) {
    return row.cliente.razon_social;
  }
  return '-';
};

const ESTADO_LABELS = {
  planificado: 'Planificado',
  iniciado: 'Iniciado',
  terminado: 'Terminado',
};

const ESTADO_BADGE_CLASSES = {
  planificado: 'estado-badge estado-badge-planificado',
  iniciado: 'estado-badge estado-badge-iniciado',
  terminado: 'estado-badge estado-badge-terminado',
};

const estadoRender = (v) => (
  <span className={ESTADO_BADGE_CLASSES[v] ?? 'estado-badge'}>{ESTADO_LABELS[v] ?? (v || '-')}</span>
);

const PROCESO_FILTER_KEYS = [
  'liquidado_cliente',
  'liquidado_chofer',
  'liquidado_proveedor',
  'facturado',
];

export const buildViajeProcessFilterParams = (filters = {}) => PROCESO_FILTER_KEYS.reduce((params, key) => {
  if (filters[key]) params[key] = 'true';
  return params;
}, {});

export const buildViajesGridColumns = () => {
  return [
    { id: 'codigo_viaje', accessor: 'codigo_viaje', header: 'Código', type: 'text', width: '110px', className: 'mono' },
    { id: 'cliente_id', accessor: 'cliente_id', header: 'Cliente', type: 'text', width: '180px', render: clienteRender },
    { id: 'fecha_salida', accessor: 'fecha_salida', header: 'Fecha Salida', type: 'date', width: '120px', className: 'mono', render: dateRender },
    { id: 'chofer_id', accessor: 'chofer_id', header: 'Chofer', type: 'text', width: '180px', render: choferRender },
    { id: 'tractora_id', accessor: 'tractora_id', header: 'Vehículo', type: 'text', width: '200px', render: tractoraRender },
    { id: 'origen', accessor: 'origen', header: 'Origen', type: 'text', editable: true, width: '150px', className: 'truncate' },
    { id: 'destino', accessor: 'destino', header: 'Destino', type: 'text', editable: true, width: '150px', className: 'truncate' },
    { id: 'estado', accessor: 'estado', header: 'Estado', type: 'text', width: '140px', render: estadoRender },
  ];
};

export const buildViajesDetailFields = (choferOptions = [], clienteOptions = [], proveedorOptions = [PROPIO_OPTION], unidadOptions = []) => {
  return [
    // Operativo
    { id: 'origen', label: 'Origen', type: 'text', required: true, section: 'Operativo', colSpan: 1 },
    { id: 'destino', label: 'Destino', type: 'text', required: true, section: 'Operativo', colSpan: 1 },
    { id: 'fecha_salida', label: 'Fecha Salida', type: 'date', required: true, section: 'Operativo', colSpan: 1 },
    { id: 'fecha_llegada', label: 'Fecha Llegada', type: 'date', section: 'Operativo', colSpan: 1 },
    { id: 'cliente_id', label: 'Cliente', type: 'select', options: [{ value: '', label: 'Seleccionar...' }, ...clienteOptions], required: true, section: 'Operativo', colSpan: 1 },
    { id: 'proveedor_id', label: 'Proveedor', type: 'select', options: [{ value: '', label: 'Propio' }, ...proveedorOptions.filter(p => p.value !== '')], section: 'Operativo', colSpan: 1 },
    { id: 'chofer_id', label: 'Chofer', type: 'select', options: [{ value: '', label: 'Seleccionar...' }, ...choferOptions], required: true, section: 'Operativo', colSpan: 2 },
    { id: 'tractora_id', label: 'Tractora', type: 'select', options: [{ value: '', label: 'Seleccionar...' }, ...unidadOptions.filter(u => u.tipo === 'tractora')], required: true, section: 'Operativo', colSpan: 1 },
    { id: 'acoplado_id', label: 'Acoplado/SEM', type: 'select', options: [{ value: '', label: 'Sin acoplado' }, ...unidadOptions.filter(u => ['acoplado', 'semirremolque'].includes(u.tipo))], section: 'Operativo', colSpan: 1 },
    { id: 'peso_carga', label: 'Peso Carga (kg)', type: 'number', section: 'Operativo', colSpan: 1 },
    { id: 'estado', label: 'Estado', type: 'select', options: ESTADO_OPTIONS, section: 'Operativo', colSpan: 1 },

    // Comercial
    { id: 'precio_pactado', label: 'Precio del viaje', type: 'currency', required: true, section: 'Comercial' },
    { id: 'costo_proveedor', label: 'Costo', type: 'currency', section: 'Comercial' },
    { id: 'observaciones', label: 'Observaciones', type: 'textarea', section: 'Comercial' },
  ];
};

export { TIPO_OPTIONS, ESTADO_OPTIONS };

const LIQUIDACION_PROCESOS = [
  { tipo: 'cliente', proceso: 'Cliente Liquidado' },
  { tipo: 'proveedor', proceso: 'Proveedor Liquidado' },
  { tipo: 'chofer', proceso: 'Chofer Liquidado' },
];

const liquidacionesDelViaje = (row) => (
  Array.isArray(row?.liquidaciones) ? row.liquidaciones : []
);

const liquidacionPorProceso = (row, tipo) => (
  liquidacionesDelViaje(row).find(item => item?.tipo === tipo && item?.numero) ?? null
);

const documentoPorProceso = (row, tipo) => {
  if (tipo === 'facturado') {
    const conFactura = liquidacionesDelViaje(row).find(liquidacion => liquidacion?.tipo === 'cliente' && liquidacion?.factura?.numero);
    return conFactura?.factura?.numero ?? '—';
  }

  return liquidacionPorProceso(row, tipo)?.numero ?? '—';
};

export const buildViajeProcesosView = (row = {}) => {
  const procesos = LIQUIDACION_PROCESOS
    .filter(({ tipo }) => tipo !== 'proveedor' || Boolean(row.proveedor_id || row.proveedor))
    .map(({ tipo, proceso }) => {
      const liquidacion = liquidacionPorProceso(row, tipo);
      return {
        proceso,
        completo: Boolean(liquidacion),
        documento: liquidacion?.numero ?? '—',
      };
    });

  return [
    ...procesos,
    {
      proceso: 'Facturado',
      completo: Boolean(row.facturado),
      documento: documentoPorProceso(row, 'facturado'),
    },
  ];
};