/**
 * HeroKPICards - Enhanced KPI Display Component
 * Features: Real-time updates, trend indicators, urgent alerts, mobile-responsive design
 * Follows Organic Futurism design with glassmorphic styling and micro-animations
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Store,
  Clock,
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Package,
  Activity,
} from 'lucide-react';
import { useTheme } from '../../../../hooks/useTheme';
import { Card } from '../../../../components/ui';

const HeroKPICards = ({
  kpis = [],
  isLoading = false,
  onCardClick,
  realTimeEnabled = true,
}) => {
  const { isDarkMode } = useTheme();
  const [animatedValues, setAnimatedValues] = useState({});

  // Animate value changes for smooth transitions
  useEffect(() => {
    if (!kpis.length) return;

    kpis.forEach((kpi) => {
      if (kpi.value !== animatedValues[kpi.id]) {
        setAnimatedValues((prev) => ({
          ...prev,
          [kpi.id]: kpi.value,
        }));
      }
    });
  }, [kpis, animatedValues]);

  // Get appropriate icon for KPI type
  const getKPIIcon = (iconName) => {
    const iconMap = {
      Users,
      Store,
      Clock,
      DollarSign,
      Package,
      Activity,
    };

    const IconComponent = iconMap[iconName] || Activity;
    return IconComponent;
  };

  // Get color scheme for KPI card
  const getCardColorScheme = (color, urgent = false) => {
    if (urgent) {
      return {
        cardBg: isDarkMode
          ? 'bg-tomato-red/10 backdrop-blur-sm'
          : 'bg-tomato-red/5 backdrop-blur-sm',
        cardBorder: isDarkMode
          ? 'border-2 border-tomato-red/30'
          : 'border-2 border-tomato-red/20',
        cardShadow: 'hover:shadow-tomato-red/20',
        iconBg: isDarkMode
          ? 'bg-tomato-red/30 border-2 border-tomato-red/50'
          : 'bg-tomato-red/20 border-2 border-tomato-red/40',
        iconColor: 'text-tomato-red',
        pulseColor: 'animate-pulse',
      };
    }

    const colorSchemes = {
      blue: {
        cardBg: isDarkMode
          ? 'bg-blue-500/10 backdrop-blur-sm'
          : 'bg-blue-50/80 backdrop-blur-sm',
        cardBorder: isDarkMode
          ? 'border-2 border-blue-500/30'
          : 'border-2 border-blue-200/50',
        cardShadow: 'hover:shadow-blue-500/20',
        iconBg: isDarkMode
          ? 'bg-blue-500/30 border-2 border-blue-500/50'
          : 'bg-blue-100 border-2 border-blue-300',
        iconColor: isDarkMode ? 'text-blue-400' : 'text-blue-600',
      },
      green: {
        cardBg: isDarkMode
          ? 'bg-emerald-500/10 backdrop-blur-sm'
          : 'bg-emerald-50/80 backdrop-blur-sm',
        cardBorder: isDarkMode
          ? 'border-2 border-emerald-500/30'
          : 'border-2 border-emerald-200/50',
        cardShadow: 'hover:shadow-emerald-500/20',
        iconBg: isDarkMode
          ? 'bg-emerald-500/30 border-2 border-emerald-500/50'
          : 'bg-emerald-100 border-2 border-emerald-300',
        iconColor: isDarkMode ? 'text-emerald-400' : 'text-emerald-600',
      },
      amber: {
        cardBg: isDarkMode
          ? 'bg-amber-500/10 backdrop-blur-sm'
          : 'bg-amber-50/80 backdrop-blur-sm',
        cardBorder: isDarkMode
          ? 'border-2 border-amber-500/30'
          : 'border-2 border-amber-200/50',
        cardShadow: 'hover:shadow-amber-500/20',
        iconBg: isDarkMode
          ? 'bg-amber-500/30 border-2 border-amber-500/50'
          : 'bg-amber-100 border-2 border-amber-300',
        iconColor: isDarkMode ? 'text-amber-400' : 'text-amber-600',
      },
      purple: {
        cardBg: isDarkMode
          ? 'bg-purple-500/10 backdrop-blur-sm'
          : 'bg-purple-50/80 backdrop-blur-sm',
        cardBorder: isDarkMode
          ? 'border-2 border-purple-500/30'
          : 'border-2 border-purple-200/50',
        cardShadow: 'hover:shadow-purple-500/20',
        iconBg: isDarkMode
          ? 'bg-purple-500/30 border-2 border-purple-500/50'
          : 'bg-purple-100 border-2 border-purple-300',
        iconColor: isDarkMode ? 'text-purple-400' : 'text-purple-600',
      },
      teal: {
        cardBg: isDarkMode
          ? 'bg-teal-500/10 backdrop-blur-sm'
          : 'bg-teal-50/80 backdrop-blur-sm',
        cardBorder: isDarkMode
          ? 'border-2 border-teal-500/30'
          : 'border-2 border-teal-200/50',
        cardShadow: 'hover:shadow-teal-500/20',
        iconBg: isDarkMode
          ? 'bg-teal-500/30 border-2 border-teal-500/50'
          : 'bg-teal-100 border-2 border-teal-300',
        iconColor: isDarkMode ? 'text-teal-400' : 'text-teal-600',
      },
      rose: {
        cardBg: isDarkMode
          ? 'bg-rose-500/10 backdrop-blur-sm'
          : 'bg-rose-50/80 backdrop-blur-sm',
        cardBorder: isDarkMode
          ? 'border-2 border-rose-500/30'
          : 'border-2 border-rose-200/50',
        cardShadow: 'hover:shadow-rose-500/20',
        iconBg: isDarkMode
          ? 'bg-rose-500/30 border-2 border-rose-500/50'
          : 'bg-rose-100 border-2 border-rose-300',
        iconColor: isDarkMode ? 'text-rose-400' : 'text-rose-600',
      },
      indigo: {
        cardBg: isDarkMode
          ? 'bg-indigo-500/10 backdrop-blur-sm'
          : 'bg-indigo-50/80 backdrop-blur-sm',
        cardBorder: isDarkMode
          ? 'border-2 border-indigo-500/30'
          : 'border-2 border-indigo-200/50',
        cardShadow: 'hover:shadow-indigo-500/20',
        iconBg: isDarkMode
          ? 'bg-indigo-500/30 border-2 border-indigo-500/50'
          : 'bg-indigo-100 border-2 border-indigo-300',
        iconColor: isDarkMode ? 'text-indigo-400' : 'text-indigo-600',
      },
      gray: {
        cardBg: isDarkMode
          ? 'bg-gray-600/10 backdrop-blur-sm'
          : 'bg-gray-50/80 backdrop-blur-sm',
        cardBorder: isDarkMode
          ? 'border-2 border-gray-600/30'
          : 'border-2 border-gray-200/50',
        cardShadow: 'hover:shadow-gray-500/20',
        iconBg: isDarkMode
          ? 'bg-gray-600/30 border-2 border-gray-600/50'
          : 'bg-gray-200 border-2 border-gray-300',
        iconColor: isDarkMode ? 'text-gray-400' : 'text-gray-600',
      },
    };

    return colorSchemes[color] || colorSchemes.gray;
  };

  // Get trend icon and styling
  const getTrendDisplay = (trend, change) => {
    const isPositive = trend === 'up';
    const TrendIcon = isPositive ? TrendingUp : TrendingDown;

    return {
      Icon: TrendIcon,
      color: isPositive
        ? isDarkMode
          ? 'text-sage-green'
          : 'text-muted-olive'
        : 'text-tomato-red',
      prefix: isPositive ? '+' : '',
      value: Math.abs(change),
    };
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, index) => (
          <Card key={index} className="p-6 animate-pulse">
            <div className="flex items-center justify-between">
              <div className="space-y-3 flex-1">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
              </div>
              <div className="w-14 h-14 bg-gray-200 dark:bg-gray-700 rounded-2xl" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {kpis.map((kpi, index) => {
        const colorScheme = getCardColorScheme(kpi.color, kpi.urgent);
        const trendDisplay = getTrendDisplay(kpi.trend, kpi.change);
        const IconComponent = getKPIIcon(kpi.icon);

        return (
          <motion.div
            key={kpi.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: index * 0.1,
              duration: 0.3,
              ease: 'easeOut',
            }}
            whileHover={{
              y: -2,
              transition: { duration: 0.2 },
            }}
            className="relative"
          >
            <Card
              className={`
                p-6 cursor-pointer transition-all duration-300 group
                hover:shadow-xl ${colorScheme.cardShadow}
                ${colorScheme.cardBg}
                ${colorScheme.cardBorder}
                ${kpi.urgent ? 'ring-2 ring-tomato-red/20' : ''}
                touch-target
              `}
              onClick={() => onCardClick?.(kpi)}
            >
              {/* Urgent Alert Badge */}
              {kpi.urgent && (
                <div className="absolute -top-2 -right-2 z-10">
                  <div className="flex items-center justify-center w-6 h-6 bg-tomato-red rounded-full animate-pulse">
                    <AlertTriangle className="w-3 h-3 text-white" />
                  </div>
                </div>
              )}

              {/* Real-time Status Indicator */}
              {realTimeEnabled && (
                <div className="absolute top-4 right-4">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      isDarkMode ? 'bg-sage-green' : 'bg-muted-olive'
                    } animate-pulse`}
                  />
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  {/* KPI Title */}
                  <p
                    className={`
                    text-sm font-medium mb-2 truncate
                    ${isDarkMode ? 'text-dark-text-muted' : 'text-text-muted'}
                  `}
                  >
                    {kpi.title}
                  </p>

                  {/* KPI Value */}
                  <motion.div
                    key={animatedValues[kpi.id]}
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <p
                      className={`
                      text-2xl font-bold mb-2 truncate
                      ${isDarkMode ? 'text-dark-text-primary' : 'text-text-dark'}
                    `}
                    >
                      {kpi.value}
                    </p>
                  </motion.div>

                  {/* Trend Indicator */}
                  <div className="flex items-center space-x-1">
                    <trendDisplay.Icon
                      className={`
                      w-4 h-4 ${trendDisplay.color}
                      ${kpi.urgent ? 'animate-pulse' : ''}
                    `}
                    />
                    <span
                      className={`
                      text-sm font-medium ${trendDisplay.color}
                    `}
                    >
                      {trendDisplay.prefix}
                      {trendDisplay.value}%
                    </span>
                  </div>

                  {/* Description */}
                  {kpi.description && (
                    <p
                      className={`
                      text-xs mt-2 opacity-70 truncate
                      ${isDarkMode ? 'text-dark-text-muted' : 'text-text-muted'}
                    `}
                    >
                      {kpi.description}
                    </p>
                  )}
                </div>

                {/* Icon Container */}
                <div
                  className={`
                  flex-shrink-0 ml-4 p-3 rounded-2xl transition-all duration-200
                  ${colorScheme.iconBg} ${colorScheme.pulseColor || ''}
                  group-hover:scale-105
                `}
                >
                  <IconComponent
                    className={`
                    w-6 h-6 ${colorScheme.iconColor}
                  `}
                  />
                </div>
              </div>

              {/* Performance Indicator Bar */}
              {kpi.progress !== undefined && (
                <div className="mt-4 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${kpi.progress}%` }}
                    transition={{ duration: 1, delay: index * 0.1 }}
                    className={`
                      h-full rounded-full
                      ${
                        kpi.urgent
                          ? 'bg-tomato-red'
                          : isDarkMode
                            ? 'bg-sage-green'
                            : 'bg-muted-olive'
                      }
                    `}
                  />
                </div>
              )}

              {/* Last Updated Indicator */}
              {kpi.lastUpdated && (
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <span
                    className={`
                    text-xs ${isDarkMode ? 'text-dark-text-muted' : 'text-text-muted'}
                  `}
                  >
                    Updated {kpi.lastUpdated}
                  </span>
                  {kpi.verified && (
                    <CheckCircle className="w-3 h-3 text-sage-green" />
                  )}
                </div>
              )}
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
};

// Default props for standalone usage
HeroKPICards.defaultProps = {
  kpis: [],
  isLoading: false,
  realTimeEnabled: true,
};

export default HeroKPICards;
