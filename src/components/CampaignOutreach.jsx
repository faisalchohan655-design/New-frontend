import { useEffect, useState } from 'react';
import api from '../api';
import { FaWhatsapp, FaEnvelope, FaTrash, FaCheckSquare, FaSquare, FaSort, FaEdit, FaCheck, FaClock, FaFilter, FaTimes, FaSpinner } from 'react-icons/fa';
import * as XLSX from 'xlsx';
import toast from 'react-hot-toast';

const Sales = () => {
  const [leads, setLeads] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [selectedLeads, setSelectedLeads] = useState([]);
  const [filters, setFilters] = useState({ minRating: 0, phoneOnly: false, websiteOnly: false, city: '', search: '' });
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [viewMode, setViewMode] = useState('cards');
  const [followUp, setFollowUp] = useState({});
  const [notes, setNotes] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/leads').then(res => { setLeads(res.data); setFiltered(res.data); setLoading(false); }).catch(() => toast.error('Failed to load leads'));
    const savedFollowUp = localStorage.getItem('leadStrikerFollowUp'); if(savedFollowUp) setFollowUp(JSON.parse(savedFollowUp));
    const savedNotes = localStorage.getItem('leadStrikerNotes'); if(savedNotes) setNotes(JSON.parse(savedNotes));
  }, []);

  useEffect(() => {
    let result = [...leads];
    if (filters.minRating > 0) result = result.filter(l => (l.rating||0) >= filters.minRating);
    if (filters.phoneOnly) result = result.filter(l => l.phone);
    if (filters.websiteOnly) result = result.filter(l => l.website);
    if (filters.city) result = result.filter(l => (l.address||'').toLowerCase().includes(filters.city.toLowerCase()));
    if (filters.search) result = result.filter(l => l.name.toLowerCase().includes(filters.search.toLowerCase()));
    result.sort((a,b) => { let av = a[sortBy]||'', bv = b[sortBy]||''; if(sortBy==='rating'){av=av||0; bv=bv||0;} if(sortBy==='date'){av=new Date(a.createdAt); bv=new Date(b.createdAt);} if(av<bv) return sortOrder==='asc'?-1:1; if(av>bv) return sortOrder==='asc'?1:-1; return 0; });
    setFiltered(result);
    setSelectedLeads([]);
    setCurrentPage(1);
  }, [filters, leads, sortBy, sortOrder]);

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentLeads = filtered.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  const deleteLead = async (id) => { if(!window.confirm('Delete this lead?')) return; try{ await api.delete(`/leads/${id}`); setLeads(leads.filter(l=>l._id!==id)); toast.success('Deleted'); }catch(e){ toast.error('Delete failed'); } };
  const bulkDelete = async () => { if(selectedLeads.length===0) return toast.error('Select leads'); if(!window.confirm(`Delete ${selectedLeads.length} leads?`)) return; for(const id of selectedLeads) await api.delete(`/leads/${id}`); setLeads(leads.filter(l=>!selectedLeads.includes(l._id))); setSelectedLeads([]); toast.success(`${selectedLeads.length} deleted`); };
  const exportExcel = () => { const data = filtered.map(l=>({ Name:l.name, Phone:l.phone, Email:l.email, Website:l.website, Address:l.address, Rating:l.rating, FollowUp: followUp[l._id]||'Pending' })); const ws=XLSX.utils.json_to_sheet(data); const wb=XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb,ws,'Leads'); XLSX.writeFile(wb,`leads_${Date.now()}.xlsx`); toast.success('Exported'); };
  const bulkWhatsApp = () => { const selected = leads.filter(l=>selectedLeads.includes(l._id) && l.phone); if(selected.length===0) return toast.error('No phone numbers'); selected.forEach(l=>window.open(`https://wa.me/${l.phone.replace(/\D/g,'')}?text=${encodeURIComponent('Hi, from LeadStriker!')}`,'_blank')); toast.success(`Opened ${selected.length} chats`); };
  const bulkEmail = () => { const selected = leads.filter(l=>selectedLeads.includes(l._id) && l.email); if(selected.length===0) return toast.error('No emails'); window.location.href = `mailto:${selected.map(l=>l.email).join(',')}?subject=Business Opportunity`; toast.success(`Opened email client`); };
  const updateFollowUp = (id, status) => { const updated = {...followUp, [id]:status}; setFollowUp(updated); localStorage.setItem('leadStrikerFollowUp',JSON.stringify(updated)); toast.success(`Status: ${status}`); };
  const updateNote = (id, note) => { const updated = {...notes, [id]:note}; setNotes(updated); localStorage.setItem('leadStrikerNotes',JSON.stringify(updated)); toast.success('Note saved'); };
  const toggleSelectAll = () => { if(selectedLeads.length===currentLeads.length) setSelectedLeads([]); else setSelectedLeads(currentLeads.map(l=>l._id)); };
  const toggleSelect = (id) => { if(selectedLeads.includes(id)) setSelectedLeads(selectedLeads.filter(i=>i!==id)); else setSelectedLeads([...selectedLeads, id]); };
  const clearFilters = () => setFilters({ minRating:0, phoneOnly:false, websiteOnly:false, city:'', search:'' });

  const getStatusIcon = (status) => { if(status==='Converted') return <FaCheck className="text-green-600"/>; if(status==='Contacted') return <FaEdit className="text-blue-600"/>; return <FaClock className="text-gray-400"/>; };
  if(loading) return <div className="flex justify-center items-center h-96"><FaSpinner className="animate-spin text-4xl"/> Loading leads...</div>;

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent mb-6">Sales Outreach</h1>
      <div className="bg-white rounded-2xl shadow-lg p-5 mb-6">
        <div className="flex justify-between items-center mb-3"><h2 className="font-semibold flex items-center gap-2"><FaFilter/> Filters</h2><button onClick={clearFilters} className="text-red-500 text-sm flex items-center gap-1"><FaTimes/> Clear all</button></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div><label className="block text-sm">Min Rating: {filters.minRating}★</label><input type="range" min="0" max="5" step="0.5" value={filters.minRating} onChange={e=>setFilters({...filters, minRating: parseFloat(e.target.value)})} className="w-full"/></div>
          <div><label className="block text-sm">City filter</label><input type="text" placeholder="e.g., Karachi" value={filters.city} onChange={e=>setFilters({...filters, city: e.target.value})} className="w-full border rounded-lg p-2"/></div>
          <div><label className="block text-sm">Search by name</label><input type="text" placeholder="Business name" value={filters.search} onChange={e=>setFilters({...filters, search: e.target.value})} className="w-full border rounded-lg p-2"/></div>
          <div className="flex flex-col gap-2"><label className="flex items-center gap-2"><input type="checkbox" checked={filters.phoneOnly} onChange={e=>setFilters({...filters, phoneOnly: e.target.checked})}/> Has Phone</label><label className="flex items-center gap-2"><input type="checkbox" checked={filters.websiteOnly} onChange={e=>setFilters({...filters, websiteOnly: e.target.checked})}/> Has Website</label></div>
          <div><label className="block text-sm">Sort by</label><select value={sortBy} onChange={e=>setSortBy(e.target.value)} className="border rounded p-1"><option value="name">Name</option><option value="rating">Rating</option><option value="date">Date</option></select><button onClick={()=>setSortOrder(sortOrder==='asc'?'desc':'asc')} className="ml-2 bg-gray-200 p-1 rounded"><FaSort/> {sortOrder==='asc'?'A-Z':'Z-A'}</button></div>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow p-3 mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2"><button onClick={toggleSelectAll}>{selectedLeads.length===currentLeads.length?<FaCheckSquare/>:<FaSquare/>}</button><span>{selectedLeads.length} selected</span><button onClick={bulkWhatsApp} className="bg-green-600 text-white px-3 py-1.5 rounded-lg"><FaWhatsapp/> WhatsApp</button><button onClick={bulkEmail} className="bg-blue-600 text-white px-3 py-1.5 rounded-lg"><FaEnvelope/> Email</button><button onClick={bulkDelete} className="bg-red-600 text-white px-3 py-1.5 rounded-lg"><FaTrash/> Delete</button><button onClick={exportExcel} className="bg-purple-600 text-white px-3 py-1.5 rounded-lg"><FaTrash/> Excel</button></div>
        <div className="flex gap-1"><button onClick={()=>setViewMode('cards')} className={`px-3 py-1 rounded ${viewMode==='cards'?'bg-indigo-600 text-white':'bg-gray-200'}`}>Cards</button><button onClick={()=>setViewMode('table')} className={`px-3 py-1 rounded ${viewMode==='table'?'bg-indigo-600 text-white':'bg-gray-200'}`}>Table</button><select value={itemsPerPage} onChange={e=>{setItemsPerPage(Number(e.target.value)); setCurrentPage(1);}} className="border rounded p-1"><option>5</option><option>10</option><option>20</option><option>50</option></select></div>
      </div>
      {currentLeads.length===0? <div className="text-center py-16">No leads match filters</div> : viewMode==='cards'? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {currentLeads.map(lead=>(
            <div key={lead._id} className="bg-white rounded-xl shadow-md p-4 hover:shadow-lg">
              <div className="flex justify-between items-start"><div className="flex items-center gap-2"><button onClick={()=>toggleSelect(lead._id)}>{selectedLeads.includes(lead._id)?<FaCheckSquare className="text-indigo-600"/>:<FaSquare className="text-gray-400"/>}</button><h3 className="font-bold">{lead.name.substring(0,40)}</h3></div><button onClick={()=>deleteLead(lead._id)} className="text-red-500"><FaTrash/></button></div>
              <p className="text-gray-500 text-sm">{lead.address||'No address'}</p>
              <div className="flex justify-between items-center mt-2"><span>{lead.rating||'N/A'}★</span><div className="flex gap-2">{lead.phone && <a href={`https://wa.me/${lead.phone.replace(/\D/g,'')}`} target="_blank" className="text-green-600"><FaWhatsapp/></a>}{lead.email && <a href={`mailto:${lead.email}`} className="text-blue-600"><FaEnvelope/></a>}</div></div>
              <div className="mt-2 pt-2 border-t flex items-center justify-between"><div className="flex items-center gap-1">{getStatusIcon(followUp[lead._id]||'Pending')}<select value={followUp[lead._id]||'Pending'} onChange={e=>updateFollowUp(lead._id,e.target.value)} className="border rounded p-0.5 text-xs"><option>Pending</option><option>Contacted</option><option>Converted</option></select></div><button onClick={()=>{const note=prompt('Add note:',notes[lead._id]||''); if(note!==null) updateNote(lead._id,note);}} className="text-gray-500 text-xs underline">Note</button></div>
              {notes[lead._id] && <p className="text-xs text-gray-400 mt-1 truncate">📝 {notes[lead._id]}</p>}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg overflow-x-auto"><table className="min-w-full text-sm"><thead className="bg-gray-50"><tr><th className="p-3"><button onClick={toggleSelectAll}>{selectedLeads.length===currentLeads.length?<FaCheckSquare/>:<FaSquare/>}</button></th><th>Name</th><th>Phone</th><th>Email</th><th>Address</th><th>Rating</th><th>Status</th><th>Actions</th></tr></thead><tbody>{currentLeads.map(lead=>(<tr key={lead._id} className="border-t"><td className="p-3"><button onClick={()=>toggleSelect(lead._id)}>{selectedLeads.includes(lead._id)?<FaCheckSquare/>:<FaSquare/>}</button></td><td className="p-3 font-medium">{lead.name}</td><td className="p-3">{lead.phone||'-'}</td><td className="p-3">{lead.email||'-'}</td><td className="p-3 max-w-xs truncate">{lead.address||'-'}</td><td className="p-3">{lead.rating||'-'}</td><td className="p-3"><select value={followUp[lead._id]||'Pending'} onChange={e=>updateFollowUp(lead._id,e.target.value)} className="border rounded p-1 text-xs"><option>Pending</option><option>Contacted</option><option>Converted</option></select></td><td className="p-3 flex gap-2">{lead.phone && <a href={`https://wa.me/${lead.phone.replace(/\D/g,'')}`} target="_blank" className="text-green-600"><FaWhatsapp/></a>}{lead.email && <a href={`mailto:${lead.email}`} className="text-blue-600"><FaEnvelope/></a>}<button onClick={()=>deleteLead(lead._id)} className="text-red-500"><FaTrash/></button></td></tr>))}</tbody></table></div>
      )}
      {totalPages>1 && <div className="flex justify-center gap-3 mt-6"><button onClick={()=>setCurrentPage(p=>Math.max(1,p-1))} disabled={currentPage===1} className="px-3 py-1 bg-gray-200 rounded">Prev</button><span>Page {currentPage} of {totalPages}</span><button onClick={()=>setCurrentPage(p=>Math.min(totalPages,p+1))} disabled={currentPage===totalPages} className="px-3 py-1 bg-gray-200 rounded">Next</button></div>}
    </div>
  );
};
export default Sales;
