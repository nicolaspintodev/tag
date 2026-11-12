import { useCallback, useMemo, useState } from 'react';
import { firstEditableCol, moveCell } from '../../lib/gridNavigation';
import { parsePaste } from '../../lib/gridClipboard';

export const useEditableTable = ({ columns, rows, rowKey, onCellChange }) => {
  const [activeState, setActive] = useState(null);
  const [editing, setEditing] = useState(null);
  const [draft, setDraft] = useState('');

  const dims = useMemo(() => ({ rowCount: rows.length, columns }), [rows.length, columns]);

  const initialCol = rows.length > 0 ? firstEditableCol(columns) : -1;
  const active = useMemo(
    () => activeState ?? (initialCol !== -1 ? { row: 0, col: initialCol } : null),
    [activeState, initialCol],
  );

  const startEdit = useCallback((pos) => {
    const column = columns[pos.col];
    if (!column?.editable) return;
    const row = rows[pos.row];
    if (!row) return;
    setActive(pos);
    setEditing(pos);
    setDraft(row[column.accessor] ?? '');
  }, [columns, rows]);

  const commit = useCallback(() => {
    if (!editing) return;
    const column = columns[editing.col];
    const row = rows[editing.row];
    if (row && column) onCellChange(row[rowKey], column.id, draft);
    setEditing(null);
    setActive(moveCell(editing, 'down', dims));
  }, [editing, columns, rows, draft, onCellChange, rowKey, dims]);

  const cancel = useCallback(() => setEditing(null), []);

  const move = useCallback((direction) => {
    if (editing) return;
    setActive((current) => moveCell(current ?? active, direction, dims));
  }, [editing, dims, active]);

  const handlePaste = useCallback((text) => {
    if (!active) return;
    const matrix = parsePaste(text);
    if (matrix.length === 0) return;
    matrix.forEach((rowCells, r) => {
      rowCells.forEach((value, c) => {
        const pos = { row: active.row + r, col: active.col + c };
        const column = columns[pos.col];
        const row = rows[pos.row];
        if (column?.editable && row) onCellChange(row[rowKey], column.id, value);
      });
    });
  }, [active, columns, rows, onCellChange, rowKey]);

  return { active, editing, draft, setDraft, setActive, startEdit, commit, cancel, move, handlePaste };
};
