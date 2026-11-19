import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Save, FileText } from 'lucide-react';
import Stepper from '../components/liquidacion/Stepper';
import WizardStep1 from '../components/liquidacion/WizardStep1';
import WizardStep2 from '../components/liquidacion/WizardStep2';
import WizardStep3 from '../components/liquidacion/WizardStep3';
import WizardStep4 from '../components/liquidacion/WizardStep4';
import { liquidaciones as liquidacionesResource } from '../api/resources';
import StateBar from '../components/ui/StateBar';

const STORAGE_KEY = 'liquidacion_wizard_draft';

const initialState = {
  tipo: 'cliente',
  cliente_id: null,
  proveedor_id: null,
  fecha_emision: new Date().toISOString().slice(0, 10),
  notas: '',
  viaje_ids: [],
  montos: {},
  viajesData: [],
};

export default function LiquidacionWizard() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [data, setData] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [saveState] = useState({});
  const [lastAction, setLastAction] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setData(prev => ({ ...prev, ...parsed }));
        if (parsed._step !== undefined) setStep(parsed._step);
      } catch (e) {
        console.warn('Failed to parse wizard draft', e);
      }
    }
  }, []);

  const saveDraft = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...data, _step: step }));
  }, [data, step]);

  const clearDraft = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  useEffect(() => {
    saveDraft();
  }, [data, step, saveDraft]);

  const nextStep = () => {
    if (step < 3) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 0) setStep(step - 1);
  };

  const updateData = (patch) => {
    setData(prev => ({ ...prev, ...patch }));
  };

  const submit = async (estado) => {
    setLoading(true);
    setError(null);

    try {
      const payload = {
        tipo: data.tipo,
        [data.tipo === 'cliente' ? 'cliente_id' : 'proveedor_id']: data[data.tipo === 'cliente' ? 'cliente_id' : 'proveedor_id'],
        fecha_emision: data.fecha_emision,
        notas: data.notas || undefined,
        estado,
        viajes: data.viaje_ids.map(viajeId => ({
          viaje_id: viajeId,
          monto: data.montos[viajeId]?.monto,
          iva_monto: data.montos[viajeId]?.iva_monto,
        })),
      };

      const response = await liquidacionesResource.create(payload);
      clearDraft();
      setLastAction({ type: 'saved', message: `Liquidación ${response.numero} creada como ${estado}` });
      navigate(`/liquidaciones/${response.id}`);
    } catch (err) {
      setError(err.message || 'Error al crear liquidación');
      setLastAction({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBorrador = () => submit('borrador');
  const handleCrear = () => submit('pendiente');

  const StepComponents = [WizardStep1, WizardStep2, WizardStep3, WizardStep4];
  const CurrentStep = StepComponents[step];
  const isLastStep = step === 3;
  const isFirstStep = step === 0;
  const hasDestinatario = data.cliente_id || data.proveedor_id;

  return (
    <div className="wizard-container">
      <div className="wizard-card">
        <div className="wizard-header">
          <strong className="wizard-header-title">TAG Logística</strong>
          <div className="wizard-header-actions">
            <button className="wizard-back-btn" onClick={() => navigate('/liquidaciones')}>
              <ChevronLeft size={16} /> Volver
            </button>
          </div>
        </div>

        <Stepper activeStep={step + 1} />

        <div className="wizard-content">
          <CurrentStep
            data={data}
            updateData={updateData}
            error={error}
            onSubmit={submit}
          />
        </div>

        <div className="wizard-footer">
          {!isFirstStep && (
            <button
              type="button"
              className="wizard-btn wizard-btn-outline"
              onClick={prevStep}
              disabled={loading}
            >
              <ChevronLeft size={16} /> Anterior
            </button>
          )}
          <button
            type="button"
            className={`wizard-btn ${isLastStep ? 'wizard-btn-outline' : 'wizard-btn-primary'}`}
            onClick={isLastStep ? handleSaveBorrador : nextStep}
            disabled={loading || (isLastStep && !hasDestinatario) || (!isLastStep && step === 0 && !hasDestinatario)}
          >
            {isLastStep ? 'Guardar Borrador' : 'Siguiente >'}
          </button>
          {isLastStep && (
            <button
              type="button"
              className="wizard-btn wizard-btn-primary"
              onClick={handleCrear}
              disabled={loading || !hasDestinatario}
            >
              <FileText size={16} /> Crear Liquidación
            </button>
          )}
        </div>
      </div>

      {lastAction && <StateBar key={Date.now()} count={1} singular="liquidación" plural="liquidaciones" saveState={saveState} errors={error ? { _global: error } : {}} rows={[]} lastAction={lastAction} />}
    </div>
  );
}