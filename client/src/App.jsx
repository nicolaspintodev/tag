import { useCallback, useEffect, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import Login from './pages/Login';
import Placeholder from './pages/Placeholder';
import AppShell from './components/layout/AppShell';
import { clearToken, fetchCurrentUser, getToken, logout } from './api';
import { clearTabMarker, markTabUnloading, resolveTabLifecycle } from './session';
import useSessionTimeout from './hooks/useSessionTimeout';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => Boolean(getToken()));
  const [verificando, setVerificando] = useState(() => Boolean(getToken()));
  const [motivoCierre, setMotivoCierre] = useState(null);

  useEffect(() => {
    resolveTabLifecycle();
  }, []);

  useEffect(() => {
    if (!getToken()) return;

    let cancelado = false;

    fetchCurrentUser()
      .then((user) => {
        if (cancelado) return;
        if (!user) {
          clearToken();
          setIsAuthenticated(false);
        }
      })
      .catch(() => {
        if (cancelado) return;
        clearToken();
        setIsAuthenticated(false);
      })
      .finally(() => {
        if (!cancelado) setVerificando(false);
      });

    return () => {
      cancelado = true;
    };
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return undefined;
    window.addEventListener('pagehide', markTabUnloading);
    return () => window.removeEventListener('pagehide', markTabUnloading);
  }, [isAuthenticated]);

  const handleLogin = () => {
    setMotivoCierre(null);
    setIsAuthenticated(true);
  };

  const handleLogout = useCallback(async (motivo = 'manual') => {
    clearTabMarker();
    await logout();
    setIsAuthenticated(false);
    setMotivoCierre(motivo === 'timeout' ? 'inactividad' : null);
  }, []);

  const handleTimeout = useCallback(() => {
    handleLogout('timeout');
  }, [handleLogout]);

  useSessionTimeout({
    activo: isAuthenticated,
    onTimeout: handleTimeout,
  });

  if (verificando) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', backgroundColor: 'var(--bg-body)', color: 'var(--text-muted)' }}>
        Verificando sesión…
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Login
        onLogin={handleLogin}
        mensaje={motivoCierre === 'inactividad' ? 'Tu sesión se cerró por inactividad. Volvé a ingresar.' : ''}
      />
    );
  }

  return (
    <Routes>
      <Route element={<AppShell onLogout={() => handleLogout('manual')} />}>
        <Route index element={<Navigate to="/clientes" replace />} />
        <Route path="/clientes" element={<Placeholder title="Clientes" />} />
        <Route path="/viajes" element={<Placeholder title="Viajes" />} />
        <Route path="/proveedores" element={<Placeholder title="Proveedores" />} />
        <Route path="/choferes" element={<Placeholder title="Choferes" />} />
        <Route path="/unidades" element={<Placeholder title="Unidades" />} />
        <Route path="/liquidaciones" element={<Placeholder title="Liquidaciones" />} />
        <Route path="/facturas" element={<Placeholder title="Facturas" />} />
        <Route path="/gastos" element={<Placeholder title="Gastos" />} />
        <Route path="/documentos" element={<Placeholder title="Documentos" />} />
        <Route path="*" element={<Placeholder title="No encontrado" />} />
      </Route>
    </Routes>
  );
};

export default App;
