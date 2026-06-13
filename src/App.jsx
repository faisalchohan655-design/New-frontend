import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Scrape from './components/Scrape';
import FacebookScrape from './components/FacebookScrape';
import EmailExtractor from './components/EmailExtractor';
import WebsiteLeads from './components/WebsiteLeads';
import Sales from './components/Sales';
import Settings from './components/Settings';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <BrowserRouter>
      <div className="flex h-screen bg-gradient-to-br from-slate-50 to-gray-100">
        <Sidebar />
        <div className="flex-1 overflow-y-auto p-6">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/local-business-insights" element={<Scrape />} />
            <Route path="/social-insights" element={<FacebookScrape />} />
            <Route path="/domain-insights" element={<EmailExtractor />} />
            <Route path="/website-intelligence" element={<WebsiteLeads />} />
            <Route path="/campaign-outreach" element={<Sales />} />
            <Route path="/conversation-inbox" element={<Sales />} /> {/* placeholder */}
            <Route path="/crm-pipeline" element={<Dashboard />} />     {/* placeholder */}
            <Route path="/whatsapp-outreach" element={<Sales />} />    {/* placeholder */}
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </div>
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      </div>
    </BrowserRouter>
  );
}

export default App;
