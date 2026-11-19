const STEPS = [
  { key: 1, label: 'Tipo y Destinatario' },
  { key: 2, label: 'Datos Liquidación' },
  { key: 3, label: 'Seleccionar Viajes' },
  { key: 4, label: 'Revisar Montos' },
];

export default function Stepper({ activeStep }) {
  const completedSteps = activeStep - 1;
  const progressWidth = completedSteps > 0 ? `${(completedSteps / (STEPS.length - 1)) * 100}%` : '0%';

  const getStepStatus = (stepKey) => {
    if (stepKey < activeStep) return 'completed';
    if (stepKey === activeStep) return 'active';
    return 'inactive';
  };

  return (
    <div className="wizard-stepper">
      <div className="wizard-stepper-progress" style={{ width: progressWidth }} />
      {STEPS.map((step) => (
        <div key={step.key} className={`wizard-stepper-step ${getStepStatus(step.key)}`}>
          <div className="wizard-stepper-circle">
            {step.key}
          </div>
          <span className="wizard-stepper-label">
            {step.label}
          </span>
        </div>
      ))}
    </div>
  );
}