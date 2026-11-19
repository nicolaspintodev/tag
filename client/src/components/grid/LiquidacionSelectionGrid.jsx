import React from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import GridCell from './GridCell';

class LiquidacionSelectionGrid extends React.Component {
  constructor(props) {
    super(props);
    this.gridRef = React.createRef();
    this.handleSelectAll = this.handleSelectAll.bind(this);
    this.handleRowSelect = this.handleRowSelect.bind(this);
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
    const { columns, rows, rowKey = 'id', loading, selectedIds = [], sortColumn, sortDirection, hideToolbar = true } = this.props;

    if (loading) {
      return <div style={{ padding: '2rem', display: 'grid', placeItems: 'center' }}>Cargando...</div>;
    }

    return (
      <div ref={this.gridRef} tabIndex={0} className="resource-grid">
        {!hideToolbar && (
          <div className="grid-toolbar" style={{ display: 'flex', gap: '0.5rem', padding: '0.75rem', borderBottom: '1px solid var(--border-color)', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.3rem' }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Ordenar (interno)</label>
            </div>
          </div>
        )}

        <table className="datatable">
          <thead>
            <tr>
              {columns.map((column) => (
                <th
                  key={column.id}
                  style={column.width ? { width: column.width } : undefined}
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
            {rows.map((row) => {
              const rowId = row[rowKey];
              const isSelected = selectedIds.includes(rowId);
              return (
                <tr key={row.id} className={isSelected ? 'row-selected' : ''}>
                  {columns.map((column) => (
                    <GridCell
                      key={`${row.id}-${column.id}`}
                      column={column}
                      row={row}
                      value={row[column.accessor]}
                      isActive={false}
                      isEditing={false}
                      onSelect={() => {}}
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