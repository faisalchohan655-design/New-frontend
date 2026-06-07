import { useEffect, useState } from 'react';
import api from '../api';
import { FaWhatsapp, FaEnvelope, FaTrash, FaSave, FaDownload, FaCheckSquare, FaSquare, FaSort, FaEdit, FaCheck, FaClock, FaSpinner, FaFilter, FaTimes } from 'react-icons/fa';
import * as XLSX from 'xlsx';
import toast from 'react-hot-toast';

const Sales = () => {
  const [leads, setLeads] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [selectedLeads, setSelectedLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    minRating: 0,
    phoneOnly: false,
    websiteOnly: false,
    city: '',
    search: ''
  });
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [savedFilters, setSavedFilters] = useState([]);
  const [viewMode, setViewMode] = useState('cards');
  const [followUp, setFollowUp] = useState({});
  const [notes, setNotes] = useState({});
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Load leads
  useEffect(() => {
    fetchLeads();
    const saved = localStorage.getItem('leadStrikerFilters');
    if (saved) setSavedFilters(JSON.parse(saved));
    const savedFollowUp = localStorage.getItem('leadStrikerFollowUp');
    if (savedFollowUp) setFollowUp(JSON.parse(savedFollowUp));
    const savedNotes = localStorage.getItem('leadStrikerNotes');
    if (savedNotes) setNotes(JSON.parse(savedNotes));
  }, []);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const res = await api.get('/leads');
      setLeads(res.data);
      setFiltered(res.data);
    } catch (err) {
      toast.error('Failed to load leads');
    } finally {
      setLoading(false);
    }
  };

  // Apply filters & sort
  useEffect(() => {
    let result = [...leads];
    if (filters.minRating > 0) {
      result = result.filter(l => (l.rating || 0) >= filters.minRating);
    }
    if (filters.phoneOnly) result = result.filter(l => l.phone);
    if (filters.websiteOnly) result = result.filter(l => l.website);
    if (filters.city) {
      result = result.filter(l => (l.address || '').toLowerCase().includes(filters.city.toLowerCase()));
    }
    if (filters.search) {
      result = result.filter(l => l.name.toLowerCase().includes(filters.search.toLowerCase()));
    }
    // Sorting
    result.sort((a, b) => {
      let aVal = a[sortBy] || '';
      let bVal = b[sortBy] || '';
      if (sortBy === 'rating') { aVal = aVal || 0; bVal = bVal || 0; }
      if (sortBy === 'date') { aVal = new Date(a.createdAt); bVal = new Date(b.createdAt); }
      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    setFiltered(result);
    setSelectedLeads([]);
    setCurrentPage(1);
  }, [filters, leads, sortBy, sortOrder]);

  // Pagination logic
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentLeads = filtered.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  // Delete single lead (FIXED)
  const deleteLead = async (id) => {
    if (!window.confirm('Are you sure you want to delete this lead?')) return;
    try {
      await api.delete(`/leads/${id}`);
      toast.success('Lead deleted');
      await fetchLeads(); // Refresh fresh data
    } catch (err) {
      toast.error('Delete failed: ' + (err.response?.data?.error || err.message));
    }
  };

  // Bulk delete (FIXED)
  const bulkDelete = async () => {
    if (selectedLeads.length === 0) return toast.error('No leads selected');
    if (!window.confirm(`Delete ${selectedLeads.length} leads?`)) return;
    try {
      for (const id of selectedLeads) {
        await api.delete(`/leads/${id}`);
      }
      toast.success(`${selectedLeads.length} leads deleted`);
      await fetchLeads();
      setSelectedLeads([]);
    } catch (err) {
      toast.error('Bulk delete failed');
    }
  };

  // Export to CSV
  const exportCSV = () => {
    const headers = ['Name', 'Phone', 'Email', 'Website', 'Address', 'Rating', 'FollowUp'];
    const rows = filtered.map(l => [l.name, l.phone, l.email, l.website, l.address, l.rating, followUp[l._id] || 'Pending']);
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales_leads_${new Date().toISOString().slice(0,19)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV exported');
  };

  // Export to Excel
  const exportExcel = () => {
    const data = filtered.map(l => ({
      Name: l.name, Phone: l.phone, Email: l.email, Website: l.website,
      Address: l.address, Rating: l.rating, FollowUp: followUp[l._id] || 'Pending'
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'SalesLeads');
    XLSX.writeFile(wb, `sales_leads_${new Date().toISOString().slice(0,19)}.xlsx`);
    toast.success('Excel exported');
  };

  // Bulk WhatsApp
  const bulkWhatsApp = () => {
    const selected = leads.filter(l => selectedLeads.includes(l._id) && l.phone);
    if (selected.length === 0) return toast.error('No leads with phone selected');
    selected.forEach(lead => {
      const url = `https://wa.me/${lead.phone.replace(/\D/g, '')}?text=${encodeURIComponent('Hi, I came across your business. Would love to connect!')}`;
      window.open(url, '_blank');
    });
    toast.success(`Opened WhatsApp for ${selected.length} leads`);
  };

  // Bulk Email
  const bulkEmail = () => {
    const selected = leads.filter(l => selectedLeads.includes(l._id) && l.email);
    if (selected.length === 0) return toast.error('No emails selected');
    const emails = selected.map(l => l.email).join(',');
    window.location.href = `mailto:${emails}?subject=Business Opportunity&body=Hello, I found your profile on LeadStriker.`;
    toast.success(`Opened email for ${selected.length} leads`);
  };

  // Follow-up & Notes
  const updateFollowUp = (id, status) => {
    const updated = { ...followUp, [id]: status };
    setFollowUp(updated);
    localStorage.setItem('leadStrikerFollowUp', JSON.stringify(updated));
    toast.success(`Status updated to ${status}`);
  };

  const updateNote = (id, note) => {
    const updated = { ...notes, [id]: note };
    setNotes(updated);
    localStorage.setItem('leadStrikerNotes', JSON.stringify(updated));
    toast.success('Note saved');
  };

  // Filter presets
  const saveFilterPreset = () => {
    const name = prompt('Enter preset name');
    if (!name) return;
    const newPreset = { name, filters: { ...filters } };
    const updated = [...savedFilters, newPreset];
    setSavedFilters(updated);
    localStorage.setItem('leadStrikerFilters', JSON.stringify(updated));
    toast.success(`Preset "${name}" saved`);
  };

  const loadFilterPreset = (preset) => {
    setFilters(preset.filters);
    toast.success(`Loaded: ${preset.name}`);
  };

  const deletePreset = (index) => {
    const updated = savedFilters.filter((_, i) => i !== index);
    setSavedFilters(updated);
    localStorage.setItem('leadStrikerFilters', JSON.stringify(updated));
    toast.success('Preset deleted');
  };

  const clearFilters = () => {
    setFilters({ minRating: 0, phoneOnly: false, websiteOnly: false, city: '', search: '' });
    setSortBy('name');
    setSortOrder('asc');
    toast.success('Filters cleared');
  };

  const toggleSelectAll = () => {
    if (selectedLeads.length === currentLeads.length) setSelectedLeads([]);
    else setSelectedLeads(currentLeads.map(l => l._id));
  };

  const toggleSelect = (id) => {
    if (selectedLeads.includes(id)) setSelectedLeads(selectedLeads.filter(i => i !== id));
    else setSelectedLeads([...selectedLeads, id]);
  };

  const getStatusIcon = (status) => {
    if (status === 'Converted') return <FaCheck className="text-green-600" />;
    if (status === 'Contacted') return <FaEdit className="text-blue-600" />;
    return <FaClock className="text-gray-400" />;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <FaSpinner className="animate-spin text-indigo-600 text-4xl" />
        <span className="ml-3 text-gray-600">Loading leads...</span>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent mb-6">Sales Outreach</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-xl shadow">
          <p className="text-sm text-gray-500">Total Leads</p>
          <p className="text-2xl font-bold">{leads.length}</p>
        </div>
        <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-xl shadow">
          <p className="text-sm text-gray-500">Filtered Leads</p>
          <p className="text-2xl font-bold">{filtered.length}</p>
        </div>
        <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-xl shadow">
          <p className="text-sm text-gray-500">Selected</p>
          <p className="text-2xl font-bold">{selectedLeads.length}</p>
        </div>
      </div>

      {/* Filter Panel */}
      <div className="bg-white rounded-2xl shadow-lg p-5 mb-6 border border-gray-100">
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-semibold text-gray-700 flex items-center gap-2"><FaFilter /> Filters</h2>
          <button onClick={clearFilters} className="text-red-500 text-sm flex items-center gap-1"><FaTimes /> Clear all</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-600">Min Rating: {filters.minRating}★</label>
            <input type="range" min="0" max="5" step="0.5" value={filters.minRating} onChange={e => setFilters({...filters, minRating: parseFloat(e.target.value)})} className="w-full" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">City filter</label>
            <input type="text" placeholder="e.g., Karachi" value={filters.city} onChange={e => setFilters({...filters, city: e.target.value})} className="w-full border rounded-lg p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">Search by name</label>
            <input type="text" placeholder="Business name" value={filters.search} onChange={e => setFilters({...filters, search: e.target.value})} className="w-full border rounded-lg p-2" />
          </div>
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2"><input type="checkbox" checked={filters.phoneOnly} onChange={e => setFilters({...filters, phoneOnly: e.target.checked})} /> Has Phone</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={filters.websiteOnly} onChange={e => setFilters({...filters, websiteOnly: e.target.checked})} /> Has Website</label>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">Saved Presets</label>
            <div className="flex flex-wrap gap-2 mt-1">
              <button onClick={saveFilterPreset} className="bg-blue-600 text-white px-2 py-1 rounded text-sm flex items-center gap-1"><FaSave size={12} /> Save</button>
              {savedFilters.map((p, idx) => (
                <div key={idx} className="bg-gray-100 rounded px-2 py-1 flex items-center gap-1 text-xs">
                  <button onClick={() => loadFilterPreset(p)} className="hover:text-blue-600">{p.name}</button>
                  <button onClick={() => deletePreset(idx)} className="text-red-500">✕</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="bg-white rounded-xl shadow p-3 mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={toggleSelectAll} className="text-gray-600 hover:text-gray-800">
            {selectedLeads.length === currentLeads.length ? <FaCheckSquare size={20} /> : <FaSquare size={20} />}
          </button>
          <span className="text-sm font-medium">{selectedLeads.length} selected</span>
          <button onClick={bulkWhatsApp} className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm flex items-center gap-1"><FaWhatsapp /> WhatsApp</button>
          <button onClick={bulkEmail} className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm flex items-center gap-1"><FaEnvelope /> Email</button>
          <button onClick={bulkDelete} className="bg-red-600 text-white px-3 py-1.5 rounded-lg text-sm flex items-center gap-1"><FaTrash /> Delete</button>
          <button onClick={exportCSV} className="bg-gray-600 text-white px-3 py-1.5 rounded-lg text-sm flex items-center gap-1"><FaDownload /> CSV</button>
          <button onClick={exportExcel} className="bg-purple-600 text-white px-3 py-1.5 rounded-lg text-sm flex items-center gap-1"><FaDownload /> Excel</button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="border rounded px-2 py-1 text-sm">
            <option value="name">Sort by Name</option>
            <option value="rating">Sort by Rating</option>
            <option value="date">Sort by Date</option>
          </select>
          <button onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')} className="bg-gray-200 px-2 py-1 rounded text-sm flex items-center gap-1"><FaSort /> {sortOrder === 'asc' ? 'A-Z' : 'Z-A'}</button>
          <div className="flex gap-1">
            <button onClick={() => setViewMode('cards')} className={`px-3 py-1 rounded text-sm ${viewMode === 'cards' ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}>Cards</button>
            <button onClick={() => setViewMode('table')} className={`px-3 py-1 rounded text-sm ${viewMode === 'table' ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}>Table</button>
          </div>
          <select value={itemsPerPage} onChange={e => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }} className="border rounded px-2 py-1 text-sm">
            <option>5</option><option>10</option><option>20</option><option>50</option>
          </select>
        </div>
      </div>

      {/* Leads Display */}
      {currentLeads.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-xl">No leads match your filters</div>
      ) : viewMode === 'cards' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {currentLeads.map(lead => (
            <div key={lead._id} className="bg-white rounded-xl shadow-md p-4 hover:shadow-lg transition border border-gray-100">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <button onClick={() => toggleSelect(lead._id)}>
                    {selectedLeads.includes(lead._id) ? <FaCheckSquare className="text-indigo-600" /> : <FaSquare className="text-gray-400" />}
                  </button>
                  <h3 className="font-bold text-md leading-tight">{lead.name.substring(0, 40)}</h3>
                </div>
                <button onClick={() => deleteLead(lead._id)} className="text-red-500 hover:text-red-700"><FaTrash size={14} /></button>
              </div>
              <p className="text-gray-500 text-xs mt-1 truncate">{lead.address || 'No address'}</p>
              <div className="flex justify-between items-center mt-2">
                <span className="text-yellow-500 text-sm">{lead.rating || 'N/A'}★</span>
                <div className="flex gap-2">
                  {lead.phone && <a href={`https://wa.me/${lead.phone.replace(/\D/g, '')}`} target="_blank" className="text-green-600"><FaWhatsapp size={16} /></a>}
                  {lead.email && <a href={`mailto:${lead.email}`} className="text-blue-600"><FaEnvelope size={16} /></a>}
                </div>
              </div>
              <div className="mt-2 pt-2 border-t flex items-center justify-between">
                <div className="flex items-center gap-1 text-xs">
                  {getStatusIcon(followUp[lead._id] || 'Pending')}
                  <select value={followUp[lead._id] || 'Pending'} onChange={e => updateFollowUp(lead._id, e.target.value)} className="border rounded p-0.5 text-xs">
                    <option>Pending</option><option>Contacted</option><option>Converted</option>
                  </select>
                </div>
                <button onClick={() => { const note = prompt('Add note:', notes[lead._id] || ''); if (note !== null) updateNote(lead._id, note); }} className="text-gray-500 text-xs underline">Note</button>
              </div>
              {notes[lead._id] && <p className="text-xs text-gray-400 mt-1 truncate">📝 {notes[lead._id]}</p>}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr><th className="p-3"><button onClick={toggleSelectAll}>{selectedLeads.length === currentLeads.length ? <FaCheckSquare /> : <FaSquare />}</button></th>
                <th className="p-3 text-left">Name</th><th>Phone</th><th>Email</th><th>Address</th><th>Rating</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentLeads.map(lead => (
                <tr key={lead._id} className="border-t hover:bg-gray-50">
                  <td className="p-3"><button onClick={() => toggleSelect(lead._id)}>{selectedLeads.includes(lead._id) ? <FaCheckSquare className="text-indigo-600" /> : <FaSquare className="text-gray-400" />}</button></td>
                  <td className="p-3 font-medium">{lead.name}</td>
                  <td className="p-3">{lead.phone || '-'}</td>
                  <td className="p-3">{lead.email || '-'}</td>
                  <td className="p-3 max-w-xs truncate">{lead.address || '-'}</td>
                  <td className="p-3">{lead.rating || '-'}</td>
                  <td className="p-3">
                    <select value={followUp[lead._id] || 'Pending'} onChange={e => updateFollowUp(lead._id, e.target.value)} className="border rounded p-1 text-xs">
                      <option>Pending</option><option>Contacted</option><option>Converted</option>
                    </select>
                  </td>
                  <td className="p-3 flex gap-2">
                    {lead.phone && <a href={`https://wa.me/${lead.phone.replace(/\D/g, '')}`} target="_blank" className="text-green-600"><FaWhatsapp /></a>}
                    {lead.email && <a href={`mailto:${lead.email}`} className="text-blue-600"><FaEnvelope /></a>}
                    <button onClick={() => deleteLead(lead._id)} className="text-red-500"><FaTrash /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {filtered.length > itemsPerPage && (
        <div className="flex justify-center items-center gap-3 mt-6">
          <button onClick={() => setCurrentPage(p => Math.max(1, p-1))} disabled={currentPage === 1} className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50">Prev</button>
          <span className="text-sm">Page {currentPage} of {totalPages}</span>
          <button onClick={() => setCurrentPage(p => Math.min(totalPages, p+1))} disabled={currentPage === totalPages} className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50">Next</button>
        </div>
      )}
    </div>
  );
};

export default Sales;
