import { useMemo, useState } from 'react';
import { X } from 'lucide-react';
import EditableTable from '../components/grid/EditableTable';
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

  const { rows, saveState, loading, error, reload, updateCell, createRow, deleteRow, restoreRow } =
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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

      {error && <div className="card" style={{ color: 'var(--color-danger-text)' }}>{error.message}</div>}

      <EditableTable
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
