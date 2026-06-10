import { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import toast from 'react-hot-toast';
import api from '../api';
import { Search, Download, Mail, Phone, ExternalLink, Filter, ChevronUp, ChevronDown } from 'lucide-react';

const Leads = () => {
  const [leads, setLeads] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  const fetchLeads = async () => {
    try {
      const res = await api.get('/leads');
      setLeads(res.data);
    } catch (err) { toast.error('Failed to load leads'); }
  };

  useEffect(() => { fetchLeads(); }, []);

  useEffect(() => {
    let result = [...leads];
    if (search) result = result.filter(l => l.name.toLowerCase().includes(search.toLowerCase()) || (l.address || '').toLowerCase().includes(search.toLowerCase()));
    result.sort((a, b) => {
      let aVal = a[sortField] || '', bVal = b[sortField] || '';
      if (sortField === 'rating') { aVal = aVal || 0; bVal = bVal || 0; }
      if (sortField === 'date') { aVal = new Date(a.createdAt); bVal = new Date(b.createdAt); }
      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    setFiltered(result);
  }, [search, leads, sortField, sortOrder]);

  const exportCSV = () => {
    const headers = ['Name','Phone','Email','Website','Address','Rating'];
    const rows = filtered.map(l => [l.name, l.phone, l.email, l.website, l.address, l.rating]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `leads_${new Date().toISOString().slice(0,19)}.csv`; a.click(); URL.revokeObjectURL(blob);
    toast.success('CSV downloaded');
  };

  const exportExcel = () => {
    const sheet = XLSX.utils.json_to_sheet(filtered.map(l => ({ Name: l.name, Phone: l.phone, Email: l.email, Website: l.website, Address: l.address, Rating: l.rating })));
    const book = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(book, sheet, 'Leads'); XLSX.writeFile(book, `leads_${new Date().toISOString().slice(0,19)}.xlsx`);
    toast.success('Excel downloaded');
  };

  const handleSort = (field) => {
    if (sortField === field) setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortOrder('asc'); }
  };

  return (
    <div>
      <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Leads Database</h1>
        <div className="flex gap-2"><button onClick={exportCSV} className="bg-gray-600 text-white px-4 py-2 rounded-xl">📄 CSV</button><button onClick={exportExcel} className="bg-green-600 text-white px-4 py-2 rounded-xl">📊 Excel</button></div>
      </div>
      <div className="bg-white p-4 rounded-xl shadow-md flex flex-wrap gap-4 items-center mb-6">
        <div className="flex-1 relative"><Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" /><input type="text" placeholder="Search by name or address..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-lg" /></div>
        <div className="text-sm text-gray-500">{filtered.length} leads shown</div>
      </div>
      <div className="bg-white rounded-xl shadow-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50"><tr>{['Name','Phone','Email','Website','Address','Rating'].map(col => (<th key={col} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100" onClick={() => handleSort(col.toLowerCase())}><div className="flex items-center gap-1">{col}{sortField === col.toLowerCase() && (sortOrder === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}</div></th>))}<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th></tr></thead>
          <tbody>{filtered.map(lead => (<tr key={lead._id} className="hover:bg-gray-50"><td className="px-6 py-4 font-medium">{lead.name}</td><td className="px-6 py-4">{lead.phone || '-'}</td><td className="px-6 py-4">{lead.email || '-'}</td><td className="px-6 py-4">{lead.website ? <a href={lead.website} target="_blank" className="text-indigo-600 hover:underline">Visit</a> : '-'}</td><td className="px-6 py-4 max-w-xs truncate">{lead.address || '-'}</td><td className="px-6 py-4">{lead.rating || '-'}</td><td className="px-6 py-4 flex gap-3">{lead.phone && <a href={`https://wa.me/${lead.phone.replace(/\D/g,'')}`} target="_blank" className="text-green-600 hover:text-green-800" title="WhatsApp"><Phone size={18} /></a>}{lead.email && <a href={`mailto:${lead.email}`} className="text-blue-600 hover:text-blue-800" title="Email"><Mail size={18} /></a>}{lead.website && <a href={lead.website} target="_blank" className="text-purple-600" title="Website"><ExternalLink size={18} /></a>}</td></tr>))}</tbody>
        </table>
      </div>
    </div>
  );
};
export default Leads;
