import { useMemo, useState } from 'react';
import EditableTable from '../components/grid/EditableTable';
import Drawer from '../components/ui/Drawer';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import { useEditableResource } from '../hooks/useEditableResource';
import { clientes } from '../api/resources';
import { GRID_COLUMNS, DETAIL_FIELDS } from '../lib/columns/clientes';

const Clientes = () => {
  const [search, setSearch] = useState('');
  const [archivados, setArchivados] = useState(false);
  const [selectedKey, setSelectedKey] = useState(null);
  const [toDelete, setToDelete] = useState(null);

  const { rows, saveState, loading, error, reload, updateCell, createRow, deleteRow } =
    useEditableResource(clientes, { rowKey: 'id' });

  const selected = useMemo(() => rows.find((row) => row.id === selectedKey), [rows, selectedKey]);

  const applyFilters = () =>
    reload({ search: search || undefined, archivados: archivados ? 1 : undefined });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div className="toolbar">
        <Input
          placeholder="Buscar por nombre, CUIT, contacto o email"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          onKeyDown={(event) => event.key === 'Enter' && applyFilters()}
          style={{ maxWidth: '340px' }}
        />
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          <input
            type="checkbox"
            checked={archivados}
            onChange={(event) => setArchivados(event.target.checked)}
          />
          Ver archivados
        </label>
        <Button variant="outline" onClick={applyFilters}>Buscar</Button>
        <Button onClick={createRow}>+ Nueva fila</Button>
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
        onRowSelect={(row) => setSelectedKey(row.id)}
        saveState={saveState}
        loading={loading}
      />

      <Drawer
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
      </Drawer>

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
