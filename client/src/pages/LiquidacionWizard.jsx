import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Save, FileText, X } from 'lucide-react';
import Stepper from '../components/liquidacion/Stepper';
import WizardStep1 from '../components/liquidacion/WizardStep1';
import WizardStep2 from '../components/liquidacion/WizardStep2';
import WizardStep3 from '../components/liquidacion/WizardStep3';
import WizardStep4 from '../components/liquidacion/WizardStep4';
import Button from '../components/ui/Button';
import { liquidaciones as liquidacionesResource } from '../api/resources';
import StateBar from '../components/ui/StateBar';

const STORAGE_KEY = 'liquidacion_wizard_draft';
const STEPS = ['tipo', 'header', 'seleccion', 'montos'];

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

  return (
    <div className="resource-page">
      <div className="page-header">
        <div className="toolbar">
          <div className="toolbar-left">
            <Button variant="ghost" onClick={() => navigate('/liquidaciones')}>
              <X size={16} /> Volver
            </Button>
          </div>
        </div>
      </div>

      <Stepper activeStep={step + 1} />

      <div className="wizard-content" style={{ minHeight: '400px' }}>
        <CurrentStep
          data={data}
          updateData={updateData}
          error={error}
          onSubmit={submit}
        />
      </div>

      <div className="wizard-footer" style={{
        position: 'sticky', bottom: 0, left: 0, right: 0,
        padding: '1rem 1.5rem', background: 'var(--bg-secondary)',
        borderTop: '1px solid var(--border-color)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        zIndex: 100, gap: '1rem'
      }}>
        <div>
          {!isFirstStep && (
            <Button variant="outline" onClick={prevStep} disabled={loading}>
              <ChevronLeft size={16} /> Anterior
            </Button>
          )}
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', marginLeft: 'auto' }}>
          {!isLastStep ? (
            <Button onClick={nextStep} disabled={loading}>
              Siguiente <ChevronRight size={16} />
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={handleSaveBorrador} disabled={loading || data.viaje_ids.length === 0}>
                <Save size={16} /> Guardar Borrador
              </Button>
              <Button onClick={handleCrear} disabled={loading || data.viaje_ids.length === 0}>
                <FileText size={16} /> Crear Liquidación
              </Button>
            </>
          )}
        </div>
      </div>

      {lastAction && <StateBar key={Date.now()} count={1} singular="liquidación" plural="liquidaciones" saveState={saveState} errors={error ? { _global: error } : {}} rows={[]} lastAction={lastAction} />}
    </div>
  );
}