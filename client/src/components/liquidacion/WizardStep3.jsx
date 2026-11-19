import { useEffect, useState, useCallback } from 'react';
import { Building2, Truck } from 'lucide-react';
import LiquidacionSelectionGrid from '../../components/grid/LiquidacionSelectionGrid';
import { buildSelectionGridColumns } from '../../lib/columns/liquidacion';
import Input from '../../components/ui/Input';

export default function WizardStep3({ data, updateData }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ fecha_desde: '', fecha_hasta: '' });
  const [sort, setSort] = useState({ column: null, direction: 'desc' });
  const [selectedIds, setSelectedIds] = useState(data.viaje_ids || []);

  const fetchViajes = useCallback(async () => {
    if (!data.cliente_id && !data.proveedor_id) {
      setRows([]);
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams({
        tipo: data.tipo,
        [data.tipo === 'cliente' ? 'cliente_id' : 'proveedor_id']: data[data.tipo === 'cliente' ? 'cliente_id' : 'proveedor_id'],
      });
      if (filters.fecha_desde) params.append('fecha_desde', filters.fecha_desde);
      if (filters.fecha_hasta) params.append('fecha_hasta', filters.fecha_hasta);
      if (sort.column) params.append('ordenar_precio', sort.direction);

      const response = await fetch(`${window.API_BASE_URL}/viajes/disponibles-para-liquidacion?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      });
      const fetchedData = await response.json();
      const viajesArray = Array.isArray(fetchedData) ? fetchedData : [];
      setRows(viajesArray);
      updateData({ viajesData: viajesArray });
    } catch (err) {
      console.error('Error fetching viajes:', err);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [data, filters, sort, updateData]);

  useEffect(() => {
    fetchViajes();
  }, [fetchViajes]);

  useEffect(() => {
    updateData({ viaje_ids: selectedIds });
  }, [selectedIds, updateData]);

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleSort = (column, direction) => {
    setSort({ column, direction });
  };

  const handleSelectionChange = (newSelectedIds) => {
    setSelectedIds(newSelectedIds);
  };

  const columns = buildSelectionGridColumns();
  columns.forEach(col => {
    if (col.id === 'cliente_id') {
      col.filterable = true;
      const clienteNombres = [...new Set(rows.map(r => r.cliente?.razon_social).filter(Boolean))];
      col.filterOptions = [{ value: '', label: 'Todos' }, ...clienteNombres.map(v => ({ value: v, label: v }))];
    }
    if (col.id === 'fecha_salida') col.filterable = false;
    if (col.id === 'precio_pactado') { col.sortable = true; }
  });

  const tipoLabel = data.tipo === 'cliente' ? 'Cliente' : 'Proveedor';
  const destinatario = data.tipo === 'cliente' ? data.cliente : data.proveedor;

  return (
    <div className="wizard-step">
      <h2 className="wizard-step-title">3. Seleccionar Viajes</h2>
      <p className="wizard-step-subtitle">Filtrá y seleccioná los viajes a incluir en la liquidación</p>

      <div className="wizard-section">
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap', alignItems: 'end' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            <span>{data.tipo === 'cliente' ? <Building2 size={16} /> : <Truck size={16} />}</span>
            <strong>{tipoLabel}:</strong>
            {destinatario?.razon_social || '(seleccionar en paso anterior)'}
          </div>

          <div className="wizard-field" style={{ marginBottom: 0, flex: 1, minWidth: '200px' }}>
            <label className="wizard-field-label">Fecha Desde</label>
            <Input type="date" value={filters.fecha_desde} onChange={(e) => handleFilterChange({ fecha_desde: e.target.value })} className="wizard-field-select" />
          </div>
          <div className="wizard-field" style={{ marginBottom: 0, flex: 1, minWidth: '200px' }}>
            <label className="wizard-field-label">Fecha Hasta</label>
            <Input type="date" value={filters.fecha_hasta} onChange={(e) => handleFilterChange({ fecha_hasta: e.target.value })} className="wizard-field-select" />
          </div>
        </div>

        <LiquidacionSelectionGrid
          columns={columns}
          rows={rows}
          rowKey="id"
          selectedIds={selectedIds}
          onSelectionChange={handleSelectionChange}
          onFilterChange={handleFilterChange}
          onSort={handleSort}
          loading={loading}
          filters={filters}
          sortColumn={sort.column}
          sortDirection={sort.direction}
        />
      </div>

      {selectedIds.length > 0 && (
        <div style={{ marginTop: '1rem', padding: '1rem', background: 'var(--color-success-bg)', borderRadius: 'var(--radius-md)', color: 'var(--color-success-text)' }}>
          <strong>{selectedIds.length} viajes seleccionados</strong> — Continúa al siguiente paso para revisar montos.
        </div>
      )}
    </div>
  );
}