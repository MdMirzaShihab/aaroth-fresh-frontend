import React, { useEffect } from 'react';
import { MapPin, Loader2 } from 'lucide-react';
import { useGetPublicMarketsQuery } from '../../store/slices/apiSlice';

/**
 * MarketSelector - Reusable market selection component
 *
 * Features:
 * - Auto-selects when only one market exists (hides dropdown)
 * - Integrates with React Hook Form
 * - Shows "Market Name - City" format
 * - Supports "All Markets" option for filters
 * - Mobile-optimized with touch-friendly design
 *
 * @param {Object} props
 * @param {string} props.value - Currently selected market ID
 * @param {Function} props.onChange - Callback for selection changes
 * @param {string} props.error - Validation error message
 * @param {boolean} props.required - Whether field is required
 * @param {boolean} props.disabled - Disabled state
 * @param {string} props.label - Custom label text
 * @param {string} props.className - Additional classes
 * @param {Object} props.register - React Hook Form register
 * @param {string} props.name - Form field name
 * @param {boolean} props.showAllOption - Show "All Markets" option for filters (default: false)
 */
const MarketSelector = ({
  value,
  onChange,
  error,
  required = false,
  disabled = false,
  label = 'Market',
  className = '',
  register,
  name,
  showAllOption = false,
}) => {
  const { data: marketsData, isLoading, isError } = useGetPublicMarketsQuery({});
  const markets = marketsData?.data || [];

  // Auto-select single market if not showing "All" option
  useEffect(() => {
    if (markets?.length === 1 && !value && !showAllOption && onChange) {
      onChange(markets[0]._id);
    }
  }, [markets, value, showAllOption, onChange]);

  // Loading state
  if (isLoading) {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-text-dark dark:text-white mb-2">
            {label} {required && <span className="text-tomato-red">*</span>}
          </label>
        )}
        <div className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-2xl bg-white dark:bg-gray-800 flex items-center gap-2">
          <Loader2 className="w-4 h-4 text-muted-olive animate-spin" />
          <span className="text-text-muted text-sm">Loading markets...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-text-dark dark:text-white mb-2">
            {label} {required && <span className="text-tomato-red">*</span>}
          </label>
        )}
        <div className="w-full px-4 py-3 border border-tomato-red/30 bg-tomato-red/5 rounded-2xl">
          <p className="text-tomato-red text-sm">Failed to load markets. Please refresh the page.</p>
        </div>
      </div>
    );
  }

  // Single market - show as read-only display (auto-selected)
  if (markets?.length === 1 && !showAllOption) {
    const market = markets[0];
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-text-dark dark:text-white mb-2">
            {label} {required && <span className="text-tomato-red">*</span>}
          </label>
        )}
        <div className="flex items-center gap-3 px-4 py-3 bg-sage-green/5 dark:bg-sage-green/10 border border-sage-green/20 dark:border-sage-green/30 rounded-2xl">
          <div className="w-10 h-10 bg-muted-olive/10 dark:bg-muted-olive/20 rounded-xl flex items-center justify-center">
            <MapPin className="w-5 h-5 text-muted-olive dark:text-sage-green" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-text-dark dark:text-white">
              {market.name}
            </p>
            <p className="text-xs text-text-muted dark:text-gray-400">
              {market.location?.city || 'Location'}
            </p>
          </div>
        </div>
        <p className="text-xs text-text-muted dark:text-gray-400 mt-2 flex items-center gap-1">
          <MapPin className="w-3 h-3" />
          Automatically selected - this is the only available market
        </p>
      </div>
    );
  }

  // Regular dropdown with multiple markets or "All" option
  const selectProps = register
    ? register(name, { required: required ? 'Please select a market' : false })
    : {
        value,
        onChange: (e) => onChange?.(e.target.value),
      };

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label
          htmlFor={name}
          className="block text-sm font-medium text-text-dark dark:text-white mb-2"
        >
          {label} {required && <span className="text-tomato-red">*</span>}
        </label>
      )}

      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
          <MapPin className="w-5 h-5 text-muted-olive dark:text-sage-green" />
        </div>

        <select
          id={name}
          disabled={disabled}
          className={`
            w-full pl-12 pr-4 py-3
            border rounded-2xl
            bg-white dark:bg-gray-800
            text-text-dark dark:text-white
            focus:outline-none focus:ring-2 focus:ring-muted-olive/20 dark:focus:ring-sage-green/20
            transition-all duration-200
            disabled:opacity-50 disabled:cursor-not-allowed
            appearance-none cursor-pointer
            touch-target
            ${error
              ? 'border-tomato-red/30 bg-tomato-red/5 focus:border-tomato-red/50 focus:ring-tomato-red/10'
              : 'border-gray-200 dark:border-gray-700 hover:border-muted-olive/30 dark:hover:border-sage-green/30'
            }
          `}
          {...selectProps}
        >
          {showAllOption && <option value="">All Markets</option>}

          {!showAllOption && !value && (
            <option value="" disabled>
              Select a market
            </option>
          )}

          {markets?.map((market) => (
            <option key={market._id} value={market._id}>
              {market.name} - {market.location?.city || 'Location'}
            </option>
          ))}
        </select>

        {/* Custom dropdown arrow */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
          <svg
            className="w-5 h-5 text-text-muted dark:text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>

      {error && (
        <p className="text-tomato-red/80 text-sm mt-2 flex items-center gap-2 animate-fade-in">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          {error}
        </p>
      )}

      {!error && !showAllOption && markets?.length > 1 && (
        <p className="text-xs text-text-muted dark:text-gray-400 mt-2">
          You can only create listings in markets where you operate
        </p>
      )}
    </div>
  );
};

export default MarketSelector;
