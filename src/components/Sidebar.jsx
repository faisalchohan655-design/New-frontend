import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Mail, Users, Map, Facebook, Settings, Send } from 'lucide-react';

export default function Sidebar({ isOpen, setIsOpen }) {
  const location = useLocation();
  
  const menu = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Google Maps', path: '/google-maps', icon: Map },
    { name: 'Facebook', path: '/facebook', icon: Facebook },
    { name: 'Leads', path: '/leads', icon: Users },
    { name: 'Email Extractor', path: '/emails', icon: Mail },
    { name: 'Sales Outreach', path: '/outreach', icon: Send },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" onClick={() => setIsOpen(false)} />}
      
      {/* Sidebar */}
      <aside className={`fixed md:relative z-50 w-64 bg-gradient-to-b from-purple-900 to-purple-700 text-white h-screen transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <div className="p-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            ⚡ LeadStriker
          </h2>
        </div>
        <nav className="mt-6">
          {menu.map(item => {
            const Icon = item.icon;
            return (
              <Link key={item.path} to={item.path}
                className={`flex items-center gap-3 px-6 py-3 hover:bg-purple-800 ${location.pathname === item.path ? 'bg-purple-800 border-l-4 border-white' : ''}`}
                onClick={() => setIsOpen(false)}>
                <Icon className="w-5 h-5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
