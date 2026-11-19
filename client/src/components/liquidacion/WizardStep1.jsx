import { useEffect, useState } from 'react';
import { Building2, Truck, Check } from 'lucide-react';
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

  const isClienteSelected = data.tipo === 'cliente';
  const isProveedorSelected = data.tipo === 'proveedor';
  const hasSelection = data.cliente_id || data.proveedor_id;

  return (
    <div className="wizard-step">
      <h2 className="wizard-step-title">1. Tipo y Destinatario</h2>
      <p className="wizard-step-subtitle">Tipo de liquidación</p>

      <div className="tipo-cards">
        <label className={`tipo-card ${isClienteSelected ? 'selected' : ''}`}>
          <input
            type="radio"
            name="tipo"
            value="cliente"
            checked={isClienteSelected}
            onChange={() => handleTipoChange('cliente')}
            style={{ display: 'none' }}
          />
          <div className="tipo-card-icon">
            <Building2 size={28} style={{ color: isClienteSelected ? 'var(--text-invert)' : 'var(--text-muted)' }} />
          </div>
          <span className="tipo-card-title">Cliente</span>
          <span className="tipo-card-subtitle">Cobrar a cliente</span>
          <div className="tipo-card-check">
            <Check size={12} />
          </div>
        </label>
        <label className={`tipo-card ${isProveedorSelected ? 'selected' : ''}`}>
          <input
            type="radio"
            name="tipo"
            value="proveedor"
            checked={isProveedorSelected}
            onChange={() => handleTipoChange('proveedor')}
            style={{ display: 'none' }}
          />
          <div className="tipo-card-icon">
            <Truck size={28} style={{ color: isProveedorSelected ? 'var(--text-invert)' : 'var(--text-muted)' }} />
          </div>
          <span className="tipo-card-title">Proveedor</span>
          <span className="tipo-card-subtitle">Pagar a chofer/proveedor</span>
          <div className="tipo-card-check">
            <Check size={12} />
          </div>
        </label>
      </div>

      {isClienteSelected && (
        <div className="wizard-field">
          <label className="wizard-field-label">Cliente</label>
          <select
            className="wizard-field-select"
            value={data.cliente_id || ''}
            options={clienteOptions}
            onChange={(e) => updateData({ cliente_id: e.target.value || null })}
            placeholder="Seleccionar cliente..."
            required={true}
            disabled={clientes.length === 0}
          />
          <span className="wizard-field-help">
            Se filtrarán viajes terminados sin liquidar de este cliente.
          </span>
        </div>
      )}

      {isProveedorSelected && (
        <div className="wizard-field">
          <label className="wizard-field-label">Proveedor</label>
          <select
            className="wizard-field-select"
            value={data.proveedor_id || ''}
            options={proveedorOptions}
            onChange={(e) => updateData({ proveedor_id: e.target.value || null })}
            placeholder="Seleccionar proveedor..."
            required={true}
            disabled={proveedores.length === 0}
          />
          <span className="wizard-field-help">
            Se filtrarán viajes terminados sin liquidar de este proveedor.
          </span>
        </div>
      )}

      {!hasSelection && (
        <p style={{ color: 'var(--color-danger-text)', fontSize: '0.8125rem', marginTop: '0.5rem' }}>
          Seleccioná un tipo y un destinatario para continuar.
        </p>
      )}
    </div>
  );
}