import React from 'react';
import { Calculator } from 'lucide-react';
import GridCell from './GridCell';
import { formatCurrency } from '../../lib/currency';
import { moveCell } from '../../lib/gridNavigation';

class LiquidacionMontosGrid extends React.Component {
  constructor(props) {
    super(props);
    this.gridRef = React.createRef();
    this.state = { active: null, editing: null, draft: '' };
    this.focusGrid = this.focusGrid.bind(this);
    this.scrollActiveIntoView = this.scrollActiveIntoView.bind(this);
    this.selectCell = this.selectCell.bind(this);
    this.commitEdit = this.commitEdit.bind(this);
    this.cancelEdit = this.cancelEdit.bind(this);
    this.startEditAt = this.startEditAt.bind(this);
    this.move = this.move.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
  }

  focusGrid() { this.gridRef.current?.focus(); }
  scrollActiveIntoView() {
    const cellEl = this.gridRef.current?.querySelector('.grid-cell.active');
    if (cellEl) cellEl.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }
  selectCell(pos) { this.setState({ active: pos }, () => { this.focusGrid(); this.scrollActiveIntoView(); }); }

  commitEdit(stay) {
    const { columns, rows, rowKey, onCellChange } = this.props;
    const { editing } = this.state;
    if (!editing) return;
    const column = columns[editing.col];
    const row = rows[editing.row];
    const rowId = row?.[rowKey];
    if (row && column) onCellChange(rowId, column.id, this.state.draft);
    this.setState({ editing: null });
    if (!stay) {
      const dims = { rowCount: rows.length, columns };
      this.setState({ active: moveCell(editing, 'right', dims) }, () => { this.focusGrid(); this.scrollActiveIntoView(); });
    } else { this.focusGrid(); }
  }
  cancelEdit() { this.setState({ editing: null }); this.focusGrid(); }
  startEditAt(pos, initialValue) { this.setState({ active: pos, editing: pos, draft: initialValue || '' }, () => { this.focusGrid(); this.scrollActiveIntoView(); }); }

  move(direction) {
    const { active } = this.state;
    const { rows, columns } = this.props;
    const dims = { rowCount: rows.length, columns };
    this.setState({ active: moveCell(active, direction, dims) }, () => { this.focusGrid(); this.scrollActiveIntoView(); });
  }

  handleKeyDown(event) {
    const { editing, active } = this.state;
    const { rows, columns, readonly } = this.props;
    if (readonly) return;
    if (editing) {
      if (event.key === 'Enter') { event.preventDefault(); this.commitEdit(true); }
      return;
    }
    if (event.key === 'Tab') { event.preventDefault(); this.move(event.shiftKey ? 'prev' : 'next'); }
    else if (event.key === 'ArrowDown') { event.preventDefault(); this.move('down'); }
    else if (event.key === 'ArrowUp') { event.preventDefault(); this.move('up'); }
    else if (event.key === 'ArrowRight') { event.preventDefault(); this.move('right'); }
    else if (event.key === 'ArrowLeft') { event.preventDefault(); this.move('left'); }
    else if (event.key === 'Enter' && active) {
      event.preventDefault();
      const column = columns[active.col];
      if (column?.editable) {
        const currentValue = rows?.[active.row]?.[column.accessor] ?? '';
        this.startEditAt(active, currentValue);
      }
    }
  }

  getTotals() {
    const { rows } = this.props;
    const subtotal = rows.reduce((sum, r) => sum + (Number(r.precio_sugerido) || 0), 0);
    const ivaTotal = rows.reduce((sum, r) => sum + (Number(r.iva_monto) || 0), 0);
    const total = rows.reduce((sum, r) => sum + (Number(r.monto_final) || 0), 0);
    return { subtotal, ivaTotal, total };
  }

  render() {
    const { columns, rows, readonly, loading } = this.props;
    const { draft } = this.state;
    const totals = this.getTotals();

    if (loading) {
      return <div style={{ padding: '2rem', display: 'grid', placeItems: 'center' }}>Calculando...</div>;
    }

    return (
      <div ref={this.gridRef} onKeyDown={this.handleKeyDown} onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) this.setState({ active: null }); }} tabIndex={0} className="resource-grid">
        <table className="datatable">
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column.id} style={column.width ? { width: column.width } : undefined}>
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={row.id}>
                {columns.map((column, colIndex) => (
                  <GridCell
                    key={`${row.id}-${column.id}`}
                    column={column}
                    row={row}
                    value={row[column.accessor]}
                    draft={draft}
                    isActive={this.state.active?.row === rowIndex && this.state.active?.col === colIndex}
                    isEditing={this.state.editing?.row === rowIndex && this.state.editing?.col === colIndex}
                    onSelect={() => this.selectCell({ row: rowIndex, col: colIndex })}
                    onStartEdit={(initialValue) => this.startEditAt({ row: rowIndex, col: colIndex }, initialValue)}
                    onChange={(value) => this.setState({ draft: value })}
                    onCommit={this.commitEdit}
                    onCancel={this.cancelEdit}
                    readOnly={readonly || !column.editable}
                  />
                ))}
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={columns.length} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No hay viajes seleccionados.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="montos-totals" style={{
          position: 'sticky', bottom: 0, background: 'var(--bg-secondary)',
          borderTop: '1px solid var(--border-color)', padding: '0.75rem 1rem',
          display: 'flex', justifyContent: 'flex-end', gap: '2rem',
          fontSize: '0.9rem', fontWeight: 500
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', minWidth: '160px', textAlign: 'right' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 400 }}>Subtotal</span>
            <span style={{ color: 'var(--text-primary)' }}>{formatCurrency(totals.subtotal)}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', minWidth: '160px', textAlign: 'right' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 400 }}>IVA Total</span>
            <span style={{ color: 'var(--color-warning-text)' }}>{formatCurrency(totals.ivaTotal)}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', minWidth: '180px', textAlign: 'right', borderLeft: '2px solid var(--color-primary)', paddingLeft: '1rem' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 400 }}>Total General</span>
            <span style={{ color: 'var(--color-primary)', fontSize: '1.1rem', fontWeight: 700 }}>{formatCurrency(totals.total)}</span>
          </div>
        </div>
      </div>
    );
  }
}

export default LiquidacionMontosGrid;