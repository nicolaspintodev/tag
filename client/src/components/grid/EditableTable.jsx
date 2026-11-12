import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { Trash2 } from 'lucide-react';
import EditableCell from './EditableCell';
import Spinner from '../ui/Spinner';
import { useEditableTable } from './useEditableTable';
import { serializeSelection } from '../../lib/gridClipboard';

const SAVE_LABEL = { saving: 'Guardando…', saved: 'Guardado', error: 'Error al guardar' };

const EditableTable = ({
  columns,
  rows,
  rowKey = 'id',
  onCellChange,
  onRowDelete,
  onRowSelect,
  saveState = {},
  loading,
}) => {
  const { active, editing, setDraft, startEdit, commit, cancel, move, handlePaste } =
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
    <div className="editable-grid" tabIndex={0} onKeyDown={handleKeyDown} onCopy={handleCopy} onPaste={handlePasteEvent}>
      <table className="datatable">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  style={header.column.columnDef.meta?.width ? { width: header.column.columnDef.meta.width } : undefined}
                >
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
              <th style={{ width: '110px' }}>Estado</th>
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((tableRow, rowIndex) => (
            <tr key={tableRow.id} onClick={() => onRowSelect?.(rows[rowIndex])}>
              {tableRow.getVisibleCells().map((cell, colIndex) => {
                const column = columns[colIndex];
                return (
                  <EditableCell
                    key={cell.id}
                    column={column}
                    row={rows[rowIndex]}
                    value={rows[rowIndex][column.accessor]}
                    isActive={active?.row === rowIndex && active?.col === colIndex}
                    isEditing={editing?.row === rowIndex && editing?.col === colIndex}
                    onChange={setDraft}
                    onCommit={commit}
                    onCancel={cancel}
                  />
                );
              })}
              <td>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span className="cell-save-state">{SAVE_LABEL[saveState[rows[rowIndex][rowKey]]] || ''}</span>
                  <button
                    className="btn-ghost"
                    aria-label="Eliminar"
                    onClick={(event) => {
                      event.stopPropagation();
                      onRowDelete?.(rows[rowIndex][rowKey]);
                    }}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length === 0 && <p style={{ padding: '1rem', color: 'var(--text-muted)' }}>Sin registros.</p>}
    </div>
  );
};

export default EditableTable;
