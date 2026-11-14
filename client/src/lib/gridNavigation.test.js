import { describe, it, expect } from 'vitest';
import { moveCell, firstEditableCol } from './gridNavigation';

const columns = [
  { id: 'a', editable: true },
  { id: 'b', editable: false },
  { id: 'c', editable: true },
];

describe('firstEditableCol', () => {
  it('devuelve el primer índice editable', () => {
    expect(firstEditableCol(columns)).toBe(0);
  });
  it('devuelve -1 si no hay editables', () => {
    expect(firstEditableCol([{ editable: false }])).toBe(-1);
  });
});

describe('moveCell', () => {
  it('desde null arranca en la primera celda editable', () => {
    expect(moveCell(null, 'next', { rowCount: 2, columns })).toEqual({ row: 0, col: 0 });
  });

  it('next saltea columnas no editables', () => {
    expect(moveCell({ row: 0, col: 0 }, 'next', { rowCount: 2, columns })).toEqual({ row: 0, col: 2 });
  });

  it('next en la última editable de la fila pasa a la primera de la siguiente', () => {
    expect(moveCell({ row: 0, col: 2 }, 'next', { rowCount: 2, columns })).toEqual({ row: 1, col: 0 });
  });

  it('next en la última celda del grid no se mueve', () => {
    expect(moveCell({ row: 1, col: 2 }, 'next', { rowCount: 2, columns })).toEqual({ row: 1, col: 2 });
  });

  it('prev retrocede salteando no editables', () => {
    expect(moveCell({ row: 0, col: 2 }, 'prev', { rowCount: 2, columns })).toEqual({ row: 0, col: 0 });
  });

  it('down baja de fila en la misma columna', () => {
    expect(moveCell({ row: 0, col: 0 }, 'down', { rowCount: 2, columns })).toEqual({ row: 1, col: 0 });
  });

  it('down en la última fila no se mueve', () => {
    expect(moveCell({ row: 1, col: 0 }, 'down', { rowCount: 2, columns })).toEqual({ row: 1, col: 0 });
  });

  it('right se detiene si no hay editable a la derecha (no cruza de fila)', () => {
    expect(moveCell({ row: 0, col: 0 }, 'right', { rowCount: 2, columns })).toEqual({ row: 0, col: 2 });
    expect(moveCell({ row: 0, col: 2 }, 'right', { rowCount: 2, columns })).toEqual({ row: 1, col: 0 });
  });

  it('left se detiene en el borde', () => {
    expect(moveCell({ row: 0, col: 0 }, 'left', { rowCount: 2, columns })).toEqual({ row: 0, col: 0 });
  });
});
