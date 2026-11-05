import API_BASE_URL from './apiConfig';

const TOKEN_KEY = 'tag_token';

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

const parseJson = async (response) => {
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) return null;
  return response.json().catch(() => null);
};

const isLoginPage = () => window.location.pathname === '/login';

export async function apiFetch(path, options = {}) {
  const headers = { Accept: 'application/json', ...(options.headers || {}) };

  if (options.body && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const token = getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });

  if (response.status === 401 && !isLoginPage()) {
    clearToken();
    window.location.href = '/login';
    return response;
  }

  return response;
}

export async function login(email, password) {
  const response = await apiFetch('/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

  const data = await parseJson(response);

  if (!response.ok) {
    const mensaje =
      data?.errors?.email?.[0] ||
      data?.errors?.password?.[0] ||
      data?.message ||
      'No se pudo iniciar sesión';
    throw new Error(mensaje);
  }

  if (!data?.token) {
    throw new Error('Respuesta de autenticación inválida');
  }

  setToken(data.token);
  return data.user;
}

export async function logout() {
  try {
    await apiFetch('/logout', { method: 'POST' });
  } finally {
    clearToken();
  }
}

export async function fetchCurrentUser() {
  try {
    const response = await apiFetch('/user');
    if (!response.ok) return null;
    return await parseJson(response);
  } catch {
    return null;
  }
}