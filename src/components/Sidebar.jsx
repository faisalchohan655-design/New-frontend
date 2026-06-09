import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Mail, Users, Scissors, Settings } from 'lucide-react';

export default function Sidebar() {
  const location = useLocation();
  
  const menu = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Email Extractor', path: '/emails', icon: Mail },
    { name: 'Leads', path: '/leads', icon: Users },
    { name: 'Scrape', path: '/scrape', icon: Scissors },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <div className="w-64 bg-gray-900 text-white h-screen fixed left-0 top-0">
      <div className="p-6"><h2 className="text-2xl font-bold">New Frontend</h2></div>
      <nav className="mt-6">
        {menu.map(item => {
          const Icon = item.icon;
          return (
            <Link key={item.path} to={item.path} 
              className={`flex items-center gap-3 px-6 py-3 hover:bg-gray-800 ${location.pathname === item.path ? 'bg-gray-800 border-l-4 border-indigo-500' : ''}`}>
              <Icon className="w-5 h-5" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
