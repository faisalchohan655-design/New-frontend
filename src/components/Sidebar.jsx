import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Map, Users, Settings, ChevronLeft, ChevronRight, Zap, Facebook, Mail, Globe, MessageCircle, Briefcase } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const items = [
    { path: '/dashboard', name: 'Dashboard', icon: LayoutDashboard, badge: null },
    { path: '/local-business-insights', name: 'Local Business Insights', icon: Map, badge: null },
    { path: '/social-insights', name: 'Social Insights', icon: Facebook, badge: null },
    { path: '/domain-insights', name: 'Domain Insights', icon: Mail, badge: null },
    { path: '/website-intelligence', name: 'Website Intelligence', icon: Globe, badge: null },
    { path: '/campaign-outreach', name: 'Campaign Outreach', icon: MessageCircle, badge: null },
    { path: '/conversation-inbox', name: 'Conversation Inbox', icon: Users, badge: null },
    { path: '/crm-pipeline', name: 'CRM Pipeline', icon: Briefcase, badge: 'Soon' },
    { path: '/whatsapp-outreach', name: 'WhatsApp Outreach', icon: FaWhatsapp, badge: 'Soon' },
    { path: '/settings', name: 'Settings', icon: Settings, badge: null }
  ];
  return (
    <div className={`relative transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'} bg-gradient-to-b from-indigo-900 to-purple-900 text-white shadow-2xl`}>
      <button onClick={() => setCollapsed(!collapsed)} className="absolute -right-3 top-20 bg-white text-indigo-900 rounded-full p-1 shadow-md">{collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}</button>
      <div className="p-5 text-2xl font-bold border-b border-indigo-800 flex items-center justify-center gap-2"><Zap className="w-6 h-6" />{!collapsed && <span>LeadConnect</span>}{collapsed && <span>LC</span>}</div>
      <nav className="mt-8">
        {items.map((item) => (
          <NavLink key={item.path} to={item.path} className={({ isActive }) => `flex items-center justify-between px-6 py-3 my-1 mx-2 rounded-lg ${isActive ? 'bg-indigo-600 shadow-md' : 'hover:bg-indigo-800'} ${collapsed ? 'justify-center' : ''}`}>
            <div className="flex items-center gap-3">
              <item.icon size={20} />
              {!collapsed && <span>{item.name}</span>}
            </div>
            {!collapsed && item.badge && <span className="text-xs bg-yellow-500 text-black px-2 py-0.5 rounded-full">{item.badge}</span>}
          </NavLink>
        ))}
      </nav>
    </div>
  );
};
export default Sidebar;
