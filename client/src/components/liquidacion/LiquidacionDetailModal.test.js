import { createElement } from 'react';
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { NotasField } from './LiquidacionDetailModal';

describe('NotasField', () => {
  it('mantiene las notas multilínea en un textarea', () => {
    const html = renderToStaticMarkup(createElement(NotasField, {
      value: 'Primera línea\nSegunda línea',
      disabled: false,
      onChange: () => {},
    }));

    expect(html).toContain('<textarea');
    expect(html).toContain('rows="1"');
    expect(html).toContain('detail-modal-textarea');
    expect(html).toContain('Primera línea\nSegunda línea');
  });
});
