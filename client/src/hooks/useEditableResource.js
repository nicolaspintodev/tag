import { useCallback, useEffect, useRef, useState } from 'react';
import { createDebouncer } from './useDebouncedCallback';

const SERVER_KEYS = ['id', 'created_at', 'updated_at', 'deleted_at'];

const buildPayload = (row) =>
  Object.keys(row).reduce((payload, key) => {
    if (!SERVER_KEYS.includes(key)) payload[key] = row[key];
    return payload;
  }, {});

export const useEditableResource = (resource, { rowKey = 'id', delay = 500, canPersist } = {}) => {
  const [rows, setRows] = useState([]);
  const [saveState, setSaveState] = useState({});
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [lastAction, setLastAction] = useState(null);

  const rowsRef = useRef(rows);
  rowsRef.current = rows;

  const canPersistRef = useRef(canPersist);
  canPersistRef.current = canPersist;

  const lastParamsRef = useRef(undefined);
  const debouncers = useRef({});

  const clearErrorForRow = useCallback((key) => {
    setErrors((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  const clearError = useCallback(() => {
    setErrors({});
  }, []);

  const setAction = useCallback((rowKey, state) => {
    setLastAction({ rowKey, state, timestamp: Date.now() });
  }, []);

  const persist = useCallback(async (key, payload, existing, failedColumnId) => {
    setSaveState((prev) => ({ ...prev, [key]: 'saving' }));
    setAction(key, 'saving');
    try {
      const saved = existing ? await resource.update(key, payload) : await resource.create(payload);
      setRows((prev) => prev.map((row) => (row[rowKey] === key ? { ...row, ...saved } : row)));
      setSaveState((prev) => ({ ...prev, [key]: 'saved' }));
      setAction(key, 'saved');
      return { ok: true, saved };
    } catch (err) {
      setSaveState((prev) => ({ ...prev, [key]: 'error' }));
      const message = err instanceof Error ? err.message : String(err);
      setErrors((prev) => ({
        ...prev,
        [key]: { ...prev[key], [failedColumnId || '_row']: message },
      }));
      setAction(key, 'error');
      return { ok: false, error: err };
    }
  }, [resource, rowKey, setAction]);

  const reload = useCallback(async (params = lastParamsRef.current) => {
    lastParamsRef.current = params;
    setLoading(true);
    setErrors({});
    try {
      const data = await resource.list(params);
      setRows(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setErrors({ _global: { _row: message } });
    } finally {
      setLoading(false);
    }
  }, [resource]);

  useEffect(() => {
    reload();
  }, [reload]);

  const updateCell = useCallback((key, columnId, value) => {
    clearErrorForRow(key);
    setRows((prev) => prev.map((row) => (row[rowKey] === key ? { ...row, [columnId]: value } : row)));
    if (!debouncers.current[key]) {
      debouncers.current[key] = createDebouncer((k) => {
        const row = rowsRef.current.find((item) => item[rowKey] === k);
        if (!row) return;
        if (canPersistRef.current && !canPersistRef.current(row)) return;
        persist(k, buildPayload(row), !String(row.id).startsWith('new-'), columnId);
      }, delay);
    }
    debouncers.current[key](key);
  }, [rowKey, delay, persist, clearErrorForRow]);

  const createRow = useCallback(() => {
    clearError();
    const draft = { [rowKey]: `new-${Date.now()}` };
    setRows((prev) => [...prev, draft]);
    return draft[rowKey];
  }, [rowKey, clearError]);

  const deleteRow = useCallback(async (key) => {
    setRows((prev) => prev.filter((row) => row[rowKey] !== key));
    try {
      await resource.remove(key);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setErrors({ _global: { _row: message } });
    }
  }, [resource, rowKey]);

  const restoreRow = useCallback(async (key) => {
    try {
      await resource.restore(key);
      await reload();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setErrors({ _global: { _row: message } });
    }
  }, [resource, reload]);

  const flush = useCallback(async () => {
    await Promise.all(
      Object.keys(debouncers.current).map((key) => debouncers.current[key].flush?.())
    );
  }, []);

  const saveRow = useCallback(async (key, { force = false } = {}) => {
    debouncers.current[key]?.cancel?.();
    const row = rowsRef.current.find((item) => item[rowKey] === key);
    if (!row) return { ok: false, error: new Error('Row not found') };
    if (!force && canPersistRef.current && !canPersistRef.current(row)) return { ok: false, error: new Error('Row cannot be persisted') };
    return persist(key, buildPayload(row), !String(row.id).startsWith('new-'));
  }, [rowKey, persist]);

  const cancelPendingSave = useCallback((key) => {
    debouncers.current[key]?.cancel?.();
  }, []);

  return { rows, setRows, saveState, loading, errors, setErrors, reload, updateCell, createRow, deleteRow, restoreRow, flush, saveRow, cancelPendingSave, clearError, lastAction };
};

export { buildPayload, SERVER_KEYS };