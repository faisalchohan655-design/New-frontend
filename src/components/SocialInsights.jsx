import { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../api';
import * as XLSX from 'xlsx';
import { FaFacebook, FaSearch, FaTrash, FaDownload } from 'react-icons/fa';

const SocialInsights = () => {
  const [url, setUrl] = useState('');
  const [leads, setLeads] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [requireEmail, setRequireEmail] = useState(false);
  const [requirePhone, setRequirePhone] = useState(false);
  const [requireWebsite, setRequireWebsite] = useState(false);

  const handleScrape = async (e) => {
    e.preventDefault();
    if (!url.trim()) return toast.error('Enter Facebook Page URL');
    setLoading(true);
    const toastId = toast.loading('Fetching page insights...');
    try {
      const res = await api.post('/facebook', { pageUrl: url, filters: { requireEmail, requirePhone, requireWebsite } });
      setLeads(res.data.leads || []);
      toast.success(`Insights fetched`, { id: toastId });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed', { id: toastId });
    } finally { setLoading(false); }
  };
  const handleDelete = async (id) => { /* same delete logic */ };
  const exportCSV = () => { /* same */ };
  const exportExcel = () => { /* same */ };
  const toggleSelect = (id) => { /* same */ };
  const toggleSelectAll = () => { /* same */ };
  const bulkDelete = async () => { /* same */ };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-6">Social Insights</h1>
      <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
        <form onSubmit={handleScrape} className="space-y-4">
          <div><label className="block text-sm font-medium">Facebook Page URL</label><input type="text" value={url} onChange={e=>setUrl(e.target.value)} placeholder="https://facebook.com/example" className="w-full border rounded-xl p-2" required/></div>
          <div className="flex flex-wrap gap-4"><label><input type="checkbox" checked={requireEmail} onChange={()=>setRequireEmail(!requireEmail)}/> Must have Email</label><label><input type="checkbox" checked={requirePhone} onChange={()=>setRequirePhone(!requirePhone)}/> Must have Phone</label><label><input type="checkbox" checked={requireWebsite} onChange={()=>setRequireWebsite(!requireWebsite)}/> Must have Website</label></div>
          <button type="submit" disabled={loading} className="bg-indigo-600 text-white px-6 py-2 rounded-xl flex items-center gap-2">{loading ? 'Fetching...' : <><FaSearch/> Get Insights</>}</button>
        </form>
      </div>
      {/* Same table as above with leads, delete, export buttons */}
    </div>
  );
};
export default SocialInsights;
