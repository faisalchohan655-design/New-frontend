import { Settings as SettingsIcon, Globe, Key, Database, Shield } from 'lucide-react';

const Settings = () => {
  return (
    <div>
      <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent mb-6">Settings</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-md">
          <div className="flex items-center gap-3 mb-4"><Globe className="w-6 h-6 text-indigo-600" /><h2 className="text-xl font-semibold">API Endpoint</h2></div>
          <p className="font-mono text-sm bg-gray-100 p-3 rounded-lg break-all">{import.meta.env.VITE_API_URL}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-md">
          <div className="flex items-center gap-3 mb-4"><Database className="w-6 h-6 text-green-600" /><h2 className="text-xl font-semibold">Storage</h2></div>
          <p>MongoDB Atlas – Secure cloud database. All leads stored with unique placeId.</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-md">
          <div className="flex items-center gap-3 mb-4"><Key className="w-6 h-6 text-yellow-600" /><h2 className="text-xl font-semibold">SerpAPI</h2></div>
          <p>Google Maps scraping powered by SerpAPI. Configure your API key in backend environment.</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-md">
          <div className="flex items-center gap-3 mb-4"><Shield className="w-6 h-6 text-red-600" /><h2 className="text-xl font-semibold">Security</h2></div>
          <p>CORS enabled for frontend only. Environment variables never exposed.</p>
        </div>
      </div>
    </div>
  );
};

export default Settings;
