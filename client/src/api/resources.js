import { apiFetch } from '../api';

const parse = async (response) => {
  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json')
    ? await response.json().catch(() => null)
    : null;

  if (!response.ok) {
    const error = new Error(data?.message || 'Error de red');
    error.status = response.status;
    error.errors = data?.errors || null;
    throw error;
  }

  return data;
};

export const makeResource = (base) => ({
  list: (params = {}) => {
    const entries = Object.entries(params).filter(
      ([, value]) => value !== undefined && value !== null && value !== '',
    );
    const qs = new URLSearchParams(entries).toString();
    return apiFetch(`${base}${qs ? `?${qs}` : ''}`).then(parse);
  },
  show: (id) => apiFetch(`${base}/${id}`).then(parse),
  create: (data) => apiFetch(base, { method: 'POST', body: JSON.stringify(data) }).then(parse),
  update: (id, data) =>
    apiFetch(`${base}/${id}`, { method: 'PUT', body: JSON.stringify(data) }).then(parse),
  remove: (id) => apiFetch(`${base}/${id}`, { method: 'DELETE' }).then(parse),
  restore: (id) => apiFetch(`${base}/${id}/restore`, { method: 'POST' }).then(parse),
});

export const clientes = makeResource('/clientes');
export const choferes = makeResource('/choferes');
export const proveedores = makeResource('/proveedores');
