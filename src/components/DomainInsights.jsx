import { useState } from 'react';
import api from '../api';
import * as XLSX from 'xlsx';
import toast from 'react-hot-toast';
import { FaSearch, FaSave, FaTrash, FaDownload, FaCheckSquare, FaSquare, FaFileExcel, FaFileCsv } from 'react-icons/fa';

const DomainInsights = () => {
  const [singleUrl, setSingleUrl] = useState('');
  const [bulkUrls, setBulkUrls] = useState('');
  const [deep, setDeep] = useState(false);
  const [maxPages, setMaxPages] = useState(5);
  const [extracted, setExtracted] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [filterVerified, setFilterVerified] = useState(false);
  const [filterDomain, setFilterDomain] = useState('');

  const handleExtract = async () => {
    if (!singleUrl && !bulkUrls) {
      toast.error('Enter URL(s)');
      return;
    }

    setLoading(true);
    const toastId = toast.loading('Extracting emails & phones...');

    try {
      let response;
      if (bulkUrls) {
        const urls = bulkUrls.split('\n').filter(u => u.trim());
        if (urls.length === 0) throw new Error('No valid URLs');
        response = await api.post('/email/bulk-extract', {
          urls,
          deep,
          maxPagesPerUrl: maxPages
        });
      } else {
        response = await api.post('/email/extract', {
          url: singleUrl,
          deep,
          maxPages
        });
      }

      const leads = response.data.leads || [];
      setExtracted(leads);
      setSelected([]);
      toast.success(`Found ${leads.length} emails`, { id: toastId });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Extraction failed', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const saveSelected = async () => {
    if (selected.length === 0) {
      toast.error('No leads selected');
      return;
    }

    const leadsToSave = extracted.filter((_, idx) => selected.includes(idx));
    if (saving) return;
    setSaving(true);
    const toastId = toast.loading(`Saving ${leadsToSave.length} leads...`);

    try {
      const response = await api.post('/leads/bulk', { leads: leadsToSave });
      if (response.data.success) {
        toast.success(`✅ Saved ${response.data.saved || leadsToSave.length} leads!`, { id: toastId });
        setExtracted(extracted.filter((_, idx) => !selected.includes(idx)));
        setSelected([]);
      } else {
        toast.error(response.data.error || 'Failed to save leads', { id: toastId });
      }
    } catch (error) {
      toast.error('Failed to save leads', { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  const deleteSelected = () => {
    if (selected.length === 0) {
      toast.error('No leads selected');
      return;
    }
    const newResults = extracted.filter((_, idx) => !selected.includes(idx));
    setExtracted(newResults);
    setSelected([]);
    toast.success(`${selected.length} emails removed from results`);
  };

  const exportCSV = () => {
    if (filteredResults.length === 0) {
      toast.error('No data to export');
      return;
    }

    const headers = ['Email', 'Phone', 'Source', 'Verified'];
    const rows = filteredResults.map(e => [e.email, e.phone || '', e.source, e.verified ? 'Yes' : 'No']);
    let csvContent = headers.join(',') + '\n';
    rows.forEach(row => {
      const escaped = row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',');
      csvContent += escaped + '\n';
    });
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `domain_insights_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV exported');
  };

  const exportExcel = () => {
    if (filteredResults.length === 0) {
      toast.error('No data to export');
      return;
    }

    const data = filteredResults.map(e => ({
      Email: e.email,
      Phone: e.phone || '',
      Source: e.source,
      Verified: e.verified ? 'Yes' : 'No'
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'DomainInsights');
    XLSX.writeFile(wb, `domain_insights_${Date.now()}.xlsx`);
    toast.success('Excel exported');
  };

  const toggleSelectAll = () => {
    if (selected.length === filteredResults.length) {
      setSelected([]);
    } else {
      setSelected(filteredResults.map((_, idx) => idx));
    }
  };

  const toggleSelect = (idx) => {
    if (selected.includes(idx)) {
      setSelected(selected.filter(i => i !== idx));
    } else {
      setSelected([...selected, idx]);
    }
  };

  const filteredResults = extracted.filter(e => {
    if (filterVerified && !e.verified) return false;
    if (filterDomain && !e.email.endsWith('@' + filterDomain)) return false;
    return true;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">
        Domain Insights
      </h1>

      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Single URL</label>
            <input type="text" placeholder="https://example.com" value={singleUrl} onChange={e => setSingleUrl(e.target.value)} className="w-full border rounded-xl p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Bulk URLs (one per line)</label>
            <textarea rows="3" placeholder="https://site1.com\nhttps://site2.com" value={bulkUrls} onChange={e => setBulkUrls(e.target.value)} className="w-full border rounded-xl p-2" />
          </div>
        </div>
        <div className="flex flex-wrap gap-4 mt-4 items-center">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={deep} onChange={e => setDeep(e.target.checked)} />
            Deep crawl (max {maxPages} pages)
          </label>
          <input type="number" min="1" max="20" value={maxPages} onChange={e => setMaxPages(parseInt(e.target.value))} className="border rounded p-1 w-20" />
          <button onClick={handleExtract} disabled={loading} className="bg-indigo-600 text-white px-6 py-2 rounded-xl flex items-center gap-2 disabled:opacity-50">
            {loading ? '⏳ Extracting...' : <><FaSearch /> Extract Emails & Phones</>}
          </button>
        </div>
      </div>

      {extracted.length > 0 && (
        <div className="bg-white p-4 rounded-xl shadow mb-6 flex flex-wrap gap-4 items-center">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={filterVerified} onChange={e => setFilterVerified(e.target.checked)} />
            Verified only
          </label>
          <input type="text" placeholder="Filter by domain (e.g., gmail.com)" value={filterDomain} onChange={e => setFilterDomain(e.target.value)} className="border rounded-lg p-2 flex-1 min-w-[200px]" />
          <span className="text-sm text-gray-500">{filteredResults.length} shown / {extracted.length} total</span>
        </div>
      )}

      {extracted.length > 0 && (
        <div className="bg-white rounded-xl shadow p-3 mb-6 flex flex-wrap items-center justify-between">
          <div className="flex flex-wrap gap-2 items-center">
            <button onClick={toggleSelectAll} className="bg-gray-600 text-white px-3 py-1.5 rounded-lg flex items-center gap-1 text-sm">
              <FaCheckSquare size={18} /> Select All
            </button>
            <button onClick={saveSelected} disabled={saving} className="bg-blue-600 text-white px-3 py-1.5 rounded-lg flex items-center gap-1 text-sm">
              <FaSave size={18} /> {saving ? 'Saving...' : 'Save Selected'}
            </button>
            <button onClick={deleteSelected} className="bg-red-600 text-white px-3 py-1.5 rounded-lg flex items-center gap-1 text-sm">
              <FaTrash size={18} /> Delete
            </button>
            <button onClick={exportCSV} className="bg-gray-600 text-white px-3 py-1.5 rounded-lg flex items-center gap-1 text-sm">
              <FaFileCsv size={18} /> CSV
            </button>
            <button onClick={exportExcel} className="bg-green-600 text-white px-3 py-1.5 rounded-lg flex items-center gap-1 text-sm">
              <FaFileExcel size={18} /> Excel
            </button>
          </div>
          <span className="text-sm font-medium">{selected.length} selected / {filteredResults.length} total</span>
        </div>
      )}

      {filteredResults.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 w-10"><button onClick={toggleSelectAll}>{selected.length === filteredResults.length ? <FaCheckSquare size={16} /> : <FaSquare size={16} />}</button></th>
                <th className="text-left">Email</th>
                <th>Phone</th>
                <th>Source</th>
                <th>Verified</th>
              </tr>
            </thead>
            <tbody>
              {filteredResults.map((lead, idx) => {
                const actualIdx = extracted.indexOf(lead);
                return (
                  <tr key={idx} className="border-t hover:bg-gray-50">
                    <td className="p-3 text-center">
                      <input type="checkbox" checked={selected.includes(actualIdx)} onChange={() => toggleSelect(actualIdx)} className="w-4 h-4" />
                    </td>
                    <td className="p-3 font-medium break-all">{lead.email}</td>
                    <td className="p-3">{lead.phone || '-'}</td>
                    <td className="p-3 max-w-xs truncate">{lead.source}</td>
                    <td className="p-3">{lead.verified ? '✅ Yes' : '❌ No'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default DomainInsights;
