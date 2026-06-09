import { useState } from 'react';
import axios from 'axios';

export default function EmailExtractor() {
  const [url, setUrl] = useState('');
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(false);

  const extractEmails = async () => {
    if (!url) return alert('URL dalo bhai');
    
    setLoading(true);
    setEmails([]);
    
    try {
      const res = await axios.post('/api/outreach/extract-emails', { url });
      setEmails(res.data.emails);
    } catch (err) {
      alert('Error: ' + err.response?.data?.error || 'Kuch galat ho gaya');
    }
    
    setLoading(false);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">📧 Email Extractor</h2>
      
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="https://example.com"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="flex-1 border p-2 rounded"
        />
        <button 
          onClick={extractEmails}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {loading ? 'Extracting...' : 'Extract'}
        </button>
      </div>

      {emails.length > 0 && (
        <div className="border rounded p-4">
          <h3 className="font-bold mb-2">Miley hue Emails: {emails.length}</h3>
          <div className="space-y-1">
            {emails.map((email, i) => (
              <div key={i} className="text-sm font-mono">{email}</div>
            ))}
          </div>
          <button 
            onClick={() => navigator.clipboard.writeText(emails.join('\n'))}
            className="mt-3 text-sm bg-green-600 text-white px-3 py-1 rounded"
          >
            Copy All
          </button>
        </div>
      )}
    </div>
  );
}
