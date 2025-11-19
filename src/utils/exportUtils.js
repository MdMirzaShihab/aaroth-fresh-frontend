import { formatCurrency, formatDate, formatDateTime } from './index';

/**
 * Data Export Utilities
 * Handles CSV and PDF export functionality for dashboard data
 */

// CSV Export Functions
export const exportToCSV = (data, filename, columns = null) => {
  if (!data || data.length === 0) {
    throw new Error('No data to export');
  }

  // If columns not specified, use all keys from first object
  const headers = columns || Object.keys(data[0]);

  // Create CSV content
  const csvContent = [
    // Header row
    headers.join(','),
    // Data rows
    ...data.map((row) =>
      headers
        .map((header) => {
          let value = row[header];

          // Handle nested objects
          if (typeof value === 'object' && value !== null) {
            value = JSON.stringify(value);
          }

          // Escape commas and quotes
          if (typeof value === 'string') {
            value = `"${value.replace(/"/g, '""')}"`;
          }

          return value || '';
        })
        .join(',')
    ),
  ].join('\n');

  // Create and download file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};

// Specialized CSV export for dashboard data
export const exportDashboardDataToCSV = (data, type, userRole) => {
  const timestamp = new Date().toISOString().split('T')[0];
  let filename = `${userRole}_${type}_${timestamp}`;
  let processedData = data;
  let columns = null;

  switch (type) {
    case 'overview':
      filename = `${userRole}_dashboard_overview_${timestamp}`;
      processedData = [data]; // Overview is usually a single object
      break;

    case 'revenue':
      filename = `${userRole}_revenue_data_${timestamp}`;
      if (data.trends) {
        processedData = data.trends.map((item) => ({
          period: item.month || item.date || item.period,
          revenue: formatCurrency(item.revenue || item.amount),
          change: item.change ? `${item.change}%` : '',
          orders: item.orders || '',
        }));
        columns = ['period', 'revenue', 'change', 'orders'];
      }
      break;

    case 'orders':
      filename = `${userRole}_orders_${timestamp}`;
      processedData = data.map((order) => ({
        orderNumber: order.orderNumber || order._id?.slice(-6),
        date: formatDate(order.createdAt),
        customer: order.customer?.name || order.buyer?.name || 'N/A',
        status: order.status,
        totalAmount: formatCurrency(order.totalAmount),
        items: order.items?.length || 0,
      }));
      columns = [
        'orderNumber',
        'date',
        'customer',
        'status',
        'totalAmount',
        'items',
      ];
      break;

    case 'products':
    case 'listings':
      filename = `${userRole}_${type}_${timestamp}`;
      processedData = data.map((item) => ({
        name: item.name || item.title,
        category: item.category?.name || item.category,
        price: formatCurrency(item.price),
        stock: item.stock || item.quantity,
        status: item.status,
        revenue: item.revenue ? formatCurrency(item.revenue) : 'N/A',
        orders: item.orderCount || item.orders || 'N/A',
      }));
      columns = [
        'name',
        'category',
        'price',
        'stock',
        'status',
        'revenue',
        'orders',
      ];
      break;

    case 'customers':
      filename = `${userRole}_customers_${timestamp}`;
      processedData = data.map((customer) => ({
        name: customer.name,
        email: customer.email || 'N/A',
        phone: customer.phone || 'N/A',
        totalOrders: customer.totalOrders || 0,
        totalSpent: formatCurrency(customer.totalSpent || 0),
        lastOrder: customer.lastOrder ? formatDate(customer.lastOrder) : 'N/A',
        status: customer.status || 'active',
      }));
      columns = [
        'name',
        'email',
        'phone',
        'totalOrders',
        'totalSpent',
        'lastOrder',
        'status',
      ];
      break;

    case 'spending':
      filename = `${userRole}_spending_analysis_${timestamp}`;
      if (data.byCategory) {
        processedData = data.byCategory.map((item) => ({
          category: item.category,
          amount: formatCurrency(item.amount),
          percentage: `${item.percentage}%`,
          orders: item.orders || 0,
        }));
        columns = ['category', 'amount', 'percentage', 'orders'];
      }
      break;

    case 'vendors':
      filename = `${userRole}_vendor_analysis_${timestamp}`;
      processedData = data.map((vendor) => ({
        businessName: vendor.businessName || vendor.name,
        category: vendor.category || 'N/A',
        totalOrders: vendor.totalOrders || 0,
        totalSpent: formatCurrency(vendor.totalSpent || 0),
        avgOrderValue: formatCurrency(vendor.avgOrderValue || 0),
        rating: vendor.rating || 'N/A',
        status: vendor.status || 'active',
      }));
      columns = [
        'businessName',
        'category',
        'totalOrders',
        'totalSpent',
        'avgOrderValue',
        'rating',
        'status',
      ];
      break;

    default:
      // Generic export for unknown types
      break;
  }

  exportToCSV(processedData, filename, columns);
};

// JSON Export (for backup/import purposes)
export const exportToJSON = (data, filename) => {
  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], {
    type: 'application/json;charset=utf-8;',
  });
  const link = document.createElement('a');

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};

// PDF Export Functions (using html2pdf or similar libraries)
export const exportToPDF = async (elementId, filename, options = {}) => {
  try {
    // Dynamic import to avoid loading html2pdf unless needed
    const html2pdf = (await import('html2pdf.js')).default;

    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`Element with ID '${elementId}' not found`);
    }

    const defaultOptions = {
      margin: 1,
      filename: `${filename}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
      ...options,
    };

    await html2pdf().set(defaultOptions).from(element).save();
  } catch (error) {
    console.error('PDF export failed:', error);
    throw new Error('PDF export failed. Please try again.');
  }
};

// Generate PDF report for dashboard data
export const generateDashboardPDFReport = async (data, type, userRole) => {
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `${userRole}_${type}_report_${timestamp}`;

  // Create a temporary div with the report content
  const reportDiv = document.createElement('div');
  reportDiv.id = 'pdf-report-temp';
  reportDiv.innerHTML = generateReportHTML(data, type, userRole);

  // Add styles for PDF
  const style = document.createElement('style');
  style.textContent = `
    #pdf-report-temp {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      color: #333;
    }
    #pdf-report-temp h1 {
      color: #2d5734;
      border-bottom: 2px solid #2d5734;
      padding-bottom: 10px;
      margin-bottom: 20px;
    }
    #pdf-report-temp h2 {
      color: #4a7c5d;
      margin-top: 25px;
      margin-bottom: 15px;
    }
    #pdf-report-temp table {
      width: 100%;
      border-collapse: collapse;
      margin: 15px 0;
    }
    #pdf-report-temp th, #pdf-report-temp td {
      border: 1px solid #ddd;
      padding: 8px;
      text-align: left;
    }
    #pdf-report-temp th {
      background-color: #f8f9fa;
      font-weight: 600;
    }
    #pdf-report-temp .summary-card {
      background: #f8f9fa;
      border: 1px solid #e9ecef;
      border-radius: 8px;
      padding: 15px;
      margin: 10px 0;
    }
    #pdf-report-temp .metric {
      display: inline-block;
      margin: 10px 15px 10px 0;
    }
    #pdf-report-temp .metric-label {
      font-size: 12px;
      color: #666;
      text-transform: uppercase;
    }
    #pdf-report-temp .metric-value {
      font-size: 18px;
      font-weight: 600;
      color: #333;
    }
  `;

  document.head.appendChild(style);
  document.body.appendChild(reportDiv);

  try {
    await exportToPDF('pdf-report-temp', filename, {
      margin: 0.5,
      html2canvas: {
        scale: 1.5,
        useCORS: true,
        letterRendering: true,
        allowTaint: false,
      },
      jsPDF: {
        unit: 'in',
        format: 'a4',
        orientation: 'portrait',
        compress: true,
      },
    });
  } finally {
    // Clean up
    document.body.removeChild(reportDiv);
    document.head.removeChild(style);
  }
};

// Generate HTML content for PDF reports
const generateReportHTML = (data, type, userRole) => {
  const now = new Date();
  const roleLabel = userRole.charAt(0).toUpperCase() + userRole.slice(1);
  const typeLabel = type.charAt(0).toUpperCase() + type.slice(1);

  let content = `
    <div>
      <h1>Aaroth Fresh - ${roleLabel} ${typeLabel} Report</h1>
      <p><strong>Generated:</strong> ${formatDateTime(now)}</p>
      <p><strong>Report Type:</strong> ${typeLabel} Analysis</p>
      <p><strong>User Role:</strong> ${roleLabel}</p>
  `;

  switch (type) {
    case 'overview':
      content += generateOverviewHTML(data);
      break;
    case 'revenue':
      content += generateRevenueHTML(data);
      break;
    case 'orders':
      content += generateOrdersHTML(data);
      break;
    case 'spending':
      content += generateSpendingHTML(data);
      break;
    default:
      content += generateGenericHTML(data);
  }

  content += `
      <div style="margin-top: 40px; text-align: center; font-size: 12px; color: #666;">
        <p>This report was generated automatically by Aaroth Fresh Dashboard</p>
        <p>Report ID: ${Date.now()}</p>
      </div>
    </div>
  `;

  return content;
};

const generateOverviewHTML = (data) => {
  return `
    <h2>Dashboard Overview</h2>
    <div class="summary-card">
      <div class="metric">
        <div class="metric-label">Total Revenue</div>
        <div class="metric-value">${formatCurrency(data.totalRevenue || 0)}</div>
      </div>
      <div class="metric">
        <div class="metric-label">Total Orders</div>
        <div class="metric-value">${(data.totalOrders || 0).toLocaleString()}</div>
      </div>
      <div class="metric">
        <div class="metric-label">Active Listings</div>
        <div class="metric-value">${(data.activeListings || 0).toLocaleString()}</div>
      </div>
      <div class="metric">
        <div class="metric-label">Customer Retention</div>
        <div class="metric-value">${(data.retentionRate || 0).toFixed(1)}%</div>
      </div>
    </div>
  `;
};

const generateRevenueHTML = (data) => {
  let html = '<h2>Revenue Analysis</h2>';

  if (data.trends && data.trends.length > 0) {
    html += `
      <table>
        <thead>
          <tr>
            <th>Period</th>
            <th>Revenue</th>
            <th>Change (%)</th>
            <th>Orders</th>
          </tr>
        </thead>
        <tbody>
    `;

    data.trends.forEach((item) => {
      html += `
        <tr>
          <td>${item.month || item.date || item.period}</td>
          <td>${formatCurrency(item.revenue || item.amount)}</td>
          <td>${item.change || 0}%</td>
          <td>${item.orders || 0}</td>
        </tr>
      `;
    });

    html += '</tbody></table>';
  }

  return html;
};

const generateOrdersHTML = (data) => {
  let html = '<h2>Orders Summary</h2>';

  if (data && data.length > 0) {
    html += `
      <table>
        <thead>
          <tr>
            <th>Order #</th>
            <th>Date</th>
            <th>Customer</th>
            <th>Status</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
    `;

    data.slice(0, 50).forEach((order) => {
      // Limit to 50 orders for PDF
      html += `
        <tr>
          <td>${order.orderNumber || order._id?.slice(-6)}</td>
          <td>${formatDate(order.createdAt)}</td>
          <td>${order.customer?.name || order.buyer?.name || 'N/A'}</td>
          <td>${order.status}</td>
          <td>${formatCurrency(order.totalAmount)}</td>
        </tr>
      `;
    });

    html += '</tbody></table>';

    if (data.length > 50) {
      html += `<p><em>Showing first 50 orders out of ${data.length} total orders.</em></p>`;
    }
  }

  return html;
};

const generateSpendingHTML = (data) => {
  let html = '<h2>Spending Analysis</h2>';

  if (data.byCategory && data.byCategory.length > 0) {
    html += `
      <table>
        <thead>
          <tr>
            <th>Category</th>
            <th>Amount</th>
            <th>Percentage</th>
            <th>Orders</th>
          </tr>
        </thead>
        <tbody>
    `;

    data.byCategory.forEach((item) => {
      html += `
        <tr>
          <td>${item.category}</td>
          <td>${formatCurrency(item.amount)}</td>
          <td>${item.percentage}%</td>
          <td>${item.orders || 0}</td>
        </tr>
      `;
    });

    html += '</tbody></table>';
  }

  return html;
};

const generateGenericHTML = (data) => {
  return `
    <h2>Data Summary</h2>
    <pre style="background: #f8f9fa; padding: 15px; border-radius: 5px; overflow-x: auto;">
      ${JSON.stringify(data, null, 2)}
    </pre>
  `;
};

// Export format validation
export const validateExportData = (data, format) => {
  if (!data) {
    throw new Error('No data provided for export');
  }

  if (format === 'csv' && !Array.isArray(data) && typeof data !== 'object') {
    throw new Error('CSV export requires array or object data');
  }

  if (format === 'pdf' && !data) {
    throw new Error('PDF export requires valid data');
  }

  return true;
};

// Get available export formats
export const getAvailableExportFormats = () => {
  return [
    {
      value: 'csv',
      label: 'CSV',
      description: 'Comma-separated values for spreadsheets',
    },
    {
      value: 'json',
      label: 'JSON',
      description: 'JavaScript Object Notation for data backup',
    },
    {
      value: 'pdf',
      label: 'PDF',
      description: 'Portable Document Format for reports',
    },
  ];
};

// Export with progress tracking
export const exportWithProgress = async (
  data,
  format,
  filename,
  onProgress
) => {
  try {
    onProgress?.(0, 'Preparing data...');

    validateExportData(data, format);
    onProgress?.(25, 'Validating data...');

    switch (format) {
      case 'csv':
        onProgress?.(50, 'Generating CSV...');
        exportToCSV(data, filename);
        onProgress?.(100, 'CSV export completed');
        break;

      case 'json':
        onProgress?.(50, 'Generating JSON...');
        exportToJSON(data, filename);
        onProgress?.(100, 'JSON export completed');
        break;

      case 'pdf':
        onProgress?.(50, 'Generating PDF...');
        await generateDashboardPDFReport(data, 'generic', 'user');
        onProgress?.(100, 'PDF export completed');
        break;

      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  } catch (error) {
    onProgress?.(0, `Export failed: ${error.message}`);
    throw error;
  }
};
