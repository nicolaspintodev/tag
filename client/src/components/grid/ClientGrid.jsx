import React from 'react';
import { Eye, RotateCcw, Trash2 } from 'lucide-react';
import Spinner from '../ui/Spinner';
import GridCell from './GridCell';
import { serializeSelection, parsePaste } from '../../lib/gridClipboard';
import { moveCell } from '../../lib/gridNavigation';

const SAVE_LABEL = { saving: 'Guardando…', saved: 'Guardado', error: 'Error al guardar' };

const STATE_COLOR = { saving: 'var(--color-warning-text)', saved: 'var(--color-success-text)', error: 'var(--color-danger-text)', '': 'var(--border-color)' };

class ClientGrid extends React.Component {
  constructor(props) {
    super(props);
    this.gridRef = React.createRef();
    this.state = { active: null, editing: null, draft: '' };
    this.focusGrid = this.focusGrid.bind(this);
    this.selectCell = this.selectCell.bind(this);
    this.commitEdit = this.commitEdit.bind(this);
    this.cancelEdit = this.cancelEdit.bind(this);
    this.startEditAt = this.startEditAt.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleCopy = this.handleCopy.bind(this);
    this.handlePasteEvent = this.handlePasteEvent.bind(this);
    this.handlePaste = this.handlePaste.bind(this);
  }

  focusGrid() {
    this.gridRef.current?.focus();
  }

  selectCell(pos) {
    this.setState({ active: pos }, () => this.focusGrid());
  }

  commitEdit(stay) {
    const { columns, rows, rowKey } = this.props;
    const { editing } = this.state;
    const current = editing;
    if (!current) return;
    const column = columns[current.col];
    const row = rows[current.row];
    if (row && column) this.props.onCellChange(row[rowKey], column.id, this.state.draft);
    this.setState({ editing: null });
    if (!stay) {
      const dims = { rowCount: this.props.rows.length, columns: this.props.columns };
      this.setState({ active: moveCell(current, 'down', dims) });
    }
    this.focusGrid();
  }

  cancelEdit() {
    this.setState({ editing: null });
    this.focusGrid();
  }

  startEditAt(pos, initialValue) {
    this.setState({ active: pos, editing: pos, draft: initialValue || '' }, () => this.focusGrid());
  }

  handlePaste(text) {
    if (!this.state.active) return;
    const matrix = parsePaste(text);
    if (matrix.length === 0) return;
    const { columns, rows, rowKey, onCellChange } = this.props;
    const { active } = this.state;
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
    const { active, editing, move } = this.state;
    const { columns, rows, rowKey, onCellChange } = this.props;
    if (editing) return;
    if (event.key === 'Tab') {
      event.preventDefault();
      move(event.shiftKey ? 'prev' : 'next');
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      move('down');
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      move('up');
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      move('right');
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      move('left');
    } else if (event.key === 'Enter') {
      event.preventDefault();
      if (active) this.startEdit(active);
    } else if (event.key === 'Delete' && active) {
      const column = columns[active.col];
      const row = rows[active.row];
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
    const { columns, rows, rowKey = 'id', onRowDelete, onRowOpenDetail, onRowRestore, saveState = {}, loading } = this.props;
    const { active, editing, draft } = this.state;

    if (loading) {
      return (
        <div style={{ padding: '2rem', display: 'grid', placeItems: 'center' }}>
          <Spinner />
        </div>
      );
    }

    return (
      <div ref={this.gridRef} onKeyDown={this.handleKeyDown} onCopy={this.handleCopy} onPaste={this.handlePasteEvent}>
        <table>
          <tbody>
            {rows.map((row, rowIndex) => {
              const state = saveState[row[rowKey]] || '';
              return (
                <tr key={row.id} onDoubleClick={() => onRowOpenDetail?.(row)}>
                  <td className="col-estado" onDoubleClick={(event) => event.stopPropagation()}>
                    <span className="state-dot" style={{ backgroundColor: STATE_COLOR[state] }} title={SAVE_LABEL[state] || ''} />
                  </td>
                  {columns.map((column, colIndex) => (
                    <GridCell
                      key={`${row.id}-${column.id}`}
                      column={column}
                      row={row}
                      value={row[column.accessor]}
                      draft={draft}
                      isActive={active?.row === rowIndex && active?.col === colIndex}
                      isEditing={editing?.row === rowIndex && editing?.col === colIndex}
                      onSelect={() => this.selectCell({ row: rowIndex, col: colIndex })}
                      onStartEdit={(initialValue) => this.startEditAt({ row: rowIndex, col: colIndex }, initialValue)}
                      onChange={this.setState.bind(this, { draft: '' })}
                      onCommit={this.commitEdit}
                      onCancel={this.cancelEdit}
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
                          onRowOpenDetail?.(row);
                        }}
                      >
                        <Eye size={15} />
                      </button>
                      {row.deleted_at ? (
                        <button
                          type="button"
                          className="btn-ghost"
                          aria-label="Restaurar"
                          title="Restaurar"
                          onClick={(event) => {
                            event.stopPropagation();
                            onRowRestore?.(row[rowKey]);
                          }}
                        >
                          <RotateCcw size={15} />
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="btn-ghost"
                          aria-label="Archivar"
                          title="Archivar"
                          onClick={(event) => {
                            event.stopPropagation();
                            onRowDelete?.(row[rowKey]);
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

export default ClientGrid;