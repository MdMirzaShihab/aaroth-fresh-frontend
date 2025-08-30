/**
 * VendorPerformance - Analytics Dashboard for Vendor Performance Monitoring
 * Comprehensive performance analytics with business metrics, trends analysis, and comparative insights
 * Features: Performance charts, business metrics, rankings, trend analysis, export capabilities
 */

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  ShoppingCart,
  Users,
  Star,
  Clock,
  Target,
  Award,
  BarChart3,
  PieChart,
  LineChart,
  Filter,
  Download,
  RefreshCw,
  Calendar,
  MapPin,
  Building2,
  Eye
} from 'lucide-react';
import { useTheme } from '../../../../hooks/useTheme';
import { Card } from '../../../../components/ui';
import { Button } from '../../../../components/ui';
import LoadingSpinner from '../../../../components/ui/LoadingSpinner';
import EmptyState from '../../../../components/ui/EmptyState';

// Performance metrics card
const MetricsCard = ({ title, value, change, icon: Icon, trend, color = 'muted-olive' }) => {
  const getTrendColor = () => {
    if (trend === 'up') return 'text-sage-green';
    if (trend === 'down') return 'text-tomato-red';
    return 'text-text-muted';
  };

  const getTrendIcon = () => {
    if (trend === 'up') return TrendingUp;
    if (trend === 'down') return TrendingDown;
    return null;
  };

  const TrendIcon = getTrendIcon();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className="glass-card rounded-2xl p-6 border hover:shadow-glow-sage/10 transition-all duration-300"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 bg-${color}/10 rounded-xl flex items-center justify-center`}>
          <Icon className={`w-6 h-6 text-${color}`} />
        </div>
        {TrendIcon && (
          <div className={`flex items-center gap-1 ${getTrendColor()}`}>
            <TrendIcon className="w-4 h-4" />
            <span className="text-sm font-medium">{change}</span>
          </div>
        )}
      </div>
      <div>
        <p className="text-2xl font-bold text-text-dark mb-1">{value}</p>
        <p className="text-sm text-text-muted">{title}</p>
      </div>
    </motion.div>
  );
};

// Performance ranking card
const RankingCard = ({ vendor, rank, metric, value, change }) => {
  const getRankColor = (rank) => {
    if (rank <= 3) return 'text-earthy-yellow bg-earthy-yellow/10';
    if (rank <= 10) return 'text-sage-green bg-sage-green/10';
    return 'text-text-muted bg-gray-100';
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200 hover:border-muted-olive/30 transition-all duration-200"
    >
      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${getRankColor(rank)}`}>
        #{rank}
      </div>
      
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-muted-olive via-sage-green to-sage-green 
                      flex items-center justify-center shadow-lg text-white font-medium">
        <Building2 className="w-5 h-5" />
      </div>
      
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-text-dark truncate">{vendor.businessName}</h4>
        <p className="text-sm text-text-muted">{vendor.businessType}</p>
      </div>
      
      <div className="text-right">
        <p className="font-semibold text-text-dark">{value}</p>
        <div className={`text-xs flex items-center gap-1 ${
          change > 0 ? 'text-sage-green' : change < 0 ? 'text-tomato-red' : 'text-text-muted'
        }`}>
          {change > 0 && <TrendingUp className="w-3 h-3" />}
          {change < 0 && <TrendingDown className="w-3 h-3" />}
          <span>{change > 0 ? '+' : ''}{change}%</span>
        </div>
      </div>
    </motion.div>
  );
};

// Performance chart placeholder (would integrate with actual charting library)
const PerformanceChart = ({ data, type, title }) => {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-text-dark">{title}</h3>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Calendar className="w-4 h-4 mr-2" />
            Monthly
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      {/* Placeholder for chart */}
      <div className="h-64 bg-gradient-to-br from-earthy-beige/20 to-sage-green/10 rounded-xl 
                      flex items-center justify-center border-2 border-dashed border-gray-300">
        <div className="text-center">
          <BarChart3 className="w-12 h-12 text-muted-olive mx-auto mb-2" />
          <p className="text-text-muted font-medium">Performance Chart</p>
          <p className="text-sm text-text-muted">{title}</p>
        </div>
      </div>
    </Card>
  );
};

// Geographic performance map placeholder
const GeographicMap = ({ vendors }) => {
  const locationData = useMemo(() => {
    const locations = {};
    vendors.forEach(vendor => {
      const location = vendor.location || 'Unknown';
      if (!locations[location]) {
        locations[location] = { count: 0, revenue: 0 };
      }
      locations[location].count += 1;
      locations[location].revenue += vendor.businessMetrics?.totalRevenue || 0;
    });
    return Object.entries(locations).map(([location, data]) => ({
      location,
      ...data
    }));
  }, [vendors]);

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-text-dark">Geographic Performance</h3>
        <Button variant="outline" size="sm">
          <Eye className="w-4 h-4 mr-2" />
          View Map
        </Button>
      </div>
      
      <div className="space-y-3">
        {locationData.slice(0, 5).map((item, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-3">
              <MapPin className="w-4 h-4 text-muted-olive" />
              <div>
                <p className="font-medium text-text-dark">{item.location}</p>
                <p className="text-sm text-text-muted">{item.count} vendors</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-semibold text-text-dark">${item.revenue.toLocaleString()}</p>
              <p className="text-xs text-text-muted">Total Revenue</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

const VendorPerformance = ({ data, loading, vendors = [] }) => {
  const { isDarkMode } = useTheme();
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [selectedMetric, setSelectedMetric] = useState('revenue');
  const [showComparison, setShowComparison] = useState(false);

  // Generate performance metrics from vendors data
  const performanceMetrics = useMemo(() => {
    if (!vendors.length) return {};

    const totalRevenue = vendors.reduce((sum, v) => sum + (v.businessMetrics?.totalRevenue || 0), 0);
    const totalOrders = vendors.reduce((sum, v) => sum + (v.businessMetrics?.totalOrders || 0), 0);
    const avgRating = vendors.reduce((sum, v) => sum + (v.businessMetrics?.rating || 0), 0) / vendors.length;
    const activeVendors = vendors.filter(v => v.isActive).length;
    
    return {
      totalRevenue: totalRevenue,
      totalOrders: totalOrders,
      averageRating: avgRating,
      activeVendors: activeVendors,
      totalVendors: vendors.length,
      conversionRate: totalOrders > 0 ? ((totalOrders / vendors.length) * 100) : 0
    };
  }, [vendors]);

  // Generate top performers
  const topPerformers = useMemo(() => {
    return vendors
      .sort((a, b) => (b.businessMetrics?.totalRevenue || 0) - (a.businessMetrics?.totalRevenue || 0))
      .slice(0, 10)
      .map((vendor, index) => ({
        ...vendor,
        rank: index + 1,
        change: Math.floor(Math.random() * 30) - 10 // Mock change percentage
      }));
  }, [vendors]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!vendors.length) {
    return (
      <div className="py-12">
        <EmptyState
          icon={BarChart3}
          title="No performance data available"
          description="Performance analytics will appear here once vendors start generating data"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-text-dark">Performance Analytics</h2>
          <p className="text-text-muted">Comprehensive vendor performance insights and trends</p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-xl">
            {['weekly', 'monthly', 'quarterly'].map(period => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 capitalize ${
                  selectedPeriod === period
                    ? 'bg-white text-muted-olive shadow-sm'
                    : 'text-text-muted hover:text-text-dark'
                }`}
              >
                {period}
              </button>
            ))}
          </div>
          
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <MetricsCard
          title="Total Revenue"
          value={`$${performanceMetrics.totalRevenue?.toLocaleString() || '0'}`}
          change="12.5%"
          icon={DollarSign}
          trend="up"
          color="sage-green"
        />
        <MetricsCard
          title="Total Orders"
          value={performanceMetrics.totalOrders?.toLocaleString() || '0'}
          change="8.2%"
          icon={ShoppingCart}
          trend="up"
          color="sage-green"
        />
        <MetricsCard
          title="Average Rating"
          value={performanceMetrics.averageRating?.toFixed(1) || '0.0'}
          change="0.3%"
          icon={Star}
          trend="up"
          color="earthy-yellow"
        />
        <MetricsCard
          title="Active Vendors"
          value={performanceMetrics.activeVendors || '0'}
          change="5.1%"
          icon={Building2}
          trend="up"
          color="dusty-cedar"
        />
        <MetricsCard
          title="Conversion Rate"
          value={`${performanceMetrics.conversionRate?.toFixed(1) || '0.0'}%`}
          change="-2.1%"
          icon={Target}
          trend="down"
          color="muted-olive"
        />
        <MetricsCard
          title="Response Time"
          value="1.2h"
          change="15%"
          icon={Clock}
          trend="down"
          color="sage-green"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PerformanceChart
          data={data}
          type="line"
          title="Revenue Trends"
        />
        <PerformanceChart
          data={data}
          type="bar"
          title="Order Volume"
        />
      </div>

      {/* Performance Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performers */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-text-dark">Top Performers</h3>
            <div className="flex items-center gap-2">
              <select
                value={selectedMetric}
                onChange={(e) => setSelectedMetric(e.target.value)}
                className="px-3 py-2 rounded-xl bg-white border border-gray-200 text-sm"
              >
                <option value="revenue">By Revenue</option>
                <option value="orders">By Orders</option>
                <option value="rating">By Rating</option>
              </select>
              <Button variant="outline" size="sm">
                <Eye className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          <div className="space-y-3">
            {topPerformers.slice(0, 5).map((vendor) => (
              <RankingCard
                key={vendor.id}
                vendor={vendor}
                rank={vendor.rank}
                metric={selectedMetric}
                value={selectedMetric === 'revenue' 
                  ? `$${(vendor.businessMetrics?.totalRevenue || 0).toLocaleString()}`
                  : selectedMetric === 'orders'
                  ? (vendor.businessMetrics?.totalOrders || 0).toString()
                  : (vendor.businessMetrics?.rating || 0).toFixed(1)
                }
                change={vendor.change}
              />
            ))}
          </div>
        </Card>

        {/* Geographic Distribution */}
        <GeographicMap vendors={vendors} />
      </div>

      {/* Performance Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-sage-green/10 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-sage-green" />
            </div>
            <h3 className="font-semibold text-text-dark">Growth Insights</h3>
          </div>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2 text-text-dark">
              <div className="w-2 h-2 bg-sage-green rounded-full" />
              Revenue up 12.5% this month
            </li>
            <li className="flex items-center gap-2 text-text-dark">
              <div className="w-2 h-2 bg-sage-green rounded-full" />
              New vendor signups increased 18%
            </li>
            <li className="flex items-center gap-2 text-text-dark">
              <div className="w-2 h-2 bg-earthy-yellow rounded-full" />
              Customer satisfaction improved
            </li>
          </ul>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-earthy-yellow/10 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-earthy-yellow" />
            </div>
            <h3 className="font-semibold text-text-dark">Action Required</h3>
          </div>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2 text-text-dark">
              <div className="w-2 h-2 bg-tomato-red rounded-full" />
              5 vendors need verification
            </li>
            <li className="flex items-center gap-2 text-text-dark">
              <div className="w-2 h-2 bg-earthy-yellow rounded-full" />
              3 vendors have low ratings
            </li>
            <li className="flex items-center gap-2 text-text-dark">
              <div className="w-2 h-2 bg-sage-green rounded-full" />
              2 performance reviews due
            </li>
          </ul>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-sage-green/10 rounded-xl flex items-center justify-center">
              <Award className="w-5 h-5 text-sage-green" />
            </div>
            <h3 className="font-semibold text-text-dark">Achievements</h3>
          </div>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2 text-text-dark">
              <div className="w-2 h-2 bg-earthy-yellow rounded-full" />
              Highest monthly revenue achieved
            </li>
            <li className="flex items-center gap-2 text-text-dark">
              <div className="w-2 h-2 bg-sage-green rounded-full" />
              98% order fulfillment rate
            </li>
            <li className="flex items-center gap-2 text-text-dark">
              <div className="w-2 h-2 bg-sage-green rounded-full" />
              Customer satisfaction at all-time high
            </li>
          </ul>
        </Card>
      </div>

      {/* Comparative Analysis */}
      {showComparison && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          <PerformanceChart
            data={data}
            type="comparison"
            title="Vendor Comparison"
          />
          <PerformanceChart
            data={data}
            type="growth"
            title="Growth Analysis"
          />
        </motion.div>
      )}

      {/* Show/Hide Comparison Toggle */}
      <div className="flex justify-center">
        <Button
          onClick={() => setShowComparison(!showComparison)}
          variant="outline"
          className="border-muted-olive/30 text-muted-olive hover:bg-muted-olive/5"
        >
          {showComparison ? 'Hide' : 'Show'} Comparative Analysis
        </Button>
      </div>
    </div>
  );
};

export default VendorPerformance;