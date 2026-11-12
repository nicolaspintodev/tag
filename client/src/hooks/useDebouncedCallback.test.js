import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createDebouncer } from './useDebouncedCallback';

describe('createDebouncer', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('ejecuta una sola vez tras el delay con el último valor', () => {
    const fn = vi.fn();
    const debounced = createDebouncer(fn, 500);
    debounced('a');
    debounced('b');
    debounced('c');
    expect(fn).not.toHaveBeenCalled();
    vi.advanceTimersByTime(500);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith('c');
  });

  it('permite cancelar', () => {
    const fn = vi.fn();
    const debounced = createDebouncer(fn, 500);
    debounced('a');
    debounced.cancel();
    vi.advanceTimersByTime(500);
    expect(fn).not.toHaveBeenCalled();
  });

  it('flush ejecuta de inmediato', () => {
    const fn = vi.fn();
    const debounced = createDebouncer(fn, 500);
    debounced('a');
    debounced.flush();
    expect(fn).toHaveBeenCalledWith('a');
  });
});
