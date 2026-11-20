import { useCallback, useEffect, useRef } from 'react';

export const createDebouncer = (fn, delay) => {
  let timer = null;
  let lastArgs = null;
  const debounced = (...args) => {
    lastArgs = args;
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      fn(...lastArgs);
    }, delay);
  };
  debounced.cancel = () => {
    if (timer) clearTimeout(timer);
    timer = null;
  };
  debounced.flush = () => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
      fn(...lastArgs);
    }
  };
  return debounced;
};

export const useDebouncedCallback = (fn, delay = 500) => {
  const fnRef = useRef(fn);
  const debouncedRef = useRef(null);

  useEffect(() => {
    fnRef.current = fn;
  }, [fn]);

  useEffect(() => {
    debouncedRef.current = createDebouncer((...args) => fnRef.current(...args), delay);
    return () => debouncedRef.current.cancel();
  }, [delay]);

  return useCallback((...args) => debouncedRef.current(...args), []);
};
