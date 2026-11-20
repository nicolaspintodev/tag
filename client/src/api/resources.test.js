import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../api', () => ({ apiFetch: vi.fn() }));

import { apiFetch } from '../api';
import { clientes } from './resources';

const ok = (body) => ({
  ok: true,
  status: 200,
  headers: { get: () => 'application/json' },
  json: async () => body,
});

beforeEach(() => {
  apiFetch.mockReset();
});

describe('clientes resource', () => {
  it('list arma la query de búsqueda', async () => {
    apiFetch.mockResolvedValue(ok([]));
    await clientes.list({ search: 'acme', archivados: 1 });
    expect(apiFetch).toHaveBeenCalledWith('/clientes?search=acme&archivados=1');
  });

  it('create hace POST con body JSON', async () => {
    apiFetch.mockResolvedValue(ok({ id: 1 }));
    await clientes.create({ razon_social: 'ACME' });
    expect(apiFetch).toHaveBeenCalledWith('/clientes', {
      method: 'POST',
      body: JSON.stringify({ razon_social: 'ACME' }),
    });
  });

  it('update hace PUT a /clientes/{id}', async () => {
    apiFetch.mockResolvedValue(ok({ id: 7 }));
    await clientes.update(7, { razon_social: 'ACME' });
    expect(apiFetch).toHaveBeenCalledWith('/clientes/7', {
      method: 'PUT',
      body: JSON.stringify({ razon_social: 'ACME' }),
    });
  });

  it('remove hace DELETE y restore hace POST /restore', async () => {
    apiFetch.mockResolvedValue(ok({ message: 'ok' }));
    await clientes.remove(7);
    expect(apiFetch).toHaveBeenCalledWith('/clientes/7', { method: 'DELETE' });
    await clientes.restore(7);
    expect(apiFetch).toHaveBeenCalledWith('/clientes/7/restore', { method: 'POST' });
  });

  it('lanza error con status y errors cuando la respuesta no es ok', async () => {
    apiFetch.mockResolvedValue({
      ok: false,
      status: 422,
      headers: { get: () => 'application/json' },
      json: async () => ({ message: 'Validación', errors: { cuit: ['CUIT duplicado'] } }),
    });
    await expect(clientes.create({})).rejects.toMatchObject({
      status: 422,
      errors: { cuit: ['CUIT duplicado'] },
    });
  });
});
