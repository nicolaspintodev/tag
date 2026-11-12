const stripQuotes = (cell) => {
  if (cell.length >= 2 && cell.startsWith('"') && cell.endsWith('"')) {
    return cell.slice(1, -1).replace(/""/g, '"');
  }
  return cell;
};

const splitRow = (line) => {
  const cells = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === '\t' && !inQuotes) {
      cells.push(stripQuotes(current));
      current = '';
    } else {
      current += char;
    }
  }
  cells.push(stripQuotes(current));
  return cells;
};

export const parsePaste = (text) => {
  if (!text) return [];
  const normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const body = normalized.endsWith('\n') ? normalized.slice(0, -1) : normalized;
  if (body === '') return [];
  return body.split('\n').map(splitRow);
};

export const serializeSelection = (matrix) =>
  matrix.map((row) => row.map((cell) => (cell ?? '')).join('\t')).join('\n');
