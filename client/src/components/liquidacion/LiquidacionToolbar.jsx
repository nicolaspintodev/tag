import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';

const TIPO_OPTIONS = [
  { value: 'cliente', label: 'Cliente' },
  { value: 'chofer', label: 'Chofer' },
  { value: 'proveedor', label: 'Proveedor (próximamente)', disabled: true },
];

export default function LiquidacionToolbar({
  tipo,
  cliente,
  proveedor,
  chofer,
  fecha_emision,
  onTipoChange,
  onEntityPick,
  onEntityClear,
  onFechaChange,
}) {
  const currentEntity = tipo === 'cliente' ? cliente : (tipo === 'chofer' ? chofer : proveedor);
  const entityLabel = tipo === 'cliente' ? 'cliente' : (tipo === 'chofer' ? 'chofer' : 'proveedor');
  const pickButtonLabel = currentEntity ? `Cambiar ${entityLabel}` : `Elegir ${entityLabel}`;

  return (
    <div className="liquidacion-toolbar">
      <div className="liquidacion-toolbar-line">
        <div className="liquidacion-toolbar-group toolbar-left">
          <label className="toolbar-label">TIPO</label>
          <div className="select-wrapper">
            <Select
              value={tipo}
              options={TIPO_OPTIONS}
              onChange={(e) => {
                const newTipo = e.target.value;
                onTipoChange(newTipo);
              }}
              className="tipo-select"
            />
          </div>

          <Button
            variant="outline"
            onClick={onEntityPick}
            className={`entity-pick-btn ${currentEntity ? '' : 'entity-pick-required'}`}
          >
            {pickButtonLabel}
          </Button>
          {currentEntity && (
            <span className="entity-label">{currentEntity.razon_social}</span>
          )}
          {currentEntity && (
            <Button variant="ghost" size="sm" onClick={onEntityClear} className="entity-clear-btn">
              ✕
            </Button>
          )}
        </div>

        <div className="liquidacion-toolbar-group toolbar-right">
          <label className="toolbar-label">Fecha emisión</label>
          <Input
            type="date"
            value={fecha_emision}
            onChange={(e) => onFechaChange(e.target.value)}
            className="fecha-input"
            required
          />
        </div>
      </div>
    </div>
  );
}