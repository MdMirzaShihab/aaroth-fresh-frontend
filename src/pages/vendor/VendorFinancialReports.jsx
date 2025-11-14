import React, { useState } from 'react';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Download,
  Calendar,
  Filter,
  FileText,
  PieChart,
  BarChart3,
  CreditCard,
  AlertCircle,
  CheckCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import {
  useGetFinancialSummaryQuery,
  useGetSalesReportsQuery,
  useGetRevenueAnalyticsQuery,
} from '../../store/slices/vendor/vendorDashboardApi';
import { useGetProductAnalyticsQuery } from '../../store/slices/vendor/vendorDashboardApi';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import SimpleLineChart from '../../components/ui/charts/SimpleLineChart';
import SimpleBarChart from '../../components/ui/charts/SimpleBarChart';

const VendorFinancialReports = () => {
  const [timeRange, setTimeRange] = useState('month'); // week, month, quarter, year
  const [reportType, setReportType] = useState('overview'); // overview, pnl, products, payouts

  // API calls
  const {
    data: financialSummary,
    isLoading: financialLoading,
    error: financialError,
  } = useGetFinancialSummaryQuery({ period: timeRange });

  const {
    data: salesReports,
    isLoading: salesLoading,
  } = useGetSalesReportsQuery({ period: timeRange });

  const {
    data: revenueAnalytics,
    isLoading: revenueLoading,
  } = useGetRevenueAnalyticsQuery({ period: timeRange });

  const {
    data: productAnalytics,
    isLoading: productLoading,
  } = useGetProductAnalyticsQuery({ period: timeRange });

  const isLoading = financialLoading || salesLoading || revenueLoading || productLoading;

  // Mock data for demonstration (replace with actual API data)
  const mockPayouts = [
    {
      id: 1,
      date: '2025-11-10',
      amount: 45000,
      status: 'completed',
      transactionId: 'TXN123456',
    },
    {
      id: 2,
      date: '2025-11-03',
      amount: 38500,
      status: 'completed',
      transactionId: 'TXN123455',
    },
    {
      id: 3,
      date: '2025-10-27',
      amount: 42000,
      status: 'completed',
      transactionId: 'TXN123454',
    },
    {
      id: 4,
      date: '2025-10-20',
      amount: 35000,
      status: 'pending',
      transactionId: 'TXN123453',
    },
  ];

  const handleExportReport = (format) => {
    // In production: Call API to generate and download report
    alert(`Exporting ${reportType} report as ${format.toUpperCase()}`);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  const formatPercentage = (value) => {
    return `${(value || 0).toFixed(1)}%`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (financialError) {
    return (
      <EmptyState
        icon={AlertCircle}
        title="Failed to load financial data"
        description="Please try again later or contact support if the problem persists."
        action={{
          label: 'Retry',
          onClick: () => window.location.reload(),
        }}
      />
    );
  }

  // Extract data from API responses (with fallbacks)
  const summary = financialSummary || {};
  const revenue = revenueAnalytics || {};
  const products = productAnalytics?.products || [];

  const kpis = [
    {
      label: 'Total Revenue',
      value: formatCurrency(summary.totalRevenue || 0),
      change: summary.revenueGrowth || 0,
      trend: (summary.revenueGrowth || 0) >= 0 ? 'up' : 'down',
      icon: DollarSign,
      color: 'text-mint-fresh',
      bgColor: 'bg-mint-fresh/10',
    },
    {
      label: 'Gross Profit',
      value: formatCurrency(summary.grossProfit || 0),
      change: summary.profitGrowth || 0,
      trend: (summary.profitGrowth || 0) >= 0 ? 'up' : 'down',
      icon: TrendingUp,
      color: 'text-bottle-green',
      bgColor: 'bg-bottle-green/10',
    },
    {
      label: 'Profit Margin',
      value: formatPercentage(summary.profitMargin || 0),
      change: summary.marginChange || 0,
      trend: (summary.marginChange || 0) >= 0 ? 'up' : 'down',
      icon: PieChart,
      color: 'text-muted-olive',
      bgColor: 'bg-muted-olive/10',
    },
    {
      label: 'Pending Payouts',
      value: formatCurrency(summary.pendingPayouts || 0),
      change: 0,
      trend: 'neutral',
      icon: CreditCard,
      color: 'text-earthy-yellow',
      bgColor: 'bg-earthy-yellow/10',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-8">
      {/* Header */}
      <div className="glass-layer-1 rounded-3xl p-6 shadow-soft">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-text-dark">Financial Reports</h1>
            <p className="text-text-muted mt-2">
              Track your revenue, profits, and financial performance
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Time Range Filter */}
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-3 rounded-2xl glass-layer-2 border border-sage-green/20 focus:border-muted-olive focus:ring-2 focus:ring-muted-olive/20 transition-all duration-200"
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </select>

            {/* Export Dropdown */}
            <div className="relative group">
              <button className="bg-gradient-primary text-white px-6 py-3 rounded-2xl font-medium hover:shadow-glow-green transition-all duration-200 flex items-center gap-2 touch-target">
                <Download className="w-4 h-4" />
                Export
              </button>
              <div className="absolute right-0 mt-2 w-48 glass-layer-1 rounded-2xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                <button
                  onClick={() => handleExportReport('pdf')}
                  className="w-full text-left px-4 py-3 hover:bg-sage-green/10 rounded-t-2xl transition-colors duration-200"
                >
                  Export as PDF
                </button>
                <button
                  onClick={() => handleExportReport('csv')}
                  className="w-full text-left px-4 py-3 hover:bg-sage-green/10 transition-colors duration-200"
                >
                  Export as CSV
                </button>
                <button
                  onClick={() => handleExportReport('excel')}
                  className="w-full text-left px-4 py-3 hover:bg-sage-green/10 rounded-b-2xl transition-colors duration-200"
                >
                  Export as Excel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in">
        {kpis.map((kpi, index) => {
          const Icon = kpi.icon;
          const TrendIcon = kpi.trend === 'up' ? ArrowUpRight : kpi.trend === 'down' ? ArrowDownRight : null;

          return (
            <div
              key={index}
              className="glass-layer-1 rounded-3xl p-6 shadow-soft hover:shadow-glow-green/20 transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`${kpi.bgColor} p-3 rounded-2xl`}>
                  <Icon className={`w-6 h-6 ${kpi.color}`} />
                </div>
                {TrendIcon && (
                  <div
                    className={`flex items-center gap-1 px-2 py-1 rounded-full ${
                      kpi.trend === 'up'
                        ? 'bg-mint-fresh/20 text-bottle-green'
                        : 'bg-tomato-red/20 text-tomato-red'
                    }`}
                  >
                    <TrendIcon className="w-3 h-3" />
                    <span className="text-xs font-medium">{Math.abs(kpi.change).toFixed(1)}%</span>
                  </div>
                )}
              </div>
              <p className="text-text-muted text-sm mb-1">{kpi.label}</p>
              <p className="text-2xl font-bold text-text-dark">{kpi.value}</p>
            </div>
          );
        })}
      </div>

      {/* Report Type Tabs */}
      <div className="glass-layer-1 rounded-3xl p-2 shadow-soft">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'pnl', label: 'P&L Statement', icon: FileText },
            { id: 'products', label: 'Product Profitability', icon: PieChart },
            { id: 'payouts', label: 'Payouts', icon: CreditCard },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setReportType(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-medium transition-all duration-200 whitespace-nowrap touch-target ${
                  reportType === tab.id
                    ? 'bg-gradient-primary text-white shadow-glow-green'
                    : 'text-text-muted hover:bg-sage-green/10'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Report Content */}
      <div className="glass-layer-1 rounded-3xl p-6 shadow-soft animate-fade-in">
        {/* Overview Tab */}
        {reportType === 'overview' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-text-dark">Revenue Overview</h2>

            {/* Revenue Chart */}
            <div className="glass-layer-2 rounded-2xl p-6">
              <h3 className="text-lg font-medium text-text-dark mb-4">Revenue Trend</h3>
              {revenue.revenueByDay && revenue.revenueByDay.length > 0 ? (
                <SimpleLineChart
                  data={revenue.revenueByDay.map((item) => ({
                    date: item.date,
                    value: item.revenue,
                  }))}
                  xKey="date"
                  yKey="value"
                  color="#4CAF50"
                  height={300}
                />
              ) : (
                <div className="h-64 flex items-center justify-center text-text-muted">
                  <p>No revenue data available for this period</p>
                </div>
              )}
            </div>

            {/* Revenue Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass-layer-2 rounded-2xl p-6">
                <h3 className="text-lg font-medium text-text-dark mb-4">Revenue by Category</h3>
                {revenue.revenueByCategory && revenue.revenueByCategory.length > 0 ? (
                  <div className="space-y-3">
                    {revenue.revenueByCategory.slice(0, 5).map((category, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-text-dark font-medium">{category.name}</span>
                        <span className="text-bottle-green font-bold">
                          {formatCurrency(category.revenue)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-text-muted">No category data available</p>
                )}
              </div>

              <div className="glass-layer-2 rounded-2xl p-6">
                <h3 className="text-lg font-medium text-text-dark mb-4">Top Revenue Products</h3>
                {products && products.length > 0 ? (
                  <div className="space-y-3">
                    {products.slice(0, 5).map((product, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-text-dark font-medium truncate max-w-[200px]">
                          {product.name}
                        </span>
                        <span className="text-bottle-green font-bold">
                          {formatCurrency(product.revenue)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-text-muted">No product data available</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* P&L Statement Tab */}
        {reportType === 'pnl' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-text-dark">
              Profit & Loss Statement
            </h2>

            <div className="glass-layer-2 rounded-2xl overflow-hidden">
              <table className="w-full">
                <thead className="bg-sage-green/10">
                  <tr>
                    <th className="text-left px-6 py-4 text-text-dark font-semibold">
                      Description
                    </th>
                    <th className="text-right px-6 py-4 text-text-dark font-semibold">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sage-green/20">
                  <tr>
                    <td className="px-6 py-4 text-text-dark font-medium">Total Sales Revenue</td>
                    <td className="px-6 py-4 text-right text-bottle-green font-bold">
                      {formatCurrency(summary.totalRevenue || 0)}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-text-muted pl-12">Cost of Goods Sold (COGS)</td>
                    <td className="px-6 py-4 text-right text-text-muted">
                      {formatCurrency(summary.totalCosts || 0)}
                    </td>
                  </tr>
                  <tr className="bg-mint-fresh/5">
                    <td className="px-6 py-4 text-text-dark font-semibold">Gross Profit</td>
                    <td className="px-6 py-4 text-right text-bottle-green font-bold text-lg">
                      {formatCurrency(summary.grossProfit || 0)}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-text-muted pl-12">Operating Expenses</td>
                    <td className="px-6 py-4 text-right text-text-muted">
                      {formatCurrency(summary.operatingExpenses || 0)}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-text-muted pl-12">Taxes & Fees</td>
                    <td className="px-6 py-4 text-right text-text-muted">
                      {formatCurrency(summary.taxes || 0)}
                    </td>
                  </tr>
                  <tr className="bg-mint-fresh/10">
                    <td className="px-6 py-4 text-text-dark font-bold text-lg">Net Profit</td>
                    <td className="px-6 py-4 text-right text-bottle-green font-bold text-xl">
                      {formatCurrency(summary.netProfit || 0)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="glass-layer-2 rounded-2xl p-4 text-center">
                <p className="text-text-muted text-sm mb-1">Gross Margin</p>
                <p className="text-2xl font-bold text-bottle-green">
                  {formatPercentage(summary.profitMargin || 0)}
                </p>
              </div>
              <div className="glass-layer-2 rounded-2xl p-4 text-center">
                <p className="text-text-muted text-sm mb-1">Net Margin</p>
                <p className="text-2xl font-bold text-muted-olive">
                  {formatPercentage(summary.netMargin || 0)}
                </p>
              </div>
              <div className="glass-layer-2 rounded-2xl p-4 text-center">
                <p className="text-text-muted text-sm mb-1">EBITDA</p>
                <p className="text-2xl font-bold text-text-dark">
                  {formatCurrency(summary.ebitda || 0)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Product Profitability Tab */}
        {reportType === 'products' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-text-dark">Product Profitability</h2>

            <div className="glass-layer-2 rounded-2xl overflow-hidden">
              <table className="w-full">
                <thead className="bg-sage-green/10">
                  <tr>
                    <th className="text-left px-6 py-4 text-text-dark font-semibold">Product</th>
                    <th className="text-right px-6 py-4 text-text-dark font-semibold">Revenue</th>
                    <th className="text-right px-6 py-4 text-text-dark font-semibold">Cost</th>
                    <th className="text-right px-6 py-4 text-text-dark font-semibold">Profit</th>
                    <th className="text-right px-6 py-4 text-text-dark font-semibold">Margin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sage-green/20">
                  {products && products.length > 0 ? (
                    products.map((product, index) => (
                      <tr key={index} className="hover:bg-sage-green/5 transition-colors duration-200">
                        <td className="px-6 py-4 text-text-dark font-medium">{product.name}</td>
                        <td className="px-6 py-4 text-right text-bottle-green">
                          {formatCurrency(product.revenue || 0)}
                        </td>
                        <td className="px-6 py-4 text-right text-text-muted">
                          {formatCurrency(product.cost || 0)}
                        </td>
                        <td className="px-6 py-4 text-right text-muted-olive font-semibold">
                          {formatCurrency(product.profit || 0)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium ${
                              (product.margin || 0) >= 30
                                ? 'bg-mint-fresh/20 text-bottle-green'
                                : (product.margin || 0) >= 15
                                ? 'bg-earthy-yellow/20 text-earthy-brown'
                                : 'bg-tomato-red/20 text-tomato-red'
                            }`}
                          >
                            {formatPercentage(product.margin || 0)}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-6 py-8 text-center text-text-muted">
                        No product data available for this period
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Payouts Tab */}
        {reportType === 'payouts' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-text-dark">Payout History</h2>
              <div className="flex items-center gap-2 px-4 py-2 bg-earthy-yellow/20 text-earthy-brown rounded-full">
                <Clock className="w-4 h-4" />
                <span className="text-sm font-medium">Next payout in 3 days</span>
              </div>
            </div>

            <div className="glass-layer-2 rounded-2xl overflow-hidden">
              <table className="w-full">
                <thead className="bg-sage-green/10">
                  <tr>
                    <th className="text-left px-6 py-4 text-text-dark font-semibold">Date</th>
                    <th className="text-left px-6 py-4 text-text-dark font-semibold">
                      Transaction ID
                    </th>
                    <th className="text-right px-6 py-4 text-text-dark font-semibold">Amount</th>
                    <th className="text-center px-6 py-4 text-text-dark font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sage-green/20">
                  {mockPayouts.map((payout) => (
                    <tr
                      key={payout.id}
                      className="hover:bg-sage-green/5 transition-colors duration-200"
                    >
                      <td className="px-6 py-4 text-text-dark">
                        {new Date(payout.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="px-6 py-4 text-text-muted font-mono text-sm">
                        {payout.transactionId}
                      </td>
                      <td className="px-6 py-4 text-right text-bottle-green font-bold">
                        {formatCurrency(payout.amount)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                            payout.status === 'completed'
                              ? 'bg-mint-fresh/20 text-bottle-green'
                              : payout.status === 'pending'
                              ? 'bg-earthy-yellow/20 text-earthy-brown'
                              : 'bg-tomato-red/20 text-tomato-red'
                          }`}
                        >
                          {payout.status === 'completed' ? (
                            <CheckCircle className="w-3 h-3" />
                          ) : payout.status === 'pending' ? (
                            <Clock className="w-3 h-3" />
                          ) : (
                            <AlertCircle className="w-3 h-3" />
                          )}
                          {payout.status.charAt(0).toUpperCase() + payout.status.slice(1)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-4 bg-blue-50/80 border border-blue-200/50 rounded-2xl">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> Payouts are processed weekly on Fridays. Funds typically
                reach your bank account within 2-3 business days.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorFinancialReports;
