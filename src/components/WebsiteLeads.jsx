import { useEffect, useState } from 'react';
import api from '../api';
import * as XLSX from 'xlsx';
import toast from 'react-hot-toast';

const WebsiteLeads = () => {
  const [leads, setLeads] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [filters, setFilters] = useState({ minRating: 0, city: '', search: '' });
  const [loading, setLoading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [sending, setSending] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('');

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const res = await api.get('/leads');
      const withWebsite = res.data.filter(l => l.website && l.website.trim() !== '');
      setLeads(withWebsite);
      setFiltered(withWebsite);
    } catch (err) {
      toast.error('Failed to load leads');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let result = [...leads];
    if (filters.minRating > 0) result = result.filter(l => (l.rating || 0) >= filters.minRating);
    if (filters.city) result = result.filter(l => (l.address || '').toLowerCase().includes(filters.city.toLowerCase()));
    if (filters.search) result = result.filter(l => l.name.toLowerCase().includes(filters.search.toLowerCase()));
    setFiltered(result);
    setSelectedIds([]);
  }, [filters, leads]);

  const handleExtractEmails = async () => {
    if (selectedIds.length === 0) return toast.error('Select at least one lead');
    setExtracting(true);
    const toastId = toast.loading(`Extracting emails from ${selectedIds.length} websites...`);
    try {
      const res = await api.post('/email/bulk-extract-from-leads', { leadIds: selectedIds });
      toast.success(`${res.data.totalNewEmails} new emails extracted!`, { id: toastId });
      fetchLeads();
    } catch (err) {
      toast.error('Extraction failed', { id: toastId });
    } finally {
      setExtracting(false);
    }
  };

  const handleDelete = async () => {
    if (selectedIds.length === 0) return toast.error('No leads selected');
    if (!window.confirm(`Delete ${selectedIds.length} leads?`)) return;
    for (const id of selectedIds) {
      await api.delete(`/leads/${id}`);
    }
    toast.success(`${selectedIds.length} leads deleted`);
    fetchLeads();
    setSelectedIds([]);
  };

  const exportExcel = () => {
    const data = filtered.map(l => ({
      Name: l.name,
      Phone: l.phone,
      Website: l.website,
      Address: l.address,
      Rating: l.rating,
      ExtractedEmail: l.email || 'Not extracted'
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'WebsiteLeads');
    XLSX.writeFile(wb, `website_leads_${Date.now()}.xlsx`);
    toast.success('Exported to Excel');
  };

  const openEmailModal = () => {
    const leadsWithEmail = filtered.filter(l => selectedIds.includes(l._id) && l.email);
    if (leadsWithEmail.length === 0) {
      toast.error('Selected leads have no email (extract first)');
      return;
    }
    if (leadsWithEmail.length > 50) {
      toast.error('Max 50 recipients per batch');
      return;
    }
    setShowEmailModal(true);
  };

  // ✅ NEW: Send emails via backend API (Unosend)
  const sendEmails = async () => {
    const recipients = filtered.filter(l => selectedIds.includes(l._id) && l.email).map(l => l.email);
    if (recipients.length === 0) {
      toast.error('No valid emails selected');
      return;
    }
    if (!emailSubject || !emailMessage) {
      toast.error('Subject and message required');
      return;
    }
    setSending(true);
    const toastId = toast.loading(`Sending to ${recipients.length} recipients...`);
    try {
      await api.post('/email/bulk-send', { recipients, subject: emailSubject, message: emailMessage });
      toast.success(`✅ Sent to ${recipients.length} recipients`, { id: toastId });
      setShowEmailModal(false);
      setEmailSubject('');
      setEmailMessage('');
    } catch (err) {
      toast.error('Send failed: ' + (err.response?.data?.error || err.message), { id: toastId });
    } finally {
      setSending(false);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filtered.length) setSelectedIds([]);
    else setSelectedIds(filtered.map(l => l._id));
  };

  const toggleSelect = (id) => {
    if (selectedIds.includes(id)) setSelectedIds(selectedIds.filter(i => i !== id));
    else setSelectedIds([...selectedIds, id]);
  };

  if (loading) return <div className="p-6 text-center">Loading leads with websites...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-6">
        Website Leads – Bulk Email Sender
      </h1>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow mb-6 flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-sm">Min Rating</label>
          <input
            type="range"
            min="0"
            max="5"
            step="0.5"
            value={filters.minRating}
            onChange={e => setFilters({ ...filters, minRating: parseFloat(e.target.value) })}
          />
          <span className="ml-2">{filters.minRating}★</span>
        </div>
        <div>
          <label className="block text-sm">City (in address)</label>
          <input
            type="text"
            placeholder="e.g., Karachi"
            value={filters.city}
            onChange={e => setFilters({ ...filters, city: e.target.value })}
            className="border rounded p-1"
          />
        </div>
        <div>
          <label className="block text-sm">Search by name</label>
          <input
            type="text"
            placeholder="Business name"
            value={filters.search}
            onChange={e => setFilters({ ...filters, search: e.target.value })}
            className="border rounded p-1"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="bg-white p-3 rounded-xl shadow mb-6 flex flex-wrap gap-3 items-center">
        <button onClick={toggleSelectAll} className="bg-gray-500 text-white px-3 py-1 rounded">Select All</button>
        <button onClick={handleExtractEmails} disabled={extracting} className="bg-blue-600 text-white px-3 py-1 rounded">
          {extracting ? 'Extracting...' : '📧 Extract Emails'}
        </button>
        <button onClick={openEmailModal} disabled={sending} className="bg-green-600 text-white px-3 py-1 rounded">
          {sending ? 'Sending...' : '✉️ Send Email'}
        </button>
        <button onClick={handleDelete} className="bg-red-600 text-white px-3 py-1 rounded">🗑️ Delete</button>
        <button onClick={exportExcel} className="bg-purple-600 text-white px-3 py-1 rounded">📊 Export Excel</button>
        <span className="text-sm ml-auto">{selectedIds.length} selected / {filtered.length} total</span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3">Select</th>
              <th className="text-left">Name</th>
              <th>Website</th>
              <th>Extracted Email</th>
              <th>Phone</th>
              <th>City</th>
              <th>Rating</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(lead => (
              <tr key={lead._id} className="border-t">
                <td className="p-3">
                  <input type="checkbox" checked={selectedIds.includes(lead._id)} onChange={() => toggleSelect(lead._id)} />
                </td>
                <td className="p-3 font-medium">{lead.name}</td>
                <td className="p-3">
                  <a href={lead.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate max-w-xs block">
                    {lead.website}
                  </a>
                </td>
                <td className="p-3">{lead.email || '❌ Not extracted'}</td>
                <td className="p-3">{lead.phone || '-'}</td>
                <td className="p-3">{lead.address?.split(',').slice(-2).join(',').trim() || '-'}</td>
                <td className="p-3">{lead.rating || '-'}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan="7" className="text-center p-6">No leads with website found</tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl">
            <h2 className="text-2xl font-bold mb-4">Send Email to Selected Leads</h2>
            <input
              type="text"
              placeholder="Subject"
              value={emailSubject}
              onChange={e => setEmailSubject(e.target.value)}
              className="w-full border rounded-xl p-2 mb-3"
            />
            <textarea
              rows="6"
              placeholder="Message (HTML allowed)"
              value={emailMessage}
              onChange={e => setEmailMessage(e.target.value)}
              className="w-full border rounded-xl p-2 mb-3"
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowEmailModal(false)} className="bg-gray-300 px-4 py-2 rounded">Cancel</button>
              <button onClick={sendEmails} disabled={sending} className="bg-green-600 text-white px-4 py-2 rounded">
                {sending ? 'Sending...' : 'Send Now'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WebsiteLeads;
