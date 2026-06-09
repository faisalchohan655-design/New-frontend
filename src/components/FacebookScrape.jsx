import { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../api';
import { FaFacebook, FaSearch } from 'react-icons/fa';

const FacebookScrape = () => {
  const [pageUrl, setPageUrl] = useState('');
  const [requireEmail, setRequireEmail] = useState(false);
  const [requirePhone, setRequirePhone] = useState(false);
  const [requireWebsite, setRequireWebsite] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!pageUrl.trim()) {
      toast.error('Please enter a Facebook Page URL');
      return;
    }
    setLoading(true);
    const toastId = toast.loading('Scraping Facebook page...');
    try {
      const res = await api.post('/facebook', {
        pageUrl,
        filters: { requireEmail, requirePhone, requireWebsite }
      });
      toast.success(res.data.message, { id: toastId });
      setPageUrl('');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Facebook scraping failed', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-6">
        Facebook Page Scraper
      </h1>
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
              <FaFacebook className="text-blue-600" /> Facebook Page URL
            </label>
            <input
              type="text"
              value={pageUrl}
              onChange={(e) => setPageUrl(e.target.value)}
              className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500"
              placeholder="https://facebook.com/example"
              required
            />
            <p className="text-xs text-gray-400 mt-1">
              Enter a public Facebook Page URL (e.g., https://facebook.com/nike)
            </p>
          </div>

          {/* Quality Filters */}
          <div className="border-t pt-4">
            <h3 className="font-semibold text-gray-700 mb-3">Quality Filters (Optional)</h3>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setRequireEmail(!requireEmail)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                  requireEmail ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'
                }`}
              >
                {requireEmail ? '✅' : '⭕'} Must have Email
              </button>
              <button
                type="button"
                onClick={() => setRequirePhone(!requirePhone)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                  requirePhone ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'
                }`}
              >
                {requirePhone ? '✅' : '⭕'} Must have Phone
              </button>
              <button
                type="button"
                onClick={() => setRequireWebsite(!requireWebsite)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                  requireWebsite ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'
                }`}
              >
                {requireWebsite ? '✅' : '⭕'} Must have Website
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Enable to save only pages that have email, phone, or website in their public info.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl hover:shadow-lg disabled:opacity-50 transition flex items-center justify-center gap-2"
          >
            {loading ? '⏳ Scraping...' : <><FaSearch /> Scrape Facebook Page</>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default FacebookScrape;
