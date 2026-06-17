import { useState } from 'react';
import api from '../api';
import toast from 'react-hot-toast';

const Scrape = () => {
  const [keyword, setKeyword] = useState('');
  const [city, setCity] = useState('');
  const [count, setCount] = useState(10);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!keyword.trim() || !city.trim()) {
      toast.error('Enter keyword and city');
      return;
    }
    setLoading(true);
    const toastId = toast.loading('Scraping...');
    try {
      await api.post('/scrape', { keyword, city, count });
      toast.success('Scraped successfully', { id: toastId });
    } catch (err) {
      toast.error('Failed', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Local Business Insights</h1>
      <form onSubmit={handleSubmit} className="max-w-md">
        <input
          type="text"
          placeholder="Keyword"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          className="w-full border rounded p-2 mb-2"
        />
        <input
          type="text"
          placeholder="City"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="w-full border rounded p-2 mb-2"
        />
        <input
          type="number"
          placeholder="Count"
          value={count}
          onChange={(e) => setCount(parseInt(e.target.value))}
          className="w-full border rounded p-2 mb-2"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded w-full"
        >
          {loading ? 'Scraping...' : 'Scrape'}
        </button>
      </form>
    </div>
  );
};

export default Scrape;
