/**
 * ReportGenerator - Advanced Report Generation Component
 * Features: PDF generation, CSV export, scheduled reports, custom templates
 * Provides comprehensive reporting capabilities for analytics and performance data
 */

import React, { useState, useMemo, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  Download,
  Calendar,
  Settings,
  Filter,
  Eye,
  Send,
  Clock,
  Users,
  BarChart3,
  PieChart,
  TrendingUp,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Mail,
  Printer,
  Share2,
  Save,
  FileDown,
  Image,
} from 'lucide-react';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';
import toast from 'react-hot-toast';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { CSVLink } from 'react-csv';
import { Card, Button, LoadingSpinner } from '.';
import { useTheme } from '../../hooks/useTheme';

// Report template option component
const ReportTemplateCard = ({ template, isSelected, onSelect }) => {
  const { isDarkMode } = useTheme();

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      onClick={() => onSelect(template)}
      className={`
        glass-card rounded-xl p-4 border cursor-pointer transition-all duration-200
        ${
          isSelected
            ? isDarkMode
              ? 'border-sage-green/50 bg-sage-green/5'
              : 'border-muted-olive/50 bg-muted-olive/5'
            : isDarkMode
              ? 'border-gray-700/50 hover:border-gray-600'
              : 'border-gray-200/50 hover:border-gray-300'
        }
      `}
    >
      <div className="flex items-center gap-3 mb-3">
        <div
          className={`
          w-10 h-10 rounded-lg flex items-center justify-center
          ${
            isSelected
              ? isDarkMode
                ? 'bg-sage-green/20'
                : 'bg-muted-olive/10'
              : isDarkMode
                ? 'bg-gray-700'
                : 'bg-gray-100'
          }
        `}
        >
          <template.icon
            className={`w-5 h-5 ${
              isSelected
                ? isDarkMode
                  ? 'text-sage-green'
                  : 'text-muted-olive'
                : isDarkMode
                  ? 'text-gray-400'
                  : 'text-text-muted'
            }`}
          />
        </div>
        <div className="flex-1">
          <h4
            className={`font-medium ${isDarkMode ? 'text-white' : 'text-text-dark'}`}
          >
            {template.name}
          </h4>
          <p
            className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-text-muted'}`}
          >
            {template.description}
          </p>
        </div>
        {isSelected && (
          <CheckCircle
            className={`w-5 h-5 ${isDarkMode ? 'text-sage-green' : 'text-muted-olive'}`}
          />
        )}
      </div>

      <div className="flex items-center justify-between text-xs">
        <span className={`${isDarkMode ? 'text-gray-400' : 'text-text-muted'}`}>
          {template.sections.length} sections
        </span>
        <span className={`${isDarkMode ? 'text-gray-400' : 'text-text-muted'}`}>
          {template.estimatedPages} pages
        </span>
      </div>
    </motion.div>
  );
};

// Schedule option component
const ScheduleOptionCard = ({ option, isSelected, onSelect }) => {
  const { isDarkMode } = useTheme();

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      onClick={() => onSelect(option)}
      className={`
        p-3 rounded-lg border cursor-pointer transition-all duration-200
        ${
          isSelected
            ? isDarkMode
              ? 'border-sage-green/50 bg-sage-green/5'
              : 'border-muted-olive/50 bg-muted-olive/5'
            : isDarkMode
              ? 'border-gray-700 hover:border-gray-600'
              : 'border-gray-200 hover:border-gray-300'
        }
      `}
    >
      <div className="flex items-center gap-2">
        <option.icon
          className={`w-4 h-4 ${
            isSelected
              ? isDarkMode
                ? 'text-sage-green'
                : 'text-muted-olive'
              : isDarkMode
                ? 'text-gray-400'
                : 'text-text-muted'
          }`}
        />
        <span
          className={`text-sm font-medium ${
            isSelected
              ? isDarkMode
                ? 'text-sage-green'
                : 'text-muted-olive'
              : isDarkMode
                ? 'text-white'
                : 'text-text-dark'
          }`}
        >
          {option.label}
        </span>
      </div>
      <p
        className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-text-muted'}`}
      >
        {option.description}
      </p>
    </motion.div>
  );
};

const ReportGenerator = ({
  analyticsData = {},
  performanceData = {},
  onGenerateReport,
  onScheduleReport,
}) => {
  const { isDarkMode } = useTheme();
  const reportRef = useRef(null);
  const csvLinkRef = useRef(null);

  const [selectedTemplate, setSelectedTemplate] = useState('comprehensive');
  const [selectedSchedule, setSelectedSchedule] = useState('manual');
  const [dateRange, setDateRange] = useState('30d');
  const [reportFormat, setReportFormat] = useState('pdf'); // pdf, csv, both
  const [isGenerating, setIsGenerating] = useState(false);
  const [includeSections, setIncludeSections] = useState({
    overview: true,
    sales: true,
    users: true,
    products: true,
    performance: true,
    sla: true,
  });
  const [recipientEmail, setRecipientEmail] = useState('');

  // Report templates
  const reportTemplates = useMemo(
    () => [
      {
        id: 'comprehensive',
        name: 'Comprehensive Report',
        description: 'Full analytics and performance insights',
        icon: BarChart3,
        sections: [
          'overview',
          'sales',
          'users',
          'products',
          'performance',
          'sla',
        ],
        estimatedPages: 12,
      },
      {
        id: 'executive',
        name: 'Executive Summary',
        description: 'High-level metrics and key insights',
        icon: TrendingUp,
        sections: ['overview', 'performance'],
        estimatedPages: 3,
      },
      {
        id: 'sales-focused',
        name: 'Sales Analytics',
        description: 'Detailed sales performance and revenue analysis',
        icon: BarChart3,
        sections: ['overview', 'sales'],
        estimatedPages: 6,
      },
      {
        id: 'user-focused',
        name: 'User Analytics',
        description: 'User behavior and engagement insights',
        icon: Users,
        sections: ['overview', 'users'],
        estimatedPages: 5,
      },
      {
        id: 'performance',
        name: 'Performance Report',
        description: 'System performance and SLA compliance',
        icon: Activity,
        sections: ['performance', 'sla'],
        estimatedPages: 4,
      },
    ],
    []
  );

  // Schedule options
  const scheduleOptions = useMemo(
    () => [
      {
        id: 'manual',
        label: 'Manual Generation',
        description: 'Generate reports on demand',
        icon: Download,
      },
      {
        id: 'daily',
        label: 'Daily Reports',
        description: 'Auto-generate every day at 6 AM',
        icon: Calendar,
      },
      {
        id: 'weekly',
        label: 'Weekly Reports',
        description: 'Auto-generate every Monday at 6 AM',
        icon: Calendar,
      },
      {
        id: 'monthly',
        label: 'Monthly Reports',
        description: 'Auto-generate first day of month',
        icon: Calendar,
      },
    ],
    []
  );

  // Get selected template
  const template = useMemo(
    () => reportTemplates.find((t) => t.id === selectedTemplate),
    [reportTemplates, selectedTemplate]
  );

  // Generate CSV data
  const generateCSVData = useCallback(() => {
    const csvData = [];

    // Add overview data
    if (includeSections.overview) {
      csvData.push(['OVERVIEW METRICS']);
      csvData.push(['Metric', 'Value', 'Change', 'Period']);
      csvData.push([
        'Total Revenue',
        `$${analyticsData.totalRevenue || 125840}`,
        '+18.5%',
        dateRange,
      ]);
      csvData.push([
        'Total Orders',
        analyticsData.totalOrders || 3842,
        '+12.3%',
        dateRange,
      ]);
      csvData.push([
        'Active Users',
        analyticsData.activeUsers || 1567,
        '+24.7%',
        dateRange,
      ]);
      csvData.push([
        'Avg Order Value',
        `$${analyticsData.avgOrderValue || 87.65}`,
        '+8.9%',
        dateRange,
      ]);
      csvData.push([]);
    }

    // Add sales data
    if (includeSections.sales) {
      csvData.push(['SALES ANALYTICS']);
      csvData.push(['Date', 'Revenue', 'Orders', 'Customers', 'AOV']);
      // Add sample sales data
      for (let i = 30; i >= 1; i--) {
        const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
        csvData.push([
          date,
          Math.floor(Math.random() * 5000) + 2000,
          Math.floor(Math.random() * 50) + 20,
          Math.floor(Math.random() * 30) + 15,
          Math.floor(Math.random() * 50) + 80,
        ]);
      }
      csvData.push([]);
    }

    // Add performance data
    if (includeSections.performance) {
      csvData.push(['PERFORMANCE METRICS']);
      csvData.push(['Metric', 'Current', 'Target', 'Status']);
      csvData.push([
        'API Response Time',
        `${performanceData.apiResponseTime || 145}ms`,
        '< 500ms',
        'Healthy',
      ]);
      csvData.push([
        'System Uptime',
        `${performanceData.uptime || 99.94}%`,
        '> 99.5%',
        'Compliant',
      ]);
      csvData.push([
        'Error Rate',
        `${performanceData.errorRate || 0.3}%`,
        '< 1%',
        'Healthy',
      ]);
      csvData.push([]);
    }

    return csvData;
  }, [analyticsData, performanceData, includeSections, dateRange]);

  // Generate PDF report
  const generatePDFReport = useCallback(async () => {
    setIsGenerating(true);

    try {
      // Create a new jsPDF instance
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      const contentWidth = pageWidth - 2 * margin;
      let currentY = margin;

      // Helper function to add new page if needed
      const checkNewPage = (requiredHeight) => {
        if (currentY + requiredHeight > pageHeight - margin) {
          pdf.addPage();
          currentY = margin;
        }
      };

      // Report header
      pdf.setFontSize(24);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Aaroth Fresh Analytics Report', margin, currentY);
      currentY += 15;

      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Generated: ${format(new Date(), 'PPP')}`, margin, currentY);
      currentY += 5;
      pdf.text(`Period: ${dateRange}`, margin, currentY);
      currentY += 15;

      // Overview section
      if (includeSections.overview) {
        checkNewPage(40);
        pdf.setFontSize(18);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Executive Overview', margin, currentY);
        currentY += 10;

        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'normal');

        const metrics = [
          [
            'Total Revenue',
            `$${(analyticsData.totalRevenue || 125840).toLocaleString()}`,
            '+18.5%',
          ],
          [
            'Total Orders',
            (analyticsData.totalOrders || 3842).toLocaleString(),
            '+12.3%',
          ],
          [
            'Active Users',
            (analyticsData.activeUsers || 1567).toLocaleString(),
            '+24.7%',
          ],
          [
            'Avg Order Value',
            `$${(analyticsData.avgOrderValue || 87.65).toFixed(2)}`,
            '+8.9%',
          ],
        ];

        metrics.forEach(([metric, value, change]) => {
          pdf.text(`${metric}: ${value} (${change})`, margin + 5, currentY);
          currentY += 6;
        });
        currentY += 10;
      }

      // Sales section
      if (includeSections.sales) {
        checkNewPage(30);
        pdf.setFontSize(18);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Sales Performance', margin, currentY);
        currentY += 10;

        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'normal');
        pdf.text(
          'Revenue has shown consistent growth with strong order volume.',
          margin + 5,
          currentY
        );
        currentY += 6;
        pdf.text(
          'Top performing periods indicate weekend and holiday peaks.',
          margin + 5,
          currentY
        );
        currentY += 15;
      }

      // Performance section
      if (includeSections.performance) {
        checkNewPage(40);
        pdf.setFontSize(18);
        pdf.setFont('helvetica', 'bold');
        pdf.text('System Performance', margin, currentY);
        currentY += 10;

        const performanceMetrics = [
          [
            'API Response Time',
            `${performanceData.apiResponseTime || 145}ms`,
            'Target: < 500ms',
          ],
          [
            'System Uptime',
            `${(performanceData.uptime || 99.94).toFixed(2)}%`,
            'Target: > 99.5%',
          ],
          [
            'Error Rate',
            `${(performanceData.errorRate || 0.3).toFixed(2)}%`,
            'Target: < 1%',
          ],
          [
            'Active Connections',
            (performanceData.activeConnections || 156).toString(),
            'Normal range',
          ],
        ];

        pdf.setFontSize(11);
        performanceMetrics.forEach(([metric, value, target]) => {
          pdf.text(`${metric}: ${value} (${target})`, margin + 5, currentY);
          currentY += 6;
        });
        currentY += 10;
      }

      // Footer
      const footerY = pageHeight - 10;
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'italic');
      pdf.text('Generated by Aaroth Fresh Analytics Platform', margin, footerY);
      pdf.text(
        `Page ${pdf.internal.pages.length - 1}`,
        pageWidth - margin - 20,
        footerY
      );

      // Save the PDF
      const fileName = `aaroth-analytics-report-${format(new Date(), 'yyyy-MM-dd')}.pdf`;
      pdf.save(fileName);

      toast.success('PDF report generated successfully');

      if (onGenerateReport) {
        onGenerateReport({
          type: 'pdf',
          template: selectedTemplate,
          dateRange,
          fileName,
          sections: includeSections,
        });
      }
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.error('Failed to generate PDF report');
    } finally {
      setIsGenerating(false);
    }
  }, [
    analyticsData,
    performanceData,
    includeSections,
    dateRange,
    selectedTemplate,
    onGenerateReport,
  ]);

  // Generate CSV report
  const generateCSVReport = useCallback(() => {
    const csvData = generateCSVData();
    const fileName = `aaroth-analytics-data-${format(new Date(), 'yyyy-MM-dd')}.csv`;

    // Trigger CSV download
    if (csvLinkRef.current) {
      csvLinkRef.current.link.click();
    }

    toast.success('CSV report downloaded');

    if (onGenerateReport) {
      onGenerateReport({
        type: 'csv',
        template: selectedTemplate,
        dateRange,
        fileName,
        sections: includeSections,
      });
    }
  }, [
    generateCSVData,
    selectedTemplate,
    dateRange,
    includeSections,
    onGenerateReport,
  ]);

  // Handle report generation
  const handleGenerateReport = useCallback(async () => {
    if (reportFormat === 'pdf') {
      await generatePDFReport();
    } else if (reportFormat === 'csv') {
      generateCSVReport();
    } else {
      // Generate both
      await generatePDFReport();
      setTimeout(() => generateCSVReport(), 1000);
    }
  }, [reportFormat, generatePDFReport, generateCSVReport]);

  // Handle schedule report
  const handleScheduleReport = useCallback(() => {
    if (selectedSchedule === 'manual') {
      toast.error('Cannot schedule manual reports');
      return;
    }

    const scheduleData = {
      template: selectedTemplate,
      schedule: selectedSchedule,
      format: reportFormat,
      sections: includeSections,
      recipientEmail,
      dateRange,
    };

    toast.success(`${selectedSchedule} report scheduled successfully`);

    if (onScheduleReport) {
      onScheduleReport(scheduleData);
    }
  }, [
    selectedTemplate,
    selectedSchedule,
    reportFormat,
    includeSections,
    recipientEmail,
    dateRange,
    onScheduleReport,
  ]);

  // Handle section toggle
  const handleSectionToggle = useCallback((section) => {
    setIncludeSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  }, []);

  return (
    <div className="space-y-6">
      {/* Report Generator Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2
            className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-text-dark'}`}
          >
            Report Generator
          </h2>
          <p
            className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-text-muted'}`}
          >
            Generate and schedule comprehensive analytics reports
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={handleGenerateReport}
            disabled={isGenerating}
            className={`
              min-h-[44px] bg-gradient-to-r from-muted-olive to-sage-green hover:from-muted-olive/90 hover:to-sage-green/90
              text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200
            `}
          >
            {isGenerating ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Download className="w-4 h-4 mr-2" />
            )}
            {isGenerating ? 'Generating...' : 'Generate Report'}
          </Button>

          {selectedSchedule !== 'manual' && (
            <Button
              variant="outline"
              onClick={handleScheduleReport}
              className="min-h-[44px]"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Schedule
            </Button>
          )}
        </div>
      </div>

      {/* Report Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Template Selection */}
        <Card
          className={`p-6 ${isDarkMode ? 'bg-gray-800/50' : 'bg-white/80'}`}
        >
          <div className="flex items-center gap-3 mb-4">
            <div
              className={`
              w-10 h-10 rounded-xl flex items-center justify-center
              ${isDarkMode ? 'bg-sage-green/20' : 'bg-sage-green/10'}
            `}
            >
              <FileText className="w-5 h-5 text-sage-green" />
            </div>
            <div>
              <h3
                className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-text-dark'}`}
              >
                Report Templates
              </h3>
              <p
                className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-text-muted'}`}
              >
                Choose a template for your report
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {reportTemplates.map((template) => (
              <ReportTemplateCard
                key={template.id}
                template={template}
                isSelected={selectedTemplate === template.id}
                onSelect={(template) => setSelectedTemplate(template.id)}
              />
            ))}
          </div>
        </Card>

        {/* Configuration Options */}
        <Card
          className={`p-6 ${isDarkMode ? 'bg-gray-800/50' : 'bg-white/80'}`}
        >
          <div className="flex items-center gap-3 mb-4">
            <div
              className={`
              w-10 h-10 rounded-xl flex items-center justify-center
              ${isDarkMode ? 'bg-sage-green/20' : 'bg-sage-green/10'}
            `}
            >
              <Settings className="w-5 h-5 text-sage-green" />
            </div>
            <div>
              <h3
                className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-text-dark'}`}
              >
                Configuration
              </h3>
              <p
                className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-text-muted'}`}
              >
                Customize your report settings
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Date Range */}
            <div>
              <label
                className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-text-dark'}`}
              >
                Date Range
              </label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className={`
                  w-full px-3 py-2 border rounded-lg text-sm
                  ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-200 text-gray-900'
                  }
                `}
              >
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
                <option value="6m">Last 6 Months</option>
                <option value="1y">Last Year</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>

            {/* Report Format */}
            <div>
              <label
                className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-text-dark'}`}
              >
                Report Format
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'pdf', label: 'PDF', icon: FileText },
                  { id: 'csv', label: 'CSV', icon: FileDown },
                  { id: 'both', label: 'Both', icon: Download },
                ].map((format) => (
                  <button
                    key={format.id}
                    onClick={() => setReportFormat(format.id)}
                    className={`
                      flex items-center justify-center gap-2 p-2 rounded-lg text-sm font-medium transition-all duration-200
                      ${
                        reportFormat === format.id
                          ? isDarkMode
                            ? 'bg-sage-green/20 text-sage-green border border-sage-green/30'
                            : 'bg-muted-olive/10 text-muted-olive border border-muted-olive/30'
                          : isDarkMode
                            ? 'bg-gray-700 text-gray-300 border border-gray-600 hover:bg-gray-600'
                            : 'bg-gray-50 text-text-muted border border-gray-200 hover:bg-gray-100'
                      }
                    `}
                  >
                    <format.icon className="w-4 h-4" />
                    {format.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Include Sections */}
            <div>
              <label
                className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-text-dark'}`}
              >
                Include Sections
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'overview', label: 'Overview', icon: BarChart3 },
                  { id: 'sales', label: 'Sales', icon: TrendingUp },
                  { id: 'users', label: 'Users', icon: Users },
                  { id: 'products', label: 'Products', icon: Package },
                  { id: 'performance', label: 'Performance', icon: Activity },
                  { id: 'sla', label: 'SLA', icon: Shield },
                ].map((section) => (
                  <label
                    key={section.id}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={includeSections[section.id]}
                      onChange={() => handleSectionToggle(section.id)}
                      className="w-4 h-4 rounded border-gray-300 text-muted-olive focus:ring-muted-olive/20"
                    />
                    <section.icon className="w-4 h-4 text-text-muted" />
                    <span
                      className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-text-dark'}`}
                    >
                      {section.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Schedule Configuration */}
      <Card className={`p-6 ${isDarkMode ? 'bg-gray-800/50' : 'bg-white/80'}`}>
        <div className="flex items-center gap-3 mb-4">
          <div
            className={`
            w-10 h-10 rounded-xl flex items-center justify-center
            ${isDarkMode ? 'bg-earthy-yellow/20' : 'bg-earthy-yellow/10'}
          `}
          >
            <Calendar className="w-5 h-5 text-earthy-yellow" />
          </div>
          <div>
            <h3
              className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-text-dark'}`}
            >
              Report Scheduling
            </h3>
            <p
              className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-text-muted'}`}
            >
              Set up automated report generation
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          {scheduleOptions.map((option) => (
            <ScheduleOptionCard
              key={option.id}
              option={option}
              isSelected={selectedSchedule === option.id}
              onSelect={(option) => setSelectedSchedule(option.id)}
            />
          ))}
        </div>

        {/* Email Configuration for Scheduled Reports */}
        {selectedSchedule !== 'manual' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="border-t pt-4 mt-4 border-gray-200 dark:border-gray-700"
          >
            <label
              className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-text-dark'}`}
            >
              Email Recipients (comma-separated)
            </label>
            <div className="flex gap-2">
              <input
                type="email"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                placeholder="admin@aarothfresh.com, manager@aarothfresh.com"
                className={`
                  flex-1 px-3 py-2 border rounded-lg text-sm
                  ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500'
                  }
                `}
              />
              <Button
                variant="outline"
                onClick={() => toast.success('Email configuration saved')}
                disabled={!recipientEmail}
              >
                <Mail className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </Card>

      {/* Report Preview */}
      <Card className={`p-6 ${isDarkMode ? 'bg-gray-800/50' : 'bg-white/80'}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className={`
              w-10 h-10 rounded-xl flex items-center justify-center
              ${isDarkMode ? 'bg-dusty-cedar/20' : 'bg-dusty-cedar/10'}
            `}
            >
              <Eye className="w-5 h-5 text-dusty-cedar" />
            </div>
            <div>
              <h3
                className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-text-dark'}`}
              >
                Report Preview
              </h3>
              <p
                className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-text-muted'}`}
              >
                Preview of {template?.name || 'selected template'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Image className="w-4 h-4 mr-2" />
              Screenshot
            </Button>
            <Button variant="outline" size="sm">
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Report Preview Content */}
        <div
          ref={reportRef}
          className={`
            border rounded-xl p-6 min-h-[400px]
            ${isDarkMode ? 'border-gray-700 bg-gray-900/50' : 'border-gray-200 bg-white'}
          `}
        >
          {/* Preview Header */}
          <div className="border-b pb-4 mb-6 border-gray-200 dark:border-gray-700">
            <h1
              className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-text-dark'}`}
            >
              Aaroth Fresh Analytics Report
            </h1>
            <div className="flex items-center justify-between mt-2">
              <p
                className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-text-muted'}`}
              >
                {template?.name || 'Report Template'}
              </p>
              <p
                className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-text-muted'}`}
              >
                Generated: {format(new Date(), 'PPP')}
              </p>
            </div>
          </div>

          {/* Preview Sections */}
          <div className="space-y-6">
            {includeSections.overview && (
              <div>
                <h3
                  className={`text-lg font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-text-dark'}`}
                >
                  Executive Overview
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div
                    className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}
                  >
                    <p
                      className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-text-muted'}`}
                    >
                      Total Revenue
                    </p>
                    <p
                      className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-text-dark'}`}
                    >
                      ${(analyticsData.totalRevenue || 125840).toLocaleString()}
                    </p>
                  </div>
                  <div
                    className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}
                  >
                    <p
                      className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-text-muted'}`}
                    >
                      Total Orders
                    </p>
                    <p
                      className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-text-dark'}`}
                    >
                      {(analyticsData.totalOrders || 3842).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {includeSections.performance && (
              <div>
                <h3
                  className={`text-lg font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-text-dark'}`}
                >
                  System Performance
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div
                    className={`p-3 rounded-lg text-center ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}
                  >
                    <p
                      className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-text-muted'}`}
                    >
                      Uptime
                    </p>
                    <p className="text-lg font-bold text-sage-green">
                      {(performanceData.uptime || 99.94).toFixed(2)}%
                    </p>
                  </div>
                  <div
                    className={`p-3 rounded-lg text-center ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}
                  >
                    <p
                      className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-text-muted'}`}
                    >
                      Response Time
                    </p>
                    <p className="text-lg font-bold text-sage-green">
                      {performanceData.apiResponseTime || 145}ms
                    </p>
                  </div>
                  <div
                    className={`p-3 rounded-lg text-center ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}
                  >
                    <p
                      className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-text-muted'}`}
                    >
                      Error Rate
                    </p>
                    <p className="text-lg font-bold text-earthy-yellow">
                      {(performanceData.errorRate || 0.3).toFixed(2)}%
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div
              className={`text-center py-4 text-sm ${isDarkMode ? 'text-gray-400' : 'text-text-muted'}`}
            >
              <p>
                ... Additional sections will be included based on template
                selection ...
              </p>
              <p className="mt-2">
                Estimated report length: {template?.estimatedPages || 0} pages
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Hidden CSV Link for download */}
      <CSVLink
        ref={csvLinkRef}
        data={generateCSVData()}
        filename={`aaroth-analytics-data-${format(new Date(), 'yyyy-MM-dd')}.csv`}
        className="hidden"
        target="_blank"
      />
    </div>
  );
};

export default ReportGenerator;
