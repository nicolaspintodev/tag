import { useEffect, useMemo, useRef, useState } from 'react';
import { Search, X, Calendar, Filter, ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from 'lucide-react';
import ViajeGrid from '../components/grid/ViajeGrid';
import Modal from '../components/ui/Modal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import StateBar from '../components/ui/StateBar';
import { useEditableResource } from '../hooks/useEditableResource';
import { viajes, choferes as choferesResource, clientes as clientesResource, proveedores as proveedoresResource, unidades as unidadesResource } from '../api/resources';
import {
  buildViajesGridColumns,
  buildViajesDetailFields,
} from '../lib/columns/viajes';

const baseCanPersist = (row) =>
  Boolean(row.id) ||
  (String(row.origen ?? '').trim() !== '' &&
   String(row.destino ?? '').trim() !== '' &&
   String(row.fecha_salida ?? '').trim() !== '' &&
   row.chofer_id &&
   row.cliente_id &&
   row.tractora_id &&
   String(row.precio_pactado ?? '').trim() !== '');

const DETAIL_SECTIONS = ['Operativo', 'Comercial'];

const Viajes = () => {
  const [search, setSearch] = useState('');
  const [archivados, setArchivados] = useState(false);
  const [estadoFilter, setEstadoFilter] = useState('');
  const [facturadoFilter, setFacturadoFilter] = useState(false); // false=all, true=facturado
  const [liquidadoFilter, setLiquidadoFilter] = useState(false);
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [selectedKey, setSelectedKey] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [choferes, setChoferes] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [unidades, setUnidades] = useState([]);

  useEffect(() => {
    let cancelado = false;
    Promise.all([
      choferesResource.list(),
      clientesResource.list(),
      proveedoresResource.list(),
      unidadesResource.list(),
    ]).then(([choferesData, clientesData, proveedoresData, unidadesData]) => {
      if (!cancelado) {
        setChoferes(Array.isArray(choferesData) ? choferesData : []);
        setClientes(Array.isArray(clientesData) ? clientesData : []);
        setProveedores(Array.isArray(proveedoresData) ? proveedoresData : []);
        setUnidades(Array.isArray(unidadesData) ? unidadesData : []);
      }
    }).catch(() => {
      if (!cancelado) {
        setChoferes([]);
        setClientes([]);
        setProveedores([]);
        setUnidades([]);
      }
    });
    return () => { cancelado = true; };
  }, []);

  const columns = useMemo(() => buildViajesGridColumns(), []);
  const detailFields = useMemo(() => buildViajesDetailFields(
    choferes.map(c => ({ value: c.id, label: `${c.nombre} ${c.apellido}` })),
    clientes.map(c => ({ value: c.id, label: c.razon_social })),
    proveedores.map(p => ({ value: p.id, label: p.razon_social })),
    unidades.map(u => {
      const label = [u.marca, u.modelo].filter(Boolean).join(' ');
      return { value: u.id, label: u.patente ? `${label} (${u.patente})` : label || `Unidad ${u.id}`, tipo: u.tipo };
    })
  ), [choferes, clientes, proveedores, unidades]);

  const estadoOptions = useMemo(() => [
    { value: '', label: 'Todos los estados' },
    { value: 'planificado', label: 'Planificado' },
    { value: 'iniciado', label: 'Iniciado' },
    { value: 'terminado', label: 'Terminado' },
  ], []);

  const { rows, setRows, saveState, loading, errors, reload, updateCell, createRow, deleteRow, restoreRow, saveRow, cancelPendingSave, lastAction } =
    useEditableResource(viajes, { rowKey: 'id', canPersist });

  const selected = useMemo(() => rows.find((row) => row.id === selectedKey), [rows, selectedKey]);
  const selectedSnapshotRef = useRef(null);

  const fetchRows = (overrides = {}) => {
    const searchValue = overrides.searchValue ?? search;
    const archivadosValue = overrides.archivadosValue ?? archivados;
    const estadoValue = overrides.estadoValue ?? estadoFilter;
    const facturadoValue = overrides.facturadoValue ?? facturadoFilter;
    const liquidadoValue = overrides.liquidadoValue ?? liquidadoFilter;
    const fechaDesdeValue = overrides.fechaDesdeValue ?? fechaDesde;
    const fechaHastaValue = overrides.fechaHastaValue ?? fechaHasta;
    return reload({
      search: searchValue || undefined,
      archivados: archivadosValue ? 1 : undefined,
      estado: estadoValue || undefined,
      facturado: facturadoValue === true ? 'true' : undefined,
      liquidado: liquidadoValue === true ? 'true' : undefined,
      fecha_desde: fechaDesdeValue || undefined,
      fecha_hasta: fechaHastaValue || undefined,
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

  const openDetail = (row) => {
    selectedSnapshotRef.current = structuredClone(row);
    setSelectedKey(row.id);
    setActiveTab('operativo');
  };

  const closeDetail = async () => {
    const snapshot = selectedSnapshotRef.current;
    selectedSnapshotRef.current = null;
    const key = selectedKey;
    if (key) cancelPendingSave(key);
    setSelectedKey(null);
    setActiveTab('operativo');
    if (snapshot && key) {
      if (String(key).startsWith('new-')) {
        setRows((prev) => prev.filter((row) => row.id !== key));
      } else {
        await fetchRows();
      }
    }
  };

  const handleSaveDetail = async () => {
    if (!selected) return;
    const result = await saveRow(selected.id, { force: true });
    if (!result?.ok) return;
    selectedSnapshotRef.current = null;
    await fetchRows();
    setSelectedKey(null);
    setActiveTab('operativo');
  };

  const handleEstadoFilterChange = (value) => {
    setEstadoFilter(value);
    fetchRows({ estadoValue: value });
  };

  const handleFacturadoFilterChange = (checked) => {
    setFacturadoFilter(checked);
    fetchRows({ facturadoValue: checked });
  };

  const handleLiquidadoFilterChange = (checked) => {
    setLiquidadoFilter(checked);
    fetchRows({ liquidadoValue: checked });
  };

  const handleFechaDesdeChange = (value) => {
    setFechaDesde(value);
    fetchRows({ fechaDesdeValue: value });
  };

  const handleFechaHastaChange = (value) => {
    setFechaHasta(value);
    fetchRows({ fechaHastaValue: value });
  };

  const [activeTab, setActiveTab] = useState('operativo');
  const selectedKeyRef = useRef(null);
  selectedKeyRef.current = selectedKey;

  const canPersist = (row) => {
    if (selectedKeyRef.current && row.id === selectedKeyRef.current) return false;
    return baseCanPersist(row);
  };

  const handleBooleanChange = (rowId, fieldId, checked) => {
    updateCell(rowId, fieldId, checked);
    if (checked && (fieldId === 'facturado' || fieldId === 'liquidado')) {
      updateCell(rowId, 'estado', 'terminado');
    }
  };

  const renderTabContent = () => {
    if (!selected) return null;

    const sectionName = activeTab === 'operativo' ? 'Operativo' : 'Comercial';
    const fields = detailFields.filter((f) => f.section === sectionName);

    const isDisabled = (field) => {
      if (!field.disabled) return false;
      return typeof field.disabled === 'function' ? field.disabled(selected) : field.disabled;
    };

    const renderInput = (field) => {
      const disabled = isDisabled(field);
      if (field.type === 'select') {
        return (
          <Select
            value={selected[field.id] ?? ''}
            options={field.options}
            onChange={(event) => updateCell(selected.id, field.id, event.target.value)}
            className="modal-detail-value"
            disabled={disabled}
          />
        );
      }
      if (field.type === 'boolean') {
        const isChecked = Boolean(selected[field.id]);
        return (
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
            cursor: disabled ? 'not-allowed' : 'pointer',
            opacity: disabled ? 0.5 : 1,
            width: '100%',
          }}>
            <span style={{ fontWeight: 500, fontSize: '0.875rem', whiteSpace: 'nowrap' }}>
              {field.label}
            </span>
            <input
              type="checkbox"
              checked={isChecked}
              onChange={(event) => {
                if (disabled) return;
                handleBooleanChange(selected.id, field.id, event.target.checked);
              }}
              style={{
                width: '22px',
                height: '22px',
                accentColor: 'var(--color-success)',
                flexShrink: 0,
              }}
            />
          </label>
        );
      }
      if (field.type === 'currency') {
        return (
          <Input
            type="text"
            value={selected[field.id] ?? ''}
            onChange={(event) => updateCell(selected.id, field.id, event.target.value)}
            className="modal-detail-value"
          />
        );
      }
      if (field.type === 'date') {
        return (
          <Input
            type="date"
            value={selected[field.id] ? String(selected[field.id]).slice(0, 10) : ''}
            onChange={(event) => updateCell(selected.id, field.id, event.target.value)}
            className="modal-detail-value"
          />
        );
      }
      if (field.type === 'textarea') {
        return (
          <Input
            type="text"
            value={selected[field.id] ?? ''}
            onChange={(event) => updateCell(selected.id, field.id, event.target.value)}
            className="modal-detail-value"
            style={{ minHeight: '80px', resize: 'vertical' }}
          />
        );
      }
      if (field.type === 'time') {
        return (
          <Input
            type="time"
            value={selected[field.id] ?? ''}
            onChange={(event) => updateCell(selected.id, field.id, event.target.value)}
            className="modal-detail-value"
          />
        );
      }
      return (
        <Input
          type="text"
          value={selected[field.id] ?? ''}
          onChange={(event) => updateCell(selected.id, field.id, event.target.value)}
          className="modal-detail-value"
        />
      );
    };

    if (sectionName === 'Comercial') {
      const topFields = fields.filter(f => f.id === 'precio_pactado' || f.id === 'costo_proveedor');
      const obsField = fields.find(f => f.id === 'observaciones');
      const bottomFields = fields.filter(f => f.id === 'facturado' || f.id === 'liquidado');

      return (
        <div className="modal-detail-section">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {topFields.map((field) => (
                <div key={field.id} className="modal-detail-row">
                  <label className="modal-detail-label">{field.label}</label>
                  {renderInput(field)}
                </div>
              ))}
            </div>
            {obsField && (
              <div className="modal-detail-row" style={{ gridColumn: '1 / -1' }}>
                <label className="modal-detail-label">{obsField.label}</label>
                {renderInput(obsField)}
              </div>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {bottomFields.map((field) => (
                <div key={field.id} className="modal-detail-row">
                  {renderInput(field)}
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="modal-detail-section">
        <div className="modal-detail-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gridAutoFlow: 'dense' }}>
          {fields.map((field) => {
            const colSpan = field.colSpan === 2 ? '1 / -1' : 'auto';
            return (
              <div key={field.id} className="modal-detail-row" style={{ gridColumn: colSpan }}>
                <label className="modal-detail-label">{field.label}</label>
                {renderInput(field)}
                {field.validate && field.validate(selected[field.id], selected) && (
                  <span style={{ color: 'var(--color-danger-text)', fontSize: '0.7rem' }}>
                    {field.validate(selected[field.id], selected)}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="resource-page">
      <div className="page-header">
        <div className="toolbar">
          <div className="toolbar-left">
            <div className="search-field">
              <Input
                placeholder="Buscar por origen, destino, chofer, cliente, nro. viaje"
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
              value={estadoFilter}
              options={estadoOptions}
              onChange={(event) => handleEstadoFilterChange(event.target.value)}
              className="filter-select"
              style={{ width: '150px', marginLeft: '0.5rem' }}
            />
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.85rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>
              <input
                type="checkbox"
                checked={facturadoFilter}
                onChange={(event) => handleFacturadoFilterChange(event.target.checked)}
              />
              Facturado
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.85rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>
              <input
                type="checkbox"
                checked={liquidadoFilter}
                onChange={(event) => handleLiquidadoFilterChange(event.target.checked)}
              />
              Liquidado
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginLeft: '0.5rem' }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Desde</label>
              <Input type="date" value={fechaDesde} onChange={(e) => handleFechaDesdeChange(e.target.value)} style={{ width: '140px' }} />
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>Hasta</label>
              <Input type="date" value={fechaHasta} onChange={(e) => handleFechaHastaChange(e.target.value)} style={{ width: '140px' }} />
            </div>
          </div>
          <div style={{ marginLeft: 'auto' }}>
            <Button onClick={() => { const key = createRow(); const draft = { id: key }; selectedSnapshotRef.current = draft; setSelectedKey(key); setActiveTab('operativo'); }}>+ Nuevo Viaje</Button>
          </div>
        </div>
      </div>

      <div className="table-container">
        <ViajeGrid
          columns={columns}
          rows={rows}
          rowKey="id"
          onCellChange={updateCell}
          onRowDelete={(key) => setToDelete(key)}
          onRowOpenDetail={openDetail}
          onRowRestore={(key) => restoreRow(key)}
          onAddRow={undefined}
          saveState={saveState}
          loading={loading}
          errors={errors}
        />
      </div>
      {rows.length > 0 && (
        <StateBar key={rows.length} count={rows.length} singular="viaje" plural="viajes" saveState={saveState} errors={errors} rows={rows} lastAction={lastAction} />
      )}

      <Modal
        open={Boolean(selected)}
        title="Detalle de Viaje"
        onClose={closeDetail}
        footer={
          <div className="modal-detail-footer">
            <Button variant="outline" size="sm" onClick={closeDetail}>
              Cerrar
            </Button>
            <Button size="sm" onClick={handleSaveDetail}>
              Guardar
            </Button>
          </div>
        }
      >
        {selected && (
          <div className="modal-detail">
            <div className="modal-tabs" style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', marginBottom: '1rem' }}>
              <button
                className={`modal-tab ${activeTab === 'operativo' ? 'active' : ''}`}
                onClick={() => setActiveTab('operativo')}
                style={{
                  padding: '0.5rem 1rem',
                  background: 'none',
                  border: 'none',
                  borderBottom: activeTab === 'operativo' ? '2px solid var(--color-primary)' : '2px solid transparent',
                  cursor: 'pointer',
                  fontWeight: activeTab === 'operativo' ? 600 : 400,
                  color: activeTab === 'operativo' ? 'var(--color-primary)' : 'var(--text-muted)'
                }}
              >
                Operativo
              </button>
              <button
                className={`modal-tab ${activeTab === 'comercial' ? 'active' : ''}`}
                onClick={() => setActiveTab('comercial')}
                style={{
                  padding: '0.5rem 1rem',
                  background: 'none',
                  border: 'none',
                  borderBottom: activeTab === 'comercial' ? '2px solid var(--color-primary)' : '2px solid transparent',
                  cursor: 'pointer',
                  fontWeight: activeTab === 'comercial' ? 600 : 400,
color: activeTab === 'comercial' ? 'var(--color-primary)' : 'var(--text-muted)'
              }}
            >
              Comercial
            </button>
          </div>
            {renderTabContent()}
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Archivar viaje"
        message="¿Querés archivar este viaje? Podés restaurarlo luego."
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

export default Viajes;