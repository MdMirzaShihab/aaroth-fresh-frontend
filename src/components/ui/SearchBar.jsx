import React, { useState, useRef, useEffect } from 'react';
import { Search, X, Filter, ChevronDown } from 'lucide-react';
import { cn } from '../../utils';
import { Input } from './Input';
import Button from './Button';

const SearchBar = ({
  value = '',
  onChange,
  onSearch,
  onClear,
  placeholder = 'Search...',
  className,
  showFilters = false,
  filters = [],
  selectedFilters = {},
  onFilterChange,
  suggestions = [],
  showSuggestions = false,
  onSuggestionSelect,
  loading = false,
  debounceMs = 300,
  ...props
}) => {
  const [internalValue, setInternalValue] = useState(value);
  const [showSuggestionsList, setShowSuggestionsList] = useState(false);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const searchRef = useRef(null);
  const debounceRef = useRef(null);

  // Handle debounced search
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      if (onChange) {
        onChange(internalValue);
      }
    }, debounceMs);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [internalValue, onChange, debounceMs]);

  // Update internal value when prop changes
  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  const handleInputChange = (e) => {
    setInternalValue(e.target.value);
    if (showSuggestions && e.target.value.length > 0) {
      setShowSuggestionsList(true);
    } else {
      setShowSuggestionsList(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(internalValue);
    }
    setShowSuggestionsList(false);
  };

  const handleClear = () => {
    setInternalValue('');
    setShowSuggestionsList(false);
    if (onClear) {
      onClear();
    }
    if (onChange) {
      onChange('');
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setInternalValue(suggestion.value || suggestion);
    setShowSuggestionsList(false);
    if (onSuggestionSelect) {
      onSuggestionSelect(suggestion);
    }
  };

  const handleFilterChange = (filterKey, filterValue) => {
    if (onFilterChange) {
      onFilterChange({
        ...selectedFilters,
        [filterKey]: filterValue
      });
    }
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestionsList(false);
        setShowFilterPanel(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const hasActiveFilters = Object.values(selectedFilters).some(value => 
    Array.isArray(value) ? value.length > 0 : value
  );

  return (
    <div ref={searchRef} className={cn('relative', className)} {...props}>
      {/* Main Search Input */}
      <form onSubmit={handleSearch} className="relative flex items-center gap-2">
        <div className="flex-1 relative">
          <Input
            variant="search"
            value={internalValue}
            onChange={handleInputChange}
            placeholder={placeholder}
            onFocus={() => {
              if (showSuggestions && internalValue.length > 0) {
                setShowSuggestionsList(true);
              }
            }}
            rightIcon={
              internalValue.length > 0 ? (
                <button
                  type="button"
                  onClick={handleClear}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors duration-200"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              ) : null
            }
          />
        </div>

        {/* Filter Toggle Button */}
        {showFilters && (
          <Button
            type="button"
            variant={hasActiveFilters ? 'primary' : 'outline'}
            size="default"
            onClick={() => setShowFilterPanel(!showFilterPanel)}
            className="flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            <span className="hidden sm:inline">Filters</span>
            {hasActiveFilters && (
              <span className="bg-white/20 text-xs px-1.5 py-0.5 rounded-full">
                {Object.values(selectedFilters).filter(v => Array.isArray(v) ? v.length > 0 : v).length}
              </span>
            )}
          </Button>
        )}

        {/* Search Button */}
        <Button
          type="submit"
          variant="primary"
          size="default"
          loading={loading}
          className="flex items-center gap-2"
        >
          <Search className="w-4 h-4" />
          <span className="hidden sm:inline">Search</span>
        </Button>
      </form>

      {/* Suggestions Dropdown */}
      {showSuggestions && showSuggestionsList && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 py-2 z-50 max-h-60 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleSuggestionClick(suggestion)}
              className="w-full px-4 py-2 text-left hover:bg-bottle-green/5 transition-colors duration-200 flex items-center gap-3 min-h-[44px]"
            >
              <Search className="w-4 h-4 text-text-muted flex-shrink-0" />
              <span className="flex-1 truncate">
                {suggestion.label || suggestion.value || suggestion}
              </span>
              {suggestion.category && (
                <span className="text-xs text-text-muted bg-earthy-beige/50 px-2 py-1 rounded-full">
                  {suggestion.category}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Filter Panel */}
      {showFilters && showFilterPanel && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-6 z-50 animate-scale-in">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-text-dark">Filters</h3>
            <button
              onClick={() => setShowFilterPanel(false)}
              className="p-2 hover:bg-gray-100 rounded-2xl transition-colors duration-200 min-h-[36px] min-w-[36px]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-4">
            {filters.map((filter) => (
              <div key={filter.key} className="space-y-2">
                <label className="text-sm font-medium text-text-dark">
                  {filter.label}
                </label>
                
                {filter.type === 'select' && (
                  <select
                    value={selectedFilters[filter.key] || ''}
                    onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                    className="w-full px-4 py-2 rounded-2xl bg-earthy-beige/30 border-0 focus:bg-white focus:shadow-lg transition-all duration-300 min-h-[44px]"
                  >
                    <option value="">All {filter.label}</option>
                    {filter.options.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                )}

                {filter.type === 'multiselect' && (
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {filter.options.map((option) => (
                      <label key={option.value} className="flex items-center gap-2 text-sm min-h-[32px]">
                        <input
                          type="checkbox"
                          checked={(selectedFilters[filter.key] || []).includes(option.value)}
                          onChange={(e) => {
                            const currentValues = selectedFilters[filter.key] || [];
                            const newValues = e.target.checked
                              ? [...currentValues, option.value]
                              : currentValues.filter(v => v !== option.value);
                            handleFilterChange(filter.key, newValues);
                          }}
                          className="w-4 h-4 rounded text-bottle-green focus:ring-bottle-green"
                        />
                        <span>{option.label}</span>
                      </label>
                    ))}
                  </div>
                )}

                {filter.type === 'range' && (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={selectedFilters[filter.key]?.min || ''}
                      onChange={(e) => handleFilterChange(filter.key, {
                        ...selectedFilters[filter.key],
                        min: e.target.value
                      })}
                      className="flex-1 px-3 py-2 rounded-2xl bg-earthy-beige/30 border-0 focus:bg-white focus:shadow-lg transition-all duration-300 min-h-[40px]"
                    />
                    <span className="text-text-muted">to</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={selectedFilters[filter.key]?.max || ''}
                      onChange={(e) => handleFilterChange(filter.key, {
                        ...selectedFilters[filter.key],
                        max: e.target.value
                      })}
                      className="flex-1 px-3 py-2 rounded-2xl bg-earthy-beige/30 border-0 focus:bg-white focus:shadow-lg transition-all duration-300 min-h-[40px]"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Filter Actions */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
            <button
              onClick={() => {
                if (onFilterChange) {
                  onFilterChange({});
                }
              }}
              className="text-sm text-text-muted hover:text-text-dark transition-colors duration-200"
            >
              Clear all filters
            </button>
            
            <Button
              onClick={() => setShowFilterPanel(false)}
              variant="primary"
              size="sm"
            >
              Apply Filters
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

// Compact Search Bar for smaller spaces
export const CompactSearchBar = ({
  value = '',
  onChange,
  onSearch,
  placeholder = 'Search...',
  className,
  loading = false,
  ...props
}) => {
  const [internalValue, setInternalValue] = useState(value);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(internalValue);
    }
  };

  const handleInputChange = (e) => {
    setInternalValue(e.target.value);
    if (onChange) {
      onChange(e.target.value);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={cn('flex items-center gap-2', className)} {...props}>
      <Input
        variant="search"
        value={internalValue}
        onChange={handleInputChange}
        placeholder={placeholder}
        className="flex-1"
      />
      <Button
        type="submit"
        variant="ghost"
        size="icon"
        loading={loading}
        className="flex-shrink-0"
      >
        <Search className="w-4 h-4" />
      </Button>
    </form>
  );
};

export default SearchBar;