import React, { useState } from 'react';
import { 
  useGetProductAnalyticsQuery,
  useGetAdminProductsQuery,
  useGetProductPerformanceQuery
} from '../../store/slices/apiSlice';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { Card } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import SimpleLineChart from '../../components/ui/charts/SimpleLineChart';
import SimpleBarChart from '../../components/ui/charts/SimpleBarChart';
import SimplePieChart from '../../components/ui/charts/SimplePieChart';
import { 
  BarChart3,
  TrendingUp,
  TrendingDown,
  Package,
  DollarSign,
  ShoppingCart,
  Eye,
  Users,
  Calendar,
  Download,
  RefreshCw,
  AlertTriangle,
  Star,
  Filter,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

const ProductAnalytics = () => {
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedProductId, setSelectedProductId] = useState(null);
  
  // Query for overall product analytics
  const { 
    data: analyticsData, 
    isLoading: analyticsLoading, 
    error: analyticsError,
    refetch: refetchAnalytics 
  } = useGetProductAnalyticsQuery({ timeRange });

  // Query for product list (for dropdowns)
  const { data: productsData } = useGetAdminProductsQuery({ 
    limit: 100, 
    status: 'active' 
  });

  // Query for individual product performance
  const { 
    data: performanceData, 
    isLoading: performanceLoading 
  } = useGetProductPerformanceQuery(selectedProductId, {
    skip: !selectedProductId
  });

  const analytics = analyticsData?.data || {};
  const products = productsData?.data?.products || [];
  const performance = performanceData?.data || {};

  const timeRangeOptions = [
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 90 Days' },
    { value: '1y', label: 'Last Year' },
  ];

  // Mock data for demonstration (replace with actual API data)
  const mockAnalytics = {
    overview: {
      totalProducts: 847,
      activeProducts: 782,
      totalViews: 45280,
      totalOrders: 3420,
      revenue: 125430,
      conversionRate: 7.56,
      averageRating: 4.3,
      topPerformingCategory: 'Vegetables'
    },
    trends: {
      viewsTrend: '+12.5%',
      ordersTrend: '+8.3%',
      revenueTrend: '+15.7%',
      conversionTrend: '-2.1%'
    },
    charts: {
      viewsOverTime: [
        { label: 'Mon', value: 1200 },
        { label: 'Tue', value: 1450 },
        { label: 'Wed', value: 1180 },
        { label: 'Thu', value: 1680 },
        { label: 'Fri', value: 1520 },
        { label: 'Sat', value: 980 },
        { label: 'Sun', value: 1100 },
      ],
      ordersOverTime: [
        { label: 'Mon', value: 85 },
        { label: 'Tue', value: 92 },
        { label: 'Wed', value: 78 },
        { label: 'Thu', value: 105 },
        { label: 'Fri', value: 88 },
        { label: 'Sat', value: 65 },
        { label: 'Sun', value: 72 },
      ],
      topCategories: [
        { label: 'Vegetables', value: 45 },
        { label: 'Fruits', value: 32 },
        { label: 'Herbs', value: 18 },
        { label: 'Grains', value: 12 },
        { label: 'Others', value: 8 },
      ],
      topProducts: [
        { name: 'Organic Tomatoes', views: 2840, orders: 245, revenue: 3680 },
        { name: 'Fresh Spinach', views: 2120, orders: 198, revenue: 2970 },
        { name: 'Bell Peppers', views: 1890, orders: 167, revenue: 2505 },
        { name: 'Carrots', views: 1650, orders: 134, revenue: 2010 },
        { name: 'Lettuce Mix', views: 1420, orders: 112, revenue: 1680 },
      ]
    }
  };

  // Key metrics data
  const keyMetrics = [
    {
      id: 'total-products',
      title: 'Total Products',
      value: mockAnalytics.overview.totalProducts.toLocaleString(),
      change: '+23',
      changeType: 'positive',
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      id: 'total-views',
      title: 'Product Views',
      value: mockAnalytics.overview.totalViews.toLocaleString(),
      change: mockAnalytics.trends.viewsTrend,
      changeType: 'positive',
      icon: Eye,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      id: 'total-orders',
      title: 'Orders',
      value: mockAnalytics.overview.totalOrders.toLocaleString(),
      change: mockAnalytics.trends.ordersTrend,
      changeType: 'positive',
      icon: ShoppingCart,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      id: 'revenue',
      title: 'Revenue',
      value: `$${mockAnalytics.overview.revenue.toLocaleString()}`,
      change: mockAnalytics.trends.revenueTrend,
      changeType: 'positive',
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      id: 'conversion-rate',
      title: 'Conversion Rate',
      value: `${mockAnalytics.overview.conversionRate}%`,
      change: mockAnalytics.trends.conversionTrend,
      changeType: 'negative',
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      id: 'average-rating',
      title: 'Avg. Rating',
      value: mockAnalytics.overview.averageRating.toFixed(1),
      change: '+0.2',
      changeType: 'positive',
      icon: Star,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
  ];

  if (analyticsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (analyticsError) {
    return (
      <EmptyState
        icon={AlertTriangle}
        title="Failed to load analytics"
        description="There was an error loading analytics data. Please try again."
        action={{
          label: "Retry",
          onClick: refetchAnalytics
        }}
      />
    );
  }

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-text-dark dark:text-white">
            Product Analytics
          </h1>
          <p className="text-text-muted mt-1">
            Track product performance, sales metrics, and customer insights
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Time Range Selector */}
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-2xl bg-white dark:bg-gray-800 text-text-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-bottle-green/20 min-h-[44px]"
          >
            {timeRangeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <Button
            variant="outline"
            onClick={refetchAnalytics}
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>

          <Button className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        {keyMetrics.map((metric) => (
          <Card key={metric.id} className="p-6 hover:shadow-lg transition-shadow duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-2xl ${metric.bgColor} flex items-center justify-center`}>
                <metric.icon className={`w-6 h-6 ${metric.color}`} />
              </div>
              <div className={`flex items-center gap-1 text-sm font-medium ${
                metric.changeType === 'positive' 
                  ? 'text-green-600' 
                  : metric.changeType === 'negative' 
                  ? 'text-red-600' 
                  : 'text-gray-600'
              }`}>
                {metric.changeType === 'positive' ? (
                  <ArrowUpRight className="w-4 h-4" />
                ) : metric.changeType === 'negative' ? (
                  <ArrowDownRight className="w-4 h-4" />
                ) : null}
                {metric.change}
              </div>
            </div>
            
            <div>
              <p className="text-2xl font-bold text-text-dark dark:text-white mb-1">
                {metric.value}
              </p>
              <p className="text-sm text-text-muted">
                {metric.title}
              </p>
            </div>
          </Card>
        ))}
      </div>

      {/* Charts Row 1: Views and Orders Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Product Views Trend */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-text-dark dark:text-white">
                Product Views Trend
              </h3>
              <p className="text-text-muted text-sm">Daily product page views</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-text-muted">This week</p>
              <p className="text-lg font-semibold text-text-dark dark:text-white">
                {mockAnalytics.overview.totalViews.toLocaleString()}
              </p>
            </div>
          </div>
          <SimpleLineChart 
            data={mockAnalytics.charts.viewsOverTime} 
            height={250}
            color="#3B82F6"
          />
        </Card>

        {/* Orders Trend */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-text-dark dark:text-white">
                Orders Trend
              </h3>
              <p className="text-text-muted text-sm">Daily orders placed</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-text-muted">This week</p>
              <p className="text-lg font-semibold text-text-dark dark:text-white">
                {mockAnalytics.overview.totalOrders.toLocaleString()}
              </p>
            </div>
          </div>
          <SimpleLineChart 
            data={mockAnalytics.charts.ordersOverTime} 
            height={250}
            color="#10B981"
          />
        </Card>
      </div>

      {/* Charts Row 2: Category Performance and Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Categories */}
        <Card className="p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-text-dark dark:text-white">
              Top Performing Categories
            </h3>
            <p className="text-text-muted text-sm">Orders by category</p>
          </div>
          <div className="flex justify-center">
            <SimplePieChart 
              data={mockAnalytics.charts.topCategories}
              size={280}
            />
          </div>
        </Card>

        {/* Top Products Table */}
        <Card className="p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-text-dark dark:text-white">
              Top Performing Products
            </h3>
            <p className="text-text-muted text-sm">Best selling products this month</p>
          </div>
          
          <div className="space-y-3">
            {mockAnalytics.charts.topProducts.map((product, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-secondary rounded-xl flex items-center justify-center text-white text-sm font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-text-dark dark:text-white text-sm">
                      {product.name}
                    </p>
                    <p className="text-xs text-text-muted">
                      {product.views} views • {product.orders} orders
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-text-dark dark:text-white text-sm">
                    ${product.revenue.toLocaleString()}
                  </p>
                  <p className="text-xs text-text-muted">
                    Revenue
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Individual Product Performance */}
      <Card className="p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-text-dark dark:text-white mb-4">
            Individual Product Performance
          </h3>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 max-w-md">
              <select
                value={selectedProductId || ''}
                onChange={(e) => setSelectedProductId(e.target.value || null)}
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-2xl bg-white dark:bg-gray-800 text-text-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-bottle-green/20"
              >
                <option value="">Select a product to analyze</option>
                {products.map(product => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {selectedProductId && performanceLoading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="md" />
          </div>
        ) : selectedProductId ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Individual product metrics would go here */}
            <div className="p-4 bg-blue-50 rounded-2xl">
              <div className="flex items-center gap-2 mb-2">
                <Eye className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Views</span>
              </div>
              <p className="text-2xl font-bold text-blue-900">1,248</p>
              <p className="text-xs text-blue-700">+12% vs last period</p>
            </div>
            
            <div className="p-4 bg-green-50 rounded-2xl">
              <div className="flex items-center gap-2 mb-2">
                <ShoppingCart className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">Orders</span>
              </div>
              <p className="text-2xl font-bold text-green-900">89</p>
              <p className="text-xs text-green-700">+8% vs last period</p>
            </div>
            
            <div className="p-4 bg-purple-50 rounded-2xl">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-800">Conversion</span>
              </div>
              <p className="text-2xl font-bold text-purple-900">7.1%</p>
              <p className="text-xs text-purple-700">-0.3% vs last period</p>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-text-muted">
            Select a product to view detailed performance metrics
          </div>
        )}
      </Card>

      {/* Insights and Recommendations */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-text-dark dark:text-white mb-4">
          Insights & Recommendations
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 bg-green-50 rounded-2xl">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">Growth Opportunity</span>
            </div>
            <p className="text-sm text-green-700">
              Organic vegetables category showing 25% growth. Consider expanding inventory.
            </p>
          </div>
          
          <div className="p-4 bg-orange-50 rounded-2xl">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-orange-600" />
              <span className="text-sm font-medium text-orange-800">Attention Needed</span>
            </div>
            <p className="text-sm text-orange-700">
              12 products have low conversion rates. Review pricing and descriptions.
            </p>
          </div>
          
          <div className="p-4 bg-blue-50 rounded-2xl">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Customer Behavior</span>
            </div>
            <p className="text-sm text-blue-700">
              Peak ordering times are 10-11 AM and 3-4 PM. Optimize inventory accordingly.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ProductAnalytics;