import { LogOut } from 'lucide-react';

const Header = ({ title, onLogout }) => (
  <header className="app-header">
    <strong className="app-header-title">{title}</strong>
    <button className="outline" onClick={onLogout} style={{ display: 'flex', alignItems: 'center', color: 'var(--bg-primary)' }}>
      <LogOut size={16} />
    </button>
  </header>
);

export default Header;
