import { useEffect, useMemo, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import Modal from '../ui/Modal';
import ConfirmDialog from '../ui/ConfirmDialog';
import Button from '../ui/Button';
import Input from '../ui/Input';
import ViajePickerModal from './ViajePickerModal';
import { liquidaciones } from '../../api/resources';
import {
  buildDetailPayload,
  computeDetailTotals,
  createDetailRequest,
  createDetailViaje,
  hasInvalidDetailAmount,
  normalizeDraft,
  shouldCloseAfterSave,
  toDetailDraft,
} from '../../lib/liquidacionDetail';
import { ivaFromMonto, tipoLabel, toNumber } from '../../lib/liquidacion';
import { entidadNombre, montoLabelVista } from '../../lib/liquidacionViews';

const dateRender = (value) => {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('es-AR');
};

const money = (value) => new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  minimumFractionDigits: 0,
}).format(value);

const estadoBadge = (estado) => {
  const colors = {
    borrador: { bg: 'var(--bg-tertiary)', color: 'var(--text-muted)' },
    pendiente: { bg: 'var(--color-warning-bg)', color: 'var(--color-warning-text)' },
    facturada: { bg: 'var(--color-success-bg)', color: 'var(--color-success-text)' },
  };
  const current = colors[estado] || colors.borrador;
  return (
    <span style={{ background: current.bg, color: current.color, padding: '0.15rem 0.5rem', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: 600 }}>
      {estado}
    </span>
  );
};

export default function LiquidacionDetailModal({ liquidacionId, open, onClose, onSaved }) {
  const [request, setRequest] = useState(() => createDetailRequest(open, liquidacionId));
  const [saving, setSaving] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [confirmPending, setConfirmPending] = useState(false);
  const [confirmDiscard, setConfirmDiscard] = useState(false);

  const { detail, draft, loading, error } = request.id === liquidacionId
    ? request
    : { detail: null, draft: null, loading: open, error: '' };

  useEffect(() => {
    if (!open || !liquidacionId) return undefined;
    let cancelled = false;

    liquidaciones.show(liquidacionId)
      .then((data) => {
        if (cancelled) return;
        setRequest({
          id: liquidacionId,
          detail: data,
          draft: toDetailDraft(data),
          loading: false,
          error: '',
        });
      })
      .catch((err) => {
        if (cancelled) return;
        setRequest({
          id: liquidacionId,
          detail: null,
          draft: null,
          loading: false,
          error: err.message || 'No se pudo cargar la liquidación',
        });
      });

    return () => { cancelled = true; };
  }, [open, liquidacionId]);

  const isBorrador = draft?.estado === 'borrador';
  const dirty = useMemo(
    () => Boolean(draft && normalizeDraft(draft) !== normalizeDraft(toDetailDraft(detail ?? {}))),
    [draft, detail],
  );
  const totals = useMemo(() => computeDetailTotals(draft?.viajes ?? []), [draft]);
  const hasInvalidAmount = hasInvalidDetailAmount(draft?.viajes ?? []);
  const tipo = draft?.tipo ?? detail?.tipo ?? 'cliente';

  const close = () => {
    if (dirty && isBorrador) {
      setConfirmDiscard(true);
      return;
    }
    onClose();
  };

  const updateViaje = (viajeId, patch) => {
    setRequest((prev) => ({
      ...prev,
      draft: {
        ...prev.draft,
        viajes: prev.draft.viajes.map((viaje) => (
          viaje.viaje_id === viajeId ? { ...viaje, ...patch } : viaje
        )),
      },
    }));
  };

  const removeViaje = (viajeId) => {
    setRequest((prev) => ({
      ...prev,
      draft: {
        ...prev.draft,
        viajes: prev.draft.viajes.filter((viaje) => viaje.viaje_id !== viajeId),
      },
    }));
  };

  const addViajes = (seleccionados) => {
    setRequest((prev) => {
      const existingIds = new Set(prev.draft.viajes.map((viaje) => viaje.viaje_id));
      const nuevos = seleccionados
        .filter((viaje) => !existingIds.has(viaje.id))
        .map((viaje) => createDetailViaje(viaje, tipo));
      return { ...prev, draft: { ...prev.draft, viajes: [...prev.draft.viajes, ...nuevos] } };
    });
    setPickerOpen(false);
  };

  const updateDraft = (patch) => {
    setRequest((prev) => ({
      ...prev,
      draft: { ...prev.draft, ...patch },
    }));
  };

  const save = async (estado) => {
    setSaving(true);
    setRequest((prev) => ({ ...prev, error: '' }));
    try {
      const response = await liquidaciones.saveDetalle(liquidacionId, buildDetailPayload(draft, { estado }));
      setRequest({
        id: liquidacionId,
        detail: response,
        draft: toDetailDraft(response),
        loading: false,
        error: '',
      });
      onSaved();
      if (shouldCloseAfterSave(estado)) onClose();
    } catch (err) {
      setRequest((prev) => ({ ...prev, error: err.message || 'No se pudieron guardar los cambios' }));
    } finally {
      setSaving(false);
      setConfirmPending(false);
    }
  };

  const footer = (
    <div className="detail-modal-footer">
      {saving && <span className="detail-modal-saving">Guardando…</span>}
      <Button variant="outline" onClick={close} disabled={saving}>Cerrar</Button>
      {isBorrador && (
        <>
          <Button
            variant="outline"
            disabled={!dirty || saving || hasInvalidAmount}
            onClick={() => save(null)}
          >
            Guardar cambios
          </Button>
          <Button
            disabled={saving || hasInvalidAmount}
            onClick={() => setConfirmPending(true)}
          >
            Guardar y pasar a pendiente
          </Button>
        </>
      )}
    </div>
  );

  return (
    <div className="detail-modal">
      <Modal
        open={open}
        title="Detalle de Liquidación"
        onClose={close}
        footer={footer}
      >
        {loading && <p className="detail-modal-message">Cargando detalle…</p>}
        {error && <p className="detail-modal-error">{error}</p>}
        {draft && (
          <>
            <div className="detail-modal-grid" style={{ marginBottom: '1.25rem' }}>
              <div className="detail-modal-field">
                <label>Número</label>
                <strong className="mono">{draft.numero}</strong>
              </div>
              <div className="detail-modal-field">
                <label>Tipo</label>
                <strong>{tipoLabel(draft.tipo)}</strong>
              </div>
              <div className="detail-modal-field">
                <label>Estado</label>
                <div>{estadoBadge(draft.estado)}</div>
              </div>
              <div className="detail-modal-field">
                <label>Entidad</label>
                  <strong>{entidadNombre(draft.entidad, draft.tipo)}</strong>
              </div>
              <div className="detail-modal-field">
                <label>Viajes incluidos</label>
                <strong>{draft.viajes.length}</strong>
              </div>
            </div>

            <div className="detail-modal-section">
              <h3>Datos generales</h3>
              <div className="detail-modal-grid">
                <div className="detail-modal-field">
                  <label htmlFor="detail-fecha-emision">Fecha de emisión</label>
                  <Input
                    id="detail-fecha-emision"
                    className="detail-modal-input"
                    type="date"
                    value={draft.fecha_emision}
                    disabled={!isBorrador || saving}
                    onChange={(event) => updateDraft({ fecha_emision: event.target.value })}
                  />
                </div>
                <div className="detail-modal-field" style={{ gridColumn: 'span 2' }}>
                  <label htmlFor="detail-notas">Notas</label>
                  <Input
                    id="detail-notas"
                    className="detail-modal-input"
                    type="text"
                    value={draft.notas}
                    disabled={!isBorrador || saving}
                    onChange={(event) => updateDraft({ notas: event.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="detail-modal-section">
              <div className="detail-modal-actions">
                <h3 style={{ margin: 0 }}>Viajes incluidos</h3>
                {isBorrador && (
                  <Button variant="outline" size="sm" onClick={() => setPickerOpen(true)}>
                    <Plus size={14} /> Agregar viajes
                  </Button>
                )}
              </div>
              <div className="detail-modal-table-wrap">
                <table className="detail-modal-table">
                  <thead>
                    <tr>
                      <th>Código</th>
                      <th>Fecha</th>
                      <th>Origen → Destino</th>
                      <th>Estado</th>
                      <th>{montoLabelVista(draft.tipo, 'detalle')}</th>
                      <th>IVA</th>
                      <th>Subtotal</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {draft.viajes.length === 0 && (
                      <tr>
                        <td colSpan="8" className="detail-modal-empty">Sin viajes incluidos.</td>
                      </tr>
                    )}
                    {draft.viajes.map((viaje) => (
                      <tr key={viaje.viaje_id}>
                        <td>{viaje.codigo_viaje}</td>
                        <td>{dateRender(viaje.fecha_salida)}</td>
                        <td>{(viaje.origen || '-') + ' → ' + (viaje.destino || '-')}</td>
                        <td>{viaje.estado || '-'}</td>
                        <td>
                          <Input
                            className="detail-modal-number"
                            type="number"
                            min="0"
                            step="0.01"
                            value={viaje.monto}
                            disabled={!isBorrador || saving}
                            onChange={(event) => {
                              const monto = event.target.value;
                              updateViaje(viaje.viaje_id, { monto, iva_monto: ivaFromMonto(monto) });
                            }}
                          />
                        </td>
                        <td className="mono">{money(toNumber(viaje.iva_monto))}</td>
                        <td className="mono">{money(toNumber(viaje.monto) + toNumber(viaje.iva_monto))}</td>
                        <td>
                          {isBorrador && (
                            <Button
                              variant="ghost"
                              size="sm"
                              aria-label="Quitar viaje"
                              onClick={() => removeViaje(viaje.viaje_id)}
                            >
                              <Trash2 size={14} />
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="detail-modal-totals">
              <div className="detail-modal-total">
                <span>Subtotal neto</span>
                <strong>{money(totals.subtotalNeto)}</strong>
              </div>
              <div className="detail-modal-total">
                <span>IVA total</span>
                <strong>{money(totals.ivaTotal)}</strong>
              </div>
              <div className="detail-modal-total">
                <span>Total guardado (neto)</span>
                <strong>{money(totals.totalGuardado)}</strong>
              </div>
              <div className="detail-modal-total">
                <span>Total a pagar</span>
                <strong>{money(totals.totalPagar)}</strong>
              </div>
            </div>
          </>
        )}
      </Modal>

      {pickerOpen && (
        <ViajePickerModal
          liquidacionId={liquidacionId}
          tipo={tipo}
          onConfirm={addViajes}
          onClose={() => setPickerOpen(false)}
        />
      )}

      <ConfirmDialog
        open={confirmPending}
        title="Pasar a pendiente"
        message="La liquidación pasará a pendiente y no podrá volver a borrador. Los viajes incluidos quedarán marcados como liquidados."
        confirmLabel="Confirmar"
        confirmVariant="primary"
        onCancel={() => setConfirmPending(false)}
        onConfirm={() => save('pendiente')}
      />

      <ConfirmDialog
        open={confirmDiscard}
        title="Descartar cambios"
        message="Hay cambios sin guardar. ¿Querés descartarlos y cerrar?"
        confirmLabel="Descartar y cerrar"
        onCancel={() => setConfirmDiscard(false)}
        onConfirm={() => {
          setConfirmDiscard(false);
          onClose();
        }}
      />
    </div>
  );
}
