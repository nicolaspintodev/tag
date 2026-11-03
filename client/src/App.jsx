import { useCallback, useEffect, useState } from 'react';
import { LogOut } from 'lucide-react';

import Login from './pages/Login';
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
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-body)' }}>
      <header style={{ height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 2rem', backgroundColor: 'var(--bg-card)', borderBottom: '1px solid var(--border-color)' }}>
        <strong style={{ fontSize: '1.15rem', color: 'var(--bg-primary)' }}>TAG Logística</strong>
        <button className="outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={() => handleLogout('manual')}>
          <LogOut size={16} />
          Cerrar Sesión
        </button>
      </header>
      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div className="card" style={{ maxWidth: '520px', textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>Interfaz en reformulación</h2>
          <p style={{ color: 'var(--text-muted)' }}>La UI se reconstruye en la Semana 1.</p>
        </div>
      </main>
    </div>
  );
};

export default App;
