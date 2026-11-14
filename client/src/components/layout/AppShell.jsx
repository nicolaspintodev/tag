import { Outlet, useLocation } from 'react-router-dom';

import Sidebar from './Sidebar';
import Header from './Header';
import StateBar from '../ui/StateBar';
import { StateBarProvider } from '../../context/StateBarContext';

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

  return (
    <StateBarProvider>
      <div className="app-shell">
        <Sidebar />
        <div className="app-main">
          <Header title={TITLES[pathname] || 'TAG Logística'} onLogout={onLogout} />
          <main className="app-content">
            <Outlet />
          </main>
          <StateBar />
        </div>
      </div>
    </StateBarProvider>
  );
};

export default AppShell;
