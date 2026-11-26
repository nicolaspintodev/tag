import { createElement } from 'react';
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import LiquidacionToolbar from './LiquidacionToolbar';

const baseProps = {
  cliente: null,
  proveedor: null,
  chofer: null,
  fecha_emision: '2026-11-26',
  onTipoChange: () => {},
  onEntityPick: () => {},
  onEntityClear: () => {},
  onFechaChange: () => {},
};

describe('LiquidacionToolbar', () => {
  it('resalta el botón de elegir cliente cuando no hay cliente elegido', () => {
    const html = renderToStaticMarkup(createElement(LiquidacionToolbar, { ...baseProps, tipo: 'cliente' }));

    expect(html).toContain('entity-pick-required');
    expect(html).toContain('Elegir cliente');
    expect(html).not.toContain('entity-pick-hint');
  });

  it('resalta el botón de elegir chofer cuando no hay chofer elegido', () => {
    const html = renderToStaticMarkup(createElement(LiquidacionToolbar, { ...baseProps, tipo: 'chofer' }));

    expect(html).toContain('entity-pick-required');
    expect(html).toContain('Elegir chofer');
    expect(html).not.toContain('entity-pick-hint');
  });

  it('no resalta el botón cuando ya hay cliente elegido', () => {
    const html = renderToStaticMarkup(createElement(LiquidacionToolbar, {
      ...baseProps,
      tipo: 'cliente',
      cliente: { razon_social: 'Acme' },
    }));

    expect(html).not.toContain('entity-pick-required');
    expect(html).toContain('Cambiar cliente');
  });
});
