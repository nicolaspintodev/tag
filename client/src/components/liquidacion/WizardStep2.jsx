import Input from '../../components/ui/Input';

export default function WizardStep2({ data, updateData }) {
  return (
    <div className="wizard-step" style={{ maxWidth: '600px' }}>
      <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)' }}>2. Datos de la Liquidación</h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label style={{ display: 'block', fontWeight: 500, marginBottom: '0.4rem' }}>Fecha de emisión *</label>
          <Input
            type="date"
            value={data.fecha_emision}
            onChange={(e) => updateData({ fecha_emision: e.target.value })}
            required
            style={{ width: '100%', maxWidth: '250px' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontWeight: 500, marginBottom: '0.4rem' }}>Notas</label>
          <Input
            type="text"
            value={data.notas || ''}
            onChange={(e) => updateData({ notas: e.target.value })}
            placeholder="Observaciones internas..."
            style={{ width: '100%', maxWidth: '600px' }}
          />
        </div>
      </div>

      <div style={{ marginTop: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
        La fecha de emisión se usará como referencia para la liquidación.
      </div>
    </div>
  );
}