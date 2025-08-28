/**
 * Dashboard Service - Admin V2
 * Business logic for dashboard data processing and transformations
 */

import { format } from 'date-fns';

/**
 * Transform dashboard metrics for KPI display
 */
export const transformDashboardMetrics = (rawData) => {
  if (!rawData?.data) return null;

  const { data } = rawData;
  
  return {
    kpis: [
      {
        id: 'total-users',
        title: 'Total Users',
        value: data.totalUsers || 0,
        change: data.userGrowth || 0,
        trend: data.userGrowth >= 0 ? 'up' : 'down',
        icon: 'Users',
        color: 'blue'
      },
      {
        id: 'pending-verifications', 
        title: 'Pending Verifications',
        value: data.pendingVerifications || 0,
        change: data.verificationChange || 0,
        trend: data.verificationChange <= 0 ? 'up' : 'down', // Less pending is good
        icon: 'Clock',
        color: 'amber',
        urgent: (data.pendingVerifications || 0) > 10
      },
      {
        id: 'active-vendors',
        title: 'Active Vendors', 
        value: data.activeVendors || 0,
        change: data.vendorGrowth || 0,
        trend: data.vendorGrowth >= 0 ? 'up' : 'down',
        icon: 'Store',
        color: 'green'
      },
      {
        id: 'total-revenue',
        title: 'Total Revenue',
        value: formatCurrency(data.totalRevenue || 0),
        change: data.revenueGrowth || 0,
        trend: data.revenueGrowth >= 0 ? 'up' : 'down', 
        icon: 'DollarSign',
        color: 'green'
      }
    ],
    charts: {
      userGrowth: transformTimeSeriesData(data.userGrowthChart || []),
      verificationQueue: transformVerificationQueueData(data.verificationQueue || []),
      revenueOvertime: transformTimeSeriesData(data.revenueChart || []),
      categoryPerformance: transformCategoryData(data.categoryPerformance)
    },
    alerts: transformSystemAlerts(data.systemAlerts || []),
    recentActivity: transformRecentActivity(data.recentActivity || [])
  };
};

/**
 * Transform time series data for charts
 */
const transformTimeSeriesData = (data) => {
  if (!Array.isArray(data)) return [];
  
  return data.map(item => {
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
      label: item.label || formattedDate
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
      color: '#F59E0B' // amber
    },
    {
      label: 'Under Review',
      value: data.underReview || 0,
      color: '#3B82F6' // blue  
    },
    {
      label: 'Approved Today',
      value: data.approvedToday || 0,
      color: '#10B981' // green
    },
    {
      label: 'Rejected',
      value: data.rejected || 0,
      color: '#EF4444' // red
    }
  ];
};

/**
 * Transform category performance data
 */
const transformCategoryData = (data) => {
  if (!Array.isArray(data)) return [];
  
  return data.map(category => ({
    name: category.name,
    value: category.orderCount || 0,
    revenue: category.revenue || 0,
    growth: category.growth || 0
  }));
};

/**
 * Transform system alerts for admin attention
 */
const transformSystemAlerts = (alerts) => {
  return alerts.map(alert => {
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
      category: alert.category || 'system'
    };
  });
};

/**
 * Transform recent activity for activity feed
 */
const transformRecentActivity = (activities) => {
  if (!activities || !Array.isArray(activities)) return [];
  
  return activities.map(activity => {
    // Safe date parsing with fallback
    let timestamp = 'Just now';
    try {
      if (activity.createdAt) {
        const date = new Date(activity.createdAt);
        if (!isNaN(date.getTime())) {
          timestamp = format(date, 'PPp');
        }
      }
    } catch (error) {
      console.warn('Invalid date format for activity:', activity.createdAt);
    }

    return {
      id: activity.id || Date.now() + Math.random(),
      type: activity.type || 'unknown',
      user: activity.user?.name || 'System',
      action: activity.action || 'performed an action',
      target: activity.target || 'system',
      timestamp,
      icon: getActivityIcon(activity.type),
      color: getActivityColor(activity.type)
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
    restaurant_approved: 'Store',
    product_created: 'Package',
    order_placed: 'ShoppingCart',
    listing_flagged: 'Flag',
    category_updated: 'Tags'
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
    restaurant_approved: 'green',
    product_created: 'purple',
    order_placed: 'blue',
    listing_flagged: 'red',
    category_updated: 'gray'
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
    maximumFractionDigits: 0
  }).format(value);
};

/**
 * Calculate verification urgency based on waiting time
 */
export const calculateVerificationUrgency = (createdAt) => {
  const daysWaiting = Math.floor((Date.now() - new Date(createdAt)) / (1000 * 60 * 60 * 24));
  
  if (daysWaiting >= 7) return 'critical'; // Red
  if (daysWaiting >= 3) return 'high';     // Orange  
  if (daysWaiting >= 1) return 'medium';   // Yellow
  return 'normal';                         // Green
};

/**
 * Generate dashboard filters for time periods
 */
export const getDashboardFilters = () => {
  return [
    { value: '24h', label: 'Last 24 Hours' },
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 90 Days' },
    { value: 'custom', label: 'Custom Range' }
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
      totalUsers: kpis.find(k => k.id === 'total-users')?.value || 0,
      pendingVerifications: kpis.find(k => k.id === 'pending-verifications')?.value || 0,
      activeVendors: kpis.find(k => k.id === 'active-vendors')?.value || 0,
      totalRevenue: kpis.find(k => k.id === 'total-revenue')?.value || 0
    },
    alerts: alerts.map(alert => ({
      type: alert.type,
      title: alert.title,
      message: alert.message,
      timestamp: alert.timestamp
    })),
    recentActivity: recentActivity.map(activity => ({
      type: activity.type,
      user: activity.user,
      action: activity.action,
      target: activity.target,
      timestamp: activity.timestamp
    }))
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
  data.alerts.forEach(alert => {
    lines.push(`${alert.type},${alert.title},"${alert.message}",${alert.timestamp}`);
  });
  lines.push('');

  // Recent activity section  
  lines.push('Recent Activity');
  lines.push('Type,User,Action,Target,Timestamp');
  data.recentActivity.forEach(activity => {
    lines.push(`${activity.type},${activity.user},${activity.action},${activity.target},${activity.timestamp}`);
  });

  return lines.join('\n');
};

const dashboardService = {
  transformDashboardMetrics,
  calculateVerificationUrgency,
  getDashboardFilters,
  generateDashboardExport
};

export default dashboardService;