import { useEffect, useState } from 'react';
import { Loader2, Check } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { clientes as clientesResource, proveedores as proveedoresResource } from '../../api/resources';
import { viajes as viajesResource } from '../../api/resources';

export default function EntityPickerModal({
  tipo,
  open,
  onClose,
  onSelect,
}) {
  const [entities, setEntities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [localCounts, setLocalCounts] = useState(new Map());

  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    setLoading(true);
    setLocalCounts(new Map());

    const fetchEntities = async () => {
      try {
        const [entitiesRes, countsRes] = await Promise.all([
          tipo === 'cliente' ? clientesResource.list() : proveedoresResource.list(),
          viajesResource.disponiblesPorEntidad({ tipo }),
        ]);

        if (cancelled) return;

        const entitiesArray = Array.isArray(entitiesRes) ? entitiesRes : entitiesRes.data || [];
        const countsArray = Array.isArray(countsRes) ? countsRes : [];

        const countsMap = new Map();
        countsArray.forEach(c => countsMap.set(c.id, c.cantidad));

        setEntities(entitiesArray);
        setLocalCounts(countsMap);
      } catch (err) {
        console.error('Error loading entities:', err);
        setEntities([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchEntities();
    return () => { cancelled = true; };
  }, [open, tipo]);

  const handleSelect = (entity) => {
    onSelect(entity);
    onClose();
  };

  if (!open) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Seleccionar ${tipo === 'cliente' ? 'Cliente' : 'Proveedor'}`}
      size="lg"
      className="modal-fullscreen"
    >
      <div className="entity-picker-modal" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {loading ? (
          <div className="entity-picker-loading">
            <Loader2 size={24} className="spin" />
            <span>Cargando {tipo === 'cliente' ? 'clientes' : 'proveedores'}...</span>
          </div>
        ) : entities.length === 0 ? (
          <div className="entity-picker-empty">
            No hay {tipo === 'cliente' ? 'clientes' : 'proveedores'} registrados.
          </div>
        ) : (
          <div className="entity-picker-list">
            {entities.map(entity => (
              <button
                key={entity.id}
                className="entity-picker-item"
                onClick={() => handleSelect({ id: entity.id, razon_social: entity.razon_social })}
                type="button"
              >
                <span className="entity-name">{entity.razon_social}</span>
                <span className={`entity-count ${(localCounts.get(entity.id) || 0) === 0 ? 'zero' : ''}`}>
                  ({localCounts.get(entity.id) || 0})
                </span>
                <Check size={16} className="entity-check" />
              </button>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}