import { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../api';
import * as XLSX from 'xlsx';

const EmailExtractor = () => {
  const [singleUrl, setSingleUrl] = useState('');
  const [bulkUrls, setBulkUrls] = useState('');
  const [deep, setDeep] = useState(false);
  const [maxPages, setMaxPages] = useState(10);
  const [extractedLeads, setExtractedLeads] = useState([]);
  const [filteredLeads, setFilteredLeads] = useState([]);
  const [filterVerified, setFilterVerified] = useState(false);
  const [filterDomain, setFilterDomain] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedEmails, setSelectedEmails] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('');

  const handleExtract = async () => {
    const hasSingle = singleUrl.trim();
    const hasBulk = bulkUrls.trim();
    if (!hasSingle && !hasBulk) {
      toast.error('Enter at least one URL');
      return;
    }
    setLoading(true);
    const toastId = toast.loading('Extracting emails...');
    try {
      let response;
      if (hasBulk) {
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
      setExtractedLeads(leads);
      setFilteredLeads(leads);
      toast.success(`Found ${leads.length} emails`, { id: toastId });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Extraction failed', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...extractedLeads];
    if (filterVerified) filtered = filtered.filter(l => l.verified);
    if (filterDomain) filtered = filtered.filter(l => l.email.endsWith('@' + filterDomain));
    setFilteredLeads(filtered);
    setSelectedEmails([]);
    setSelectAll(false);
  };

  const exportExcel = () => {
    if (!filteredLeads.length) { toast.error('No data'); return; }
    const data = filteredLeads.map(l => ({ Email: l.email, Verified: l.verified ? 'Yes' : 'No', Phone: l.phone || '', Source: l.source }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Emails');
    XLSX.writeFile(wb, `emails_${Date.now()}.xlsx`);
    toast.success('Exported');
  };

  const saveToLeads = async () => {
    if (!filteredLeads.length) { toast.error('No leads'); return; }
    setLoading(true);
    try {
      await api.post('/email/save-leads', { leads: filteredLeads });
      toast.success(`Saved ${filteredLeads.length} leads`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Save failed');
    } finally { setLoading(false); }
  };

  const openSendModal = () => {
    if (selectedEmails.length === 0) { toast.error('Select emails'); return; }
    if (selectedEmails.length > 50) { toast.error('Max 50'); return; }
    setShowSendModal(true);
  };

  const sendEmails = async () => {
    if (!emailSubject || !emailMessage) { toast.error('Subject & message required'); return; }
    setLoading(true);
    try {
      await api.post('/email/bulk-send', { recipients: selectedEmails, subject: emailSubject, message: emailMessage });
      toast.success(`Sent to ${selectedEmails.length}`);
      setShowSendModal(false);
      setEmailSubject('');
      setEmailMessage('');
      setSelectedEmails([]);
      setSelectAll(false);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Send failed');
    } finally { setLoading(false); }
  };

  const toggleSelectAll = () => {
    if (selectAll) setSelectedEmails([]);
    else setSelectedEmails(filteredLeads.map(l => l.email));
    setSelectAll(!selectAll);
  };

  const toggleSelect = (email) => {
    if (selectedEmails.includes(email)) setSelectedEmails(selectedEmails.filter(e => e !== email));
    else setSelectedEmails([...selectedEmails, email]);
  };

  const clearAll = () => {
    setExtractedLeads([]);
    setFilteredLeads([]);
    setSelectedEmails([]);
    setSelectAll(false);
    setFilterVerified(false);
    setFilterDomain('');
    toast.success('Cleared');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-6">Email Extractor & Campaign</h1>
      <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label className="block text-sm font-medium text-gray-700">Single URL</label><input type="text" value={singleUrl} onChange={e => setSingleUrl(e.target.value)} placeholder="https://example.com" className="w-full border rounded-xl p-2" /></div>
          <div><label className="block text-sm font-medium text-gray-700">Bulk URLs (one per line)</label><textarea rows="3" value={bulkUrls} onChange={e => setBulkUrls(e.target.value)} placeholder="https://site1.com\nhttps://site2.com" className="w-full border rounded-xl p-2" /></div>
        </div>
        <div className="flex flex-wrap gap-4 mt-4 items-center">
          <label className="flex items-center gap-2"><input type="checkbox" checked={deep} onChange={e => setDeep(e.target.checked)} /> Deep crawl (max {maxPages} pages)</label>
          <input type="number" min="1" max="50" value={maxPages} onChange={e => setMaxPages(parseInt(e.target.value))} className="border rounded p-1 w-20" />
          <button onClick={handleExtract} disabled={loading} className="bg-indigo-600 text-white px-6 py-2 rounded-xl disabled:opacity-50">{loading ? 'Extracting...' : 'Extract Emails'}</button>
        </div>
      </div>
      {extractedLeads.length > 0 && (
        <div className="bg-white rounded-xl shadow p-4 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            <label className="flex items-center gap-2"><input type="checkbox" checked={filterVerified} onChange={e => { setFilterVerified(e.target.checked); setTimeout(applyFilters, 0); }} /> Verified only</label>
            <input type="text" placeholder="Filter by domain (e.g., gmail.com)" value={filterDomain} onChange={e => { setFilterDomain(e.target.value); setTimeout(applyFilters, 0); }} className="border rounded p-1" />
            <button onClick={applyFilters} className="bg-gray-600 text-white px-3 py-1 rounded">Apply Filters</button>
            <button onClick={exportExcel} className="bg-green-600 text-white px-3 py-1 rounded">📊 Export Excel</button>
            <button onClick={saveToLeads} className="bg-blue-600 text-white px-3 py-1 rounded">💾 Save to Leads</button>
            <button onClick={openSendModal} className="bg-red-600 text-white px-3 py-1 rounded">✉️ Bulk Email ({selectedEmails.length})</button>
            <button onClick={clearAll} className="text-gray-500">Clear all</button>
          </div>
          <div className="mt-3 text-sm text-gray-500">{filteredLeads.length} emails shown (total {extractedLeads.length})</div>
        </div>
      )}
      {filteredLeads.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100"><tr><th className="p-3"><input type="checkbox" checked={selectAll} onChange={toggleSelectAll} /></th><th className="text-left p-3">Email</th><th className="p-3">Verified</th><th className="p-3">Phone</th><th className="p-3">Source URL</th></tr></thead>
            <tbody>
              {filteredLeads.map((lead, idx) => (
                <tr key={idx} className="border-t"><td className="p-3"><input type="checkbox" checked={selectedEmails.includes(lead.email)} onChange={() => toggleSelect(lead.email)} /></td><td className="p-3">{lead.email}</td><td className="p-3">{lead.verified ? '✅ Yes' : '❌ No'}</td><td className="p-3">{lead.phone || '-'}</td><td className="p-3 truncate max-w-xs">{lead.source}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {showSendModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl">
            <h2 className="text-2xl font-bold mb-4">Send to {selectedEmails.length} recipient(s)</h2>
            <input type="text" placeholder="Subject" value={emailSubject} onChange={e => setEmailSubject(e.target.value)} className="w-full border rounded-xl p-2 mb-3" />
            <textarea rows="6" placeholder="Message (HTML allowed)" value={emailMessage} onChange={e => setEmailMessage(e.target.value)} className="w-full border rounded-xl p-2 mb-3" />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowSendModal(false)} className="bg-gray-300 px-4 py-2 rounded">Cancel</button>
              <button onClick={sendEmails} className="bg-red-600 text-white px-4 py-2 rounded">Send Now</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailExtractor;
