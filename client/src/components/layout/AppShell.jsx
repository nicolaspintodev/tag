import { Outlet, useLocation } from 'react-router-dom';

import Sidebar from './Sidebar';
import Header from './Header';

const TITLES = {
  '/clientes': 'Clientes',
  '/viajes': 'Viajes',
  '/proveedores': 'Proveedores',
  '/choferes': 'Choferes',
  '/unidades': 'Unidades',
  '/liquidaciones': 'Liquidaciones',
  '/facturas': 'Facturas',
  '/gastos': 'Gastos',
  '/documentos': 'Documentos',
};

const AppShell = ({ onLogout }) => {
  const { pathname } = useLocation();
  const title = TITLES[pathname] || 'TAG Logística';

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="app-main">
        <Header title={title} onLogout={onLogout} />
        <main className="app-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppShell;
