import { describe, it, expect } from 'vitest';
import { buildSelectionGridColumns } from './liquidacion';

describe('buildSelectionGridColumns', () => {
  it('usa costo_viaje con header Costo para chofer', () => {
    const columns = buildSelectionGridColumns('chofer');
    const amountColumn = columns.find(column => column.accessor === 'costo_viaje');

    expect(amountColumn).toBeDefined();
    expect(amountColumn.header).toBe('Costo');
  });

  it('mantiene precio_pactado con header Precio para cliente', () => {
    const columns = buildSelectionGridColumns('cliente');
    const amountColumn = columns.find(column => column.accessor === 'precio_pactado');

    expect(amountColumn).toBeDefined();
    expect(amountColumn.header).toBe('Precio');
  });
});
