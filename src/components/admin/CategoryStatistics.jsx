import React from 'react';
import {
  Tag,
  CheckCircle,
  AlertTriangle,
  Eye,
  EyeOff,
  Package,
  TrendingUp,
  BarChart3,
  Layers,
} from 'lucide-react';
import { Card } from '../ui/Card';

const CategoryStatistics = ({ stats, isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, index) => (
          <Card key={index} className="p-6 animate-pulse">
            <div className="flex items-center justify-between">
              <div>
                <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-16"></div>
              </div>
              <div className="w-12 h-12 bg-gray-200 rounded-2xl"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  const statisticsCards = [
    {
      title: 'Total Categories',
      value: stats?.totalCategories || 0,
      icon: Tag,
      color: 'text-bottle-green',
      bgColor: 'bg-bottle-green/10',
      description: 'All categories in system',
    },
    {
      title: 'Active Categories',
      value: stats?.activeCategories || 0,
      icon: CheckCircle,
      color: 'text-mint-fresh',
      bgColor: 'bg-mint-fresh/10',
      description: 'Currently active categories',
      percentage:
        stats?.totalCategories > 0
          ? Math.round((stats.activeCategories / stats.totalCategories) * 100)
          : 0,
    },
    {
      title: 'Available Categories',
      value: stats?.availableCategories || 0,
      icon: Eye,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      description: 'Not flagged categories',
      percentage:
        stats?.totalCategories > 0
          ? Math.round(
              (stats.availableCategories / stats.totalCategories) * 100
            )
          : 0,
    },
    {
      title: 'Flagged Categories',
      value: stats?.flaggedCategories || 0,
      icon: AlertTriangle,
      color: 'text-tomato-red',
      bgColor: 'bg-tomato-red/10',
      description: 'Categories with issues',
      percentage:
        stats?.totalCategories > 0
          ? Math.round((stats.flaggedCategories / stats.totalCategories) * 100)
          : 0,
    },
  ];

  return (
    <div className="space-y-6 mb-8">
      {/* Main Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statisticsCards.map((stat, index) => (
          <Card
            key={index}
            className="p-6 hover:shadow-lg transition-all duration-300 group"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-text-muted mb-1">
                  {stat.title}
                </p>
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-bold text-text-dark">
                    {stat.value}
                  </p>
                  {stat.percentage !== undefined && (
                    <span className="text-sm text-text-muted">
                      {stat.percentage}%
                    </span>
                  )}
                </div>
                <p className="text-xs text-text-muted mt-1">
                  {stat.description}
                </p>
              </div>
              <div
                className={`p-3 rounded-2xl ${stat.bgColor} group-hover:scale-110 transition-transform duration-200`}
              >
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Category Health Overview */}
      {stats && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-bottle-green" />
            <h3 className="text-lg font-semibold text-text-dark">
              Category Health Overview
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Health Status Bars */}
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm font-medium mb-1">
                  <span className="text-text-dark">Active Status</span>
                  <span className="text-mint-fresh">
                    {stats.totalCategories > 0
                      ? Math.round(
                          (stats.activeCategories / stats.totalCategories) * 100
                        )
                      : 0}
                    %
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-mint-fresh h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${
                        stats.totalCategories > 0
                          ? (stats.activeCategories / stats.totalCategories) *
                            100
                          : 0
                      }%`,
                    }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm font-medium mb-1">
                  <span className="text-text-dark">Availability</span>
                  <span className="text-blue-600">
                    {stats.totalCategories > 0
                      ? Math.round(
                          (stats.availableCategories / stats.totalCategories) *
                            100
                        )
                      : 0}
                    %
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${
                        stats.totalCategories > 0
                          ? (stats.availableCategories /
                              stats.totalCategories) *
                            100
                          : 0
                      }%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Category Levels Distribution */}
            <div>
              <h4 className="text-sm font-medium text-text-dark mb-3">
                Level Distribution
              </h4>
              <div className="space-y-2">
                {[0, 1, 2, 3].map((level) => {
                  const levelCount = stats.levelDistribution?.[level] || 0;
                  const levelPercentage =
                    stats.totalCategories > 0
                      ? (levelCount / stats.totalCategories) * 100
                      : 0;

                  return (
                    <div
                      key={level}
                      className="flex items-center justify-between text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <Layers className="w-3 h-3 text-text-muted" />
                        <span className="text-text-muted">Level {level}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-text-dark font-medium">
                          {levelCount}
                        </span>
                        <span className="text-text-muted">
                          ({levelPercentage.toFixed(0)}%)
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Actions */}
            <div>
              <h4 className="text-sm font-medium text-text-dark mb-3">
                Quick Insights
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <span className="text-text-muted">
                    Categories with products
                  </span>
                  <span className="text-text-dark font-medium">
                    {stats.categoriesWithProducts || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <span className="text-text-muted">Empty categories</span>
                  <span className="text-text-dark font-medium">
                    {(stats.totalCategories || 0) -
                      (stats.categoriesWithProducts || 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <span className="text-text-muted">Root categories</span>
                  <span className="text-text-dark font-medium">
                    {stats.levelDistribution?.[0] || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default CategoryStatistics;
