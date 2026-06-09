import { useEffect, useState } from 'react';
import api from '../api';

const Dashboard = () => {
  const [stats, setStats] = useState({ totalLeads: 0, lastScrape: null });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/leads');
        setStats({
          totalLeads: res.data.length,
          lastScrape: res.data[0]?.createdAt || 'No data'
        });
      } catch (err) {
        console.error(err);
      }
    };
    fetchStats();
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold mb-2">Total Leads</h2>
          <p className="text-4xl text-blue-600">{stats.totalLeads}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold mb-2">Last Lead Added</h2>
          <p className="text-gray-600">
            {stats.lastScrape ? new Date(stats.lastScrape).toLocaleString() : 'None'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
