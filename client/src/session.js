import API_BASE_URL from './apiConfig';
import { getToken } from './api';

const TAB_ID_KEY = 'tag_tab_id';
const MARKER_PREFIX = 'tag_tab_closed:';
const ORPHAN_GRACE_MS = 5000;

const createId = () => {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `tab-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

export const getTabId = () => {
  let id = sessionStorage.getItem(TAB_ID_KEY);
  if (!id) {
    id = createId();
    sessionStorage.setItem(TAB_ID_KEY, id);
  }
  return id;
};

const markerKey = (tabId) => `${MARKER_PREFIX}${tabId}`;

const readMarkers = () => {
  const markers = [];
  for (let i = 0; i < localStorage.length; i += 1) {
    const key = localStorage.key(i);
    if (!key?.startsWith(MARKER_PREFIX)) continue;
    try {
      markers.push({ key, ...JSON.parse(localStorage.getItem(key)) });
    } catch {
      localStorage.removeItem(key);
    }
  }
  return markers;
};

const revokeToken = (token) => {
  if (!token) return;
  fetch(`${API_BASE_URL}/logout`, {
    method: 'POST',
    headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
    keepalive: true,
  }).catch(() => {});
};

// Se ejecuta una vez al arrancar la app:
// - Marcador de esta misma pestaña => fue recarga (F5), se conserva la sesión.
// - Marcadores de otras pestañas => cierres, se revoca su token (best-effort).
// Limitación conocida: con varias pestañas compartiendo token, cerrar una
// puede revocar la sesión de otra en el siguiente arranque.
export const resolveTabLifecycle = () => {
  const tabId = getTabId();
  const ownMarkerKey = markerKey(tabId);
  const now = Date.now();

  localStorage.removeItem(ownMarkerKey);

  readMarkers().forEach((marker) => {
    if (marker.key === ownMarkerKey) return;
    if (typeof marker.at !== 'number' || now - marker.at < ORPHAN_GRACE_MS) return;
    revokeToken(marker.token);
    localStorage.removeItem(marker.key);
  });
};

// Registra el estado de esta pestaña al descargarse (cierre o recarga).
// La distinción real ocurre en resolveTabLifecycle al volver a arrancar.
export const markTabUnloading = () => {
  const token = getToken();
  if (!token) return;
  try {
    localStorage.setItem(markerKey(getTabId()), JSON.stringify({ token, at: Date.now() }));
  } catch {
    // almacenamiento bloqueado o lleno: best-effort
  }
};

export const clearTabMarker = () => {
  localStorage.removeItem(markerKey(getTabId()));
};
