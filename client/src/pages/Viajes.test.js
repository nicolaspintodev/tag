import { createElement } from 'react';
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import Viajes from './Viajes';
import { emptyProcessFilters, processFilterReducer } from '../lib/processFilters';

const appliedFilters = () => ({
  ...emptyProcessFilters(),
  liquidado_cliente: true,
});

const pendingDraft = () => ({
  ...emptyProcessFilters(),
  facturado: true,
});

describe('Viajes', () => {
  it('muestra el botón de filtros con la etiqueta Filtrar y sin icono', () => {
    const html = renderToStaticMarkup(createElement(Viajes));

    expect(html).toContain('Filtrar');
    expect(html).not.toContain('Procesos');
    expect(html).not.toContain('lucide-funnel');
    expect(html).not.toContain('Filtrar (');
  });
});

describe('processFilterReducer', () => {
  it('descarta cambios pendientes al cerrar con click afuera', () => {
    const applied = appliedFilters();
    const next = processFilterReducer({
      applied,
      draft: pendingDraft(),
      menuOpen: true,
    }, { type: 'close' });

    expect(next.menuOpen).toBe(false);
    expect(next.draft).toEqual(applied);
  });

  it('descarta cambios pendientes al cerrar con el botón', () => {
    const applied = appliedFilters();
    const next = processFilterReducer({
      applied,
      draft: pendingDraft(),
      menuOpen: true,
    }, { type: 'toggle' });

    expect(next.menuOpen).toBe(false);
    expect(next.draft).toEqual(applied);
  });

  it('muestra los filtros aplicados al volver a abrir', () => {
    const applied = appliedFilters();
    const closed = processFilterReducer({
      applied,
      draft: pendingDraft(),
      menuOpen: true,
    }, { type: 'close' });
    const opened = processFilterReducer(closed, { type: 'toggle' });

    expect(opened.menuOpen).toBe(true);
    expect(opened.draft).toEqual(applied);
  });
});
