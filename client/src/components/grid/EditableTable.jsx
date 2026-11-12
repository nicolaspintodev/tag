import { useRef } from 'react';
import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { Eye, Plus, RotateCcw, Trash2 } from 'lucide-react';
import EditableCell from './EditableCell';
import Spinner from '../ui/Spinner';
import { useEditableTable } from './useEditableTable';
import { serializeSelection } from '../../lib/gridClipboard';

const SAVE_LABEL = { saving: 'Guardando…', saved: 'Guardado', error: 'Error al guardar' };

const STATE_COLOR = { saving: 'var(--color-warning-text)', saved: 'var(--color-success-text)', error: 'var(--color-danger-text)', '': 'var(--border-color)' };

const EditableTable = ({
  columns,
  rows,
  rowKey = 'id',
  onCellChange,
  onRowDelete,
  onRowOpenDetail,
  onRowRestore,
  onAddRow,
  saveState = {},
  loading,
}) => {
  const gridRef = useRef(null);
  const { active, editing, draft, setDraft, setActive, startEdit, commit, cancel, move, handlePaste } =
    useEditableTable({ columns, rows, rowKey, onCellChange });

  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table no es memoizable por React Compiler
  const table = useReactTable({
    data: rows,
    columns: columns.map((column) => ({
      id: column.id,
      accessorKey: column.accessor,
      header: column.header,
      meta: { width: column.width },
    })),
    getCoreRowModel: getCoreRowModel(),
  });

  const focusGrid = () => gridRef.current?.focus();

  const selectCell = (pos) => {
    setActive(pos);
    focusGrid();
  };

  const commitEdit = (moveDown) => {
    commit(moveDown);
    focusGrid();
  };

  const cancelEdit = () => {
    cancel();
    focusGrid();
  };

  const startEditAt = (pos, initialValue) => {
    startEdit(pos, initialValue);
    focusGrid();
  };

  const handleKeyDown = (event) => {
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
      if (active) startEdit(active);
    } else if (event.key === 'Delete' && active) {
      const column = columns[active.col];
      const row = rows[active.row];
      if (column?.editable && row) onCellChange(row[rowKey], column.id, '');
    }
  };

  const handleCopy = (event) => {
    if (!active) return;
    const column = columns[active.col];
    const row = rows[active.row];
    if (!column || !row) return;
    event.clipboardData.setData('text/plain', serializeSelection([[row[column.accessor] ?? '']]));
    event.preventDefault();
  };

  const handlePasteEvent = (event) => {
    const text = event.clipboardData.getData('text/plain');
    if (!text) return;
    event.preventDefault();
    handlePaste(text);
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', display: 'grid', placeItems: 'center' }}>
        <Spinner />
      </div>
    );
  }

  return (
    <div className="editable-grid-wrapper" tabIndex={0} ref={gridRef} onKeyDown={handleKeyDown} onCopy={handleCopy} onPaste={handlePasteEvent}>
      <table className="datatable">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              <th className="col-estado" style={{ width: '40px' }} />
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  style={header.column.columnDef.meta?.width ? { width: header.column.columnDef.meta.width } : undefined}
                >
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
              <th className="col-acciones" style={{ width: '110px' }}>Acciones</th>
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((tableRow, rowIndex) => {
            const row = rows[rowIndex];
            const archived = Boolean(row.deleted_at);
            const state = saveState[row[rowKey]] || '';
            return (
              <tr key={tableRow.id} onDoubleClick={() => onRowOpenDetail?.(row)}>
                <td className="col-estado" onDoubleClick={(event) => event.stopPropagation()}>
                  <span className="state-dot" style={{ backgroundColor: STATE_COLOR[state] }} title={SAVE_LABEL[state] || ''} />
                </td>
                {tableRow.getVisibleCells().map((cell, colIndex) => {
                  const column = columns[colIndex];
                  return (
                    <EditableCell
                      key={cell.id}
                      column={column}
                      row={row}
                      value={row[column.accessor]}
                      draft={draft}
                      isActive={active?.row === rowIndex && active?.col === colIndex}
                      isEditing={editing?.row === rowIndex && editing?.col === colIndex}
                      onSelect={() => selectCell({ row: rowIndex, col: colIndex })}
                      onStartEdit={(initialValue) => startEditAt({ row: rowIndex, col: colIndex }, initialValue)}
                      onChange={setDraft}
                      onCommit={commitEdit}
                      onCancel={cancelEdit}
                    />
                  );
                })}
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
                    {archived ? (
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
        </tbody>
        <tfoot>
          <tr>
            <td className="col-estado" />
            <td colSpan={columns.length} style={{ padding: 0 }}>
              <button type="button" className="grid-add-row" onClick={() => onAddRow?.()}>
                <Plus size={15} /> Agregar fila
              </button>
            </td>
            <td className="col-acciones" />
          </tr>
        </tfoot>
      </table>
      {rows.length === 0 && <p style={{ padding: '1rem', color: 'var(--text-muted)' }}>Sin registros.</p>}
    </div>
  );
};

export default EditableTable;