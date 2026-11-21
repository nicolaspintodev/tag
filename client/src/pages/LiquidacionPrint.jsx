import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer } from 'lucide-react';
import { liquidaciones as liquidacionesResource } from '../api/resources';
import { toNumber } from '../lib/liquidacion';
import { buildPrintView } from '../lib/liquidacionViews';
import Button from '../components/ui/Button';

const dateRender = (v) => {
  if (!v) return '-';
  return new Date(v).toLocaleDateString('es-AR');
};

const currencyRender = (v) => {
  const amount = toNumber(v);
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(amount);
};

export default function LiquidacionPrint() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [liquidacion, setLiquidacion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    liquidacionesResource.show(id)
      .then(data => { if (!cancelled) setLiquidacion(data); })
      .catch(err => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [id]);

  const handlePrint = () => window.print();
  const handleBack = () => navigate(`/liquidaciones/${id}`);

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Cargando...</div>;
  if (error) return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-danger-text)' }}>Error: {error}</div>;
  if (!liquidacion) return <div style={{ padding: '2rem', textAlign: 'center' }}>No encontrado</div>;

  const { destinatarioNombre, destinatarioDocumento, labelDestinatario, labelMonto, total } = buildPrintView(liquidacion);

  const viajes = liquidacion.viajes || [];
  const subtotal = viajes.reduce((s, v) => s + toNumber(v.pivot?.monto), 0);
  const ivaTotal = viajes.reduce((s, v) => s + toNumber(v.pivot?.iva_monto), 0);

  return (
    <div className="print-page" style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem', fontFamily: 'system-ui, sans-serif', fontSize: '10pt', lineHeight: '1.4' }}>
      <div className="print-header" style={{ marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '2px solid #333', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem' }}>LIQUIDACIÓN {liquidacion.numero}</h1>
          <div style={{ fontSize: '0.9rem', color: '#666' }}>Tipo: {labelDestinatario} • Estado: {liquidacion.estado}</div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button variant="outline" onClick={handleBack}><ArrowLeft size={16} /> Volver</Button>
          <Button onClick={handlePrint}><Printer size={16} /> Imprimir / PDF</Button>
        </div>
      </div>

      <div className="print-content">
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1.5rem' }}>
          <tbody>
            <tr>
              <td style={{ width: '50%', padding: '0.3rem 0', fontWeight: 'bold' }}>{labelDestinatario}:</td>
              <td style={{ width: '50%', padding: '0.3rem 0' }}>{destinatarioNombre}</td>
            </tr>
            <tr>
              <td style={{ padding: '0.3rem 0', fontWeight: 'bold' }}>CUIT:</td>
              <td style={{ padding: '0.3rem 0' }}>{destinatarioDocumento || '-'}</td>
            </tr>
            <tr>
              <td style={{ padding: '0.3rem 0', fontWeight: 'bold' }}>Fecha Emisión:</td>
              <td style={{ padding: '0.3rem 0' }}>{dateRender(liquidacion.fecha_emision)}</td>
            </tr>
            <tr>
              <td style={{ padding: '0.3rem 0', fontWeight: 'bold' }}>N° Liquidación:</td>
              <td style={{ padding: '0.3rem 0' }}>{liquidacion.numero}</td>
            </tr>
          </tbody>
        </table>

        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1rem', fontSize: '9pt' }}>
          <thead>
            <tr style={{ background: '#f0f0f0', borderBottom: '2px solid #333' }}>
              <th style={{ padding: '0.4rem', textAlign: 'left', borderRight: '1px solid #ddd' }}>Código</th>
              <th style={{ padding: '0.4rem', textAlign: 'left', borderRight: '1px solid #ddd' }}>Fecha</th>
              <th style={{ padding: '0.4rem', textAlign: 'left', borderRight: '1px solid #ddd' }}>Origen → Destino</th>
              <th style={{ padding: '0.4rem', textAlign: 'right', borderRight: '1px solid #ddd' }}>{labelMonto}</th>
              <th style={{ padding: '0.4rem', textAlign: 'right', borderRight: '1px solid #ddd' }}>IVA $</th>
              <th style={{ padding: '0.4rem', textAlign: 'right' }}>Monto Final</th>
            </tr>
          </thead>
          <tbody>
            {viajes.map((v) => (
              <tr key={v.id} style={{ borderBottom: '1px solid #eee', pageBreakInside: 'avoid' }}>
                <td style={{ padding: '0.3rem', borderRight: '1px solid #ddd', fontFamily: 'monospace' }}>{v.codigo_viaje}</td>
                <td style={{ padding: '0.3rem', borderRight: '1px solid #ddd' }}>{dateRender(v.fecha_salida)}</td>
                <td style={{ padding: '0.3rem', borderRight: '1px solid #ddd' }}>{v.origen || '-'} → {v.destino || '-'}</td>
                <td style={{ padding: '0.3rem', textAlign: 'right', borderRight: '1px solid #ddd' }}>{currencyRender(v.pivot?.monto)}</td>
                <td style={{ padding: '0.3rem', textAlign: 'right', borderRight: '1px solid #ddd' }}>{currencyRender(v.pivot?.iva_monto)}</td>
                <td style={{ padding: '0.3rem', textAlign: 'right', fontWeight: 600 }}>{currencyRender(v.pivot?.monto_final ?? v.pivot?.monto)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <table style={{ width: '100%', borderCollapse: 'collapse', borderTop: '2px solid #333' }}>
          <tbody>
            <tr>
              <td style={{ width: '60%', padding: '0.4rem', textAlign: 'right', fontWeight: 'bold' }}>Subtotal:</td>
              <td style={{ width: '40%', padding: '0.4rem', textAlign: 'right' }}>{currencyRender(subtotal)}</td>
            </tr>
            <tr>
              <td style={{ padding: '0.4rem', textAlign: 'right', fontWeight: 'bold' }}>IVA Total (21%):</td>
              <td style={{ padding: '0.4rem', textAlign: 'right' }}>{currencyRender(ivaTotal)}</td>
            </tr>
            <tr style={{ borderTop: '2px solid #333' }}>
              <td style={{ padding: '0.5rem', textAlign: 'right', fontWeight: 'bold', fontSize: '11pt' }}>TOTAL GENERAL:</td>
              <td style={{ padding: '0.5rem', textAlign: 'right', fontWeight: 'bold', fontSize: '11pt' }}>{currencyRender(total)}</td>
            </tr>
          </tbody>
        </table>

        {liquidacion.notas && (
          <div style={{ marginTop: '2rem', padding: '1rem', border: '1px solid #ddd', borderRadius: '4px' }}>
            <strong>Observaciones:</strong>
            <p style={{ margin: '0.5rem 0 0' }}>{liquidacion.notas}</p>
          </div>
        )}
      </div>
    </div>
  );
}