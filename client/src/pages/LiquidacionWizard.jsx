import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Save, FileText } from 'lucide-react';
import { liquidaciones as liquidacionesResource, viajes as viajesResource } from '../api/resources';
import StateBar from '../components/ui/StateBar';
import LiquidacionToolbar from '../components/liquidacion/LiquidacionToolbar';
import EntityPickerModal from '../components/liquidacion/EntityPickerModal';
import LiquidacionPreview from '../components/liquidacion/LiquidacionPreview';
import LiquidacionSelectionGrid from '../components/grid/LiquidacionSelectionGrid';
import { buildSelectionGridColumns } from '../lib/columns/liquidacion';
import { deriveMontos, computeTotals } from '../lib/liquidacion';

const STORAGE_KEY = 'liquidacion_wizard_draft';

const initialState = {
  tipo: 'cliente',
  cliente_id: null,
  proveedor_id: null,
  cliente: null,
  proveedor: null,
  fecha_emision: new Date().toISOString().slice(0, 10),
  notas: '',
  viaje_ids: [],
  montos: {},
  viajesData: [],
};

export default function LiquidacionWizard() {
  const navigate = useNavigate();
  const [vista, setVista] = useState('edicion');
  const [data, setData] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [saveState] = useState({});
  const [lastAction, setLastAction] = useState(null);
  const [filters, setFilters] = useState({ fecha_desde: '', fecha_hasta: '', search: '' });
  const [sort, setSort] = useState({ column: 'precio_pactado', direction: 'desc' });
  const [selectedIds, setSelectedIds] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);

  const dataRef = useRef(data);
  dataRef.current = data;

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setData(prev => ({ ...prev, ...parsed }));
      } catch (e) {
        console.warn('Failed to parse wizard draft', e);
      }
    }
  }, []);

  const saveDraft = useCallback(() => {
    const draft = {
      ...data,
      filters,
      sort,
      selectedIds,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  }, [data, filters, sort, selectedIds]);

  const clearDraft = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  useEffect(() => {
    saveDraft();
  }, [saveDraft]);

  const fetchViajes = useCallback(async () => {
    const { tipo, cliente_id, proveedor_id } = dataRef.current;
    if (!cliente_id && !proveedor_id) return;

    setLoading(true);
    try {
      const params = {
        tipo,
        [tipo === 'cliente' ? 'cliente_id' : 'proveedor_id']: tipo === 'cliente' ? cliente_id : proveedor_id,
        ...(filters.fecha_desde && { fecha_desde: filters.fecha_desde }),
        ...(filters.fecha_hasta && { fecha_hasta: filters.fecha_hasta }),
      };

      const response = await viajesResource.disponiblesParaLiquidacion(params);
      const viajesArray = Array.isArray(response) ? response : [];

      setData(prev => ({ ...prev, viajesData: viajesArray }));

      if (selectedIds.length > 0) {
        const newMontos = deriveMontos(viajesArray.filter(v => selectedIds.includes(v.id)));
        setData(prev => ({ ...prev, montos: { ...prev.montos, ...newMontos } }));
      }
    } catch (err) {
      console.error('Error fetching viajes:', err);
      setData(prev => ({ ...prev, viajesData: [] }));
    } finally {
      setLoading(false);
    }
  }, [filters.fecha_desde, filters.fecha_hasta, selectedIds]);

  useEffect(() => {
    fetchViajes();
  }, [fetchViajes]);

  const handleTipoChange = useCallback((newTipo) => {
    setData(prev => ({
      ...prev,
      tipo: newTipo,
      cliente_id: null,
      proveedor_id: null,
      cliente: null,
      proveedor: null,
      viaje_ids: [],
      selectedIds: [],
      montos: {},
      viajesData: [],
    }));
    setSelectedIds([]);
  }, []);

  const handleEntityPick = useCallback(() => {
    setModalOpen(true);
  }, []);

  const handleEntityClear = useCallback(() => {
    setData(prev => ({
      ...prev,
      [prev.tipo === 'cliente' ? 'cliente_id' : 'proveedor_id']: null,
      [prev.tipo === 'cliente' ? 'cliente' : 'proveedor']: null,
      viaje_ids: [],
      selectedIds: [],
      montos: {},
      viajesData: [],
    }));
    setSelectedIds([]);
  }, []);

  const handleEntitySelect = useCallback((entity) => {
    setData(prev => ({
      ...prev,
      [prev.tipo === 'cliente' ? 'cliente_id' : 'proveedor_id']: entity.id,
      [prev.tipo === 'cliente' ? 'cliente' : 'proveedor']: entity,
      viaje_ids: [],
      selectedIds: [],
      montos: {},
      viajesData: [],
    }));
    setSelectedIds([]);
    setModalOpen(false);
  }, []);

  const handleFechaChange = useCallback((value) => {
    setData(prev => ({ ...prev, fecha_emision: value }));
  }, []);

  const handleSearchChange = useCallback((value) => {
    setFilters(prev => ({ ...prev, search: value }));
  }, []);

  const handleFilterDateChange = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const handleSortChange = useCallback((newSort) => {
    setSort(prev => ({ ...prev, ...newSort }));
  }, []);

  const handleSelectionChange = useCallback((newSelectedIds) => {
    setSelectedIds(newSelectedIds);
    setData(prev => ({ ...prev, viaje_ids: newSelectedIds }));

    if (newSelectedIds.length > 0) {
      const newMontos = deriveMontos(data.viajesData.filter(v => newSelectedIds.includes(v.id)));
      setData(prev => ({ ...prev, montos: { ...prev.montos, ...newMontos } }));
    }
  }, [data.viajesData]);

  const goToPreview = useCallback(() => {
    if (data.cliente_id || data.proveedor_id) {
      if (selectedIds.length > 0) {
        setVista('preview');
      }
    }
  }, [data.cliente_id, data.proveedor_id, selectedIds.length]);

  const goToEdicion = useCallback(() => {
    setVista('edicion');
  }, []);

  const submit = async (estado) => {
    setLoading(true);
    setError(null);

    try {
      const payload = {
        tipo: data.tipo,
        [data.tipo === 'cliente' ? 'cliente_id' : 'proveedor_id']: data[data.tipo === 'cliente' ? 'cliente_id' : 'proveedor_id'],
        fecha_emision: data.fecha_emision,
        notas: data.notas || undefined,
        estado,
        viajes: data.viaje_ids.map(viajeId => ({
          viaje_id: viajeId,
          monto: data.montos[viajeId]?.monto,
          iva_monto: data.montos[viajeId]?.iva_monto,
        })),
      };

      const response = await liquidacionesResource.create(payload);
      clearDraft();
      setLastAction({ type: 'saved', message: `Liquidación ${response.numero} creada como ${estado}` });
      navigate('/liquidaciones');
    } catch (err) {
      setError(err.message || 'Error al crear liquidación');
      setLastAction({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBorrador = () => submit('borrador');
  const handleCrear = () => submit('pendiente');

  const hasDestinatario = data.cliente_id || data.proveedor_id;
  const isEdicion = vista === 'edicion';

  const columns = useMemo(() => buildSelectionGridColumns(), []);
  const rows = useMemo(() => {
    let result = data.viajesData || [];
    if (filters.search) {
      const search = filters.search.toLowerCase();
      result = result.filter(v =>
        (v.codigo_viaje?.toLowerCase().includes(search)) ||
        (v.origen?.toLowerCase().includes(search)) ||
        (v.destino?.toLowerCase().includes(search)) ||
        (v.cliente?.razon_social?.toLowerCase().includes(search)) ||
        (v.proveedor?.razon_social?.toLowerCase().includes(search))
      );
    }
    if (sort.column) {
      result = [...result].sort((a, b) => {
        let aVal = a[sort.column];
        let bVal = b[sort.column];
        if (sort.column === 'origen_destino') {
          aVal = `${a.origen || ''} → ${a.destino || ''}`;
          bVal = `${b.origen || ''} → ${b.destino || ''}`;
        }
        if (aVal == null && bVal == null) return 0;
        if (aVal == null) return 1;
        if (bVal == null) return -1;
        const cmp = aVal > bVal ? 1 : -1;
        return sort.direction === 'asc' ? cmp : -cmp;
      });
    }
    return result;
  }, [data.viajesData, filters.search, sort.column, sort.direction]);

  const { subtotal } = computeTotals(rows.filter(v => selectedIds.includes(v.id)));

  return (
    <div className="resource-page" style={{
      padding: '0',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      <div className="wizard-header" style={{
        padding: '1rem 1.5rem',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexShrink: 0
      }}>
        <button className="wizard-back-btn" onClick={() => navigate('/liquidaciones')}>
          <ChevronLeft size={16} /> Volver
        </button>
      </div>

      {isEdicion ? (
        <>
          <LiquidacionToolbar
            tipo={data.tipo}
            cliente={data.cliente}
            proveedor={data.proveedor}
            fecha_emision={data.fecha_emision}
            filters={filters}
            sort={sort}
            onTipoChange={handleTipoChange}
            onEntityPick={handleEntityPick}
            onEntityClear={handleEntityClear}
            onFechaChange={handleFechaChange}
            onSearchChange={handleSearchChange}
            onFilterDateChange={handleFilterDateChange}
            onSortChange={handleSortChange}
          />

          <div className="wizard-content" style={{
            padding: '1.5rem',
            flex: '1',
            overflow: 'auto',
            minHeight: 0
          }}>
            <LiquidacionSelectionGrid
              columns={columns}
              rows={rows}
              rowKey="id"
              selectedIds={selectedIds}
              onSelectionChange={handleSelectionChange}
              loading={loading}
              hideToolbar={true}
            />

            {selectedIds.length > 0 && (
              <div style={{ marginTop: '1rem', padding: '1rem', background: 'var(--color-success-bg)', borderRadius: 'var(--radius-md)', color: 'var(--color-success-text)' }}>
                <strong>{selectedIds.length} viajes seleccionados</strong> — Subtotal: {new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(subtotal)}
              </div>
            )}
          </div>
        </>
      ) : (
        <LiquidacionPreview
          data={{
            ...data,
            updateData: (patch) => setData(prev => ({ ...prev, ...patch })),
          }}
          onEdit={goToEdicion}
          onSubmit={submit}
          loading={loading}
          error={error}
        />
      )}

      <div className="wizard-footer" style={{
        padding: '1rem 1.5rem',
        borderTop: '1px solid var(--border-color)',
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '0.5rem',
        background: 'var(--bg-secondary)',
        flexShrink: 0
      }}>
        {isEdicion ? (
          <button
            type="button"
            className={`wizard-btn ${hasDestinatario && selectedIds.length > 0 ? 'wizard-btn-primary' : 'wizard-btn-outline'}`}
            onClick={goToPreview}
            disabled={loading || !hasDestinatario || selectedIds.length === 0}
          >
            {'Vista previa >'}
          </button>
        ) : (
          <>
            <button
              type="button"
              className="wizard-btn wizard-btn-outline"
              onClick={goToEdicion}
              disabled={loading}
            >
              <ChevronLeft size={16} /> Editar
            </button>
            <button
              type="button"
              className="wizard-btn wizard-btn-outline"
              onClick={handleSaveBorrador}
              disabled={loading || selectedIds.length === 0}
            >
              <Save size={16} /> Guardar Borrador
            </button>
            <button
              type="button"
              className="wizard-btn wizard-btn-primary"
              onClick={handleCrear}
              disabled={loading || selectedIds.length === 0}
            >
              <FileText size={16} /> Crear Liquidación
            </button>
          </>
        )}
      </div>

      {lastAction && <StateBar key={Date.now()} count={1} singular="liquidación" plural="liquidaciones" saveState={saveState} errors={error ? { _global: error } : {}} rows={[]} lastAction={lastAction} />}

      <EntityPickerModal
        tipo={data.tipo}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSelect={handleEntitySelect}
      />
    </div>
  );
}