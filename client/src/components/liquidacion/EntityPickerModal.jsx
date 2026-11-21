import { useEffect, useState } from 'react';
import { Loader2, Check } from 'lucide-react';
import Modal from '../ui/Modal';
import { clientes as clientesResource, proveedores as proveedoresResource, choferes as choferesResource } from '../../api/resources';
import { viajes as viajesResource } from '../../api/resources';
import { entityCountText, viajesLoadErrorMessage } from '../../lib/liquidacionPicker';

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
  const [countsError, setCountsError] = useState('');

  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    setLoading(true);
    setLoadError(null);
    setLocalCounts(new Map());
    setCountsError('');

    const fetchEntities = async () => {
      try {
        let entitiesRes;
        if (tipo === 'cliente') {
          entitiesRes = await clientesResource.list();
        } else if (tipo === 'chofer') {
          entitiesRes = await choferesResource.list();
        } else {
          entitiesRes = await proveedoresResource.list();
        }

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
        if (!cancelled) setCountsError(viajesLoadErrorMessage('counts'));
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

  const getEntityLabel = (tipo) => {
      if (tipo === 'cliente') return 'Cliente';
      if (tipo === 'chofer') return 'Chofer';
      return 'Proveedor';
    };

    const getEntityLabelPlural = (tipo) => {
      if (tipo === 'cliente') return 'clientes';
      if (tipo === 'chofer') return 'choferes';
      return 'proveedores';
    };

    return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Seleccionar ${getEntityLabel(tipo)}`}
    >
      <div className="entity-picker-modal" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {loading ? (
          <div className="entity-picker-loading">
            <Loader2 size={24} className="spin" />
            <span>Cargando {getEntityLabelPlural(tipo)}...</span>
          </div>
        ) : loadError ? (
          <div className="entity-picker-empty">{loadError}</div>
        ) : entities.length === 0 ? (
          <div className="entity-picker-empty">
            No hay {getEntityLabelPlural(tipo)} registrados.
          </div>
        ) : (
          <>
            {countsError && <div className="entity-picker-error" role="alert">{countsError}</div>}
            <div className="entity-picker-list">
              {entities.map(entity => {
                let displayEntity;
                if (tipo === 'chofer') {
                  displayEntity = {
                    id: entity.id,
                    razon_social: `${entity.nombre} ${entity.apellido}`,
                    cuit: entity.cuil,
                    condicion_iva: 'Sin condición IVA',
                  };
                } else {
                  displayEntity = {
                    id: entity.id,
                    razon_social: entity.razon_social,
                    cuit: entity.cuit,
                    condicion_iva: entity.condicion_iva,
                  };
                }
                const count = localCounts.get(entity.id);
                return (
                  <button
                    key={entity.id}
                    className="entity-picker-item"
                    onClick={() => handleSelect(displayEntity)}
                    type="button"
                  >
                    <span className="entity-name">{displayEntity.razon_social}</span>
                    <span className={`entity-count ${!countsError && (count || 0) === 0 ? 'zero' : ''}`}>
                      {entityCountText(count, Boolean(countsError))}
                    </span>
                    <Check size={16} className="entity-check" />
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}