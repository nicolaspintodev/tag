import { useState } from 'react';
import { Truck } from 'lucide-react';

import { login } from '../api';

const Login = ({ onLogin, mensaje = '' }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setEnviando(true);

    try {
      const user = await login(email, password);
      onLogin(user);
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div style={{ height: '100vh', width: '100vw', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-body)' }}>
      <div className="card" style={{ width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2.5rem 2rem' }}>
        <div style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-invert)', width: '72px', height: '72px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', marginBottom: '1.5rem' }}>
          <Truck size={36} />
        </div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--text-main)', textAlign: 'center' }}>TAG Logística</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem', fontSize: '0.875rem', textAlign: 'center' }}>Plataforma Integral de Flota</p>

        <form style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1.25rem' }} onSubmit={handleSubmit}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Email</label>
            <input
              type="email"
              className="input-field"
              placeholder="usuario@logisticatag.com.ar"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
              required
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Contraseña</label>
            <input
              type="password"
              className="input-field"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          {mensaje && (
            <p role="status" style={{ color: '#1d4ed8', fontSize: '0.875rem' }}>{mensaje}</p>
          )}

          {error && (
            <p role="alert" style={{ color: '#b91c1c', fontSize: '0.875rem' }}>{error}</p>
          )}

          <button type="submit" disabled={enviando} style={{ marginTop: '0.5rem', padding: '0.75rem', fontSize: '1rem' }}>
            {enviando ? 'Ingresando…' : 'Ingresar al Sistema'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
