/* eslint-disable react-refresh/only-export-components */
import { required } from '../validations';

const TIPO_OPTIONS = [
  { value: 'tractora', label: 'Tractora' },
  { value: 'acoplado', label: 'Acoplado' },
  { value: 'semirremolque', label: 'Semirremolque' },
];

const PROVEEDOR_OPTION = { value: '', label: 'Propio' };

export const buildProveedorOptions = (proveedores = []) => [
  PROVEEDOR_OPTION,
  ...proveedores.map((p) => ({ value: p.id, label: p.razon_social ?? `Proveedor ${p.id}` })),
];

const dateRender = (v) => {
  if (!v) return '-';
  const date = new Date(v);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isVencida = date < today;
  return (
    <span className={isVencida ? 'text-danger' : ''}>
      {date.toLocaleDateString('es-AR')}
    </span>
  );
};

const vehiculoRender = (v, row) => {
  const parts = [row?.marca, row?.modelo];
  if (row?.anio) parts.push(`(${row.anio})`);
  return parts.filter(Boolean).join(' ');
};

export const buildUnidadesGridColumns = (proveedorOptions = [PROVEEDOR_OPTION]) => {
  const labels = Object.fromEntries(proveedorOptions.map((o) => [o.value, o.label]));
  return [
    { id: 'numero', accessor: 'numero', header: 'Nº Interno', type: 'text', editable: true, width: '100px', className: 'truncate mono' },
    { id: 'vehiculo', accessor: 'vehiculo', header: 'Vehículo', type: 'text', width: '200px', render: vehiculoRender },
    { id: 'patente', accessor: 'patente', header: 'Patente', type: 'text', editable: true, validate: required, width: '120px', className: 'truncate mono' },
    { id: 'proveedor_id', accessor: 'proveedor_id', header: 'Proveedor', type: 'select', editable: true, options: proveedorOptions, width: '180px', render: (v) => labels[v] ?? 'Propio' },
    { id: 'vtv_vencimiento', accessor: 'vtv_vencimiento', header: 'VTV', type: 'date', editable: true, width: '120px', className: 'mono', render: dateRender },
    { id: 'seguro_vencimiento', accessor: 'seguro_vencimiento', header: 'Seguro', type: 'date', editable: true, width: '120px', className: 'mono', render: dateRender },
    { id: 'activo', accessor: 'activo', header: 'Activo', type: 'boolean', editable: true, width: '90px' },
  ];
};

export const buildUnidadesDetailFields = (proveedorOptions = [PROVEEDOR_OPTION]) => [
  // Identificación
  { id: 'patente', label: 'Patente', type: 'text', required: true, section: 'Identificación' },
  { id: 'tipo', label: 'Tipo', type: 'select', options: TIPO_OPTIONS, required: true, section: 'Identificación' },
  { id: 'marca', label: 'Marca', type: 'text', section: 'Identificación' },
  { id: 'modelo', label: 'Modelo', type: 'text', section: 'Identificación' },
  { id: 'anio', label: 'Año', type: 'number', section: 'Identificación' },
  { id: 'numero', label: 'Nº Interno', type: 'text', section: 'Identificación' },

  // Asignación
  { id: 'proveedor_id', label: 'Proveedor', type: 'select', options: proveedorOptions, section: 'Asignación' },
  { id: 'activo', label: 'Activo', type: 'boolean', section: 'Asignación' },

  // Documentación
  { id: 'vtv_vencimiento', label: 'VTV Vence', type: 'date', section: 'Documentación' },
  { id: 'seguro_vencimiento', label: 'Seguro Vence', type: 'date', section: 'Documentación' },
];

export { TIPO_OPTIONS, PROVEEDOR_OPTION };