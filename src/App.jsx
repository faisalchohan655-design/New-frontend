import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Scrape from './components/Scrape';
import FacebookScrape from './components/FacebookScrape';
import Leads from './components/Leads';
import Sales from './components/Sales';
import Settings from './components/Settings';
import Emails from './components/Emails';
import GoogleMaps from './components/Scrape';
import './App.css';

function App() {
  return (
    <Router>
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-6">
          <Toaster position="top-right" />
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/scrape" element={<Scrape />} />
            <Route path="/facebook" element={<FacebookScrape />} />
            <Route path="/leads" element={<Leads />} />
            <Route path="/sales" element={<Sales />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/emails" element={<Emails />} />
            <Route path="/google-maps" element={<GoogleMaps />} />
            <Route path="*" element={<div className="text-center mt-20 text-2xl">Route not found</div>} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
