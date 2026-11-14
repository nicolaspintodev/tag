import { useEffect, useMemo, useState } from 'react';
import { Search, X } from 'lucide-react';
import ChoferGrid from '../components/grid/ChoferGrid';
import Modal from '../components/ui/Modal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import StateBar from '../components/ui/StateBar';
import { useEditableResource } from '../hooks/useEditableResource';
import { choferes, proveedores as proveedoresResource } from '../api/resources';
import {
  buildProveedorOptions,
  buildChoferesGridColumns,
  buildChoferesDetailFields,
} from '../lib/columns/choferes';

const canPersist = (row) =>
  Boolean(row.id) ||
  (String(row.nombre ?? '').trim() !== '' &&
    String(row.apellido ?? '').trim() !== '' &&
    String(row.dni ?? '').trim() !== '');

const DETAIL_SECTIONS = ['Identificación', 'Asignación', 'Contacto', 'Licencia'];

const Choferes = () => {
  const [search, setSearch] = useState('');
  const [archivados, setArchivados] = useState(false);
  const [proveedorFilter, setProveedorFilter] = useState('');
  const [activoFilter, setActivoFilter] = useState('');
  const [selectedKey, setSelectedKey] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [proveedores, setProveedores] = useState([]);

  useEffect(() => {
    let cancelado = false;
    proveedoresResource
      .list()
      .then((data) => {
        if (!cancelado) setProveedores(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!cancelado) setProveedores([]);
      });
    return () => {
      cancelado = true;
    };
  }, []);

  const proveedorOptions = useMemo(() => buildProveedorOptions(proveedores), [proveedores]);
  const columns = useMemo(() => buildChoferesGridColumns(proveedorOptions), [proveedorOptions]);
  const detailFields = useMemo(() => buildChoferesDetailFields(proveedorOptions), [proveedorOptions]);
  const proveedorFilterOptions = useMemo(
    () => [{ value: '', label: 'Todos los proveedores' }, ...proveedorOptions.slice(1), { value: 'propio', label: 'Propios' }],
    [proveedorOptions],
  );

  const getErrorMessage = (err) => {
    if (err.status === 500) return 'Error del servidor. Contactá a soporte.';
    if (err.status === 400) return 'Datos inválidos. Revisá los campos.';
    if (err.status === 409) return 'El DNI o CUIL ya está registrado.';
    if (err.status === 404) return 'No se encontró el registro solicitado.';
    if (err.status === 403) return 'No tenés permisos para realizar esta acción.';
    if (err.status === 401) return 'Tu sesión expiró. Volvé a iniciar sesión.';
    const msg = (err.message || '').toLowerCase();
    if (msg.includes('required')) return 'Un campo obligatorio está vacío.';
    if (msg.includes('unique') || msg.includes('duplicate')) return 'El valor ya está registrado.';
    if (msg.includes('email')) return 'El email no es válido.';
    if (msg.includes('cuil')) return 'El CUIL es inválido.';
    return 'Ocurrió un error inesperado.';
  };

  const { rows, saveState, loading, error, setError, reload, updateCell, createRow, deleteRow, restoreRow, flush } =
    useEditableResource(choferes, { rowKey: 'id', canPersist });

  const selected = useMemo(() => rows.find((row) => row.id === selectedKey), [rows, selectedKey]);

  const fetchRows = (overrides = {}) => {
    const searchValue = overrides.searchValue ?? search;
    const archivadosValue = overrides.archivadosValue ?? archivados;
    const proveedorValue = overrides.proveedorValue ?? proveedorFilter;
    const activoValue = overrides.activoValue ?? activoFilter;
    return reload({
      search: searchValue || undefined,
      archivados: archivadosValue ? 1 : undefined,
      proveedor_id: proveedorValue || undefined,
      activo: activoValue !== '' ? activoValue : undefined,
    });
  };

  const toggleArchivados = (checked) => {
    setArchivados(checked);
    fetchRows({ archivadosValue: checked });
  };

  const clearSearch = () => {
    setSearch('');
    fetchRows({ searchValue: '' });
  };

  const handleProveedorFilterChange = (value) => {
    setProveedorFilter(value);
    fetchRows({ proveedorValue: value });
  };

  const handleActivoFilterChange = (value) => {
    setActivoFilter(value);
    fetchRows({ activoValue: value });
  };

  return (
    <div className="choferes-page">
      <div className="page-header">
        <div className="toolbar">
          <div className="toolbar-left">
            <div className="search-field">
              <Input
                placeholder="Buscar por nombre, apellido, DNI, email o teléfono"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                onKeyDown={(event) => event.key === 'Enter' && fetchRows()}
              />
              {search && (
                <button type="button" className="search-clear" aria-label="Limpiar búsqueda" onClick={clearSearch}>
                  <X size={14} />
                </button>
              )}
            </div>
            <Button variant="outline" size="sm" onClick={() => fetchRows()}>
              <Search size={14} />
            </Button>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <input type="checkbox" checked={archivados} onChange={(event) => toggleArchivados(event.target.checked)} />
              Ver archivados
            </label>
            <Select
              value={proveedorFilter}
              options={proveedorFilterOptions}
              onChange={(event) => handleProveedorFilterChange(event.target.value)}
              className="filter-select"
              style={{ width: '200px', marginLeft: '0.5rem' }}
            />
            <Select
              value={activoFilter}
              options={[
                { value: '', label: 'Todos' },
                { value: '1', label: 'Activos' },
                { value: '0', label: 'Inactivos' },
              ]}
              onChange={(event) => handleActivoFilterChange(event.target.value)}
              className="filter-select"
              style={{ width: '130px', marginLeft: '0.5rem' }}
            />
          </div>
          <div style={{ marginLeft: 'auto' }}>
            <Button onClick={() => createRow()}>+ Agregar fila</Button>
          </div>
        </div>
      </div>

      {error && (
        <div className="error-banner" style={{ color: 'var(--color-danger-text)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.4rem 1rem', margin: '0.75rem 1.5rem', fontSize: '0.85rem', borderRadius: 'var(--radius-md)', background: 'var(--color-danger-bg)', border: '1px solid var(--color-danger-text)' }}>
          <span>{getErrorMessage(error)}</span>
          <Button variant="outline" size="sm" onClick={() => setError(null)}>Cerrar</Button>
        </div>
      )}

      <div className="table-container">
        <ChoferGrid
          columns={columns}
          rows={rows}
          rowKey="id"
          onCellChange={updateCell}
          onRowDelete={(key) => setToDelete(key)}
          onRowOpenDetail={(row) => setSelectedKey(row.id)}
          onRowRestore={(key) => restoreRow(key)}
          onAddRow={createRow}
          saveState={saveState}
          loading={loading}
        />
      </div>
        {rows.length > 0 && (
          <StateBar key={rows.length} count={rows.length} singular="chofer" plural="choferes" />
        )}

      <Modal
        open={Boolean(selected)}
        title="Detalle de Chofer"
        onClose={() => setSelectedKey(null)}
        footer={
          <div className="modal-detail-footer">
            <Button variant="outline" size="sm" onClick={() => setSelectedKey(null)}>
              Cerrar
            </Button>
            <Button size="sm" onClick={async () => { await flush(); setSelectedKey(null); }}>
              Guardar
            </Button>
          </div>
        }
      >
        {selected && (
          <div className="modal-detail">
            {DETAIL_SECTIONS.map((sectionName) => {
              const fields = detailFields.filter((f) => f.section === sectionName);
              if (fields.length === 0) return null;
              return (
                <div key={sectionName} className="modal-detail-section">
                  <div className="modal-detail-section-title">{sectionName}</div>
                  <div className="modal-detail-grid">
                    {fields.map((field) => (
                      <div key={field.id} className="modal-detail-row">
                        <label className="modal-detail-label">{field.label}</label>
                        {field.type === 'select' ? (
                          <Select
                            value={selected[field.id] ?? ''}
                            options={field.options}
                            onChange={(event) => updateCell(selected.id, field.id, event.target.value)}
                            className="modal-detail-value"
                          />
                        ) : field.type === 'boolean' ? (
                          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <input
                              type="checkbox"
                              checked={Boolean(selected[field.id])}
                              onChange={(event) => updateCell(selected.id, field.id, event.target.checked)}
                            />
                            <span>{selected[field.id] ? 'Activo' : 'Inactivo'}</span>
                          </label>
                        ) : field.type === 'date' ? (
                          <Input
                            type="date"
                            value={selected[field.id] ? String(selected[field.id]).slice(0, 10) : ''}
                            onChange={(event) => updateCell(selected.id, field.id, event.target.value)}
                            className="modal-detail-value"
                          />
                        ) : (
                          <Input
                            type="text"
                            value={selected[field.id] ?? ''}
                            onChange={(event) => updateCell(selected.id, field.id, event.target.value)}
                            className="modal-detail-value"
                          />
                        )}
                        {field.validate && field.validate(selected[field.id], selected) && (
                          <span style={{ color: 'var(--color-danger-text)', fontSize: '0.7rem' }}>
                            {field.validate(selected[field.id], selected)}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Archivar chofer"
        message="¿Querés archivar este chofer? Podés restaurarlo luego."
        confirmLabel="Archivar"
        onCancel={() => setToDelete(null)}
        onConfirm={() => {
          deleteRow(toDelete);
          setToDelete(null);
        }}
      />
    </div>
  );
};

export default Choferes;
