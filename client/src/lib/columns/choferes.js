import { required, cuit, email } from '../validations';

const PROPIO_OPTION = { value: '', label: 'Propio' };

export const buildProveedorOptions = (proveedores = []) => [
  PROPIO_OPTION,
  ...proveedores.map((p) => ({ value: p.id, label: p.razon_social ?? `Proveedor ${p.id}` })),
];

export const buildChoferesGridColumns = (proveedorOptions = [PROPIO_OPTION]) => {
  const labels = Object.fromEntries(proveedorOptions.map((o) => [o.value, o.label]));
  return [
    { id: 'numero', accessor: 'numero', header: 'Nº Interno', type: 'text', editable: true, validate: required, width: '100px', className: 'truncate mono' },
    { id: 'nombre_completo', accessor: 'nombre_completo', header: 'Chofer', type: 'text', editable: false, width: '180px', className: 'truncate', render: (v, row) => `${row.apellido || ''}, ${row.nombre || ''}`.trim() },
    { id: 'dni', accessor: 'dni', header: 'DNI', type: 'text', editable: true, validate: required, width: '130px', className: 'truncate mono' },
    { id: 'proveedor_id', accessor: 'proveedor_id', header: 'Proveedor', type: 'select', editable: true, options: proveedorOptions, width: '180px', render: (v) => labels[v] ?? 'Propio' },
    { id: 'telefono', accessor: 'telefono', header: 'Teléfono', type: 'text', editable: true, width: '130px', className: 'mono' },
    { id: 'licencia_vencimiento', accessor: 'licencia_vencimiento', header: 'Lic. Vence', type: 'date', editable: true, width: '140px', className: 'mono', render: (v) => (v ? String(v).slice(0, 10) : '') },
    { id: 'activo', accessor: 'activo', header: 'Activo', type: 'boolean', editable: false, width: '90px', render: (v) => (v ? 'Sí' : 'No') },
  ];
};

export const buildChoferesDetailFields = (proveedorOptions = [PROPIO_OPTION]) => [
  { id: 'numero', label: 'Nº Interno', type: 'text', required: true, section: 'Identificación' },
  { id: 'nombre', label: 'Nombre', type: 'text', required: true, section: 'Identificación' },
  { id: 'apellido', label: 'Apellido', type: 'text', required: true, section: 'Identificación' },
  { id: 'dni', label: 'DNI', type: 'text', validate: required, section: 'Identificación' },
  { id: 'cuil', label: 'CUIL', type: 'text', validate: cuit, section: 'Identificación' },
  { id: 'proveedor_id', label: 'Proveedor', type: 'select', options: proveedorOptions, section: 'Asignación' },
  { id: 'activo', label: 'Activo', type: 'boolean', section: 'Asignación' },
  { id: 'telefono', label: 'Teléfono', type: 'text', section: 'Contacto' },
  { id: 'email', label: 'Email', type: 'text', validate: email, section: 'Contacto' },
  { id: 'direccion', label: 'Dirección', type: 'text', section: 'Contacto' },
  { id: 'fecha_nacimiento', label: 'Fecha Nacimiento', type: 'date', section: 'Licencia' },
  { id: 'licencia_vencimiento', label: 'Licencia Vence', type: 'date', required: true, section: 'Licencia' },
];
