import { required, cuit, email } from '../validations';

const CONDICION_IVA_OPTIONS = [
  { value: '', label: '—' },
  { value: 'responsable_inscripto', label: 'Responsable Inscripto' },
  { value: 'monotributo', label: 'Monotributo' },
  { value: 'exento', label: 'Exento' },
  { value: 'consumidor_final', label: 'Consumidor Final' },
  { value: 'no_categorizado', label: 'No Categorizado' },
];

export const GRID_COLUMNS = [
  { id: 'razon_social', accessor: 'razon_social', header: 'Razón Social', type: 'text', editable: true, validate: required, width: '220px' },
  { id: 'nombre_administrativo', accessor: 'nombre_administrativo', header: 'Nombre Admin.', type: 'text', editable: true, width: '180px' },
  { id: 'cuit', accessor: 'cuit', header: 'CUIT', type: 'text', editable: true, validate: cuit, width: '150px' },
  { id: 'condicion_iva', accessor: 'condicion_iva', header: 'Cond. IVA', type: 'select', editable: true, options: CONDICION_IVA_OPTIONS, width: '170px' },
  { id: 'localidad', accessor: 'localidad', header: 'Localidad', type: 'text', editable: true, width: '150px' },
  { id: 'provincia', accessor: 'provincia', header: 'Provincia', type: 'text', editable: true, width: '140px' },
  { id: 'telefono', accessor: 'telefono', header: 'Teléfono', type: 'text', editable: true, width: '130px' },
  { id: 'contacto', accessor: 'contacto', header: 'Contacto', type: 'text', editable: true, width: '150px' },
];

export const DETAIL_FIELDS = [
  { id: 'razon_social', label: 'Razón Social', type: 'text', required: true },
  { id: 'nombre_administrativo', label: 'Nombre Administrativo', type: 'text' },
  { id: 'cuit', label: 'CUIT', type: 'text', validate: cuit },
  { id: 'condicion_iva', label: 'Condición IVA', type: 'select', options: CONDICION_IVA_OPTIONS },
  { id: 'ingresos_brutos', label: 'Ingresos Brutos', type: 'text' },
  { id: 'direccion', label: 'Dirección', type: 'text' },
  { id: 'localidad', label: 'Localidad', type: 'text' },
  { id: 'provincia', label: 'Provincia', type: 'text' },
  { id: 'codigo_postal', label: 'Código Postal', type: 'text' },
  { id: 'telefono', label: 'Teléfono', type: 'text' },
  { id: 'email', label: 'Email', type: 'text', validate: email },
  { id: 'contacto', label: 'Contacto', type: 'text' },
  { id: 'notas', label: 'Notas', type: 'textarea' },
];
