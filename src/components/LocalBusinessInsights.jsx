const exportCSV = () => {
  if (leads.length === 0) return toast.error('No data to export');
  // Define headers
  const headers = ['Name', 'Phone', 'Email', 'Website', 'Address', 'Rating'];
  // Map leads to rows
  const rows = leads.map(l => [
    `"${(l.name || '').replace(/"/g, '""')}"`, // escape quotes
    `"${(l.phone || '').replace(/"/g, '""')}"`,
    `"${(l.email || '').replace(/"/g, '""')}"`,
    `"${(l.website || '').replace(/"/g, '""')}"`,
    `"${(l.address || '').replace(/"/g, '""')}"`,
    l.rating || ''
  ]);
  // Combine headers and rows
  const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
  // Add BOM for UTF-8 (fixes Excel opening)
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.href = url;
  link.setAttribute('download', `business_insights_${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  toast.success('CSV exported');
};
