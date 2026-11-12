import { describe, it, expect } from 'vitest';
import { parsePaste, serializeSelection } from './gridClipboard';

describe('parsePaste', () => {
  it('parsea una matriz TSV', () => {
    expect(parsePaste('a\tb\nc\td')).toEqual([['a', 'b'], ['c', 'd']]);
  });

  it('tolera \\r\\n y salto final', () => {
    expect(parsePaste('a\tb\r\nc\td\r\n')).toEqual([['a', 'b'], ['c', 'd']]);
  });

  it('conserva celdas vacías internas', () => {
    expect(parsePaste('a\t\tc')).toEqual([['a', '', 'c']]);
  });

  it('quita comillas de valores entrecomillados', () => {
    expect(parsePaste('"a\tb"\tc')).toEqual([['a\tb', 'c']]);
  });

  it('devuelve matriz vacía para texto vacío', () => {
    expect(parsePaste('')).toEqual([]);
  });
});

describe('serializeSelection', () => {
  it('genera TSV', () => {
    expect(serializeSelection([['a', 'b'], ['c', 'd']])).toBe('a\tb\nc\td');
  });
});
