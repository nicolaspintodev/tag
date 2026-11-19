import { Search, ChevronDown, ChevronUp } from 'lucide-react';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';

const TIPO_OPTIONS = [
  { value: 'cliente', label: 'Cliente' },
  { value: 'proveedor', label: 'Proveedor' },
  { value: 'chofer', label: 'Chofer (próximamente)', disabled: true },
];

const SORT_COLUMNS = [
  { value: '', label: 'Sin orden' },
  { value: 'codigo_viaje', label: 'Código' },
  { value: 'fecha_salida', label: 'Fecha' },
  { value: 'origen_destino', label: 'Origen → Destino' },
  { value: 'peso_carga', label: 'Peso (kg)' },
  { value: 'precio_pactado', label: 'Precio' },
];

const SORT_DIRECTIONS = [
  { value: 'desc', label: 'Descendente' },
  { value: 'asc', label: 'Ascendente' },
];

export default function LiquidacionToolbar({
  tipo,
  cliente,
  proveedor,
  fecha_emision,
  filters,
  sort,
  onTipoChange,
  onEntityPick,
  onEntityClear,
  onFechaChange,
  onSearchChange,
  onFilterDateChange,
  onSortChange,
}) {
  const currentEntity = tipo === 'cliente' ? cliente : proveedor;
  const entityLabel = tipo === 'cliente' ? 'cliente' : 'proveedor';
  const pickButtonLabel = currentEntity ? `Cambiar ${entityLabel}` : `Elegir ${entityLabel}`;

  return (
    <div className="liquidacion-toolbar">
      <div className="liquidacion-toolbar-line">
        <div className="liquidacion-toolbar-group">
          <label className="toolbar-label">TIPO</label>
          <div className="select-wrapper">
            <Select
              value={tipo}
              options={TIPO_OPTIONS.filter(o => !o.disabled || o.value === tipo)}
              onChange={(e) => {
                const newTipo = e.target.value;
                onTipoChange(newTipo);
              }}
              className="tipo-select"
            />
          </div>
        </div>

        <div className="liquidacion-toolbar-group">
          <Button variant="outline" onClick={onEntityPick} className="entity-pick-btn">
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

        <div className="liquidacion-toolbar-group">
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

      <div className="liquidacion-toolbar-line">
        <div className="liquidacion-toolbar-group search-group">
          <label className="toolbar-label visually-hidden">Buscar</label>
          <div className="search-input-wrapper">
            <Search size={16} className="search-icon" />
            <Input
              type="text"
              placeholder="Buscar..."
              value={filters.search || ''}
              onChange={(e) => onSearchChange(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        <div className="liquidacion-toolbar-group date-filter-group">
          <label className="toolbar-label">Desde</label>
          <Input
            type="date"
            value={filters.fecha_desde || ''}
            onChange={(e) => onFilterDateChange({ fecha_desde: e.target.value })}
            className="date-filter-input"
          />
        </div>

        <div className="liquidacion-toolbar-group date-filter-group">
          <label className="toolbar-label">Hasta</label>
          <Input
            type="date"
            value={filters.fecha_hasta || ''}
            onChange={(e) => onFilterDateChange({ fecha_hasta: e.target.value })}
            className="date-filter-input"
          />
        </div>

        <div className="liquidacion-toolbar-group sort-group">
          <label className="toolbar-label">Ordenar</label>
          <div className="sort-controls">
            <Select
              value={sort.column || ''}
              options={SORT_COLUMNS}
              onChange={(e) => onSortChange({ column: e.target.value || null, direction: sort.direction })}
              className="sort-column-select"
            />
            <Select
              value={sort.direction}
              options={SORT_DIRECTIONS}
              onChange={(e) => onSortChange({ column: sort.column, direction: e.target.value })}
              className="sort-direction-select"
              disabled={!sort.column}
            />
          </div>
        </div>
      </div>
    </div>
  );
}