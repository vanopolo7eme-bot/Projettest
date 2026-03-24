// Utility functions for exporting data natively without heavy external dependencies

export const exportToCSV = (data: any[], filename: string) => {
  if (data.length === 0) return;

  const headers = Object.keys(data[0]);
  const csvRows = [headers.join(',')];

  for (const row of data) {
    const values = headers.map(header => {
      const val = row[header] === null || row[header] === undefined ? '' : String(row[header]);
      // Escape quotes and commas
      return `"${val.replace(/"/g, '""')}"`;
    });
    csvRows.push(values.join(','));
  }

  // Add BOM for Excel UTF-8 support
  const csvString = '\ufeff' + csvRows.join('\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

export const exportToExcel = (data: any[], filename: string) => {
  // We can use the CSV exporter for Excel, or build a simplified HTML table to save as .xls
  if (data.length === 0) return;
  
  let tableHTML = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="UTF-8"></head><body><table>';
  
  const headers = Object.keys(data[0]);
  tableHTML += '<tr>' + headers.map(header => `<th style="background:#f3f4f6;">${header}</th>`).join('') + '</tr>';
  
  for (const row of data) {
    tableHTML += '<tr>' + headers.map(header => `<td>${row[header] !== undefined ? row[header] : ''}</td>`).join('') + '</tr>';
  }
  
  tableHTML += '</table></body></html>';
  
  const blob = new Blob([tableHTML], { type: 'application/vnd.ms-excel' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.xls`;
  link.click();
  URL.revokeObjectURL(url);
};

export const exportToWord = (elementId: string, filename: string) => {
  const element = document.getElementById(elementId);
  if (!element) return;

  const preHtml = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Export Document</title></head><body>";
  const postHtml = "</body></html>";
  const html = preHtml + element.innerHTML + postHtml;

  const blob = new Blob(['\ufeff', html], {
      type: 'application/msword'
  });
  
  const url = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(html);
  
  const downloadLink = document.createElement("a");
  document.body.appendChild(downloadLink);
  
  const nav = navigator as any;
  if (nav.msSaveOrOpenBlob) {
      nav.msSaveOrOpenBlob(blob, filename + '.doc');
  } else {
      downloadLink.href = url;
      downloadLink.download = filename + '.doc';
      downloadLink.click();
  }
  
  document.body.removeChild(downloadLink);
};

export const exportToPDF = () => {
  // Native printing allows users to "Save as PDF" through the OS dialog
  // This is often much more reliable than client-side JS PDF generation without huge libraries
  window.print();
};
