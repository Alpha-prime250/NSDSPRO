/**
 * Utility to export tabular data to CSV format
 * @param {string} filename - Desired filename without extension
 * @param {Array<object>} rows - Data array
 * @param {Array<{key: string, label: string}>} columns - Column configurations
 */
export function exportToCSV(filename, rows, columns) {
  if (!rows || rows.length === 0) {
    alert('No data available to export.');
    return;
  }

  // Header row
  const headerLine = columns.map(c => `"${(c.label || c.key).replace(/"/g, '""')}"`).join(',');

  // Data rows
  const dataLines = rows.map(row => {
    return columns.map(col => {
      let val = row[col.key];
      if (val === null || val === undefined) {
        val = '';
      } else if (typeof val === 'number') {
        val = val.toString();
      } else if (val instanceof Date) {
        val = val.toISOString();
      } else {
        val = String(val).replace(/"/g, '""');
      }
      return `"${val}"`;
    }).join(',');
  });

  const csvContent = '\uFEFF' + [headerLine, ...dataLines].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
