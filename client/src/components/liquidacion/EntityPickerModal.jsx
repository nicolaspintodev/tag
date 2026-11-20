import { useEffect, useState } from 'react';
import { Loader2, Check } from 'lucide-react';
import Modal from '../ui/Modal';
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
  const [loadError, setLoadError] = useState(null);
  const [localCounts, setLocalCounts] = useState(new Map());

  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    setLoading(true);
    setLoadError(null);
    setLocalCounts(new Map());

    const fetchEntities = async () => {
      try {
        const entitiesRes = tipo === 'cliente'
          ? await clientesResource.list()
          : await proveedoresResource.list();

        if (cancelled) return;

        const entitiesArray = Array.isArray(entitiesRes) ? entitiesRes : entitiesRes.data || [];
        setEntities(entitiesArray);
      } catch (err) {
        console.error('Error loading entities:', err);
        if (!cancelled) {
          setEntities([]);
          setLoadError('No se pudieron cargar las entidades.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    const fetchCounts = async () => {
      try {
        const countsRes = await viajesResource.disponiblesPorEntidad({ tipo });
        if (cancelled) return;

        const countsArray = Array.isArray(countsRes) ? countsRes : [];
        const countsMap = new Map();
        countsArray.forEach(c => countsMap.set(c.id, c.cantidad));
        setLocalCounts(countsMap);
      } catch (err) {
        console.error('Error loading entity counts:', err);
      }
    };

    fetchEntities();
    fetchCounts();

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
    >
      <div className="entity-picker-modal" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {loading ? (
          <div className="entity-picker-loading">
            <Loader2 size={24} className="spin" />
            <span>Cargando {tipo === 'cliente' ? 'clientes' : 'proveedores'}...</span>
          </div>
        ) : loadError ? (
          <div className="entity-picker-empty">{loadError}</div>
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