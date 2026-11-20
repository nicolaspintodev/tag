import { required, cuit, email } from '../validations';

const CONDICION_IVA_OPTIONS = [
  { value: '', label: '—' },
  { value: 'responsable_inscripto', label: 'Responsable Inscripto' },
  { value: 'monotributo', label: 'Monotributo' },
  { value: 'exento', label: 'Exento' },
  { value: 'consumidor_final', label: 'Consumidor Final' },
  { value: 'no_categorizado', label: 'No Categorizado' },
];

const CONDICION_IVA_LABELS = Object.fromEntries(CONDICION_IVA_OPTIONS.map((o) => [o.value, o.label]));

export const GRID_COLUMNS = [
  { id: 'razon_social', accessor: 'razon_social', header: 'Razón Social', type: 'text', editable: true, validate: required, width: '220px', className: 'truncate' },
  { id: 'nombre_administrativo', accessor: 'nombre_administrativo', header: 'Nombre Admin.', type: 'text', editable: true, width: '180px', className: 'truncate' },
  { id: 'cuit', accessor: 'cuit', header: 'CUIT', type: 'text', editable: true, validate: cuit, warn: true, width: '150px', className: 'truncate mono' },
  { id: 'condicion_iva', accessor: 'condicion_iva', header: 'Cond. IVA', type: 'select', editable: true, options: CONDICION_IVA_OPTIONS, width: '170px', render: (v) => CONDICION_IVA_LABELS[v] ?? v },
  { id: 'localidad', accessor: 'localidad', header: 'Localidad', type: 'text', editable: true, width: '150px', className: 'truncate' },
  { id: 'provincia', accessor: 'provincia', header: 'Provincia', type: 'text', editable: true, width: '140px', className: 'truncate' },
  { id: 'telefono', accessor: 'telefono', header: 'Teléfono', type: 'text', editable: true, width: '130px', className: 'mono' },
  { id: 'contacto', accessor: 'contacto', header: 'Contacto', type: 'text', editable: true, width: '150px', className: 'truncate' },
];

export const DETAIL_FIELDS = [
  { id: 'razon_social', label: 'Razón Social', type: 'text', required: true, section: 'Identificación' },
  { id: 'nombre_administrativo', label: 'Nombre Administrativo', type: 'text', section: 'Identificación' },
  { id: 'cuit', label: 'CUIT', type: 'text', validate: cuit, section: 'Identificación' },
  { id: 'condicion_iva', label: 'Condición IVA', type: 'select', options: CONDICION_IVA_OPTIONS, section: 'Identificación' },
  { id: 'direccion', label: 'Dirección', type: 'text', section: 'Ubicación' },
  { id: 'localidad', label: 'Localidad', type: 'text', section: 'Ubicación' },
  { id: 'provincia', label: 'Provincia', type: 'text', section: 'Ubicación' },
  { id: 'codigo_postal', label: 'Código Postal', type: 'text', section: 'Ubicación' },
  { id: 'telefono', label: 'Teléfono', type: 'text', section: 'Contacto' },
  { id: 'email', label: 'Email', type: 'text', validate: email, section: 'Contacto' },
  { id: 'contacto', label: 'Contacto', type: 'text', section: 'Contacto' },
  { id: 'notas', label: 'Notas', type: 'textarea', section: 'Otros' },
];
