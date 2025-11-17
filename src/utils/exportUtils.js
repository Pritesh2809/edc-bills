import html2pdf from 'html2pdf.js';

/**
 * Generate PDF with embedded receipt images
 * @param {Array} receipts - Array of receipt objects with downloadUrl
 * @param {Object} trip - Trip object (optional)
 */
export const generatePDF = async (receipts, trip = null) => {
  if (!receipts || receipts.length === 0) {
    alert('No receipts to export');
    return;
  }

  try {
    // Calculate totals
    const totalAmount = receipts.reduce((sum, r) => sum + r.amount, 0);
    const categoryTotals = receipts.reduce((acc, r) => {
      acc[r.category] = (acc[r.category] || 0) + r.amount;
      return acc;
    }, {});

    // Per-person breakdown
    const personTotals = receipts.reduce((acc, r) => {
      const payer = r.bill_payer_name || 'Unknown';
      acc[payer] = (acc[payer] || 0) + r.amount;
      return acc;
    }, {});

    // Fetch images as base64 for embedding
    const receiptsWithImages = await Promise.all(
      receipts.map(async (receipt) => {
        if (receipt.downloadUrl) {
          try {
            const response = await fetch(receipt.downloadUrl);
            const blob = await response.blob();
            const base64 = await blobToBase64(blob);
            return { ...receipt, imageBase64: base64 };
          } catch (error) {
            console.error('Error fetching image:', error);
            return { ...receipt, imageBase64: null };
          }
        }
        return { ...receipt, imageBase64: null };
      })
    );

    // Create HTML template
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
              line-height: 1.6;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 2px solid #333;
              padding-bottom: 20px;
            }
            .header h1 {
              margin: 0;
              font-size: 24px;
            }
            .header p {
              margin: 5px 0;
              font-size: 14px;
              color: #666;
            }
            .summary {
              margin: 20px 0;
              padding: 15px;
              background-color: #f5f5f5;
              border-radius: 5px;
            }
            .summary h3 {
              margin-top: 0;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
            }
            table, th, td {
              border: 1px solid #ddd;
            }
            th {
              background-color: #4a5568;
              color: white;
              padding: 10px;
              text-align: left;
              font-size: 12px;
            }
            td {
              padding: 8px;
              font-size: 11px;
            }
            .receipt-image {
              max-width: 200px;
              max-height: 150px;
              margin: 5px 0;
              border: 1px solid #ddd;
              border-radius: 3px;
            }
            .page-break {
              page-break-after: always;
            }
            .category-badge {
              display: inline-block;
              padding: 3px 8px;
              border-radius: 3px;
              font-size: 10px;
              font-weight: bold;
            }
            .category-food { background-color: #e0f2fe; color: #0369a1; }
            .category-travel { background-color: #fef3c7; color: #92400e; }
            .category-accom { background-color: #dbeafe; color: #1e40af; }
            .category-misc { background-color: #f3e8ff; color: #6b21a8; }
            .signatures {
              margin-top: 50px;
              display: flex;
              justify-content: space-around;
            }
            .signature-block {
              text-align: center;
              width: 200px;
            }
            .signature-line {
              border-top: 1px solid #000;
              margin-top: 60px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>EDC Receipt Management System</h1>
            <p><strong>K.P.R. College of Arts and Science</strong></p>
            ${trip ? `<p><strong>Trip:</strong> ${trip.name}</p>` : ''}
            <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
          </div>

          <div class="summary">
            <h3>Summary</h3>
            <p><strong>Total Receipts:</strong> ${receipts.length}</p>
            <p><strong>Total Amount:</strong> INR ${totalAmount.toFixed(2)}</p>
            <h4>Category Breakdown:</h4>
            ${Object.entries(categoryTotals)
              .map(([cat, total]) => `<p>${cat.toUpperCase()}: INR ${total.toFixed(2)}</p>`)
              .join('')}
            <h4>Per-Person Breakdown:</h4>
            ${Object.entries(personTotals)
              .map(([person, total]) => `<p>${person}: INR ${total.toFixed(2)}</p>`)
              .join('')}
          </div>

          <h3>Receipt Details</h3>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Uploader</th>
                <th>Bill Payer</th>
                <th>Category</th>
                <th>Amount (INR)</th>
                <th>Description</th>
                <th>Receipt</th>
              </tr>
            </thead>
            <tbody>
              ${receiptsWithImages
                .map(
                  (r) => `
                <tr>
                  <td>${r.date}<br/>${r.time || ''}</td>
                  <td>${r.uploader_name || '-'}</td>
                  <td>${r.bill_payer_name || '-'}</td>
                  <td><span class="category-badge category-${r.category}">${r.category}</span></td>
                  <td>${r.amount.toFixed(2)}</td>
                  <td>${r.description || '-'}</td>
                  <td>
                    ${
                      r.imageBase64
                        ? `<img src="${r.imageBase64}" class="receipt-image" alt="Receipt" />`
                        : 'N/A'
                    }
                  </td>
                </tr>
              `
                )
                .join('')}
            </tbody>
          </table>

          <div class="signatures">
            <div class="signature-block">
              <div class="signature-line"></div>
              <p><strong>Organiser</strong></p>
            </div>
            <div class="signature-block">
              <div class="signature-line"></div>
              <p><strong>Treasurer</strong></p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Convert HTML to PDF
    const element = document.createElement('div');
    element.innerHTML = htmlContent;

    const options = {
      margin: [10, 10, 10, 10],
      filename: `edc-receipts-${trip ? trip.name.replace(/\s+/g, '-') : 'all'}-${Date.now()}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    await html2pdf().set(options).from(element).save();

    // Record audit log (optional - you can add this to Firestore)
    console.log('PDF exported successfully');
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};

/**
 * Generate CSV export
 * @param {Array} receipts - Array of receipt objects
 */
export const generateCSV = (receipts) => {
  if (!receipts || receipts.length === 0) {
    alert('No receipts to export');
    return;
  }

  try {
    // Define CSV headers
    const headers = [
      'Date',
      'Time',
      'Uploader',
      'Bill Payer',
      'Category',
      'Amount (INR)',
      'Currency',
      'Description',
      'File Path'
    ];

    // Convert receipts to CSV rows
    const rows = receipts.map(r => [
      r.date || '',
      r.time || '',
      r.uploader_name || '',
      r.bill_payer_name || '',
      r.category || '',
      r.amount || 0,
      r.currency || 'INR',
      (r.description || '').replace(/,/g, ';'), // Escape commas in description
      r.file_path || ''
    ]);

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `edc-receipts-${Date.now()}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    console.log('CSV exported successfully');
  } catch (error) {
    console.error('Error generating CSV:', error);
    throw error;
  }
};

/**
 * Helper function to convert blob to base64
 * @param {Blob} blob
 * @returns {Promise<string>}
 */
const blobToBase64 = (blob) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};
