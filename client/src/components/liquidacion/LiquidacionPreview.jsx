import { AlertTriangle } from 'lucide-react';
import Input from '../ui/Input';
import { buildPreviewView } from '../../lib/liquidacionPreview';

const money = (value) => new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  minimumFractionDigits: 0,
}).format(value);

export default function LiquidacionPreview({
  data,
  error,
}) {
  const { notas } = data;
  const { meta, amountLabel, rows, totals, hasWarnings } = buildPreviewView(data);

  return (
    <div className="liquidacion-preview">
      <div className="preview-header">
        <div>
          <h2>Vista previa de liquidación</h2>
          <p className="preview-subtitle">Revisá los datos antes de confirmar la liquidación.</p>
        </div>
      </div>

      <div className="preview-meta">
        {meta.map(item => (
          <div className="preview-meta-item" key={item.label}>
            <span className="preview-meta-label">{item.label}</span>
            <span className={`preview-meta-value${item.label === 'CUIT' ? ' mono' : ''}`}>{item.value}</span>
          </div>
        ))}
      </div>

      <div className="preview-section">
        <label className="preview-label" htmlFor="observaciones-liquidacion">Observaciones</label>
        <Input
          id="observaciones-liquidacion"
          type="text"
          value={notas || ''}
          onChange={(e) => data.updateData?.({ notas: e.target.value })}
          placeholder="Observaciones internas..."
          className="preview-notas-input"
        />
      </div>

      <div className="preview-section">
        <h3 className="preview-section-title">Viajes incluidos</h3>
        <table className="preview-table">
          <thead>
            <tr>
              <th>Código</th>
              <th>Fecha</th>
              <th>Origen → Destino</th>
              <th className="mono">{amountLabel}</th>
              <th className="mono">IVA $</th>
              <th className="mono">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ viaje, monto, iva_monto, monto_final }) => (
              <tr key={viaje.id}>
                <td>{viaje.codigo_viaje || '-'}</td>
                <td>{viaje.fecha_salida ? new Date(viaje.fecha_salida).toLocaleDateString('es-AR') : '-'}</td>
                <td className="truncate">{(viaje.origen || '-') + ' → ' + (viaje.destino || '-')}</td>
                <td className="mono">{money(monto)}</td>
                <td className="mono">{money(iva_monto)}</td>
                <td className="mono">{money(monto_final)}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="empty-row">No hay viajes seleccionados</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {hasWarnings && (
        <div className="preview-warning">
          <AlertTriangle size={16} /> Algunos importes son negativos. Revisá antes de confirmar.
        </div>
      )}

      <div className="preview-totals">
        <div className="totals-grid">
          <div className="total-row">
            <span>Subtotal</span>
            <span className="mono">{money(totals.subtotal)}</span>
          </div>
          <div className="total-row">
            <span>IVA (21%)</span>
            <span className="mono">{money(totals.ivaTotal)}</span>
          </div>
          <div className="total-row grand-total">
            <span>TOTAL GENERAL</span>
            <span className="mono">{money(totals.total)}</span>
          </div>
        </div>
      </div>

      {error && <div className="preview-error">{error}</div>}
    </div>
  );
}
