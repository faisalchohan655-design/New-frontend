import { useEffect, useState } from 'react';
import api from '../api';
import { FaWhatsapp, FaEnvelope, FaPhone, FaSave, FaFolderOpen, FaDownload, FaCheckSquare, FaSquare } from 'react-icons/fa';
import * as XLSX from 'xlsx';
import toast from 'react-hot-toast';

const Sales = () => {
  const [leads, setLeads] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [selectedLeads, setSelectedLeads] = useState([]);
  const [filters, setFilters] = useState({
    minRating: 0,
    phoneOnly: false,
    websiteOnly: false,
    city: '',
    search: ''
  });
  const [savedFilters, setSavedFilters] = useState([]);
  const [viewMode, setViewMode] = useState('cards'); // 'cards' or 'table'

  // Load leads
  useEffect(() => {
    api.get('/leads').then(res => {
      setLeads(res.data);
      setFiltered(res.data);
    }).catch(console.error);
    
    // Load saved filter presets from localStorage
    const saved = localStorage.getItem('leadStrikerFilters');
    if (saved) setSavedFilters(JSON.parse(saved));
  }, []);

  // Apply filters
  useEffect(() => {
    let result = [...leads];
    if (filters.minRating > 0) {
      result = result.filter(l => (l.rating || 0) >= filters.minRating);
    }
    if (filters.phoneOnly) {
      result = result.filter(l => l.phone);
    }
    if (filters.websiteOnly) {
      result = result.filter(l => l.website);
    }
    if (filters.city) {
      result = result.filter(l => (l.address || '').toLowerCase().includes(filters.city.toLowerCase()));
    }
    if (filters.search) {
      result = result.filter(l => l.name.toLowerCase().includes(filters.search.toLowerCase()));
    }
    setFiltered(result);
    // Clear selection when filters change
    setSelectedLeads([]);
  }, [filters, leads]);

  // Handle select all / single
  const toggleSelectAll = () => {
    if (selectedLeads.length === filtered.length) {
      setSelectedLeads([]);
    } else {
      setSelectedLeads(filtered.map(l => l._id));
    }
  };

  const toggleSelect = (id) => {
    if (selectedLeads.includes(id)) {
      setSelectedLeads(selectedLeads.filter(i => i !== id));
    } else {
      setSelectedLeads([...selectedLeads, id]);
    }
  };

  // Bulk WhatsApp (opens multiple tabs - browser popup blocker may interfere, but user can allow)
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
    toast.success(`Opened email client for ${selected.length} leads`);
  };

  // Export filtered leads to CSV
  const exportCSV = () => {
    const data = filtered.map(l => ({
      Name: l.name, Phone: l.phone, Email: l.email, Website: l.website, Address: l.address, Rating: l.rating
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'SalesLeads');
    XLSX.writeFile(wb, `sales_leads_${new Date().toISOString().slice(0,19)}.xlsx`);
    toast.success('Exported filtered leads');
  };

  // Save current filter preset
  const saveFilterPreset = () => {
    const name = prompt('Enter preset name (e.g., High Rated Karachi)');
    if (!name) return;
    const newPreset = { name, filters: { ...filters } };
    const updated = [...savedFilters, newPreset];
    setSavedFilters(updated);
    localStorage.setItem('leadStrikerFilters', JSON.stringify(updated));
    toast.success(`Preset "${name}" saved`);
  };

  // Load filter preset
  const loadFilterPreset = (preset) => {
    setFilters(preset.filters);
    toast.success(`Loaded preset: ${preset.name}`);
  };

  // Delete preset
  const deletePreset = (index) => {
    const updated = savedFilters.filter((_, i) => i !== index);
    setSavedFilters(updated);
    localStorage.setItem('leadStrikerFilters', JSON.stringify(updated));
    toast.success('Preset deleted');
  };

  // Get selected lead objects
  const selectedLeadObjects = leads.filter(l => selectedLeads.includes(l._id));

  return (
    <div className="p-6">
      <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent mb-6">
        Sales Outreach
      </h1>

      {/* Filter Panel */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Min Rating</label>
            <input type="range" min="0" max="5" step="0.5" value={filters.minRating} onChange={e => setFilters({...filters, minRating: parseFloat(e.target.value)})} className="w-full" />
            <span className="text-sm text-gray-500">{filters.minRating}★ and above</span>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">City filter</label>
            <input type="text" placeholder="e.g., Karachi" value={filters.city} onChange={e => setFilters({...filters, city: e.target.value})} className="w-full border rounded-lg p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Search by name</label>
            <input type="text" placeholder="Business name" value={filters.search} onChange={e => setFilters({...filters, search: e.target.value})} className="w-full border rounded-lg p-2" />
          </div>
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2"><input type="checkbox" checked={filters.phoneOnly} onChange={e => setFilters({...filters, phoneOnly: e.target.checked})} /> Has Phone Number</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={filters.websiteOnly} onChange={e => setFilters({...filters, websiteOnly: e.target.checked})} /> Has Website</label>
          </div>
        </div>

        {/* Filter Presets */}
        <div className="mt-4 flex flex-wrap gap-2 items-center border-t pt-4">
          <button onClick={saveFilterPreset} className="bg-blue-600 text-white px-3 py-1 rounded-lg flex items-center gap-1"><FaSave /> Save Filters</button>
          {savedFilters.map((p, idx) => (
            <div key={idx} className="bg-gray-100 rounded-lg px-3 py-1 flex items-center gap-2">
              <button onClick={() => loadFilterPreset(p)} className="text-sm hover:text-blue-600">{p.name}</button>
              <button onClick={() => deletePreset(idx)} className="text-red-500 text-xs">✕</button>
            </div>
          ))}
        </div>
      </div>

      {/* Bulk Actions Bar */}
      <div className="bg-white rounded-xl shadow p-4 mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button onClick={toggleSelectAll} className="text-gray-600 hover:text-gray-800">
            {selectedLeads.length === filtered.length ? <FaCheckSquare size={20} /> : <FaSquare size={20} />}
          </button>
          <span className="text-sm">{selectedLeads.length} selected</span>
          <button onClick={bulkWhatsApp} className="bg-green-600 text-white px-3 py-1 rounded-lg flex items-center gap-1"><FaWhatsapp /> Bulk WhatsApp</button>
          <button onClick={bulkEmail} className="bg-blue-600 text-white px-3 py-1 rounded-lg flex items-center gap-1"><FaEnvelope /> Bulk Email</button>
          <button onClick={exportCSV} className="bg-purple-600 text-white px-3 py-1 rounded-lg flex items-center gap-1"><FaDownload /> Export Filtered</button>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setViewMode('cards')} className={`px-3 py-1 rounded ${viewMode === 'cards' ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}>Cards</button>
          <button onClick={() => setViewMode('table')} className={`px-3 py-1 rounded ${viewMode === 'table' ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}>Table</button>
        </div>
      </div>

      {/* Leads Display: Cards or Table */}
      {viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(lead => (
            <div key={lead._id} className="bg-white rounded-xl shadow-md p-4 hover:shadow-lg transition">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <button onClick={() => toggleSelect(lead._id)}>
                    {selectedLeads.includes(lead._id) ? <FaCheckSquare className="text-indigo-600" /> : <FaSquare className="text-gray-400" />}
                  </button>
                  <h3 className="font-bold text-lg">{lead.name}</h3>
                </div>
                <span className="text-yellow-500">{lead.rating || 'N/A'}★</span>
              </div>
              <p className="text-gray-600 text-sm mt-1">{lead.address || 'No address'}</p>
              <div className="flex gap-3 mt-3">
                {lead.phone && <a href={`https://wa.me/${lead.phone.replace(/\D/g, '')}`} target="_blank" className="text-green-600 hover:text-green-800"><FaWhatsapp size={20} /></a>}
                {lead.email && <a href={`mailto:${lead.email}`} className="text-blue-600"><FaEnvelope size={20} /></a>}
                {lead.website && <a href={lead.website} target="_blank" className="text-purple-600">🌐</a>}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg overflow-x-auto">
          <table className="min-w-full divide-y">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3"><button onClick={toggleSelectAll}>{selectedLeads.length === filtered.length ? <FaCheckSquare /> : <FaSquare />}</button></th>
                <th>Name</th><th>Phone</th><th>Email</th><th>Address</th><th>Rating</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(lead => (
                <tr key={lead._id} className="hover:bg-gray-50">
                  <td className="px-4 py-2"><button onClick={() => toggleSelect(lead._id)}>{selectedLeads.includes(lead._id) ? <FaCheckSquare className="text-indigo-600" /> : <FaSquare className="text-gray-400" />}</button></td>
                  <td className="px-4 py-2 font-medium">{lead.name}</td>
                  <td className="px-4 py-2">{lead.phone || '-'}</td>
                  <td className="px-4 py-2">{lead.email || '-'}</td>
                  <td className="px-4 py-2 truncate max-w-xs">{lead.address || '-'}</td>
                  <td className="px-4 py-2">{lead.rating || '-'}</td>
                  <td className="px-4 py-2 flex gap-2">
                    {lead.phone && <a href={`https://wa.me/${lead.phone.replace(/\D/g, '')}`} target="_blank" className="text-green-600"><FaWhatsapp /></a>}
                    {lead.email && <a href={`mailto:${lead.email}`} className="text-blue-600"><FaEnvelope /></a>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {filtered.length === 0 && <div className="text-center py-10 text-gray-500">No leads match filters</div>}
    </div>
  );
};

export default Sales;
