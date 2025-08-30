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
  Activity
} from 'lucide-react';
import { useTheme } from '../../../../hooks/useTheme';
import { Card } from '../../../../components/ui';

const HeroKPICards = ({ 
  kpis = [], 
  isLoading = false, 
  onCardClick, 
  realTimeEnabled = true 
}) => {
  const { isDarkMode } = useTheme();
  const [animatedValues, setAnimatedValues] = useState({});

  // Animate value changes for smooth transitions
  useEffect(() => {
    if (!kpis.length) return;

    kpis.forEach(kpi => {
      if (kpi.value !== animatedValues[kpi.id]) {
        setAnimatedValues(prev => ({
          ...prev,
          [kpi.id]: kpi.value
        }));
      }
    });
  }, [kpis, animatedValues]);

  // Get appropriate icon for KPI type
  const getKPIIcon = (iconName) => {
    const iconMap = {
      Users: Users,
      Store: Store,
      Clock: Clock,
      DollarSign: DollarSign,
      Package: Package,
      Activity: Activity
    };
    
    const IconComponent = iconMap[iconName] || Activity;
    return IconComponent;
  };

  // Get color scheme for KPI card
  const getCardColorScheme = (color, urgent = false) => {
    if (urgent) {
      return {
        iconBg: isDarkMode 
          ? 'bg-tomato-red/20 border border-tomato-red/30' 
          : 'bg-tomato-red/10 border border-tomato-red/20',
        iconColor: 'text-tomato-red',
        pulseColor: 'animate-pulse'
      };
    }

    const colorSchemes = {
      blue: {
        iconBg: isDarkMode 
          ? 'bg-blue-500/20 border border-blue-500/30' 
          : 'bg-blue-100 border border-blue-200',
        iconColor: isDarkMode ? 'text-blue-400' : 'text-blue-600'
      },
      green: {
        iconBg: isDarkMode 
          ? 'bg-sage-green/20 border border-sage-green/30' 
          : 'bg-sage-green/10 border border-sage-green/20',
        iconColor: isDarkMode ? 'text-sage-green' : 'text-muted-olive'
      },
      amber: {
        iconBg: isDarkMode 
          ? 'bg-earthy-yellow/20 border border-earthy-yellow/30' 
          : 'bg-earthy-yellow/10 border border-earthy-yellow/20',
        iconColor: isDarkMode ? 'text-earthy-yellow' : 'text-earthy-brown'
      },
      gray: {
        iconBg: isDarkMode 
          ? 'bg-gray-600/20 border border-gray-600/30' 
          : 'bg-gray-100 border border-gray-200',
        iconColor: isDarkMode ? 'text-gray-400' : 'text-gray-600'
      }
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
        ? (isDarkMode ? 'text-sage-green' : 'text-muted-olive')
        : 'text-tomato-red',
      prefix: isPositive ? '+' : '',
      value: Math.abs(change)
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
              ease: "easeOut"
            }}
            whileHover={{ 
              y: -2,
              transition: { duration: 0.2 }
            }}
            className="relative"
          >
            <Card 
              className={`
                p-6 cursor-pointer transition-all duration-300 group
                hover:shadow-xl hover:shadow-sage-green/10
                ${isDarkMode ? 'glass-2-dark border-dark-olive-border' : 'glass-2 border-sage-green/20'}
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
                  <div className={`w-2 h-2 rounded-full ${
                    isDarkMode ? 'bg-sage-green' : 'bg-muted-olive'
                  } animate-pulse`} />
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  {/* KPI Title */}
                  <p className={`
                    text-sm font-medium mb-2 truncate
                    ${isDarkMode ? 'text-dark-text-muted' : 'text-text-muted'}
                  `}>
                    {kpi.title}
                  </p>

                  {/* KPI Value */}
                  <motion.div
                    key={animatedValues[kpi.id]}
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <p className={`
                      text-2xl font-bold mb-2 truncate
                      ${isDarkMode ? 'text-dark-text-primary' : 'text-text-dark'}
                    `}>
                      {kpi.value}
                    </p>
                  </motion.div>

                  {/* Trend Indicator */}
                  <div className="flex items-center space-x-1">
                    <trendDisplay.Icon className={`
                      w-4 h-4 ${trendDisplay.color}
                      ${kpi.urgent ? 'animate-pulse' : ''}
                    `} />
                    <span className={`
                      text-sm font-medium ${trendDisplay.color}
                    `}>
                      {trendDisplay.prefix}{trendDisplay.value}%
                    </span>
                  </div>

                  {/* Description */}
                  {kpi.description && (
                    <p className={`
                      text-xs mt-2 opacity-70 truncate
                      ${isDarkMode ? 'text-dark-text-muted' : 'text-text-muted'}
                    `}>
                      {kpi.description}
                    </p>
                  )}
                </div>

                {/* Icon Container */}
                <div className={`
                  flex-shrink-0 ml-4 p-3 rounded-2xl transition-all duration-200
                  ${colorScheme.iconBg} ${colorScheme.pulseColor || ''}
                  group-hover:scale-105
                `}>
                  <IconComponent className={`
                    w-6 h-6 ${colorScheme.iconColor}
                  `} />
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
                      ${kpi.urgent 
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
                  <span className={`
                    text-xs ${isDarkMode ? 'text-dark-text-muted' : 'text-text-muted'}
                  `}>
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
  realTimeEnabled: true
};

export default HeroKPICards;