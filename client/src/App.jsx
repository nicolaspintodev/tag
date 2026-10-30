import { useState } from 'react';
import { LogOut } from 'lucide-react';

import Login from './pages/Login';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  if (!isAuthenticated) {
    return <Login onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-body)' }}>
      <header style={{ height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 2rem', backgroundColor: 'var(--bg-card)', borderBottom: '1px solid var(--border-color)' }}>
        <strong style={{ fontSize: '1.15rem', color: 'var(--bg-primary)' }}>TAG Logística</strong>
        <button className="outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={() => setIsAuthenticated(false)}>
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
