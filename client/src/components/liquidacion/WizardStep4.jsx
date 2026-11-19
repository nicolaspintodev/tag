export default function WizardStep4({ data }) {
  return (
    <div className="wizard-step" style={{ maxWidth: '800px' }}>
      <h3 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>4. Revisar Montos y Confirmar</h3>
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        <p>Grid de montos con IVA y total (pendiente)</p>
        <p style={{ fontSize: '0.85rem' }}>Viajes seleccionados: {data.viaje_ids.length}</p>
      </div>
    </div>
  );
}