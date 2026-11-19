import Input from '../../components/ui/Input';

export default function WizardStep2({ data, updateData }) {
  return (
    <div className="wizard-step">
      <h2 className="wizard-step-title">2. Datos Liquidación</h2>
      <p className="wizard-step-subtitle">Fecha de emisión y observaciones</p>

      <div className="wizard-section">
        <h3 className="wizard-section-title">Información principal</h3>
        <div className="wizard-field-row">
          <div className="wizard-field">
            <label className="wizard-field-label">Fecha de emisión <span style={{ color: 'var(--color-danger-text)' }}>*</span></label>
            <Input
              type="date"
              value={data.fecha_emision}
              onChange={(e) => updateData({ fecha_emision: e.target.value })}
              required
              className="wizard-field-select"
            />
          </div>
          <div className="wizard-field">
            <label className="wizard-field-label">Notas</label>
            <Input
              type="text"
              value={data.notas || ''}
              onChange={(e) => updateData({ notas: e.target.value })}
              placeholder="Observaciones internas..."
              className="wizard-field-select"
            />
          </div>
        </div>
      </div>

      <p className="wizard-field-help">
        La fecha de emisión se usará como referencia para la liquidación.
      </p>
    </div>
  );
}