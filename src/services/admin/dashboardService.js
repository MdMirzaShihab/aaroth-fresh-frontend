/**
 * Dashboard Service - Admin V2
 * Business logic for dashboard data processing and transformations
 */

import { format } from 'date-fns';

/**
 * Transform dashboard metrics for KPI display
 * Updated to handle backend's nested data structure
 */
export const transformDashboardMetrics = (combinedData) => {
  if (!combinedData) return null;

  // Extract data from different endpoints
  const overviewData = combinedData.overview?.data || {};
  const analyticsData = combinedData.analytics?.data || {};
  const performanceData = combinedData.performance?.data || {};

  // Handle both direct data and nested data structures
  const data = combinedData.data || overviewData || combinedData;

  // Calculate total users from backend nested structure
  const totalUsers = (data.users?.totalVendors || 0) + (data.users?.totalBuyers || 0) + (data.users?.activeUsers || 0);
  
  // Extract analytics for growth calculations
  const userGrowth = calculateGrowthFromAnalytics(analyticsData?.userGrowth);
  const revenueGrowth = calculateGrowthFromAnalytics(analyticsData?.revenueTrends);

  return {
    kpis: [
      {
        id: 'total-users',
        title: 'Total Users',
        value: data.users?.activeUsers || totalUsers || 0,
        change: userGrowth,
        trend: userGrowth >= 0 ? 'up' : 'down',
        icon: 'Users',
        color: 'indigo',
      },
      {
        id: 'pending-verifications',
        title: 'Pending Verifications',
        value: data.users?.pendingApprovals || 0,
        change: 0, // Will be calculated from analytics
        trend: 'neutral',
        icon: 'Clock',
        color: 'amber',
        urgent: (data.users?.pendingApprovals || 0) > 5,
      },
      {
        id: 'active-vendors',
        title: 'Active Vendors',
        value: data.users?.totalVendors || 0,
        change: 0, // Will be calculated from analytics
        trend: 'up',
        icon: 'Store',
        color: 'green',
      },
      {
        id: 'total-revenue',
        title: 'Total Revenue',
        value: formatCurrency(data.orders?.totalRevenue || 0),
        change: revenueGrowth,
        trend: revenueGrowth >= 0 ? 'up' : 'down',
        icon: 'DollarSign',
        color: 'teal',
      },
      {
        id: 'active-listings',
        title: 'Active Listings',
        value: data.products?.activeListings || 0,
        change: 0,
        trend: 'up',
        icon: 'Package',
        color: 'blue',
      },
      {
        id: 'todays-orders',
        title: "Today's Orders",
        value: data.orders?.todayOrders || 0,
        change: 0,
        trend: 'neutral',
        icon: 'ShoppingCart',
        color: 'purple',
      },
    ],
    charts: {
      userGrowth: transformAnalyticsToTimeSeriesData(analyticsData?.userGrowth || {}),
      verificationQueue: transformVerificationQueueData({
        pending: data.users?.pendingApprovals || 0,
        underReview: 0,
        approvedToday: data.users?.newUsersToday || 0,
        rejected: 0,
      }),
      revenueOvertime: transformAnalyticsToTimeSeriesData(analyticsData?.revenueTrends || []),
      categoryPerformance: transformCategoryData(analyticsData?.topCategories || []),
    },
    alerts: transformSystemAlerts(performanceData?.systemAlerts || []),
    recentActivity: transformRecentActivity(data.recentActivity || []),
    rawData: data, // Keep raw data for debugging
  };
};

/**
 * Calculate growth percentage from analytics data
 */
const calculateGrowthFromAnalytics = (analyticsData) => {
  if (!analyticsData || Array.isArray(analyticsData) && analyticsData.length < 2) {
    return 0;
  }

  if (Array.isArray(analyticsData)) {
    // Handle revenue trends array
    const current = analyticsData[analyticsData.length - 1];
    const previous = analyticsData[analyticsData.length - 2];
    
    if (current && previous && previous.revenue > 0) {
      return ((current.revenue - previous.revenue) / previous.revenue * 100).toFixed(1);
    }
  } else if (typeof analyticsData === 'object') {
    // Handle user growth object structure
    const periods = Object.keys(analyticsData).sort();
    if (periods.length >= 2) {
      const currentPeriod = periods[periods.length - 1];
      const previousPeriod = periods[periods.length - 2];
      
      const currentTotal = Object.values(analyticsData[currentPeriod] || {}).reduce((sum, val) => sum + val, 0);
      const previousTotal = Object.values(analyticsData[previousPeriod] || {}).reduce((sum, val) => sum + val, 0);
      
      if (previousTotal > 0) {
        return ((currentTotal - previousTotal) / previousTotal * 100).toFixed(1);
      }
    }
  }

  return 0;
};

/**
 * Transform analytics data to time series format for charts
 */
const transformAnalyticsToTimeSeriesData = (analyticsData) => {
  if (Array.isArray(analyticsData)) {
    // Handle revenue trends array
    return analyticsData.map((item) => {
      let formattedDate = 'Invalid Date';
      try {
        if (item.period) {
          const date = new Date(item.period + '-01'); // Add day for month formats
          if (!isNaN(date.getTime())) {
            formattedDate = format(date, 'MMM dd');
          }
        }
      } catch (error) {
        console.warn('Invalid date format in analytics data:', item.period);
        formattedDate = item.period || 'Unknown';
      }

      return {
        date: formattedDate,
        value: item.revenue || item.orderCount || 0,
        label: formattedDate,
      };
    });
  } else if (typeof analyticsData === 'object') {
    // Handle user growth object structure
    return Object.entries(analyticsData).map(([period, data]) => {
      let formattedDate = 'Invalid Date';
      try {
        const date = new Date(period + '-01');
        if (!isNaN(date.getTime())) {
          formattedDate = format(date, 'MMM dd');
        }
      } catch (error) {
        console.warn('Invalid date format in analytics data:', period);
        formattedDate = period;
      }

      const totalValue = Object.values(data || {}).reduce((sum, val) => sum + val, 0);

      return {
        date: formattedDate,
        value: totalValue,
        label: formattedDate,
      };
    });
  }

  return [];
};

/**
 * Transform time series data for charts
 */
const transformTimeSeriesData = (data) => {
  if (!Array.isArray(data)) return [];

  return data.map((item) => {
    let formattedDate = 'Invalid Date';
    try {
      if (item.date) {
        const date = new Date(item.date);
        if (!isNaN(date.getTime())) {
          formattedDate = format(date, 'MMM dd');
        }
      }
    } catch (error) {
      console.warn('Invalid date format in time series:', item.date);
      formattedDate = item.date || 'Unknown';
    }

    return {
      date: formattedDate,
      value: item.value || 0,
      label: item.label || formattedDate,
    };
  });
};

/**
 * Transform verification queue data for workflow visualization
 */
const transformVerificationQueueData = (data) => {
  if (!data) return [];

  return [
    {
      label: 'Pending',
      value: data.pending || 0,
      color: '#F59E0B', // amber
    },
    {
      label: 'Under Review',
      value: data.underReview || 0,
      color: '#3B82F6', // blue
    },
    {
      label: 'Approved Today',
      value: data.approvedToday || 0,
      color: '#10B981', // green
    },
    {
      label: 'Rejected',
      value: data.rejected || 0,
      color: '#EF4444', // red
    },
  ];
};

/**
 * Transform category performance data
 */
const transformCategoryData = (data) => {
  if (!Array.isArray(data)) return [];

  return data.map((category) => ({
    name: category.categoryName || category.name || 'Unknown',
    value: category.orderCount || 0,
    revenue: category.totalRevenue || category.revenue || 0,
    growth: category.growth || 0,
    categoryId: category.categoryId || category._id,
  }));
};

/**
 * Transform system alerts for admin attention
 */
const transformSystemAlerts = (alerts) => {
  return alerts.map((alert) => {
    let timestamp = null;
    try {
      if (alert.createdAt) {
        const date = new Date(alert.createdAt);
        if (!isNaN(date.getTime())) {
          timestamp = format(date, 'PPp');
        }
      }
    } catch (error) {
      console.warn('Invalid date format for alert:', alert.createdAt);
    }

    return {
      id: alert.id || Math.random().toString(36).substr(2, 9),
      type: alert.type || 'info',
      title: alert.title,
      message: alert.message,
      timestamp,
      urgent: alert.urgent || false,
      actionable: alert.actionable || false,
      category: alert.category || 'system',
    };
  });
};

/**
 * Transform recent activity for activity feed
 */
const transformRecentActivity = (activities) => {
  if (!activities || !Array.isArray(activities)) {
    // Return empty array with placeholder if no activities
    return [];
  }

  return activities.map((activity) => {
    // Safe date parsing with fallback
    let timestamp = 'Just now';
    try {
      if (activity.timestamp || activity.createdAt) {
        const date = new Date(activity.timestamp || activity.createdAt);
        if (!isNaN(date.getTime())) {
          timestamp = format(date, 'PPp');
        }
      }
    } catch (error) {
      console.warn('Invalid date format for activity:', activity.timestamp || activity.createdAt);
    }

    return {
      id: activity.id || activity._id || Date.now() + Math.random(),
      type: activity.type || 'system_activity',
      user: activity.userName || activity.user?.name || 'System',
      action: activity.description || activity.action || 'performed an action',
      target: activity.target || 'system',
      timestamp,
      icon: getActivityIcon(activity.type),
      color: getActivityColor(activity.type),
      userId: activity.userId,
    };
  });
};

/**
 * Get activity icon based on type
 */
const getActivityIcon = (type) => {
  const iconMap = {
    user_registered: 'UserPlus',
    vendor_verified: 'CheckCircle',
    buyer_approved: 'Store',
    product_created: 'Package',
    order_placed: 'Package', // Changed from ShoppingCart to Package since it's imported
    listing_flagged: 'Flag',
    category_updated: 'Tags',
    user_registration: 'UserPlus',
    system_activity: 'Activity',
  };

  return iconMap[type] || 'Activity';
};

/**
 * Get activity color based on type
 */
const getActivityColor = (type) => {
  const colorMap = {
    user_registered: 'blue',
    vendor_verified: 'green',
    buyer_approved: 'green',
    product_created: 'purple',
    order_placed: 'blue',
    listing_flagged: 'red',
    category_updated: 'gray',
  };

  return colorMap[type] || 'gray';
};

/**
 * Format currency values
 */
const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

/**
 * Calculate verification urgency based on waiting time
 */
export const calculateVerificationUrgency = (createdAt) => {
  const daysWaiting = Math.floor(
    (Date.now() - new Date(createdAt)) / (1000 * 60 * 60 * 24)
  );

  if (daysWaiting >= 7) return 'critical'; // Red
  if (daysWaiting >= 3) return 'high'; // Orange
  if (daysWaiting >= 1) return 'medium'; // Yellow
  return 'normal'; // Green
};

/**
 * Generate dashboard filters for time periods
 */
export const getDashboardFilters = () => {
  return [
    { value: 'day', label: 'Last 24 Hours' },
    { value: 'week', label: 'Last 7 Days' },
    { value: 'month', label: 'Last 30 Days' },
    { value: 'quarter', label: 'Last 90 Days' },
    { value: 'year', label: 'Last Year' },
    { value: 'custom', label: 'Custom Range' },
  ];
};

/**
 * Generate export data for dashboard reports
 */
export const generateDashboardExport = (dashboardData, format = 'csv') => {
  const { kpis, alerts, recentActivity } = dashboardData;

  const exportData = {
    summary: {
      generatedAt: format(new Date(), 'PPP'),
      totalUsers: kpis.find((k) => k.id === 'total-users')?.value || 0,
      pendingVerifications:
        kpis.find((k) => k.id === 'pending-verifications')?.value || 0,
      activeVendors: kpis.find((k) => k.id === 'active-vendors')?.value || 0,
      totalRevenue: kpis.find((k) => k.id === 'total-revenue')?.value || 0,
    },
    alerts: alerts.map((alert) => ({
      type: alert.type,
      title: alert.title,
      message: alert.message,
      timestamp: alert.timestamp,
    })),
    recentActivity: recentActivity.map((activity) => ({
      type: activity.type,
      user: activity.user,
      action: activity.action,
      target: activity.target,
      timestamp: activity.timestamp,
    })),
  };

  if (format === 'json') {
    return JSON.stringify(exportData, null, 2);
  }

  // Convert to CSV format
  return convertToCSV(exportData);
};

/**
 * Convert data to CSV format
 */
const convertToCSV = (data) => {
  const lines = [];

  // Summary section
  lines.push('Dashboard Summary');
  lines.push(`Generated At,${data.summary.generatedAt}`);
  lines.push(`Total Users,${data.summary.totalUsers}`);
  lines.push(`Pending Verifications,${data.summary.pendingVerifications}`);
  lines.push(`Active Vendors,${data.summary.activeVendors}`);
  lines.push(`Total Revenue,${data.summary.totalRevenue}`);
  lines.push('');

  // Alerts section
  lines.push('System Alerts');
  lines.push('Type,Title,Message,Timestamp');
  data.alerts.forEach((alert) => {
    lines.push(
      `${alert.type},${alert.title},"${alert.message}",${alert.timestamp}`
    );
  });
  lines.push('');

  // Recent activity section
  lines.push('Recent Activity');
  lines.push('Type,User,Action,Target,Timestamp');
  data.recentActivity.forEach((activity) => {
    lines.push(
      `${activity.type},${activity.user},${activity.action},${activity.target},${activity.timestamp}`
    );
  });

  return lines.join('\n');
};

const dashboardService = {
  transformDashboardMetrics,
  calculateVerificationUrgency,
  getDashboardFilters,
  generateDashboardExport,
};

export default dashboardService;
