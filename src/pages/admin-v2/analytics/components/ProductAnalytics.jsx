/**
 * ProductAnalytics - Comprehensive Product Performance Analytics
 * Features: Inventory insights, category performance, product trends, vendor analytics
 * Provides detailed product and inventory management analytics for optimization
 */

import React, { useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Package,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart as PieChartIcon,
  Star,
  AlertCircle,
  ShoppingCart,
  Eye,
  Filter,
  Download,
  RefreshCw,
  Calendar,
  Tags,
  Building2,
  Truck,
  DollarSign,
  Target,
  Award,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Leaf,
} from 'lucide-react';
import { useTheme } from '../../../../hooks/useTheme';
import { Card, Button } from '../../../../components/ui';
import { LineChart, BarChart, PieChart, DoughnutChart } from '../../../../components/ui/charts/ChartJS';
import { format, subDays } from 'date-fns';
import toast from 'react-hot-toast';

// Product metric card component
const ProductMetricCard = ({ 
  title, 
  value, 
  change, 
  trend, 
  icon: Icon, 
  color = 'sage-green',
  subtitle,
  onClick,
  isLoading = false,
  status 
}) => {
  const { isDarkMode } = useTheme();
  
  const getTrendIcon = () => {
    if (trend === 'up') return ArrowUpRight;
    if (trend === 'down') return ArrowDownRight;
    return Minus;
  };

  const getTrendColor = () => {
    if (trend === 'up') return isDarkMode ? 'text-sage-green' : 'text-muted-olive';
    if (trend === 'down') return 'text-tomato-red';
    return isDarkMode ? 'text-gray-400' : 'text-text-muted';
  };

  const TrendIcon = getTrendIcon();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      onClick={onClick}
      className={`
        glass-card rounded-2xl p-6 border hover:shadow-glow-sage/10 transition-all duration-300
        ${onClick ? 'cursor-pointer' : ''}
        ${isDarkMode ? 'bg-gray-800/50 border-gray-700/50' : 'bg-white/80 border-gray-200/50'}
      `}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`
          w-10 h-10 rounded-xl flex items-center justify-center
          ${isDarkMode ? `bg-${color}/20` : `bg-${color}/10`}
        `}>
          <Icon className={`w-5 h-5 text-${color}`} />
        </div>
        
        {change !== undefined && (
          <div className={`flex items-center gap-1 ${getTrendColor()}`}>
            <TrendIcon className="w-3 h-3" />
            <span className="text-xs font-medium">{change}%</span>
          </div>
        )}
      </div>
      
      <div className="space-y-1">
        {isLoading ? (
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-20 mb-1"></div>
            <div className="h-3 bg-gray-200 rounded w-24"></div>
          </div>
        ) : (
          <>
            <p className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-text-dark'}`}>
              {value}
            </p>
            <p className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-text-muted'}`}>
              {title}
            </p>
            {subtitle && (
              <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-text-muted/80'}`}>
                {subtitle}
              </p>
            )}
            {status && (
              <div className={`
                inline-flex px-2 py-1 rounded text-xs font-medium
                ${status === 'healthy' 
                  ? isDarkMode ? 'bg-sage-green/20 text-sage-green' : 'bg-sage-green/10 text-muted-olive'
                  : status === 'warning'
                    ? isDarkMode ? 'bg-earthy-yellow/20 text-earthy-yellow' : 'bg-earthy-yellow/10 text-earthy-brown'
                    : 'bg-tomato-red/10 text-tomato-red'
                }
              `}>
                {status}
              </div>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
};

// Top product item component
const TopProductItem = ({ product, rank, metric = 'revenue' }) => {
  const { isDarkMode } = useTheme();

  const getRankBadgeColor = (rank) => {
    if (rank <= 3) return 'bg-gradient-to-r from-earthy-yellow to-earthy-yellow/80 text-white';
    if (rank <= 5) return isDarkMode ? 'bg-sage-green/20 text-sage-green' : 'bg-sage-green/10 text-sage-green';
    return isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-text-muted';
  };

  const getMetricValue = () => {
    switch (metric) {
      case 'revenue':
        return `$${product.revenue.toLocaleString()}`;
      case 'orders':
        return product.orders.toLocaleString();
      case 'views':
        return `${product.views.toLocaleString()} views`;
      default:
        return product.revenue.toLocaleString();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: rank * 0.1 }}
      className={`
        flex items-center gap-4 p-3 rounded-xl transition-colors
        ${isDarkMode ? 'bg-gray-700/30 hover:bg-gray-700/50' : 'bg-gray-50 hover:bg-gray-100'}
      `}
    >
      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${getRankBadgeColor(rank)}`}>
        #{rank}
      </div>
      
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-muted-olive via-sage-green to-sage-green 
                      flex items-center justify-center shadow-lg">
        <Leaf className="w-5 h-5 text-white" />
      </div>
      
      <div className="flex-1 min-w-0">
        <h4 className={`font-medium truncate ${isDarkMode ? 'text-white' : 'text-text-dark'}`}>
          {product.name}
        </h4>
        <p className={`text-sm truncate ${isDarkMode ? 'text-gray-300' : 'text-text-muted'}`}>
          {product.category} • {product.vendor}
        </p>
      </div>
      
      <div className="text-right">
        <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-text-dark'}`}>
          {getMetricValue()}
        </p>
        <div className="flex items-center gap-1">
          <Star className="w-3 h-3 text-earthy-yellow" />
          <span className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-text-muted'}`}>
            {product.rating.toFixed(1)}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

const ProductAnalytics = ({ 
  data = {}, 
  isLoading = false, 
  timeRange = '30d',
  onTimeRangeChange 
}) => {
  const { isDarkMode } = useTheme();
  const [chartView, setChartView] = useState('performance'); // performance, inventory, categories
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [topProductsMetric, setTopProductsMetric] = useState('revenue');

  // Generate product analytics data (replace with real API data)
  const productMetrics = useMemo(() => {
    const base = data.productMetrics || {};
    return {
      totalProducts: base.totalProducts || 2847,
      activeProducts: base.activeProducts || 2156,
      outOfStock: base.outOfStock || 127,
      lowStock: base.lowStock || 284,
      totalViews: base.totalViews || 47382,
      totalRevenue: base.totalRevenue || 89420,
      avgRating: base.avgRating || 4.3,
      conversionRate: base.conversionRate || 12.8,
      returnRate: base.returnRate || 3.2,
      newProducts: base.newProducts || 156,
    };
  }, [data]);

  // Category performance data
  const categoryData = useMemo(() => [
    { 
      name: 'Vegetables', 
      products: 1247, 
      revenue: 34580, 
      orders: 3421, 
      avgRating: 4.4,
      growth: 18.5,
      color: '#10B981' 
    },
    { 
      name: 'Fruits', 
      products: 823, 
      revenue: 28940, 
      orders: 2847, 
      avgRating: 4.2,
      growth: 15.2,
      color: '#F59E0B' 
    },
    { 
      name: 'Herbs & Spices', 
      products: 456, 
      revenue: 15680, 
      orders: 1892, 
      avgRating: 4.6,
      growth: 22.8,
      color: '#8B5CF6' 
    },
    { 
      name: 'Grains & Pulses', 
      products: 234, 
      revenue: 8920, 
      orders: 967, 
      avgRating: 4.1,
      growth: 8.7,
      color: '#F97316' 
    },
    { 
      name: 'Dairy', 
      products: 87, 
      revenue: 3300, 
      orders: 423, 
      avgRating: 4.5,
      growth: 12.3,
      color: '#EC4899' 
    },
  ], []);

  // Top performing products data
  const topProducts = useMemo(() => [
    {
      id: 1,
      name: 'Organic Spinach Bundle',
      category: 'Vegetables',
      vendor: 'Green Valley Farms',
      revenue: 5420,
      orders: 342,
      views: 2847,
      rating: 4.8,
      stock: 156,
    },
    {
      id: 2,
      name: 'Fresh Tomato Mix',
      category: 'Vegetables', 
      vendor: 'Sunset Gardens',
      revenue: 4890,
      orders: 298,
      views: 3124,
      rating: 4.6,
      stock: 89,
    },
    {
      id: 3,
      name: 'Premium Herb Collection',
      category: 'Herbs & Spices',
      vendor: 'Aromatic Fields',
      revenue: 4320,
      orders: 187,
      views: 1956,
      rating: 4.9,
      stock: 234,
    },
    {
      id: 4,
      name: 'Seasonal Fruit Basket',
      category: 'Fruits',
      vendor: 'Orchard Fresh',
      revenue: 3760,
      orders: 165,
      views: 2103,
      rating: 4.4,
      stock: 67,
    },
    {
      id: 5,
      name: 'Artisan Grain Selection',
      category: 'Grains & Pulses',
      vendor: 'Heritage Mills',
      revenue: 3240,
      orders: 143,
      views: 1784,
      rating: 4.3,
      stock: 198,
    },
  ], []);

  // Product performance over time
  const productPerformanceData = useMemo(() => {
    const generateData = (days = 30) => {
      const result = [];
      for (let i = days - 1; i >= 0; i--) {
        const date = subDays(new Date(), i);
        result.push({
          date: format(date, 'MMM dd'),
          fullDate: date,
          productViews: Math.floor(Math.random() * 2000) + 1500,
          orders: Math.floor(Math.random() * 200) + 150,
          newProducts: Math.floor(Math.random() * 10) + 2,
          outOfStock: Math.floor(Math.random() * 20) + 5,
        });
      }
      return result;
    };

    return data.productPerformance || generateData(timeRange === '7d' ? 7 : timeRange === '90d' ? 90 : 30);
  }, [data, timeRange]);

  // Chart data based on view
  const chartData = useMemo(() => {
    const labels = productPerformanceData.map(item => item.date);
    
    if (chartView === 'performance') {
      return {
        labels,
        datasets: [
          {
            label: 'Product Views',
            data: productPerformanceData.map(item => item.productViews),
            color: '#10B981',
            borderColor: '#10B981',
            backgroundColor: '#10B98120',
          },
          {
            label: 'Orders',
            data: productPerformanceData.map(item => item.orders),
            color: '#3B82F6',
            borderColor: '#3B82F6',
            backgroundColor: '#3B82F620',
          },
        ],
      };
    }
    
    if (chartView === 'inventory') {
      return {
        labels,
        datasets: [
          {
            label: 'New Products',
            data: productPerformanceData.map(item => item.newProducts),
            color: '#10B981',
          },
          {
            label: 'Out of Stock',
            data: productPerformanceData.map(item => item.outOfStock),
            color: '#EF4444',
          },
        ],
      };
    }
    
    // Categories view - pie chart data
    return categoryData;
  }, [productPerformanceData, categoryData, chartView]);

  // Inventory status data
  const inventoryStatus = useMemo(() => [
    { label: 'In Stock', value: productMetrics.activeProducts, color: '#10B981' },
    { label: 'Low Stock', value: productMetrics.lowStock, color: '#F59E0B' },
    { label: 'Out of Stock', value: productMetrics.outOfStock, color: '#EF4444' },
  ], [productMetrics]);

  // Handle chart interactions
  const handleChartClick = useCallback((dataPoint, context) => {
    const { label, value, datasetLabel } = dataPoint;
    toast.success(`Analyzing ${datasetLabel}: ${label} (${typeof value === 'number' ? value.toLocaleString() : value})`);
  }, []);

  // Handle category selection
  const handleCategoryClick = useCallback((category) => {
    setSelectedCategory(selectedCategory?.name === category.name ? null : category);
    toast.success(`${selectedCategory?.name === category.name ? 'Deselected' : 'Selected'} ${category.name} category`);
  }, [selectedCategory]);

  // Handle export
  const handleExport = useCallback(() => {
    const exportData = {
      metrics: productMetrics,
      categories: categoryData,
      topProducts,
      performanceData: productPerformanceData,
      inventoryStatus,
      exportDate: new Date().toISOString(),
      timeRange,
    };
    
    // Generate CSV
    const csvData = [
      ['Product', 'Category', 'Vendor', 'Revenue', 'Orders', 'Views', 'Rating', 'Stock'],
      ...topProducts.map(product => [
        product.name,
        product.category,
        product.vendor,
        product.revenue,
        product.orders,
        product.views,
        product.rating,
        product.stock,
      ])
    ];
    
    toast.success('Product analytics export started');
  }, [productMetrics, categoryData, topProducts, productPerformanceData, inventoryStatus, timeRange]);

  return (
    <div className="space-y-6">
      {/* Product Analytics Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-text-dark'}`}>
            Product Analytics
          </h2>
          <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-text-muted'}`}>
            Product performance, inventory insights, and category analytics
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Chart View Toggle */}
          <div className={`flex items-center gap-1 p-1 rounded-lg ${
            isDarkMode ? 'bg-gray-800' : 'bg-gray-100'
          }`}>
            {[
              { id: 'performance', label: 'Performance', icon: TrendingUp },
              { id: 'inventory', label: 'Inventory', icon: Package },
              { id: 'categories', label: 'Categories', icon: Tags },
            ].map(view => (
              <button
                key={view.id}
                onClick={() => setChartView(view.id)}
                className={`
                  flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200
                  ${chartView === view.id
                    ? isDarkMode 
                      ? 'bg-sage-green/20 text-sage-green'
                      : 'bg-white text-muted-olive shadow-sm'
                    : isDarkMode
                      ? 'text-gray-400 hover:text-gray-300'
                      : 'text-text-muted hover:text-text-dark'
                  }
                `}
              >
                <view.icon className="w-3 h-3" />
                <span className="hidden sm:inline">{view.label}</span>
              </button>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            className="min-h-[36px]"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Product Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <ProductMetricCard
          title="Total Products"
          value={productMetrics.totalProducts.toLocaleString()}
          change={8.3}
          trend="up"
          icon={Package}
          color="sage-green"
          subtitle="All listings"
          isLoading={isLoading}
        />
        <ProductMetricCard
          title="Active Products"
          value={productMetrics.activeProducts.toLocaleString()}
          change={5.7}
          trend="up"
          icon={Eye}
          color="sage-green"
          subtitle="In stock"
          status="healthy"
          isLoading={isLoading}
        />
        <ProductMetricCard
          title="Product Views"
          value={productMetrics.totalViews.toLocaleString()}
          change={15.2}
          trend="up"
          icon={TrendingUp}
          color="earthy-yellow"
          subtitle="Total views"
          isLoading={isLoading}
        />
        <ProductMetricCard
          title="Conversion Rate"
          value={`${productMetrics.conversionRate.toFixed(1)}%`}
          change={-2.8}
          trend="down"
          icon={Target}
          color="dusty-cedar"
          subtitle="View to order"
          isLoading={isLoading}
        />
        <ProductMetricCard
          title="Avg Rating"
          value={productMetrics.avgRating.toFixed(1)}
          change={3.1}
          trend="up"
          icon={Star}
          color="muted-olive"
          subtitle="Platform wide"
          isLoading={isLoading}
        />
      </div>

      {/* Main Product Chart */}
      <Card className={`p-6 ${isDarkMode ? 'bg-gray-800/50' : 'bg-white/80'}`}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-text-dark'}`}>
              Product {chartView === 'performance' ? 'Performance' : chartView === 'inventory' ? 'Inventory' : 'Category'} Analytics
            </h3>
            <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-text-muted'}`}>
              {chartView === 'performance' && 'Views, orders, and engagement over time'}
              {chartView === 'inventory' && 'Stock levels and product additions tracking'}
              {chartView === 'categories' && 'Revenue distribution across product categories'}
            </p>
          </div>

          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
        </div>

        <div className="h-80">
          {chartView === 'categories' ? (
            <PieChart
              data={chartData.map(cat => ({
                label: cat.name,
                value: cat.revenue,
                color: cat.color,
              }))}
              height={320}
              showLegend={false}
              onSegmentClick={(segment) => {
                const category = categoryData.find(cat => cat.name === segment.label);
                if (category) {
                  handleCategoryClick(category);
                }
              }}
            />
          ) : (
            <LineChart
              data={chartData}
              height={320}
              fillArea={chartView === 'performance'}
              enableDrillDown={true}
              onDataPointClick={handleChartClick}
              formatTooltip={(context) => {
                const value = context.parsed.y;
                if (context.dataset.label === 'Product Views') {
                  return `Views: ${value.toLocaleString()}`;
                }
                if (context.dataset.label === 'Orders') {
                  return `Orders: ${value.toLocaleString()}`;
                }
                return `${context.dataset.label}: ${value.toLocaleString()}`;
              }}
              tension={0.3}
            />
          )}
        </div>
      </Card>

      {/* Product Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performing Products */}
        <Card className={`p-6 ${isDarkMode ? 'bg-gray-800/50' : 'bg-white/80'}`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-text-dark'}`}>
              Top Performing Products
            </h3>
            <select
              value={topProductsMetric}
              onChange={(e) => setTopProductsMetric(e.target.value)}
              className={`
                px-3 py-2 rounded-lg text-sm border
                ${isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-200 text-gray-900'
                }
              `}
            >
              <option value="revenue">By Revenue</option>
              <option value="orders">By Orders</option>
              <option value="views">By Views</option>
            </select>
          </div>
          
          <div className="space-y-3">
            {topProducts
              .sort((a, b) => {
                if (topProductsMetric === 'revenue') return b.revenue - a.revenue;
                if (topProductsMetric === 'orders') return b.orders - a.orders;
                return b.views - a.views;
              })
              .map((product, index) => (
                <TopProductItem
                  key={product.id}
                  product={product}
                  rank={index + 1}
                  metric={topProductsMetric}
                />
              ))}
          </div>
        </Card>

        {/* Inventory Status */}
        <Card className={`p-6 ${isDarkMode ? 'bg-gray-800/50' : 'bg-white/80'}`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-text-dark'}`}>
              Inventory Status
            </h3>
            <Button variant="outline" size="sm">
              <AlertCircle className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="h-48 mb-4">
            <DoughnutChart
              data={inventoryStatus}
              cutout={50}
              showLegend={false}
              onSegmentClick={(segment) => {
                toast.success(`Analyzing ${segment.label} products`);
              }}
              centerContent={(centerData) => (
                <div className="text-center">
                  <p className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-text-dark'}`}>
                    {centerData.total.toLocaleString()}
                  </p>
                  <p className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-text-muted'}`}>
                    Products
                  </p>
                </div>
              )}
            />
          </div>
          
          {/* Inventory Alerts */}
          <div className="space-y-3">
            <div className={`
              flex items-center justify-between p-3 rounded-xl
              ${productMetrics.lowStock > 200 
                ? isDarkMode ? 'bg-earthy-yellow/10 border border-earthy-yellow/20' : 'bg-earthy-yellow/5 border border-earthy-yellow/20'
                : isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'
              }
            `}>
              <div className="flex items-center gap-2">
                <AlertCircle className={`w-4 h-4 ${
                  productMetrics.lowStock > 200 ? 'text-earthy-yellow' : isDarkMode ? 'text-gray-400' : 'text-text-muted'
                }`} />
                <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-text-dark'}`}>
                  Low Stock Alert
                </span>
              </div>
              <span className={`text-sm ${
                productMetrics.lowStock > 200 ? 'text-earthy-yellow font-semibold' : isDarkMode ? 'text-gray-300' : 'text-text-muted'
              }`}>
                {productMetrics.lowStock} products
              </span>
            </div>

            <div className={`
              flex items-center justify-between p-3 rounded-xl
              ${productMetrics.outOfStock > 100 
                ? isDarkMode ? 'bg-tomato-red/10 border border-tomato-red/20' : 'bg-tomato-red/5 border border-tomato-red/20'
                : isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'
              }
            `}>
              <div className="flex items-center gap-2">
                <Package className={`w-4 h-4 ${
                  productMetrics.outOfStock > 100 ? 'text-tomato-red' : isDarkMode ? 'text-gray-400' : 'text-text-muted'
                }`} />
                <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-text-dark'}`}>
                  Out of Stock
                </span>
              </div>
              <span className={`text-sm ${
                productMetrics.outOfStock > 100 ? 'text-tomato-red font-semibold' : isDarkMode ? 'text-gray-300' : 'text-text-muted'
              }`}>
                {productMetrics.outOfStock} products
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Category Performance Analysis */}
      <Card className={`p-6 ${isDarkMode ? 'bg-gray-800/50' : 'bg-white/80'}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-text-dark'}`}>
            Category Performance
          </h3>
          <Button variant="outline" size="sm">
            <BarChart3 className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {categoryData.map((category, index) => (
            <motion.div
              key={category.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => handleCategoryClick(category)}
              className={`
                p-4 rounded-xl border cursor-pointer transition-all duration-200
                ${selectedCategory?.name === category.name
                  ? isDarkMode ? 'border-sage-green/50 bg-sage-green/5' : 'border-muted-olive/50 bg-muted-olive/5'
                  : isDarkMode ? 'border-gray-700 hover:border-gray-600 bg-gray-700/30' : 'border-gray-200 hover:border-gray-300 bg-gray-50'
                }
              `}
            >
              <div className="flex items-center justify-between mb-2">
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${category.color}20` }}
                >
                  <Tags className="w-4 h-4" style={{ color: category.color }} />
                </div>
                <div className={`flex items-center gap-1 ${
                  category.growth > 0 ? 'text-sage-green' : 'text-tomato-red'
                }`}>
                  {category.growth > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  <span className="text-xs font-medium">{category.growth.toFixed(1)}%</span>
                </div>
              </div>
              
              <div className="space-y-1">
                <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-text-dark'}`}>
                  {category.name}
                </p>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-text-muted'}`}>
                  {category.products} products
                </p>
                <div className="flex items-center justify-between">
                  <p className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-text-dark'}`}>
                    ${category.revenue.toLocaleString()}
                  </p>
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-earthy-yellow" />
                    <span className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-text-muted'}`}>
                      {category.avgRating.toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </Card>

      {/* Selected Category Details */}
      {selectedCategory && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <Card className={`p-6 ${
            isDarkMode ? 'bg-gray-800/50 border-sage-green/20' : 'bg-white/80 border-muted-olive/20'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${selectedCategory.color}20` }}
                >
                  <Tags className="w-5 h-5" style={{ color: selectedCategory.color }} />
                </div>
                <div>
                  <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-text-dark'}`}>
                    {selectedCategory.name} Category Analysis
                  </h3>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-text-muted'}`}>
                    Detailed performance metrics and insights
                  </p>
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedCategory(null)}
              >
                Close
              </Button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                <p className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-text-dark'}`}>
                  {selectedCategory.products}
                </p>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-text-muted'}`}>
                  Products
                </p>
              </div>
              <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                <p className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-text-dark'}`}>
                  ${selectedCategory.revenue.toLocaleString()}
                </p>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-text-muted'}`}>
                  Revenue
                </p>
              </div>
              <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                <p className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-text-dark'}`}>
                  {selectedCategory.orders.toLocaleString()}
                </p>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-text-muted'}`}>
                  Orders
                </p>
              </div>
              <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                <p className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-text-dark'}`}>
                  {selectedCategory.avgRating.toFixed(1)} ⭐
                </p>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-text-muted'}`}>
                  Avg Rating
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Product Insights */}
      <Card className={`p-6 ${isDarkMode ? 'bg-gray-800/50' : 'bg-white/80'}`}>
        <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-text-dark'}`}>
          Product Performance Insights
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={`
            p-4 rounded-xl border
            ${isDarkMode ? 'bg-sage-green/5 border-sage-green/20' : 'bg-sage-green/5 border-sage-green/20'}
          `}>
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-5 h-5 text-sage-green" />
              <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-text-dark'}`}>
                Best Performers
              </span>
            </div>
            <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-text-muted'}`}>
              Vegetables category leads with ${categoryData[0]?.revenue.toLocaleString()} revenue and {categoryData[0]?.growth.toFixed(1)}% growth rate.
            </p>
          </div>

          <div className={`
            p-4 rounded-xl border
            ${productMetrics.lowStock > 200
              ? isDarkMode ? 'bg-earthy-yellow/5 border-earthy-yellow/20' : 'bg-earthy-yellow/5 border-earthy-yellow/20'
              : isDarkMode ? 'bg-sage-green/5 border-sage-green/20' : 'bg-sage-green/5 border-sage-green/20'
            }
          `}>
            <div className="flex items-center gap-3 mb-2">
              <Package className={`w-5 h-5 ${
                productMetrics.lowStock > 200 ? 'text-earthy-yellow' : 'text-sage-green'
              }`} />
              <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-text-dark'}`}>
                Inventory Health
              </span>
            </div>
            <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-text-muted'}`}>
              {productMetrics.lowStock} products need restocking, {productMetrics.outOfStock} are out of stock.
              {productMetrics.lowStock > 200 ? ' Attention required.' : ' Inventory levels healthy.'}
            </p>
          </div>

          <div className={`
            p-4 rounded-xl border
            ${isDarkMode ? 'bg-muted-olive/5 border-muted-olive/20' : 'bg-muted-olive/5 border-muted-olive/20'}
          `}>
            <div className="flex items-center gap-3 mb-2">
              <Star className="w-5 h-5 text-muted-olive" />
              <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-text-dark'}`}>
                Quality Metrics
              </span>
            </div>
            <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-text-muted'}`}>
              Platform average rating of {productMetrics.avgRating.toFixed(1)} stars with {productMetrics.returnRate.toFixed(1)}% return rate indicates high product quality.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ProductAnalytics;