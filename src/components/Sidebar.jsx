import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import Scrape from './components/Scrape';
import Facebook from './components/Facebook';
import Leads from './components/Leads';
import Sales from './components/Sales';
import Settings from './components/Settings';
import Emails from './components/Emails';
import GoogleMaps from './components/ScrapeGoogleMaps'; // یہ لائن add کی
import Sidebar from './components/Sidebar';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <div className="app-layout">
        <Sidebar />
        <div className="main-content">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/scrape" element={<Scrape />} />
            <Route path="/facebook" element={<Facebook />} />
            <Route path="/leads" element={<Leads />} />
            <Route path="/sales" element={<Sales />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/emails" element={<Emails />} />
            <Route path="/google-maps" element={<GoogleMaps />} /> {/* یہ لائن add کی */}
            <Route path="*" element={<div>Route not found</div>} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
