/**
 * VendorAnalytics - Advanced Analytics Dashboard for Vendor Insights
 * Comprehensive analytics with trends, comparisons, geographic data, and business intelligence
 * Features: Real-time metrics, trend analysis, performance comparisons, geographic insights
 */

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  LineChart,
  MapPin,
  Calendar,
  DollarSign,
  Users,
  Package,
  Star,
  Target,
  Award,
  AlertCircle,
  Filter,
  Download,
  RefreshCw,
  Eye,
  Building2,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from 'lucide-react';
import { useTheme } from '../../../../hooks/useTheme';
import { Card, Button } from '../../../../components/ui';
import LoadingSpinner from '../../../../components/ui/LoadingSpinner';

// Analytics metric card component
const AnalyticsMetricCard = ({
  title,
  value,
  change,
  trend,
  icon: Icon,
  color = 'muted-olive',
  comparison,
  subtitle,
}) => {
  const getTrendIcon = () => {
    if (trend === 'up') return ArrowUpRight;
    if (trend === 'down') return ArrowDownRight;
    return Minus;
  };

  const getTrendColor = () => {
    if (trend === 'up') return 'text-sage-green';
    if (trend === 'down') return 'text-tomato-red';
    return 'text-text-muted';
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
        <div
          className={`w-12 h-12 bg-${color}/10 rounded-xl flex items-center justify-center`}
        >
          <Icon className={`w-6 h-6 text-${color}`} />
        </div>

        {change !== undefined && (
          <div className={`flex items-center gap-1 ${getTrendColor()}`}>
            <TrendIcon className="w-4 h-4" />
            <span className="text-sm font-medium">{change}%</span>
          </div>
        )}
      </div>

      <div className="space-y-1">
        <p className="text-2xl font-bold text-text-dark">{value}</p>
        <p className="text-sm text-text-muted">{title}</p>
        {subtitle && <p className="text-xs text-text-muted/80">{subtitle}</p>}
        {comparison && (
          <p className="text-xs text-text-muted">vs {comparison}</p>
        )}
      </div>
    </motion.div>
  );
};

// Performance distribution chart placeholder
const PerformanceDistributionChart = ({ data, title }) => {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-text-dark">{title}</h3>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div
        className="h-64 bg-gradient-to-br from-earthy-beige/20 to-sage-green/10 rounded-xl 
                      flex items-center justify-center border-2 border-dashed border-gray-300"
      >
        <div className="text-center">
          <PieChart className="w-12 h-12 text-muted-olive mx-auto mb-2" />
          <p className="text-text-muted font-medium">
            Performance Distribution
          </p>
          <p className="text-sm text-text-muted">{title}</p>
        </div>
      </div>
    </Card>
  );
};

// Top performers leaderboard
const TopPerformersLeaderboard = ({ vendors = [], metric = 'revenue' }) => {
  const sortedVendors = useMemo(() => {
    return vendors
      .sort((a, b) => {
        switch (metric) {
          case 'revenue':
            return (
              (b.businessMetrics?.totalRevenue || 0) -
              (a.businessMetrics?.totalRevenue || 0)
            );
          case 'orders':
            return (
              (b.businessMetrics?.totalOrders || 0) -
              (a.businessMetrics?.totalOrders || 0)
            );
          case 'rating':
            return (
              (b.businessMetrics?.rating || 0) -
              (a.businessMetrics?.rating || 0)
            );
          default:
            return 0;
        }
      })
      .slice(0, 10);
  }, [vendors, metric]);

  const getMetricValue = (vendor) => {
    switch (metric) {
      case 'revenue':
        return `$${(vendor.businessMetrics?.totalRevenue || 0).toLocaleString()}`;
      case 'orders':
        return (vendor.businessMetrics?.totalOrders || 0).toLocaleString();
      case 'rating':
        return (vendor.businessMetrics?.rating || 0).toFixed(1);
      default:
        return '0';
    }
  };

  const getRankBadgeColor = (rank) => {
    if (rank <= 3)
      return 'bg-gradient-to-r from-earthy-yellow to-earthy-yellow/80 text-white';
    if (rank <= 5)
      return 'bg-sage-green/10 text-sage-green border border-sage-green/20';
    return 'bg-gray-100 text-text-muted';
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-text-dark">Top Performers</h3>
        <select
          value={metric}
          onChange={(e) => {}} // This would be handled by parent component
          className="px-3 py-2 rounded-xl bg-white border border-gray-200 text-sm text-text-dark"
        >
          <option value="revenue">By Revenue</option>
          <option value="orders">By Orders</option>
          <option value="rating">By Rating</option>
        </select>
      </div>

      <div className="space-y-3">
        {sortedVendors.map((vendor, index) => (
          <motion.div
            key={vendor.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${getRankBadgeColor(index + 1)}`}
            >
              #{index + 1}
            </div>

            <div
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-muted-olive via-sage-green to-sage-green 
                            flex items-center justify-center shadow-lg text-white font-medium"
            >
              <Building2 className="w-5 h-5" />
            </div>

            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-text-dark truncate">
                {vendor.businessName}
              </h4>
              <p className="text-sm text-text-muted truncate">
                {vendor.businessType} • {vendor.location}
              </p>
            </div>

            <div className="text-right">
              <p className="font-semibold text-text-dark">
                {getMetricValue(vendor)}
              </p>
              <p className="text-xs text-text-muted">
                {metric === 'revenue' && 'Revenue'}
                {metric === 'orders' && 'Orders'}
                {metric === 'rating' && 'Rating'}
              </p>
            </div>
          </motion.div>
        ))}

        {sortedVendors.length === 0 && (
          <div className="text-center py-8 text-text-muted">
            <Award className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No performance data available</p>
          </div>
        )}
      </div>
    </Card>
  );
};

// Geographic insights component
const GeographicInsights = ({ vendors = [] }) => {
  const locationStats = useMemo(() => {
    const stats = {};
    vendors.forEach((vendor) => {
      const location = vendor.location || 'Unknown';
      if (!stats[location]) {
        stats[location] = {
          count: 0,
          revenue: 0,
          orders: 0,
          avgRating: 0,
        };
      }
      stats[location].count += 1;
      stats[location].revenue += vendor.businessMetrics?.totalRevenue || 0;
      stats[location].orders += vendor.businessMetrics?.totalOrders || 0;
      stats[location].avgRating += vendor.businessMetrics?.rating || 0;
    });

    return Object.entries(stats)
      .map(([location, data]) => ({
        location,
        ...data,
        avgRating: data.count > 0 ? data.avgRating / data.count : 0,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
  }, [vendors]);

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-text-dark">
          Geographic Performance
        </h3>
        <Button variant="outline" size="sm">
          <Eye className="w-4 h-4 mr-2" />
          View Map
        </Button>
      </div>

      <div className="space-y-3">
        {locationStats.map((item, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
          >
            <div className="flex items-center gap-3">
              <MapPin className="w-4 h-4 text-muted-olive" />
              <div>
                <p className="font-medium text-text-dark">{item.location}</p>
                <p className="text-sm text-text-muted">
                  {item.count} vendors • {item.orders} orders
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-semibold text-text-dark">
                ${item.revenue.toLocaleString()}
              </p>
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 text-earthy-yellow" />
                <span className="text-xs text-text-muted">
                  {item.avgRating.toFixed(1)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

// Key insights component
const KeyInsights = ({ vendors = [] }) => {
  const insights = useMemo(() => {
    const totalVendors = vendors.length;
    const activeVendors = vendors.filter((v) => v.status === 'active').length;
    const verifiedVendors = vendors.filter(
      (v) => v.verificationStatus === 'approved'
    ).length;
    const newVendors = vendors.filter((v) => {
      const createdDate = new Date(v.createdAt);
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      return createdDate >= thirtyDaysAgo;
    }).length;

    const highPerformers = vendors.filter(
      (v) =>
        (v.businessMetrics?.rating || 0) >= 4.5 &&
        (v.businessMetrics?.totalOrders || 0) >= 50
    ).length;

    const atRiskVendors = vendors.filter(
      (v) => (v.riskScore || 0) >= 70
    ).length;

    return [
      {
        title: 'Vendor Activation Rate',
        value: `${totalVendors > 0 ? Math.round((activeVendors / totalVendors) * 100) : 0}%`,
        description: `${activeVendors} of ${totalVendors} vendors are active`,
        trend: activeVendors > totalVendors * 0.8 ? 'positive' : 'warning',
        icon: Users,
      },
      {
        title: 'Verification Rate',
        value: `${totalVendors > 0 ? Math.round((verifiedVendors / totalVendors) * 100) : 0}%`,
        description: `${verifiedVendors} vendors verified`,
        trend: verifiedVendors > totalVendors * 0.7 ? 'positive' : 'warning',
        icon: Building2,
      },
      {
        title: 'Growth This Month',
        value: `${newVendors}`,
        description: 'new vendors joined',
        trend:
          newVendors > 5 ? 'positive' : newVendors > 0 ? 'neutral' : 'negative',
        icon: TrendingUp,
      },
      {
        title: 'High Performers',
        value: `${highPerformers}`,
        description: '4.5+ rating & 50+ orders',
        trend: highPerformers > totalVendors * 0.2 ? 'positive' : 'neutral',
        icon: Award,
      },
      {
        title: 'At-Risk Vendors',
        value: `${atRiskVendors}`,
        description: 'require attention',
        trend: atRiskVendors < totalVendors * 0.1 ? 'positive' : 'warning',
        icon: AlertCircle,
      },
    ];
  }, [vendors]);

  const getTrendColor = (trend) => {
    switch (trend) {
      case 'positive':
        return 'text-sage-green';
      case 'warning':
        return 'text-earthy-yellow';
      case 'negative':
        return 'text-tomato-red';
      default:
        return 'text-text-muted';
    }
  };

  const getTrendBg = (trend) => {
    switch (trend) {
      case 'positive':
        return 'bg-sage-green/5 border-sage-green/20';
      case 'warning':
        return 'bg-earthy-yellow/5 border-earthy-yellow/20';
      case 'negative':
        return 'bg-tomato-red/5 border-tomato-red/20';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-text-dark">Key Insights</h3>
        <Button variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="space-y-4">
        {insights.map((insight, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`p-4 rounded-xl border ${getTrendBg(insight.trend)}`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${getTrendBg(insight.trend)}`}
              >
                <insight.icon
                  className={`w-5 h-5 ${getTrendColor(insight.trend)}`}
                />
              </div>
              <div className="flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="font-semibold text-text-dark">
                    {insight.value}
                  </span>
                  <span className="text-sm font-medium text-text-dark">
                    {insight.title}
                  </span>
                </div>
                <p className="text-sm text-text-muted">{insight.description}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </Card>
  );
};

const VendorAnalytics = ({
  vendors = [],
  loading = false,
  dateRange = 'monthly',
  onDateRangeChange,
}) => {
  const { isDarkMode } = useTheme();
  const [selectedMetric, setSelectedMetric] = useState('revenue');
  const [viewMode, setViewMode] = useState('overview');

  // Calculate summary metrics
  const summaryMetrics = useMemo(() => {
    const totalRevenue = vendors.reduce(
      (sum, v) => sum + (v.businessMetrics?.totalRevenue || 0),
      0
    );
    const totalOrders = vendors.reduce(
      (sum, v) => sum + (v.businessMetrics?.totalOrders || 0),
      0
    );
    const avgRating =
      vendors.reduce((sum, v) => sum + (v.businessMetrics?.rating || 0), 0) /
      (vendors.length || 1);
    const activeVendors = vendors.filter((v) => v.status === 'active').length;

    return {
      totalRevenue,
      totalOrders,
      avgRating,
      activeVendors,
      totalVendors: vendors.length,
      conversionRate:
        totalOrders > 0 ? (totalOrders / vendors.length) * 100 : 0,
    };
  }, [vendors]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Analytics Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-text-dark">
            Vendor Analytics
          </h2>
          <p className="text-text-muted">
            Comprehensive insights and performance metrics
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-xl">
            {['weekly', 'monthly', 'quarterly'].map((period) => (
              <button
                key={period}
                onClick={() => onDateRangeChange?.(period)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 capitalize ${
                  dateRange === period
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
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <AnalyticsMetricCard
          title="Total Revenue"
          value={`$${summaryMetrics.totalRevenue.toLocaleString()}`}
          change={12.5}
          trend="up"
          icon={DollarSign}
          color="sage-green"
          subtitle="This period"
        />
        <AnalyticsMetricCard
          title="Total Orders"
          value={summaryMetrics.totalOrders.toLocaleString()}
          change={8.2}
          trend="up"
          icon={Package}
          color="sage-green"
          subtitle="All vendors"
        />
        <AnalyticsMetricCard
          title="Average Rating"
          value={summaryMetrics.avgRating.toFixed(1)}
          change={0.3}
          trend="up"
          icon={Star}
          color="earthy-yellow"
          subtitle="Platform wide"
        />
        <AnalyticsMetricCard
          title="Active Vendors"
          value={summaryMetrics.activeVendors.toLocaleString()}
          change={5.1}
          trend="up"
          icon={Building2}
          color="dusty-cedar"
          subtitle={`of ${summaryMetrics.totalVendors}`}
        />
        <AnalyticsMetricCard
          title="Conversion Rate"
          value={`${summaryMetrics.conversionRate.toFixed(1)}%`}
          change={-2.1}
          trend="down"
          icon={Target}
          color="muted-olive"
          subtitle="Orders per vendor"
        />
        <AnalyticsMetricCard
          title="Growth Rate"
          value="15.2%"
          change={3.8}
          trend="up"
          icon={TrendingUp}
          color="sage-green"
          subtitle="Month over month"
        />
      </div>

      {/* Charts and Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PerformanceDistributionChart
          data={vendors}
          title="Revenue Distribution"
        />
        <PerformanceDistributionChart
          data={vendors}
          title="Vendor Status Breakdown"
        />
      </div>

      {/* Insights and Leaderboards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <TopPerformersLeaderboard vendors={vendors} metric={selectedMetric} />
        <GeographicInsights vendors={vendors} />
        <KeyInsights vendors={vendors} />
      </div>
    </div>
  );
};

export default VendorAnalytics;
