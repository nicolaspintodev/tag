import { useMemo, useState } from 'react';
import { Search, X } from 'lucide-react';
import ClientGrid from '../components/grid/ClientGrid';
import Modal from '../components/ui/Modal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import { useEditableResource } from '../hooks/useEditableResource';
import { clientes } from '../api/resources';
import { GRID_COLUMNS, DETAIL_FIELDS } from '../lib/columns/clientes';

const canPersist = (row) =>
  Boolean(row.id) ||
  (String(row.razon_social ?? '').trim() !== '' && String(row.cuit ?? '').trim() !== '');

const Clientes = () => {
  const [search, setSearch] = useState('');
  const [archivados, setArchivados] = useState(false);
  const [selectedKey, setSelectedKey] = useState(null);
  const [toDelete, setToDelete] = useState(null);

  const getErrorMessage = (err) => {
    if (err.status === 500) return 'Error del servidor. Contactá a soporte.'
    if (err.status === 400) return 'Datos inválidos. Revisá los campos.'
    if (err.status === 409) return 'El CUIT ya está registrado.'
    if (err.status === 404) return 'No se encontró el registro solicitado.'
    if (err.status === 403) return 'No tenés permisos para realizar esta acción.'
    if (err.status === 401) return 'Tu sesión expiró. Volvé a iniciar sesión.'
    const msg = (err.message || '').toLowerCase()
    if (msg.includes('required')) return 'Un campo obligatorio está vacío.'
    if (msg.includes('unique') || msg.includes('duplicate')) return 'El valor ya está registrado.'
    if (msg.includes('email')) return 'El email no es válido.'
    if (msg.includes('cuit')) return 'El CUIT es inválido.'
    return 'Ocurrió un error inesperado.'
  }

  const { rows, saveState, loading, error, setError, reload, updateCell, createRow, deleteRow, restoreRow } =
    useEditableResource(clientes, { rowKey: 'id', canPersist });

  const selected = useMemo(() => rows.find((row) => row.id === selectedKey), [rows, selectedKey]);

  const fetchRows = (overrides = {}) => {
    const searchValue = overrides.searchValue ?? search;
    const archivadosValue = overrides.archivadosValue ?? archivados;
    return reload({
      search: searchValue || undefined,
      archivados: archivadosValue ? 1 : undefined,
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

  return (
    <div className="clientes-page">
      <div className="page-header">
        <div className="toolbar">
        <div className="toolbar-left">
          <div className="search-field">
            <Input
              placeholder="Buscar por nombre, CUIT, contacto o email"
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
            <input
              type="checkbox"
              checked={archivados}
              onChange={(event) => toggleArchivados(event.target.checked)}
            />
            Ver archivados
          </label>
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
        <ClientGrid
          columns={GRID_COLUMNS}
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

      <div className="clientes-state-bar">
        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{rows.length} clientes</span>
      </div>

      <Modal
        open={Boolean(selected)}
        title="Detalle de Cliente"
        onClose={() => setSelectedKey(null)}
        footer={
          <div className="modal-detail-footer">
            <Button variant="outline" size="sm" onClick={() => setSelectedKey(null)}>
              Cancelar
            </Button>
            <Button size="sm" onClick={() => setSelectedKey(null)}>
              Guardar
            </Button>
          </div>
        }
      >
        {selected && (
          <div className="modal-detail">
            {[
              'Identificación',
              'Ubicación',
              'Contacto',
              'Otros',
            ].map((sectionName) => {
              const fields = DETAIL_FIELDS.filter((f) => f.section === sectionName);
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
                        ) : field.type === 'textarea' ? (
                          <textarea
                            className="modal-detail-value textarea"
                            rows={3}
                            value={selected[field.id] ?? ''}
                            onChange={(event) => updateCell(selected.id, field.id, event.target.value)}
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
        title="Archivar cliente"
        message="¿Querés archivar este cliente? Podés restaurarlo luego."
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

export default Clientes;