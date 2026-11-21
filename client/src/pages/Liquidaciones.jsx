import { useState } from 'react';
import { Search, X, FileText } from 'lucide-react';
import LiquidacionDetailModal from '../components/liquidacion/LiquidacionDetailModal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import StateBar from '../components/ui/StateBar';
import { useEditableResource } from '../hooks/useEditableResource';
import { liquidaciones } from '../api/resources';
import { buildListRowView, canPersistLiquidacion } from '../lib/liquidacionViews';

const TIPO_OPTIONS = [
  { value: '', label: 'Todos' },
  { value: 'cliente', label: 'Cliente' },
  { value: 'chofer', label: 'Chofer' },
  { value: 'proveedor', label: 'Proveedor' },
];

const ESTADO_OPTIONS = [
  { value: '', label: 'Todos' },
  { value: 'borrador', label: 'Borrador' },
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'facturada', label: 'Facturada' },
];

const tipoBadge = (tipo) => {
  if (tipo === 'cliente') return <span style={{ background: 'var(--color-primary-bg)', color: 'var(--color-primary)', padding: '0.15rem 0.5rem', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: 600 }}>Cliente</span>;
  if (tipo === 'chofer') return <span style={{ background: 'var(--color-warning-bg)', color: 'var(--color-warning-text)', padding: '0.15rem 0.5rem', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: 600 }}>Chofer</span>;
  return <span style={{ background: 'var(--color-info-bg)', color: 'var(--color-info-text)', padding: '0.15rem 0.5rem', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: 600 }}>Proveedor</span>;
};

const estadoBadge = (estado) => {
  const colors = {
    borrador: { bg: 'var(--bg-tertiary)', color: 'var(--text-muted)' },
    pendiente: { bg: 'var(--color-warning-bg)', color: 'var(--color-warning-text)' },
    facturada: { bg: 'var(--color-success-bg)', color: 'var(--color-success-text)' },
  };
  const c = colors[estado] || colors.borrador;
  return <span style={{ background: c.bg, color: c.color, padding: '0.15rem 0.5rem', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: 600 }}>{estado}</span>;
};

const dateRender = (v) => {
  if (!v) return '-';
  const date = new Date(v);
  return date.toLocaleDateString('es-AR');
};

const currencyRender = (v) => {
  if (!v && v !== 0) return '-';
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(v);
};

const Liquidaciones = () => {
  const [search, setSearch] = useState('');
  const [archivados, setArchivados] = useState(false);
  const [tipoFilter, setTipoFilter] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('');
  const [selectedKey, setSelectedKey] = useState(null);
  const [toDelete, setToDelete] = useState(null);

  const { rows, saveState, errors, reload, deleteRow, restoreRow, lastAction } =
    useEditableResource(liquidaciones, { rowKey: 'id', canPersist: canPersistLiquidacion });

  const fetchRows = (overrides = {}) => {
    const searchValue = overrides.searchValue ?? search;
    const archivadosValue = overrides.archivadosValue ?? archivados;
    const tipoValue = overrides.tipoValue ?? tipoFilter;
    const estadoValue = overrides.estadoValue ?? estadoFilter;
    return reload({
      search: searchValue || undefined,
      archivados: archivadosValue ? 1 : undefined,
      tipo: tipoValue || undefined,
      estado: estadoValue || undefined,
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

  const handleTipoFilterChange = (value) => {
    setTipoFilter(value);
    fetchRows({ tipoValue: value });
  };

  const handleEstadoFilterChange = (value) => {
    setEstadoFilter(value);
    fetchRows({ estadoValue: value });
  };

  return (
    <div className="resource-page">
      <div className="page-header">
        <div className="toolbar">
          <div className="toolbar-left">
            <div className="search-field">
              <Input
                placeholder="Buscar por número, cliente, proveedor"
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
              value={tipoFilter}
              options={TIPO_OPTIONS}
              onChange={(event) => handleTipoFilterChange(event.target.value)}
              className="filter-select"
              style={{ width: '140px', marginLeft: '0.5rem' }}
            />
            <Select
              value={estadoFilter}
              options={ESTADO_OPTIONS}
              onChange={(event) => handleEstadoFilterChange(event.target.value)}
              className="filter-select"
              style={{ width: '140px', marginLeft: '0.5rem' }}
            />
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem' }}>
            <Button variant="outline" onClick={() => window.location.href = '/liquidaciones/nueva'}>
              <FileText size={16} /> Nueva Liquidación
            </Button>
          </div>
        </div>
      </div>

      <div className="table-container">
        <table className="datatable">
          <thead>
            <tr>
              <th style={{ width: '40px' }} />
              <th style={{ width: '130px' }}>Número</th>
              <th style={{ width: '100px' }}>Tipo</th>
              <th>Destinatario</th>
              <th style={{ width: '120px' }}>Fecha</th>
              <th style={{ width: '110px' }}>Estado</th>
              <th style={{ width: '130px' }}>Total</th>
              <th style={{ width: '110px' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => {
              const rowId = row.id;
              const isNewRow = String(rowId).startsWith('new-');
              const state = isNewRow ? 'new' : (saveState?.[rowId] || '');
              const archived = row.deleted_at;
              const hasRowError = errors?.[rowId]?._row;
              const STATE_COLOR = { saving: 'var(--color-warning-text)', saved: 'var(--color-success-text)', error: 'var(--color-danger-text)', '': 'var(--color-success-text)', new: '#94a3b8' };
              const SAVE_LABEL = { saving: 'Guardando…', saved: 'Guardado', error: 'Error al guardar', new: 'Nuevo' };
              const isSavedPulse = false;
              const displayRowNum = rowIndex + 1;
              const rowClass = [
                hasRowError ? 'has-row-error' : '',
                isSavedPulse ? 'row-saved-pulse' : ''
              ].filter(Boolean).join(' ');
              const { destinatarioNombre } = buildListRowView(row);

              return (
                <tr key={row.id} className={rowClass}>
                  <td style={{ width: '40px' }}>
                    <span className="state-dot" style={{ backgroundColor: STATE_COLOR[state] }} title={SAVE_LABEL[state] || ''} />
                    <span className="row-number">{displayRowNum}</span>
                  </td>
                  <td className="mono">{row.numero}</td>
                  <td>{tipoBadge(row.tipo)}</td>
                  <td>{destinatarioNombre}</td>
                  <td className="mono">{dateRender(row.fecha_emision)}</td>
                  <td>{estadoBadge(row.estado)}</td>
                  <td className="mono">{currencyRender(row.total)}</td>
                  <td>
                    <div className="row-actions">
                      <button
                        type="button"
                        className="btn-ghost"
                        aria-label="Abrir detalle"
                        title="Abrir detalle"
                        onClick={(event) => {
                          event.stopPropagation();
                          setSelectedKey(row.id);
                        }}
                      >
                        <FileText size={15} />
                      </button>
                      {archived ? (
                        <button
                          type="button"
                          className="btn-ghost"
                          aria-label="Restaurar"
                          title="Restaurar"
                          onClick={(event) => {
                            event.stopPropagation();
                            restoreRow(rowId);
                          }}
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 4v16"/><path d="M7 8l5 5 5-5"/><path d="M17 20V4"/></svg>
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="btn-ghost"
                          aria-label={archived ? 'Restaurar' : (isNewRow ? 'Eliminar' : 'Archivar')}
                          title={archived ? 'Restaurar' : (isNewRow ? 'Eliminar' : 'Archivar')}
                          onClick={(event) => {
                            event.stopPropagation();
                            setToDelete(rowId);
                          }}
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr>
                <td colSpan={8} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  Sin liquidaciones.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {rows.length > 0 && (
        <StateBar key={rows.length} count={rows.length} singular="liquidación" plural="liquidaciones" saveState={saveState} errors={errors} rows={rows} lastAction={lastAction} />
      )}

      {Boolean(selectedKey) && (
        <LiquidacionDetailModal
          liquidacionId={selectedKey}
          open
          onClose={() => setSelectedKey(null)}
          onSaved={fetchRows}
        />
      )}

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Archivar liquidación"
        message="¿Querés archivar esta liquidación? Podés restaurarla luego."
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

export default Liquidaciones;