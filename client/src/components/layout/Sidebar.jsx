import { NavLink } from 'react-router-dom';
import {
  Users,
  Truck,
  Building2,
  UserCog,
  Car,
  ClipboardList,
  FileText,
  Receipt,
  FolderOpen,
} from 'lucide-react';

const NAV_ITEMS = [
  { to: '/clientes', label: 'Clientes', icon: Users },
  { to: '/viajes', label: 'Viajes', icon: Truck },
  { to: '/proveedores', label: 'Proveedores', icon: Building2 },
  { to: '/choferes', label: 'Choferes', icon: UserCog },
  { to: '/unidades', label: 'Unidades', icon: Car },
  { to: '/liquidaciones', label: 'Liquidaciones', icon: ClipboardList },
  { to: '/facturas', label: 'Facturas', icon: FileText },
  { to: '/gastos', label: 'Gastos', icon: Receipt },
  { to: '/documentos', label: 'Documentos', icon: FolderOpen },
];

const Sidebar = () => (
  <aside className="app-sidebar">
    <div className="app-sidebar-brand">TAG Logística</div>
    <nav>
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) => `app-nav-item${isActive ? ' active' : ''}`}
        >
          <item.icon size={18} />
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  </aside>
);

export default Sidebar;
