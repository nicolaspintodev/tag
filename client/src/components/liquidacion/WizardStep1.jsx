import { useEffect, useState } from 'react';
import { Building2, Truck } from 'lucide-react';
import Select from '../../components/ui/Select';
import { clientes as clientesResource, proveedores as proveedoresResource } from '../../api/resources';

export default function WizardStep1({ data, updateData }) {
  const [clientes, setClientes] = useState([]);
  const [proveedores, setProveedores] = useState([]);

  useEffect(() => {
    let cancelled = false;
    Promise.all([clientesResource.list(), proveedoresResource.list()])
      .then(([c, p]) => {
        if (!cancelled) {
          setClientes(Array.isArray(c) ? c : []);
          setProveedores(Array.isArray(p) ? p : []);
        }
      });
    return () => { cancelled = true; };
  }, []);

  const handleTipoChange = (tipo) => {
    updateData({ tipo, cliente_id: null, proveedor_id: null });
  };

  const clienteOptions = [{ value: '', label: 'Seleccionar cliente...' }, ...clientes.map(c => ({ value: c.id, label: c.razon_social }))];
  const proveedorOptions = [{ value: '', label: 'Seleccionar proveedor...' }, ...proveedores.map(p => ({ value: p.id, label: p.razon_social }))];

  return (
    <div className="wizard-step" style={{ maxWidth: '600px' }}>
      <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)' }}>1. Tipo y Destinatario</h3>

      <fieldset style={{ border: 'none', marginBottom: '1.5rem' }}>
        <legend style={{ fontWeight: 600, marginBottom: '0.75rem' }}>Tipo de liquidación</legend>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', padding: '1.5rem', border: '2px solid', borderRadius: '8px', cursor: 'pointer', flex: 1, borderColor: data.tipo === 'cliente' ? 'var(--color-primary)' : 'var(--border-color)', background: data.tipo === 'cliente' ? 'var(--color-primary-bg)' : 'transparent' }}>
            <Building2 size={28} style={{ color: data.tipo === 'cliente' ? 'var(--color-primary)' : 'var(--text-muted)' }} />
            <span style={{ fontWeight: 600 }}>Cliente</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Cobrar a cliente</span>
            <input type="radio" name="tipo" value="cliente" checked={data.tipo === 'cliente'} onChange={() => handleTipoChange('cliente')} style={{ display: 'none' }} />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', padding: '1.5rem', border: '2px solid', borderRadius: '8px', cursor: 'pointer', flex: 1, borderColor: data.tipo === 'proveedor' ? 'var(--color-primary)' : 'var(--border-color)', background: data.tipo === 'proveedor' ? 'var(--color-primary-bg)' : 'transparent' }}>
            <Truck size={28} style={{ color: data.tipo === 'proveedor' ? 'var(--color-primary)' : 'var(--text-muted)' }} />
            <span style={{ fontWeight: 600 }}>Proveedor</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Pagar a chofer/proveedor</span>
            <input type="radio" name="tipo" value="proveedor" checked={data.tipo === 'proveedor'} onChange={() => handleTipoChange('proveedor')} style={{ display: 'none' }} />
          </label>
        </div>
      </fieldset>

      {data.tipo === 'cliente' && (
        <div>
          <Select
            value={data.cliente_id || ''}
            options={clienteOptions}
            onChange={(e) => updateData({ cliente_id: e.target.value || null })}
            placeholder="Seleccionar cliente..."
            required={true}
            style={{ width: '100%', maxWidth: '400px' }}
          />
        </div>
      )}

      {data.tipo === 'proveedor' && (
        <div>
          <Select
            value={data.proveedor_id || ''}
            options={proveedorOptions}
            onChange={(e) => updateData({ proveedor_id: e.target.value || null })}
            placeholder="Seleccionar proveedor..."
            required={true}
            style={{ width: '100%', maxWidth: '400px' }}
          />
        </div>
      )}

      <div style={{ marginTop: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
        {data.tipo === 'cliente' ? 'Se filtrarán viajes terminados sin liquidar de este cliente.' : 'Se filtrarán viajes terminados sin liquidar de este proveedor.'}
      </div>
    </div>
  );
}