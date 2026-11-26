import { createElement } from 'react';
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import ConfirmDialog from './ConfirmDialog';

const props = {
  open: true,
  title: 'Pasar a pendiente',
  message: 'La liquidación pasará a pendiente.',
  confirmLabel: 'Confirmar',
  onConfirm: () => {},
  onCancel: () => {},
};

describe('ConfirmDialog', () => {
  it('usa el botón azul oscuro cuando confirmVariant es primary', () => {
    const html = renderToStaticMarkup(createElement(ConfirmDialog, { ...props, confirmVariant: 'primary' }));

    expect(html).toContain('>Confirmar</button>');
    expect(html).not.toContain('btn-danger');
  });

  it('mantiene el botón rojo por defecto', () => {
    const html = renderToStaticMarkup(createElement(ConfirmDialog, props));

    expect(html).toContain('btn-danger');
    expect(html).toContain('>Confirmar</button>');
  });
});
