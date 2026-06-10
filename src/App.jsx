import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Scrape from './components/Scrape';
import Leads from './components/Leads';
import Sales from './components/Sales';
import Settings from './components/Settings';
import FacebookScrape from './components/FacebookScrape';
import EmailExtractor from './components/EmailExtractor';
import WebsiteLeads from './components/WebsiteLeads';   // ✅ new component
import { Toaster } from 'react-hot-toast';              // ✅ fixed import

function App() {
  return (
    <BrowserRouter>
      <div className="flex h-screen bg-gradient-to-br from-slate-50 to-gray-100">
        <Sidebar />
        <div className="flex-1 overflow-y-auto p-6">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/scrape" element={<Scrape />} />
            <Route path="/facebook" element={<FacebookScrape />} />
            <Route path="/email-extractor" element={<EmailExtractor />} />
            <Route path="/website-leads" element={<WebsiteLeads />} />   {/* ✅ new route */}
            <Route path="/leads" element={<Leads />} />
            <Route path="/sales" element={<Sales />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </div>
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      </div>
    </BrowserRouter>
  );
}

export default App;
