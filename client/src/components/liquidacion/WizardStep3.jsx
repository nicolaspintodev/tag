export default function WizardStep3({ data }) {
  return (
    <div className="wizard-step" style={{ maxWidth: '800px' }}>
      <h3 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>3. Seleccionar Viajes</h3>
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        <p>Grid de selección de viajes (pendiente)</p>
        <p style={{ fontSize: '0.85rem' }}>Cliente/Proveedor: {data.tipo === 'cliente' ? data.cliente_id : data.proveedor_id}</p>
      </div>
    </div>
  );
}