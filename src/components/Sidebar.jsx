import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Map, Users, Settings, ChevronLeft, ChevronRight, Zap, Facebook, Mail } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);

  const items = [
    { path: '/dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { path: '/scrape', name: 'Google Maps', icon: Map },
    { path: '/facebook', name: 'Facebook', icon: Facebook },
    { path: '/leads', name: 'Leads', icon: Users },
    { path: '/emails', name: 'Email Extractor', icon: Mail },
    { path: '/sales', name: 'Sales Outreach', icon: FaWhatsapp },
    { path: '/settings', name: 'Settings', icon: Settings }
  ];

  return (
    <div className={`relative transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'} bg-gradient-to-b from-indigo-900 to-purple-900 text-white`}>
      
      <button 
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 bg-white text-indigo-900 rounded-full p-1 shadow-md hover:bg-gray-100"
      >
        {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
      </button>

      <div className="p-5 text-2xl font-bold border-b border-indigo-800 flex items-center justify-center gap-2">
        <Zap className="w-7 h-7" />
        {!collapsed && <span>LeadStriker</span>}
      </div>

      <nav className="mt-4">
        {items.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              flex items-center gap-3 px-3 py-3 mx-2 rounded-lg transition-all duration-200 ${
                isActive ? 'bg-indigo-600 shadow-md' : 'hover:bg-indigo-800'
              } ${collapsed ? 'justify-center' : ''}
            `}
            title={collapsed ? item.name : ''}
          >
            <item.icon size={20} />
            {!collapsed && <span>{item.name}</span>}
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
