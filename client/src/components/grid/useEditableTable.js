import { useCallback, useMemo, useRef, useState } from 'react';
import { firstEditableCol, moveCell } from '../../lib/gridNavigation';
import { parsePaste } from '../../lib/gridClipboard';

export const useEditableTable = ({ columns, rows, rowKey, onCellChange }) => {
  const [activeState, setActive] = useState(null);
  const [editing, setEditing] = useState(null);
  const [draft, setDraftState] = useState('');
  const editingRef = useRef(null);
  const draftRef = useRef('');

  const dims = useMemo(() => ({ rowCount: rows.length, columns }), [rows.length, columns]);

  const initialCol = rows.length > 0 ? firstEditableCol(columns) : -1;
  const active = useMemo(
    () => activeState ?? (initialCol !== -1 ? { row: 0, col: initialCol } : null),
    [activeState, initialCol],
  );

  const setDraft = useCallback((value) => {
    draftRef.current = value;
    setDraftState(value);
  }, []);

  const startEdit = useCallback((pos) => {
    if (!pos) return;
    const column = columns[pos.col];
    if (!column?.editable) return;
    const row = rows[pos.row];
    if (!row) return;
    editingRef.current = pos;
    setEditing(pos);
    setDraft(row[column.accessor] ?? '');
  }, [columns, rows, setDraft]);

  const commit = useCallback((moveDown = true) => {
    const current = editingRef.current;
    if (!current) return;
    editingRef.current = null;
    const column = columns[current.col];
    const row = rows[current.row];
    if (row && column) onCellChange(row[rowKey], column.id, draftRef.current);
    setEditing(null);
    if (moveDown) setActive(moveCell(current, 'down', dims));
  }, [columns, rows, onCellChange, rowKey, dims]);

  const cancel = useCallback(() => {
    editingRef.current = null;
    setEditing(null);
  }, []);

  const move = useCallback((direction) => {
    if (editingRef.current) return;
    setActive((current) => moveCell(current ?? active, direction, dims));
  }, [dims, active]);

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
