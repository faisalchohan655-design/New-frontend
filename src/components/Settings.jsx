const Settings = () => {
  return (
    <div>
      <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent mb-6">Settings</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-md"><h2 className="text-xl font-semibold mb-3">API Endpoint</h2><p className="font-mono text-sm bg-gray-100 p-3 rounded-lg break-all">{import.meta.env.VITE_API_URL}</p></div>
        <div className="bg-white p-6 rounded-2xl shadow-md"><h2 className="text-xl font-semibold mb-3">Storage</h2><p>MongoDB Atlas – all leads stored securely.</p></div>
        <div className="bg-white p-6 rounded-2xl shadow-md"><h2 className="text-xl font-semibold mb-3">Scraping Sources</h2><p>Google Maps, Facebook Pages, Email Extractor</p></div>
        <div className="bg-white p-6 rounded-2xl shadow-md"><h2 className="text-xl font-semibold mb-3">Support</h2><p>For issues, contact your admin.</p></div>
      </div>
    </div>
  );
};
export default Settings;
