import React from 'react';
import { Search, X, ChevronUp, ChevronDown } from 'lucide-react';
import GridCell from './GridCell';
import { moveCell } from '../../lib/gridNavigation';

class LiquidacionSelectionGrid extends React.Component {
  constructor(props) {
    super(props);
    this.gridRef = React.createRef();
    this.state = { active: null, sortColumn: null, sortDirection: 'desc' };
    this.focusGrid = this.focusGrid.bind(this);
    this.scrollActiveIntoView = this.scrollActiveIntoView.bind(this);
    this.selectCell = this.selectCell.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleSort = this.handleSort.bind(this);
    this.handleFilterChange = this.handleFilterChange.bind(this);
    this.handleSelectAll = this.handleSelectAll.bind(this);
    this.handleRowSelect = this.handleRowSelect.bind(this);
  }

  focusGrid() {
    this.gridRef.current?.focus();
  }

  scrollActiveIntoView() {
    const cellEl = this.gridRef.current?.querySelector('.grid-cell.active');
    if (cellEl) cellEl.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }

  selectCell(pos) {
    this.setState({ active: pos }, () => { this.focusGrid(); this.scrollActiveIntoView(); });
  }

  handleKeyDown(event) {
    const { active } = this.state;
    const { rows, columns } = this.props;
    if (event.key === 'Tab') {
      event.preventDefault();
      this.move(event.shiftKey ? 'prev' : 'next');
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.move('down');
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.move('up');
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      this.move('right');
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      this.move('left');
    } else if (event.key === ' ' && active) {
      event.preventDefault();
      const column = columns[active.col];
      const row = rows[active.row];
      if (column?.id === 'select' && row) {
        this.handleRowSelect(row[this.props.rowKey]);
      }
    }
  }

  move(direction) {
    const { active } = this.state;
    const { rows, columns } = this.props;
    const dims = { rowCount: rows.length, columns };
    this.setState({ active: moveCell(active, direction, dims) }, () => { this.focusGrid(); this.scrollActiveIntoView(); });
  }

  handleSort(columnId) {
    const { sortColumn, sortDirection } = this.state;
    const newDirection = sortColumn === columnId && sortDirection === 'asc' ? 'desc' : 'asc';
    this.setState({ sortColumn: columnId, sortDirection: newDirection });
    this.props.onSort?.(columnId, newDirection);
  }

  handleFilterChange(filterKey, value) {
    this.props.onFilterChange?.({ [filterKey]: value });
  }

  handleSelectAll() {
    const { rows, rowKey, selectedIds, onSelectionChange } = this.props;
    const allIds = rows.map(r => r[rowKey]);
    const newSelection = selectedIds.length === allIds.length ? [] : allIds;
    onSelectionChange(newSelection);
  }

  handleRowSelect(rowId) {
    const { selectedIds, onSelectionChange } = this.props;
    const newSelection = selectedIds.includes(rowId)
      ? selectedIds.filter(id => id !== rowId)
      : [...selectedIds, rowId];
    onSelectionChange(newSelection);
  }

  render() {
    const { columns, rows, rowKey = 'id', loading, selectedIds = [], filters = {}, sortColumn, sortDirection } = this.props;

    if (loading) {
      return <div style={{ padding: '2rem', display: 'grid', placeItems: 'center' }}>Cargando...</div>;
    }

    const filterableColumns = columns.filter(c => c.filterable).slice(0, 3);

    return (
      <div ref={this.gridRef} onKeyDown={this.handleKeyDown} onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) this.setState({ active: null }); }} tabIndex={0} className="resource-grid">
        <div className="grid-toolbar" style={{ display: 'flex', gap: '0.5rem', padding: '0.75rem', borderBottom: '1px solid var(--border-color)', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', flex: 1, minWidth: '200px' }}>
            <Search size={14} style={{ color: 'var(--text-muted)' }} />
            <input type="text" placeholder="Buscar..." style={{ border: 'none', background: 'transparent', color: 'var(--text-primary)', width: '200px', outline: 'none' }} />
          </div>

          {filterableColumns.map(col => (
            <select
              key={col.id}
              value={filters[col.id] || ''}
              onChange={(e) => this.handleFilterChange(col.id, e.target.value)}
              style={{ minWidth: '140px', padding: '0.25rem 0.5rem', border: '1px solid var(--border-color)', borderRadius: '4px', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
            >
              <option value="">Todos</option>
              {col.filterOptions?.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          ))}

          <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.3rem' }}>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Ordenar Precio</label>
            <select
              value={sortColumn === 'precio_pactado' ? sortDirection : ''}
              onChange={(e) => this.handleSort(e.target.value ? 'precio_pactado' : null)}
              style={{ width: '150px', padding: '0.25rem 0.5rem', border: '1px solid var(--border-color)', borderRadius: '4px', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
            >
              <option value="">Por defecto</option>
              <option value="asc">Menor a Mayor</option>
              <option value="desc">Mayor a Menor</option>
            </select>
          </div>
        </div>

        <table className="datatable">
          <thead>
            <tr>
              {columns.map((column) => (
                <th
                  key={column.id}
                  style={column.width ? { width: column.width } : undefined}
                  onClick={() => column.sortable && this.handleSort(column.id)}
                  className={column.sortable ? 'sortable' : ''}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    {column.id === 'select' ? (
                      <input
                        type="checkbox"
                        checked={rows.length > 0 && selectedIds.length === rows.length}
                        onChange={this.handleSelectAll}
                        aria-label="Seleccionar todos"
                      />
                    ) : (
                      column.header
                    )}
                    {column.sortable && sortColumn === column.id && (
                      sortDirection === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => {
              const rowId = row[rowKey];
              const isSelected = selectedIds.includes(rowId);
              return (
                <tr key={row.id} className={isSelected ? 'row-selected' : ''}>
                  {columns.map((column, colIndex) => (
                    <GridCell
                      key={`${row.id}-${column.id}`}
                      column={column}
                      row={row}
                      value={row[column.accessor]}
                      isActive={this.state.active?.row === rowIndex && this.state.active?.col === colIndex}
                      isEditing={false}
                      onSelect={() => this.selectCell({ row: rowIndex, col: colIndex })}
                      onToggle={() => column.id === 'select' && this.handleRowSelect(rowId)}
                      checked={column.id === 'select' ? isSelected : undefined}
                      readOnly={true}
                    />
                  ))}
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr>
                <td colSpan={columns.length} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No hay viajes disponibles para liquidar.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="grid-summary" style={{ padding: '0.5rem 0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-color)' }}>
          {selectedIds.length} de {rows.length} viajes seleccionados
        </div>
      </div>
    );
  }
}

export default LiquidacionSelectionGrid;