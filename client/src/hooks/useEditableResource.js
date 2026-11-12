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
  const [error, setError] = useState(null);

  const rowsRef = useRef(rows);
  rowsRef.current = rows;

  const canPersistRef = useRef(canPersist);
  canPersistRef.current = canPersist;

  const lastParamsRef = useRef(undefined);
  const debouncers = useRef({});

  const persist = useCallback(async (key, payload, existing) => {
    setSaveState((prev) => ({ ...prev, [key]: 'saving' }));
    try {
      const saved = existing ? await resource.update(key, payload) : await resource.create(payload);
      setRows((prev) => prev.map((row) => (row[rowKey] === key ? { ...row, ...saved } : row)));
      setSaveState((prev) => ({ ...prev, [key]: 'saved' }));
    } catch (err) {
      setSaveState((prev) => ({ ...prev, [key]: 'error' }));
      setError(err);
    }
  }, [resource, rowKey]);

  const reload = useCallback(async (params = lastParamsRef.current) => {
    lastParamsRef.current = params;
    setLoading(true);
    setError(null);
    try {
      setRows(await resource.list(params));
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [resource]);

  useEffect(() => {
    reload();
  }, [reload]);

  const updateCell = useCallback((key, columnId, value) => {
    setRows((prev) => prev.map((row) => (row[rowKey] === key ? { ...row, [columnId]: value } : row)));
    if (!debouncers.current[key]) {
      debouncers.current[key] = createDebouncer((k) => {
        const row = rowsRef.current.find((item) => item[rowKey] === k);
        if (!row) return;
        if (canPersistRef.current && !canPersistRef.current(row)) return;
        persist(k, buildPayload(row), Boolean(row.id));
      }, delay);
    }
    debouncers.current[key](key);
  }, [rowKey, delay, persist]);

  const createRow = useCallback(() => {
    const draft = { [rowKey]: `new-${Date.now()}` };
    setRows((prev) => [...prev, draft]);
    return draft[rowKey];
  }, [rowKey]);

  const deleteRow = useCallback(async (key) => {
    setRows((prev) => prev.filter((row) => row[rowKey] !== key));
    try {
      await resource.remove(key);
    } catch (err) {
      setError(err);
    }
  }, [resource, rowKey]);

  const restoreRow = useCallback(async (key) => {
    try {
      await resource.restore(key);
      await reload();
    } catch (err) {
      setError(err);
    }
  }, [resource, reload]);

  return { rows, setRows, saveState, loading, error, setError, reload, updateCell, createRow, deleteRow, restoreRow };
};
