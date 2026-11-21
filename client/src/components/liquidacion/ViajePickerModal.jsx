import { useEffect, useMemo, useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { liquidaciones } from '../../api/resources';
import { toNumber } from '../../lib/liquidacion';

const dateRender = (value) => {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('es-AR');
};

const money = (value) => new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  minimumFractionDigits: 0,
}).format(value);

export default function ViajePickerModal({ liquidacionId, onConfirm, onClose }) {
  const [request, setRequest] = useState({ id: liquidacionId, viajes: [], loading: true, error: '' });
  const [selection, setSelection] = useState({ id: liquidacionId, ids: [] });

  const { viajes, loading, error } = request.id === liquidacionId
    ? request
    : { viajes: [], loading: true, error: '' };
  const selected = useMemo(
    () => selection.id === liquidacionId ? selection.ids : [],
    [selection, liquidacionId],
  );

  useEffect(() => {
    let cancelled = false;

    liquidaciones.viajesDisponibles(liquidacionId)
      .then((data) => {
        if (!cancelled) setRequest({
          id: liquidacionId,
          viajes: Array.isArray(data) ? data : [],
          loading: false,
          error: '',
        });
      })
      .catch((err) => {
        if (!cancelled) setRequest({
          id: liquidacionId,
          viajes: [],
          loading: false,
          error: err.message || 'No se pudieron cargar los viajes disponibles',
        });
      });

    return () => { cancelled = true; };
  }, [liquidacionId]);

  const toggle = (id) => {
    setSelection((prev) => {
      const ids = prev.id === liquidacionId ? prev.ids : [];
      return {
        id: liquidacionId,
        ids: ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id],
      };
    });
  };

  const selectedViajes = useMemo(
    () => viajes.filter((viaje) => selected.includes(viaje.id)),
    [viajes, selected],
  );

  const suggestedAmount = (viaje) => toNumber(
    viaje.precio_pactado ?? viaje.costo_proveedor_ajustado ?? viaje.costo_proveedor ?? 0,
  );

  return (
    <Modal
      open
      className="viaje-picker-modal"
      title="Agregar viajes"
      onClose={onClose}
      footer={
        <div className="detail-modal-footer">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button
            disabled={selectedViajes.length === 0}
            onClick={() => onConfirm(selectedViajes)}
          >
            Agregar seleccionados
          </Button>
        </div>
      }
    >
      {loading && <p className="detail-modal-message">Cargando viajes disponibles…</p>}
      {error && <p className="detail-modal-error">{error}</p>}
      {!loading && !error && (
        <div className="detail-modal-table-wrap">
          <table className="detail-modal-table">
            <thead>
              <tr>
                <th />
                <th>Código</th>
                <th>Fecha</th>
                <th>Origen → Destino</th>
                <th>Estado</th>
                <th>Precio</th>
              </tr>
            </thead>
            <tbody>
              {selectedViajes.length === 0 && viajes.length === 0 && (
                <tr>
                  <td colSpan="6" className="detail-modal-empty">No hay viajes disponibles.</td>
                </tr>
              )}
              {viajes.map((viaje) => (
                <tr key={viaje.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selected.includes(viaje.id)}
                      onChange={() => toggle(viaje.id)}
                      aria-label={`Seleccionar viaje ${viaje.codigo_viaje || viaje.id}`}
                    />
                  </td>
                  <td>{viaje.codigo_viaje || '-'}</td>
                  <td>{dateRender(viaje.fecha_salida)}</td>
                  <td>{(viaje.origen || '-') + ' → ' + (viaje.destino || '-')}</td>
                  <td>{viaje.estado || '-'}</td>
                  <td className="mono">{money(suggestedAmount(viaje))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Modal>
  );
}
