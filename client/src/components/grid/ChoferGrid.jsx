import React from 'react';
import { Eye, RotateCcw, Trash2 } from 'lucide-react';
import Spinner from '../ui/Spinner';
import GridCell from './GridCell';
import { serializeSelection, parsePaste } from '../../lib/gridClipboard';
import { moveCell, firstEditableCol } from '../../lib/gridNavigation';

const SAVE_LABEL = { saving: 'Guardando…', saved: 'Guardado', error: 'Error al guardar', new: 'Nuevo' };

const STATE_COLOR = { saving: 'var(--color-warning-text)', saved: 'var(--color-success-text)', error: 'var(--color-danger-text)', '': 'var(--color-success-text)', new: '#94a3b8' };

class ChoferGrid extends React.Component {
  constructor(props) {
    super(props);
    this.gridRef = React.createRef();
    this.state = { active: null, editing: null, draft: '', savedRowKey: null };
    this.focusGrid = this.focusGrid.bind(this);
    this.selectCell = this.selectCell.bind(this);
    this.commitEdit = this.commitEdit.bind(this);
    this.cancelEdit = this.cancelEdit.bind(this);
    this.startEditAt = this.startEditAt.bind(this);
    this.move = this.move.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleCopy = this.handleCopy.bind(this);
    this.handlePasteEvent = this.handlePasteEvent.bind(this);
    this.handlePaste = this.handlePaste.bind(this);
  }

  focusGrid() {
    this.gridRef.current?.focus();
  }

  scrollActiveIntoView() {
    const cellEl = this.gridRef.current?.querySelector('.grid-cell.active');
    if (cellEl) {
      cellEl.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    }
  }

  selectCell(pos) {
    this.setState({ active: pos }, () => { this.focusGrid(); this.scrollActiveIntoView(); });
  }

  commitEdit(stay) {
    const { columns, rows, rowKey, saveState } = this.props;
    const { editing } = this.state;
    const current = editing;
    if (!current) return;
    const column = columns[current.col];
    const row = rows[current.row];
    const rowId = row?.[rowKey];
    if (row && column) this.props.onCellChange(row[rowKey], column.id, this.state.draft);
    this.setState({ editing: null });
    
    // Trigger row saved pulse animation (250ms)
    if (rowId && saveState[rowId] === 'saved') {
      this.setState({ savedRowKey: rowId }, () => {
        setTimeout(() => this.setState({ savedRowKey: null }), 250);
      });
    }
    
    if (!stay) {
      const dims = { rowCount: this.props.rows.length, columns: this.props.columns };
      this.setState({ active: moveCell(current, 'right', dims) }, () => { this.focusGrid(); this.scrollActiveIntoView(); });
    } else {
      this.focusGrid();
    }
  }

  cancelEdit() {
    this.setState({ editing: null });
    this.focusGrid();
  }

  startEditAt(pos, initialValue) {
    this.setState({ active: pos, editing: pos, draft: initialValue || '' }, () => { this.focusGrid(); this.scrollActiveIntoView(); });
  }

  move(direction) {
    const { active } = this.state;
    const { rows, columns, onAddRow } = this.props;
    const dims = { rowCount: rows.length, columns };

    if (direction === 'down' && active && active.row === rows.length - 1) {
      const newKey = onAddRow?.();
      if (newKey) {
        const first = firstEditableCol(columns);
        this.setState({ active: { row: rows.length, col: first } }, () => { this.focusGrid(); this.scrollActiveIntoView(); });
        return;
      }
    }

    this.setState({ active: moveCell(active, direction, dims) }, () => { this.focusGrid(); this.scrollActiveIntoView(); });
  }

  handlePaste(text) {
    if (!this.state.active) return;
    const matrix = parsePaste(text);
    if (matrix.length === 0) return;
    const { active, columns, rows, rowKey, onCellChange } = this.props;
    matrix.forEach((rowCells, r) => {
      rowCells.forEach((value, c) => {
        const pos = { row: active.row + r, col: active.col + c };
        const column = columns[pos.col];
        const row = rows[pos.row];
        if (column?.editable && row) onCellChange(row[rowKey], column.id, value);
      });
    });
  }

  handleKeyDown(event) {
    const { editing, active } = this.state;
    const { rows, columns } = this.props;
    if (editing) {
      if (event.key === 'Enter') {
        event.preventDefault();
        this.commitEdit(true);
      }
      return;
    }
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
    } else if (event.key === 'Enter') {
      event.preventDefault();
      if (active) {
        const currentValue = rows?.[active.row]?.[columns[active.col]?.accessor] ?? '';
        this.startEditAt(active, currentValue);
      }
    } else if (event.key === 'Delete' && active) {
      const { columns, rows, rowKey, onCellChange } = this.props;
      const column = columns[this.state.active.col];
      const row = rows[this.state.active.row];
      if (column?.editable && row) onCellChange(row[rowKey], column.id, '');
    }
  }

  handleCopy(event) {
    if (!this.state.active) return;
    const { columns, rows } = this.props;
    const { active } = this.state;
    const column = columns[active.col];
    const row = rows[active.row];
    if (!column || !row) return;
    event.clipboardData.setData('text/plain', serializeSelection([[row[column.accessor] ?? '']]));
    event.preventDefault();
  }

  handlePasteEvent(event) {
    const text = event.clipboardData.getData('text/plain');
    if (!text) return;
    event.preventDefault();
    this.handlePaste(text);
  }

  render() {
    const { columns, rows, rowKey = 'id', loading } = this.props;
    const { draft } = this.state;

    if (loading) {
      return (
        <div style={{ padding: '2rem', display: 'grid', placeItems: 'center' }}>
          <Spinner />
        </div>
      );
    }

    return (
      <div ref={this.gridRef} onKeyDown={this.handleKeyDown} onCopy={this.handleCopy} onPaste={this.handlePasteEvent} onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) this.setState({ active: null }); }} tabIndex={0} className="resource-grid">
        <table className="datatable">
          <thead>
            <tr>
              <th className="col-estado" style={{ width: '40px' }} />
              {columns.map((column) => (
                <th
                  key={column.id}
                  style={column.width ? { width: column.width } : undefined}
                >
                  {column.header}
                </th>
              ))}
              <th className="col-acciones" style={{ width: '110px' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => {
              const rowId = row[rowKey];
              const isNewRow = String(rowId).startsWith('new-');
              const state = isNewRow ? 'new' : (this.props.saveState?.[row[rowKey]] || '');
              const archived = row.deleted_at;
              const serverRowError = this.props.errors?.[row[rowKey]]?._row;
              const hasValidationError = columns.some((col) => col.validate && !col.warn && col.validate(row[col.accessor], row));
              const hasValidationWarning = columns.some((col) => col.validate && col.warn && col.validate(row[col.accessor], row));
              const hasRowError = serverRowError || hasValidationError;
              const hasRowWarning = hasValidationWarning;
              const isSavedPulse = this.state.savedRowKey === rowId;
              const displayRowNum = rowIndex + 1;
              const rowClass = [
                hasRowError ? 'has-row-error' : (hasRowWarning ? 'has-row-warning' : ''),
                isSavedPulse ? 'row-saved-pulse' : ''
              ].filter(Boolean).join(' ');
              return (
                <tr key={row.id} className={rowClass}>
                  <td className="col-estado" onDoubleClick={(event) => event.stopPropagation()}>
                    <span className="state-dot" style={{ backgroundColor: STATE_COLOR[state] }} title={SAVE_LABEL[state] || ''} />
                    <span className="row-number">{displayRowNum}</span>
                  </td>
                  {columns.map((column, colIndex) => (
                      <GridCell
                      key={`${row.id}-${column.id}`}
                      column={column}
                      row={row}
                      value={row[column.accessor]}
                      draft={draft}
                      isActive={this.state.active?.row === rowIndex && this.state.active?.col === colIndex}
                      isEditing={this.state.editing?.row === rowIndex && this.state.editing?.col === colIndex}
                      isNewRow={isNewRow}
                      onSelect={() => this.selectCell({ row: rowIndex, col: colIndex })}
                      onStartEdit={(initialValue) => this.startEditAt({ row: rowIndex, col: colIndex }, initialValue)}
                      onChange={(value) => this.setState({ draft: value })}
                      onCommit={this.commitEdit}
                      onCancel={this.cancelEdit}
                      onToggle={(newValue) => this.props.onCellChange(row[rowKey], column.id, newValue)}
                      serverError={this.props.errors?.[row[rowKey]]?.[column.id]}
                      rowError={this.props.errors?.[row[rowKey]]?._row}
                    />
                  ))}
                  <td className="col-acciones" onDoubleClick={(event) => event.stopPropagation()}>
                    <div className="row-actions">
                      <button
                        type="button"
                        className="btn-ghost"
                        aria-label="Abrir detalle"
                        title="Abrir detalle"
                        onClick={(event) => {
                          event.stopPropagation();
                          this.props.onRowOpenDetail?.(row);
                        }}
                      >
                        <Eye size={15} />
                      </button>
                      {archived ? (
                        <button
                          type="button"
                          className="btn-ghost"
                          aria-label="Restaurar"
                          title="Restaurar"
                          onClick={(event) => {
                            event.stopPropagation();
                            this.props.onRowRestore?.(row[rowKey]);
                          }}
                        >
                          <RotateCcw size={15} />
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="btn-ghost"
                          aria-label={archived ? 'Restaurar' : (isNewRow ? 'Eliminar' : 'Archivar')}
                          title={archived ? 'Restaurar' : (isNewRow ? 'Eliminar' : 'Archivar')}
                          onClick={(event) => {
                            event.stopPropagation();
                            this.props.onRowDelete?.(row[rowKey]);
                          }}
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr>
                <td colSpan={columns.length + 3} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  Sin registros.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  }
}

export default ChoferGrid;