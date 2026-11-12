import { LogOut } from 'lucide-react';

const Header = ({ title, onLogout }) => (
  <header className="app-header">
    <strong className="app-header-title">{title}</strong>
    <button className="outline" onClick={onLogout} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <LogOut size={16} />
      Cerrar Sesión
    </button>
  </header>
);

export default Header;
