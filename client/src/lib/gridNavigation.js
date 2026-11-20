export const firstEditableCol = (columns) => columns.findIndex((column) => column.editable);

const lastEditableCol = (columns) => {
  for (let i = columns.length - 1; i >= 0; i -= 1) {
    if (columns[i].editable) return i;
  }
  return -1;
};

const nextEditableCol = (columns, from) => {
  for (let i = from + 1; i < columns.length; i += 1) {
    if (columns[i].editable) return i;
  }
  return -1;
};

const prevEditableCol = (columns, from) => {
  for (let i = from - 1; i >= 0; i -= 1) {
    if (columns[i].editable) return i;
  }
  return -1;
};

export const moveCell = (pos, direction, { rowCount, columns }) => {
  const first = firstEditableCol(columns);
  if (first === -1) return pos;
  if (!pos) return { row: 0, col: first };
  const current = pos;
  const clampRow = (row) => Math.max(0, Math.min(rowCount - 1, row));

  switch (direction) {
    case 'down':
      return { row: clampRow(current.row + 1), col: current.col };
    case 'up':
      return { row: clampRow(current.row - 1), col: current.col };
    case 'right': {
      const col = nextEditableCol(columns, current.col);
      if (col !== -1) return { row: current.row, col };
      // Última columna: ir a primera columna editable de la siguiente fila
      const nextRow = current.row + 1;
      if (nextRow >= rowCount) return current;
      return { row: nextRow, col: first };
    }
    case 'left': {
      const col = prevEditableCol(columns, current.col);
      if (col !== -1) return { row: current.row, col };
      // Primera columna: ir a última columna editable de la fila anterior
      const prevRow = current.row - 1;
      if (prevRow < 0) return current;
      return { row: prevRow, col: lastEditableCol(columns) };
    }
    case 'prev': {
      const col = prevEditableCol(columns, current.col);
      if (col !== -1) return { row: current.row, col };
      const row = current.row - 1;
      if (row < 0) return current;
      return { row, col: lastEditableCol(columns) };
    }
    case 'next':
    default: {
      const col = nextEditableCol(columns, current.col);
      if (col !== -1) return { row: current.row, col };
      const row = current.row + 1;
      if (row > rowCount - 1) return current;
      return { row, col: first };
    }
  }
};
