import { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../api';
import { Search, Loader2, MapPin, Hash, Building } from 'lucide-react';

const Scrape = () => {
  const [keyword, setKeyword] = useState('');
  const [city, setCity] = useState('');
  const [count, setCount] = useState(10);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!keyword.trim() || !city.trim()) {
      toast.error('Please fill both keyword and city');
      return;
    }
    if (count < 1 || count > 50) {
      toast.error('Count must be between 1 and 50');
      return;
    }
    setLoading(true);
    const toastId = toast.loading('Scraping Google Maps... This may take a few seconds');
    try {
      const res = await api.post('/scrape', { keyword, city, count });
      toast.success(res.data.message, { id: toastId });
      setKeyword('');
      setCity('');
      setCount(10);
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message || 'Scraping failed';
      toast.error(errorMsg, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent mb-6">Scrape Google Maps</h1>
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2"><Building size={16} /> Market / Keyword</label>
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              placeholder="e.g., restaurants, plumbers, dentists"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2"><MapPin size={16} /> City</label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g., New York, London, Karachi"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2"><Hash size={16} /> Number of Leads (max 50)</label>
            <input
              type="number"
              min="1"
              max="50"
              value={count}
              onChange={(e) => setCount(parseInt(e.target.value))}
              className="w-full border border-gray-300 rounded-xl p-3"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl hover:shadow-lg disabled:opacity-50 transition flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" /> : <Search />}
            {loading ? 'Scraping...' : 'Start Scraping'}
          </button>
        </form>
        <p className="text-xs text-gray-400 mt-4 text-center">Powered by SerpAPI | Google Maps data</p>
      </div>
    </div>
  );
};

export default Scrape;
