import { useEffect, useMemo, useState } from 'react';
import { Calculator, AlertTriangle } from 'lucide-react';
import LiquidacionMontosGrid from '../../components/grid/LiquidacionMontosGrid';
import { buildMontosGridColumns } from '../../lib/columns/liquidacion';
import { formatCurrency, parseCurrency } from '../../lib/currency';

const IVA_DEFAULT = 0.21;

export default function WizardStep4({ data, updateData, onSubmit }) {
  const [rows, setRows] = useState([]);

  const derivedRows = useMemo(() => {
    if (!data.viaje_ids || data.viaje_ids.length === 0) return [];
    const viajesData = data.viajesData || [];
    return data.viaje_ids.map(viajeId => {
      const viaje = viajesData.find(v => v.id === viajeId);
      const saved = data.montos[viajeId] || {};
      const precio = viaje?.precio_pactado || 0;
      const ivaDefault = Math.round(precio * IVA_DEFAULT);

      return {
        id: viajeId,
        codigo_viaje: viaje?.codigo_viaje || `V-${viajeId}`,
        cliente_id: viaje?.cliente_id,
        cliente: viaje?.cliente,
        proveedor: viaje?.proveedor,
        precio_sugerido: precio,
        iva_monto: saved.iva_monto ?? ivaDefault,
        monto_final: saved.monto_final ?? (precio + ivaDefault),
        peso_carga: viaje?.peso_carga,
      };
    });
  }, [data.viaje_ids, data.montos, data.viajesData]);

  useEffect(() => {
    setRows(derivedRows);
  }, [derivedRows]);

  const handleCellChange = (rowId, columnId, value) => {
    const numericValue = parseCurrency(value);
    setRows(prev => prev.map(row => {
      if (row.id !== rowId) return row;

      let updates = { [columnId]: numericValue };

      if (columnId === 'iva_monto') {
        updates.monto_final = (row.precio_sugerido || 0) + numericValue;
      } else if (columnId === 'monto_final') {
        updates.iva_monto = numericValue - (row.precio_sugerido || 0);
      }

      updateData({
        montos: {
          ...data.montos,
          [rowId]: { monto: row.precio_sugerido, iva_monto: updates.iva_monto },
        },
      });

      return { ...row, ...updates };
    }));
  };

  const totals = useMemo(() => ({
    subtotal: rows.reduce((s, r) => s + (r.precio_sugerido || 0), 0),
    ivaTotal: rows.reduce((s, r) => s + (r.iva_monto || 0), 0),
    total: rows.reduce((s, r) => s + (r.monto_final || 0), 0),
  }), [rows]);

  const hasWarnings = rows.some(r => (r.iva_monto || 0) < 0 || (r.monto_final || 0) < 0);

  return (
    <div className="wizard-step">
      <h2 className="wizard-step-title">4. Revisar Montos</h2>
      <p className="wizard-step-subtitle">Verificá los importes y el IVA de cada viaje</p>

      {hasWarnings && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', background: 'var(--color-warning-bg)', color: 'var(--color-warning-text)', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: '0.85rem' }}>
          <AlertTriangle size={16} /> Algunos montos tienen valores negativos. Revisá IVA y Monto Final.
        </div>
      )}

      <div className="wizard-section">
        <LiquidacionMontosGrid
          columns={buildMontosGridColumns()}
          rows={rows}
          rowKey="id"
          onCellChange={handleCellChange}
          readonly={false}
          loading={false}
        />
      </div>

      <div className="wizard-section" style={{ background: 'var(--bg-hover)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <strong>Resumen:</strong> {rows.length} viajes • Subtotal: {formatCurrency(totals.subtotal)} • IVA: {formatCurrency(totals.ivaTotal)} • <strong style={{ color: 'var(--color-primary)' }}>Total: {formatCurrency(totals.total)}</strong>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              type="button"
              className="wizard-btn wizard-btn-outline"
              onClick={() => onSubmit('borrador')}
              disabled={rows.length === 0}
            >
              Guardar Borrador
            </button>
            <button
              type="button"
              className="wizard-btn wizard-btn-primary"
              onClick={() => onSubmit('pendiente')}
              disabled={rows.length === 0}
            >
              Crear Liquidación
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}