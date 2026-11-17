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

const vehiculoRender = (v, row) => {
  if (row.tractora) {
    return `${row.tractora.marca} ${row.tractora.modelo} (${row.tractora.patente})`;
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

const estadoBadgeRender = (v, row) => {
  const estado = v;
  const facturado = row.facturado;
  const liquidado = row.liquidado;

  const estadoColors = {
    planificado: 'var(--color-warning-bg)',
    iniciado: 'var(--color-info-bg)',
    terminado: 'var(--color-success-bg)',
  };
  const estadoLabels = {
    planificado: 'P',
    iniciado: 'I',
    terminado: 'T',
  };

  const flagColorTrue = 'var(--color-success-bg)';
  const flagColorFalse = 'var(--bg-tertiary)';
  const flagTextColorTrue = 'var(--color-success-text)';
  const flagTextColorFalse = 'var(--text-muted)';

  return (
    <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center', flexWrap: 'wrap' }}>
      <span className="status-badge" style={{ background: estadoColors[estado] || 'var(--bg-secondary)', minWidth: '24px', textAlign: 'center' }}>
        {estadoLabels[estado] ?? estado?.[0]?.toUpperCase() ?? '-'}
      </span>
      <span className="status-badge" style={{ background: facturado ? flagColorTrue : flagColorFalse, color: facturado ? flagTextColorTrue : flagTextColorFalse, minWidth: '24px', textAlign: 'center' }}>
        F
      </span>
      <span className="status-badge" style={{ background: liquidado ? flagColorTrue : flagColorFalse, color: liquidado ? flagTextColorTrue : flagTextColorFalse, minWidth: '24px', textAlign: 'center' }}>
        L
      </span>
    </div>
  );
};

export const buildViajesGridColumns = () => {
  return [
    { id: 'codigo_viaje', accessor: 'codigo_viaje', header: 'Código', type: 'text', width: '110px', className: 'mono' },
    { id: 'cliente_id', accessor: 'cliente_id', header: 'Cliente', type: 'text', width: '180px', render: clienteRender },
    { id: 'chofer_id', accessor: 'chofer_id', header: 'Chofer', type: 'text', width: '180px', render: choferRender },
    { id: 'vehiculo', accessor: 'vehiculo', header: 'Vehículo', type: 'text', width: '250px', render: vehiculoRender },
    { id: 'origen', accessor: 'origen', header: 'Origen', type: 'text', editable: true, width: '150px', className: 'truncate' },
    { id: 'destino', accessor: 'destino', header: 'Destino', type: 'text', editable: true, width: '150px', className: 'truncate' },
    { id: 'estado', accessor: 'estado', header: 'Estado', type: 'text', width: '140px', render: estadoBadgeRender },
  ];
};

export const buildViajesDetailFields = (choferOptions = [], clienteOptions = [], proveedorOptions = [PROPIO_OPTION], unidadOptions = []) => {
  return [
    // Operativo
    { id: 'origen', label: 'Origen', type: 'text', required: true, section: 'Operativo' },
    { id: 'destino', label: 'Destino', type: 'text', required: true, section: 'Operativo' },
    { id: 'fecha_salida', label: 'Fecha Salida', type: 'date', required: true, section: 'Operativo' },
    { id: 'fecha_llegada', label: 'Fecha Llegada', type: 'date', section: 'Operativo' },
    { id: 'chofer_id', label: 'Chofer', type: 'select', options: [{ value: '', label: 'Seleccionar...' }, ...choferOptions], required: true, section: 'Operativo' },
    { id: 'cliente_id', label: 'Cliente', type: 'select', options: [{ value: '', label: 'Seleccionar...' }, ...clienteOptions], required: true, section: 'Operativo' },
    { id: 'proveedor_id', label: 'Proveedor', type: 'select', options: [{ value: '', label: 'Propio' }, ...proveedorOptions.slice(1)], section: 'Operativo' },
    { id: 'tractora_id', label: 'Tractora', type: 'select', options: [{ value: '', label: 'Seleccionar...' }, ...unidadOptions.filter(u => u.tipo === 'tractora')], required: true, section: 'Operativo' },
    { id: 'acoplado_id', label: 'Acoplado/SEM', type: 'select', options: [{ value: '', label: 'Sin acoplado' }, ...unidadOptions.filter(u => ['acoplado', 'semirremolque'].includes(u.tipo))], section: 'Operativo' },
    { id: 'peso_carga', label: 'Peso Carga (kg)', type: 'number', section: 'Operativo' },
    { id: 'estado', label: 'Estado', type: 'select', options: ESTADO_OPTIONS, section: 'Operativo' },

    // Comercial
    { id: 'precio_pactado', label: 'Precio del viaje', type: 'currency', required: true, section: 'Comercial' },
    { id: 'costo_proveedor', label: 'Costo', type: 'currency', section: 'Comercial' },
    { id: 'observaciones', label: 'Observaciones', type: 'textarea', section: 'Comercial' },
    { id: 'facturado', label: 'Facturado', type: 'boolean', section: 'Comercial' },
    { id: 'liquidado', label: 'Liquidado', type: 'boolean', section: 'Comercial' },
  ];
};

export { TIPO_OPTIONS, ESTADO_OPTIONS };