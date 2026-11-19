const STEPS = [
  { key: 1, label: 'Tipo y Cliente' },
  { key: 2, label: 'Datos Liquidación' },
  { key: 3, label: 'Seleccionar Viajes' },
  { key: 4, label: 'Revisar Montos' },
];

export default function Stepper({ activeStep }) {
  return (
    <div className="wizard-stepper" style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>
      {STEPS.map((step, idx) => (
        <div key={step.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, position: 'relative' }}>
          {idx < STEPS.length - 1 && (
            <div style={{ position: 'absolute', top: '14px', left: '50%', right: '50%', height: '2px', background: activeStep > step.key ? 'var(--color-primary)' : 'var(--border-color)', zIndex: 0 }} />
          )}
          <div style={{
            width: '28px', height: '28px', borderRadius: '50%',
            background: activeStep >= step.key ? 'var(--color-primary)' : 'var(--bg-tertiary)',
            color: activeStep >= step.key ? 'white' : 'var(--text-muted)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 600, fontSize: '0.85rem', zIndex: 1,
            border: activeStep === step.key ? '2px solid var(--color-primary)' : 'none'
          }}>
            {step.key}
          </div>
          <span style={{ marginTop: '0.4rem', fontSize: '0.75rem', color: activeStep >= step.key ? 'var(--text-primary)' : 'var(--text-muted)', textAlign: 'center', whiteSpace: 'nowrap' }}>
            {step.label}
          </span>
        </div>
      ))}
    </div>
  );
}