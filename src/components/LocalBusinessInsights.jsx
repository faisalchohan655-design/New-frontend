import { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../api';
import * as XLSX from 'xlsx';
import { Search, Loader2, MapPin, Hash, Building, Trash2, Download } from 'lucide-react';

const LocalBusinessInsights = () => {
  const [keyword, setKeyword] = useState('');
  const [city, setCity] = useState('');
  const [count, setCount] = useState(10);
  const [loading, setLoading] = useState(false);
  const [leads, setLeads] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [requireEmail, setRequireEmail] = useState(false);
  const [requirePhone, setRequirePhone] = useState(false);
  const [requireWebsite, setRequireWebsite] = useState(false);

  const handleScrape = async (e) => {
    e.preventDefault();
    if (!keyword.trim() || !city.trim()) return toast.error('Enter keyword and city');
    setLoading(true);
    const toastId = toast.loading('Fetching business insights...');
    try {
      const res = await api.post('/scrape', {
        keyword, city, count,
        filters: { requireEmail, requirePhone, requireWebsite }
      });
      setLeads(res.data.leads || []);
      toast.success(`Found ${res.data.leads?.length || 0} businesses`, { id: toastId });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this lead?')) return;
    try {
      await api.delete(`/leads/${id}`);
      setLeads(leads.filter(l => l._id !== id));
      setSelectedIds(selectedIds.filter(i => i !== id));
      toast.success('Deleted');
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  const bulkDelete = async () => {
    if (selectedIds.length === 0) return toast.error('No leads selected');
    if (!window.confirm(`Delete ${selectedIds.length} leads?`)) return;
    for (const id of selectedIds) {
      await api.delete(`/leads/${id}`);
    }
    setLeads(leads.filter(l => !selectedIds.includes(l._id)));
    setSelectedIds([]);
    toast.success(`${selectedIds.length} leads deleted`);
  };

  const exportCSV = () => {
    if (leads.length === 0) return toast.error('No data to export');
    const headers = ['Name', 'Phone', 'Email', 'Website', 'Address', 'Rating'];
    const rows = leads.map(l => [l.name, l.phone, l.email, l.website, l.address, l.rating]);
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `business_insights_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(blob);
    toast.success('CSV exported');
  };

  const exportExcel = () => {
    if (leads.length === 0) return toast.error('No data to export');
    const ws = XLSX.utils.json_to_sheet(leads.map(l => ({
      Name: l.name, Phone: l.phone, Email: l.email, Website: l.website, Address: l.address, Rating: l.rating
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Leads');
    XLSX.writeFile(wb, `business_insights_${Date.now()}.xlsx`);
    toast.success('Excel exported');
  };

  const toggleSelect = (id) => {
    if (selectedIds.includes(id)) setSelectedIds(selectedIds.filter(i => i !== id));
    else setSelectedIds([...selectedIds, id]);
  };
  const toggleSelectAll = () => {
    if (selectedIds.length === leads.length) setSelectedIds([]);
    else setSelectedIds(leads.map(l => l._id));
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-6">Local Business Insights</h1>
      <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
        <form onSubmit={handleScrape} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium">Business Type / Keyword</label><input type="text" value={keyword} onChange={e=>setKeyword(e.target.value)} className="w-full border rounded-xl p-2" required/></div>
            <div><label className="block text-sm font-medium">City / Location</label><input type="text" value={city} onChange={e=>setCity(e.target.value)} className="w-full border rounded-xl p-2" required/></div>
          </div>
          <div><label className="block text-sm font-medium">Number of Results (max 50)</label><input type="number" min="1" max="50" value={count} onChange={e=>setCount(parseInt(e.target.value))} className="w-full border rounded-xl p-2" required/></div>
          <div className="flex flex-wrap gap-4"><label className="flex items-center gap-2"><input type="checkbox" checked={requireEmail} onChange={()=>setRequireEmail(!requireEmail)}/> Must have Email</label><label><input type="checkbox" checked={requirePhone} onChange={()=>setRequirePhone(!requirePhone)}/> Must have Phone</label><label><input type="checkbox" checked={requireWebsite} onChange={()=>setRequireWebsite(!requireWebsite)}/> Must have Website</label></div>
          <button type="submit" disabled={loading} className="bg-indigo-600 text-white px-6 py-2 rounded-xl flex items-center gap-2">{loading ? <Loader2 className="animate-spin"/> : <Search/>}{loading ? 'Fetching...' : 'Get Insights'}</button>
        </form>
      </div>

      {leads.length > 0 && (
        <>
          <div className="flex justify-between items-center mb-4">
            <div className="flex gap-2"><button onClick={toggleSelectAll} className="bg-gray-500 text-white px-3 py-1 rounded">Select All</button><button onClick={bulkDelete} className="bg-red-600 text-white px-3 py-1 rounded flex gap-1"><Trash2 size={16}/> Delete</button><button onClick={exportCSV} className="bg-green-600 text-white px-3 py-1 rounded flex gap-1"><Download size={16}/> CSV</button><button onClick={exportExcel} className="bg-blue-600 text-white px-3 py-1 rounded flex gap-1"><Download size={16}/> Excel</button></div>
            <span>{selectedIds.length} selected / {leads.length} total</span>
          </div>
          <div className="bg-white rounded-xl shadow-lg overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100"><tr><th className="p-3">Select</th><th>Name</th><th>Phone</th><th>Email</th><th>Website</th><th>Address</th><th>Rating</th><th>Actions</th></tr></thead>
              <tbody>{leads.map(lead => (<tr key={lead._id} className="border-t"><td className="p-3"><input type="checkbox" checked={selectedIds.includes(lead._id)} onChange={()=>toggleSelect(lead._id)}/></td><td className="p-3 font-medium">{lead.name}</td><td>{lead.phone || '-'}</td><td>{lead.email || '-'}</td><td>{lead.website ? <a href={lead.website} target="_blank" className="text-blue-600">Visit</a> : '-'}</td><td className="max-w-xs truncate">{lead.address || '-'}</td><td>{lead.rating || '-'}</td><td><button onClick={()=>handleDelete(lead._id)} className="text-red-500"><Trash2 size={16}/></button></td></tr>))}</tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};
export default LocalBusinessInsights;
