import React, { useState } from 'react';
import {
  Users,
  Search,
  Filter,
  Download,
  TrendingUp,
  ShoppingCart,
  DollarSign,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Star,
  ArrowUpRight,
  MessageSquare,
} from 'lucide-react';
import { useGetCustomerAnalyticsQuery } from '../../store/slices/vendor/vendorDashboardApi';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';

const VendorCustomerManagement = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('revenue'); // revenue, orders, lastOrder
  const [filterType, setFilterType] = useState('all'); // all, top, repeat, inactive

  // API call
  const {
    data: customerData,
    isLoading,
    error,
  } = useGetCustomerAnalyticsQuery({ period: 'year' });

  // Mock customer data (replace with actual API data)
  const mockCustomers = [
    {
      id: 1,
      name: 'Golden Fork Restaurant',
      email: 'info@goldenfork.com',
      phone: '+880 1712 345678',
      totalOrders: 48,
      totalSpent: 125000,
      lastOrder: '2025-11-12',
      avgOrderValue: 2604,
      frequency: 'weekly',
      status: 'active',
      ltv: 180000,
      rating: 4.8,
    },
    {
      id: 2,
      name: 'Spice Garden',
      email: 'orders@spicegarden.com',
      phone: '+880 1812 456789',
      totalOrders: 36,
      totalSpent: 98000,
      lastOrder: '2025-11-10',
      avgOrderValue: 2722,
      frequency: 'weekly',
      status: 'active',
      ltv: 150000,
      rating: 4.9,
    },
    {
      id: 3,
      name: 'Ocean Blue Bistro',
      email: 'contact@oceanblue.com',
      phone: '+880 1912 567890',
      totalOrders: 28,
      totalSpent: 75000,
      lastOrder: '2025-11-08',
      avgOrderValue: 2679,
      frequency: 'biweekly',
      status: 'active',
      ltv: 120000,
      rating: 4.7,
    },
    {
      id: 4,
      name: 'Sunrise Cafe',
      email: 'hello@sunrisecafe.com',
      phone: '+880 1612 678901',
      totalOrders: 22,
      totalSpent: 58000,
      lastOrder: '2025-10-28',
      avgOrderValue: 2636,
      frequency: 'monthly',
      status: 'inactive',
      ltv: 90000,
      rating: 4.5,
    },
  ];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  const getDaysAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays === 0 ? 'Today' : diffDays === 1 ? 'Yesterday' : `${diffDays} days ago`;
  };

  const handleExport = () => {
    alert('Exporting customer data as CSV...');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        icon={Users}
        title="Failed to load customer data"
        description="Please try again later"
      />
    );
  }

  const customers = mockCustomers; // Replace with actual API data when available
  const analytics = customerData || {};

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-8">
      {/* Header */}
      <div className="glass-layer-1 rounded-3xl p-6 shadow-soft">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-text-dark">Customer Management</h1>
            <p className="text-text-muted mt-2">
              Manage relationships with your restaurant partners
            </p>
          </div>
          <button
            onClick={handleExport}
            className="bg-gradient-primary text-white px-6 py-3 rounded-2xl font-medium hover:shadow-glow-green transition-all duration-200 flex items-center gap-2 touch-target self-start lg:self-auto"
          >
            <Download className="w-4 h-4" />
            Export Data
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in">
        <div className="glass-layer-1 rounded-3xl p-6 shadow-soft">
          <div className="flex items-center justify-between mb-3">
            <div className="bg-mint-fresh/10 p-3 rounded-2xl">
              <Users className="w-6 h-6 text-bottle-green" />
            </div>
          </div>
          <p className="text-text-muted text-sm mb-1">Total Customers</p>
          <p className="text-3xl font-bold text-text-dark">{customers.length}</p>
        </div>

        <div className="glass-layer-1 rounded-3xl p-6 shadow-soft">
          <div className="flex items-center justify-between mb-3">
            <div className="bg-muted-olive/10 p-3 rounded-2xl">
              <ShoppingCart className="w-6 h-6 text-muted-olive" />
            </div>
          </div>
          <p className="text-text-muted text-sm mb-1">Total Orders</p>
          <p className="text-3xl font-bold text-text-dark">
            {customers.reduce((sum, c) => sum + c.totalOrders, 0)}
          </p>
        </div>

        <div className="glass-layer-1 rounded-3xl p-6 shadow-soft">
          <div className="flex items-center justify-between mb-3">
            <div className="bg-bottle-green/10 p-3 rounded-2xl">
              <DollarSign className="w-6 h-6 text-bottle-green" />
            </div>
          </div>
          <p className="text-text-muted text-sm mb-1">Total Revenue</p>
          <p className="text-3xl font-bold text-text-dark">
            {formatCurrency(customers.reduce((sum, c) => sum + c.totalSpent, 0))}
          </p>
        </div>

        <div className="glass-layer-1 rounded-3xl p-6 shadow-soft">
          <div className="flex items-center justify-between mb-3">
            <div className="bg-earthy-yellow/10 p-3 rounded-2xl">
              <TrendingUp className="w-6 h-6 text-earthy-brown" />
            </div>
          </div>
          <p className="text-text-muted text-sm mb-1">Avg Order Value</p>
          <p className="text-3xl font-bold text-text-dark">
            {formatCurrency(
              customers.reduce((sum, c) => sum + c.avgOrderValue, 0) / customers.length
            )}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-layer-1 rounded-3xl p-4 shadow-soft">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search customers..."
              className="w-full pl-12 pr-4 py-3 rounded-2xl glass-layer-2 border border-sage-green/20 focus:border-muted-olive focus:ring-2 focus:ring-muted-olive/20 transition-all duration-200"
            />
          </div>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-3 rounded-2xl glass-layer-2 border border-sage-green/20 focus:border-muted-olive focus:ring-2 focus:ring-muted-olive/20 transition-all duration-200"
          >
            <option value="revenue">Sort by Revenue</option>
            <option value="orders">Sort by Orders</option>
            <option value="lastOrder">Sort by Last Order</option>
          </select>

          {/* Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-3 rounded-2xl glass-layer-2 border border-sage-green/20 focus:border-muted-olive focus:ring-2 focus:ring-muted-olive/20 transition-all duration-200"
          >
            <option value="all">All Customers</option>
            <option value="top">Top Customers</option>
            <option value="repeat">Repeat Customers</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Customer List */}
      <div className="glass-layer-1 rounded-3xl overflow-hidden shadow-soft animate-fade-in">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-sage-green/10">
              <tr>
                <th className="text-left px-6 py-4 text-text-dark font-semibold">Customer</th>
                <th className="text-center px-6 py-4 text-text-dark font-semibold">Orders</th>
                <th className="text-right px-6 py-4 text-text-dark font-semibold">Total Spent</th>
                <th className="text-right px-6 py-4 text-text-dark font-semibold">Avg Order</th>
                <th className="text-center px-6 py-4 text-text-dark font-semibold">Last Order</th>
                <th className="text-center px-6 py-4 text-text-dark font-semibold">LTV</th>
                <th className="text-center px-6 py-4 text-text-dark font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sage-green/20">
              {customers.map((customer) => (
                <tr
                  key={customer.id}
                  className="hover:bg-sage-green/5 transition-colors duration-200"
                >
                  <td className="px-6 py-4">
                    <div>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-muted-olive/20 to-sage-green/20 flex items-center justify-center">
                          <span className="text-muted-olive font-semibold">
                            {customer.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-text-dark">{customer.name}</p>
                          <div className="flex items-center gap-2 text-sm text-text-muted">
                            <Mail className="w-3 h-3" />
                            {customer.email}
                          </div>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-muted-olive/10 rounded-full text-muted-olive font-medium">
                      <ShoppingCart className="w-3 h-3" />
                      {customer.totalOrders}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-bottle-green font-bold">
                    {formatCurrency(customer.totalSpent)}
                  </td>
                  <td className="px-6 py-4 text-right text-text-dark font-medium">
                    {formatCurrency(customer.avgOrderValue)}
                  </td>
                  <td className="px-6 py-4 text-center text-text-muted text-sm">
                    {getDaysAgo(customer.lastOrder)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-bottle-green font-bold text-sm">
                        {formatCurrency(customer.ltv)}
                      </span>
                      <div className="flex items-center gap-1 text-xs text-text-muted">
                        <Star className="w-3 h-3 fill-earthy-yellow text-earthy-yellow" />
                        {customer.rating}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => alert(`Viewing details for ${customer.name}`)}
                        className="p-2 hover:bg-sage-green/10 rounded-xl transition-colors duration-200"
                        title="View Details"
                      >
                        <ArrowUpRight className="w-4 h-4 text-muted-olive" />
                      </button>
                      <button
                        onClick={() => alert(`Messaging ${customer.name}`)}
                        className="p-2 hover:bg-sage-green/10 rounded-xl transition-colors duration-200"
                        title="Send Message"
                      >
                        <MessageSquare className="w-4 h-4 text-muted-olive" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Customers */}
      <div className="glass-layer-1 rounded-3xl p-6 shadow-soft">
        <h2 className="text-xl font-semibold text-text-dark mb-6">Top Customers</h2>
        <div className="space-y-4">
          {customers.slice(0, 3).map((customer, index) => (
            <div
              key={customer.id}
              className="glass-layer-2 rounded-2xl p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-muted-olive to-bottle-green text-white font-bold text-lg">
                  #{index + 1}
                </div>
                <div>
                  <p className="font-semibold text-text-dark">{customer.name}</p>
                  <div className="flex items-center gap-4 mt-1 text-sm text-text-muted">
                    <span className="flex items-center gap-1">
                      <ShoppingCart className="w-3 h-3" />
                      {customer.totalOrders} orders
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {customer.frequency}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-bottle-green">
                  {formatCurrency(customer.totalSpent)}
                </p>
                <p className="text-xs text-text-muted mt-1">Total Revenue</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VendorCustomerManagement;
