import React from 'react';
import { Download } from 'lucide-react';

const ReportDownloadButton = ({ streamId }) => {
  const handleDownload = async () => {
    try {
       const token = localStorage.getItem('token');
      const response = await fetch(`http://127.0.0.1:8000/api/generate-report/${streamId}`, {
        method: 'GET',  // Changed back to GET since we're retrieving data
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate report');
      }
      const data = await response.json();
      
      // Convert base64 to blob
      const pdfContent = atob(data.pdf);
      const bytes = new Uint8Array(pdfContent.length);
      for (let i = 0; i < pdfContent.length; i++) {
        bytes[i] = pdfContent.charCodeAt(i);
      }
      const blob = new Blob([bytes.buffer], { type: 'application/pdf' });
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = data.filename;
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading report:', error);
      alert('Failed to download report. Please try again.');
    }
  };

  return (
    <button
      onClick={handleDownload}
      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
    >
      <Download className="w-4 h-4" />
      <span>Download Report</span>
    </button>
  );
};

export default ReportDownloadButton;