import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { Search, Check, Package, X } from 'lucide-react';
import { useGetPublicProductsQuery } from '../../store/slices/apiSlice';
import LoadingSpinner from '../ui/LoadingSpinner';

/**
 * ProductFilterAutocomplete Component
 *
 * Searchable autocomplete for product filtering with:
 * - Debounced search (300ms)
 * - Single-select with radio button indicators
 * - Shows listing count and category for each product
 * - Keyboard navigation (arrow keys, Enter, Escape)
 * - Mobile-responsive with touch-friendly targets
 * - Futuristic minimalism design
 */
const ProductFilterAutocomplete = ({
  selectedCategory = 'all',
  selectedProduct = 'all',
  onProductSelect,
  className = '',
}) => {
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);

  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  // Debounce search input (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput]);

  // Fetch products with search and category filters
  const { data: productsData, isLoading } = useGetPublicProductsQuery(
    {
      category: selectedCategory !== 'all' ? selectedCategory : undefined,
      search: debouncedSearch || undefined,
      limit: 50,
    },
    {
      skip: !isOpen, // Only fetch when dropdown is open
    }
  );

  const products = productsData?.data || [];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Handle product selection
  const handleSelect = (productId) => {
    onProductSelect(productId);
    setIsOpen(false);
    setSearchInput('');
    setFocusedIndex(-1);
  };

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true);
        e.preventDefault();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex((prev) =>
          prev < products.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (focusedIndex >= 0 && products[focusedIndex]) {
          handleSelect(products[focusedIndex]._id);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setFocusedIndex(-1);
        inputRef.current?.blur();
        break;
      default:
        break;
    }
  };

  // Get selected product name for display
  const selectedProductName = products.find((p) => p._id === selectedProduct)?.name || '';

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          placeholder={selectedProductName || 'Search products...'}
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          className="w-full h-12 pl-11 pr-10 bg-white border border-border-light rounded-2xl text-sm text-text-dark placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-muted-olive/20 focus:border-muted-olive transition-all duration-200"
          aria-label="Search products"
          aria-expanded={isOpen}
          aria-autocomplete="list"
          aria-controls="product-dropdown"
        />
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />

        {selectedProduct !== 'all' && (
          <button
            onClick={() => handleSelect('all')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-tomato-red transition-colors"
            aria-label="Clear product filter"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div
          id="product-dropdown"
          role="listbox"
          className="absolute z-50 w-full mt-2 bg-white border border-border-light rounded-2xl shadow-soft max-h-80 overflow-y-auto"
        >
          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner size="sm" color="primary" />
              <span className="ml-2 text-sm text-text-muted">Loading products...</span>
            </div>
          )}

          {/* Products List */}
          {!isLoading && products.length > 0 && (
            <>
              {/* "All Products" option */}
              <button
                role="option"
                aria-selected={selectedProduct === 'all'}
                onClick={() => handleSelect('all')}
                className={`w-full flex items-center justify-between px-4 py-3 text-left hover:bg-sage-green/5 transition-colors touch-target ${
                  selectedProduct === 'all' ? 'bg-sage-green/10' : ''
                } ${focusedIndex === -1 ? 'bg-sage-green/5' : ''}`}
              >
                <span className="text-sm font-medium text-text-dark">
                  All Products
                </span>
                {selectedProduct === 'all' && (
                  <Check className="w-4 h-4 text-muted-olive" />
                )}
              </button>

              {/* Individual products */}
              {products.map((product, index) => (
                <button
                  key={product._id}
                  role="option"
                  aria-selected={selectedProduct === product._id}
                  onClick={() => handleSelect(product._id)}
                  className={`w-full flex items-start justify-between px-4 py-3 text-left hover:bg-sage-green/5 transition-colors touch-target border-t border-border-light ${
                    selectedProduct === product._id ? 'bg-sage-green/10' : ''
                  } ${focusedIndex === index ? 'bg-sage-green/5' : ''}`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-text-dark truncate">
                        {product.name}
                      </span>
                      {!product.hasListings && (
                        <span className="text-xs text-text-muted bg-gray-100 px-2 py-0.5 rounded-full">
                          No listings
                        </span>
                      )}
                    </div>
                    {selectedCategory === 'all' && product.category && (
                      <span className="text-xs text-text-muted">
                        {product.category.name}
                      </span>
                    )}
                  </div>
                  {selectedProduct === product._id && (
                    <Check className="w-4 h-4 text-muted-olive flex-shrink-0 ml-2" />
                  )}
                </button>
              ))}
            </>
          )}

          {/* Empty State */}
          {!isLoading && products.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8 px-4">
              <Package className="w-12 h-12 text-gray-300 mb-2" />
              <p className="text-sm text-text-muted text-center">
                {searchInput
                  ? `No products found for "${searchInput}"`
                  : 'No products available'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

ProductFilterAutocomplete.propTypes = {
  selectedCategory: PropTypes.string,
  selectedProduct: PropTypes.string,
  onProductSelect: PropTypes.func.isRequired,
  className: PropTypes.string,
};

export default ProductFilterAutocomplete;
