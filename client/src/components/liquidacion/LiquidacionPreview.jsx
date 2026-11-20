import { ChevronLeft, Save, FileText, AlertTriangle } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { computeTotals } from '../../lib/liquidacion';

export default function LiquidacionPreview({
  data,
  onEdit,
  onSubmit,
  loading,
  error,
}) {
  const { tipo, cliente, proveedor, fecha_emision, notas, viaje_ids, viajesData } = data;

  const selectedViajes = viaje_ids
    .map(id => viajesData.find(v => v.id === id))
    .filter(Boolean);

  const { subtotal, ivaTotal, total } = computeTotals(selectedViajes);
  const destinatario = cliente?.razon_social || proveedor?.razon_social || '-';
  const tipoLabel = tipo === 'cliente' ? 'Cliente' : 'Proveedor';

  const hasWarnings = selectedViajes.some(v => (v.precio_pactado ?? 0) < 0);

  return (
    <div className="liquidacion-preview">
      <div className="preview-header">
        <div>
          <h2>Vista previa de liquidación</h2>
          <Button variant="ghost" size="sm" onClick={onEdit}>
            <ChevronLeft size={16} /> Editar
          </Button>
        </div>
        <div className="preview-meta">
          <div><strong>Tipo:</strong> {tipoLabel}</div>
          <div><strong>Destinatario:</strong> {destinatario}</div>
          <div><strong>Fecha emisión:</strong> {fecha_emision}</div>
          <div><strong>Número:</strong> <span className="pending-badge">(pendiente)</span></div>
        </div>
      </div>

      <div className="preview-section">
        <label className="preview-label">Observaciones</label>
        <Input
          type="text"
          value={notas || ''}
          onChange={(e) => data.updateData?.({ notas: e.target.value })}
          placeholder="Observaciones internas..."
          className="preview-notas-input"
        />
      </div>

      <div className="preview-section">
        <table className="preview-table">
          <thead>
            <tr>
              <th>Código</th>
              <th>Fecha</th>
              <th>Origen → Destino</th>
              <th className="mono">Precio</th>
              <th className="mono">IVA $</th>
              <th className="mono">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {selectedViajes.map(v => {
              const precio = v.precio_pactado ?? 0;
              const iva = Math.round(precio * 0.21);
              const subtotal = precio + iva;
              return (
                <tr key={v.id}>
                  <td className="mono">{v.codigo_viaje || '-'}</td>
                  <td>{v.fecha_salida ? new Date(v.fecha_salida).toLocaleDateString('es-AR') : '-'}</td>
                  <td className="truncate">{(v.origen || '-') + ' → ' + (v.destino || '-')}</td>
                  <td className="mono">{new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(precio)}</td>
                  <td className="mono">{new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(iva)}</td>
                  <td className="mono">{new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(subtotal)}</td>
                </tr>
              );
            })}
            {selectedViajes.length === 0 && (
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
            <span className="mono">{new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(subtotal)}</span>
          </div>
          <div className="total-row">
            <span>IVA (21%)</span>
            <span className="mono">{new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(ivaTotal)}</span>
          </div>
          <div className="total-row grand-total">
            <span>TOTAL GENERAL</span>
            <span className="mono">{new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(total)}</span>
          </div>
        </div>
      </div>

      {error && <div className="preview-error">{error}</div>}

      <div className="preview-actions">
        <Button variant="outline" onClick={() => onSubmit('borrador')} disabled={loading || selectedViajes.length === 0}>
          <Save size={16} /> Guardar Borrador
        </Button>
        <Button onClick={() => onSubmit('pendiente')} disabled={loading || selectedViajes.length === 0}>
          <FileText size={16} /> Crear Liquidación
        </Button>
      </div>
    </div>
  );
}