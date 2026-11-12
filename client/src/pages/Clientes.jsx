import { useMemo, useState } from 'react';
import { X } from 'lucide-react';
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
      <header className="page-header">
        <div className="toolbar">
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
          <Button variant="outline" onClick={() => fetchRows()}>Buscar</Button>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            <input
              type="checkbox"
              checked={archivados}
              onChange={(event) => toggleArchivados(event.target.checked)}
            />
            Ver archivados
          </label>
          <span style={{ marginLeft: 'auto', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            {rows.length} clientes
          </span>
        </div>
      </header>

      {error && (
        <div className="error-banner" style={{ color: 'var(--color-danger-text)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1.5rem' }}>
          <span>{error.status === 500 ? 'Error del servidor (datos con caracteres inválidos). Contactá a soporte.' : error.message}</span>
          <Button variant="outline" size="sm" onClick={() => setError(null)}>Cerrar</Button>
        </div>
      )}

      <div className="grid-container">
        <div className="table-header-wrapper">
          <table className="datatable">
            <thead>
              <tr>
                <th className="col-estado" style={{ width: '40px' }} />
                {GRID_COLUMNS.map((column) => (
                  <th
                    key={column.id}
                    style={column.width ? { width: column.width } : undefined}
                  >
                    {column.header}
                  </th>
                ))}
                <th className="col-acciones" style={{ width: '110px' }}>Acciones</th>
              </tr>
            </thead>
          </table>
        </div>

        <div className="table-body-wrapper">
          <ClientGrid
            columns={GRID_COLUMNS}
            rows={rows}
            rowKey="id"
            onCellChange={updateCell}
            onRowDelete={(key) => setToDelete(key)}
            onRowOpenDetail={(row) => setSelectedKey(row.id)}
            onRowRestore={(key) => restoreRow(key)}
            saveState={saveState}
            loading={loading}
          />
        </div>
      </div>

      <div className="table-footer-fixed">
        <button type="button" className="grid-add-row-fixed" onClick={createRow}>
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          Agregar fila
        </button>
      </div>

      <Modal
        open={Boolean(selected)}
        title={selected?.nombre_administrativo || selected?.razon_social || 'Cliente'}
        onClose={() => setSelectedKey(null)}
      >
        {selected &&
          DETAIL_FIELDS.map((field) => (
            <div key={field.id} style={{ marginBottom: '0.85rem' }}>
              <label className="field-label">{field.label}</label>
              {field.type === 'select' ? (
                <Select
                  value={selected[field.id] ?? ''}
                  options={field.options}
                  onChange={(event) => updateCell(selected.id, field.id, event.target.value)}
                />
              ) : field.type === 'textarea' ? (
                <textarea
                  className="input-field"
                  rows={3}
                  value={selected[field.id] ?? ''}
                  onChange={(event) => updateCell(selected.id, field.id, event.target.value)}
                />
              ) : (
                <Input
                  type="text"
                  value={selected[field.id] ?? ''}
                  onChange={(event) => updateCell(selected.id, field.id, event.target.value)}
                />
              )}
              {field.validate && field.validate(selected[field.id], selected) && (
                <span style={{ color: 'var(--color-danger-text)', fontSize: '0.75rem' }}>
                  {field.validate(selected[field.id], selected)}
                </span>
              )}
            </div>
          ))}
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