import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Search,
  Filter,
  Grid3X3,
  List,
  MapPin,
  Star,
  ShoppingCart,
  Plus,
  Minus,
  Heart,
  Info,
  Check,
  Package,
  X,
  Scale,
} from 'lucide-react';
import {
  useGetListingsQuery,
  useGetCategoriesQuery,
} from '../../store/slices/apiSlice';
import { addToCart } from '../../store/slices/cartSlice';
import {
  toggleFavorite,
  selectIsProductFavorited,
} from '../../store/slices/favoritesSlice';
import {
  toggleComparison,
  selectIsProductInComparison,
  selectIsComparisonFull,
  selectComparisonCount,
} from '../../store/slices/comparisonSlice';
import { formatCurrency, debounce } from '../../utils';
import BulkOrderModal from '../../components/restaurant/BulkOrderModal';

const ProductBrowsing = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Redux selectors
  const comparisonCount = useSelector(selectComparisonCount);
  const isComparisonFull = useSelector(selectIsComparisonFull);

  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('relevance');
  const [viewMode, setViewMode] = useState('grid');
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    location: '',
    rating: '',
    availability: 'available',
  });
  const [showFilters, setShowFilters] = useState(false);

  // Bulk selection state
  const [bulkMode, setBulkMode] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [showBulkModal, setShowBulkModal] = useState(false);

  // API queries
  const {
    data: listingsResponse,
    isLoading: listingsLoading,
    error,
  } = useGetListingsQuery({
    search: searchQuery,
    category: selectedCategory,
    sortBy,
    ...filters,
    limit: 50,
  });

  // Handle listings data structure - backend returns nested objects
  const listings = useMemo(() => {
    if (!listingsResponse) return [];

    // Extract data array from API response
    const rawListings = Array.isArray(listingsResponse)
      ? listingsResponse
      : Array.isArray(listingsResponse?.data)
        ? listingsResponse.data
        : [];

    // Transform nested API response to flat structure expected by components
    const transformedListings = rawListings.map((listing) => {
      const product = listing.product || {};
      const vendor = listing.vendor || {};

      // Handle pricing structure - extract from pricing array
      const pricing = listing.pricing?.[0] || {};
      const price = pricing.pricePerUnit || listing.price || 0;
      const unit = pricing.unit || listing.availability?.unit || 'unit';

      // Handle availability object - convert to status string
      const availabilityObj = listing.availability || {};
      const quantityAvailable = availabilityObj.quantityAvailable || 0;
      const isInSeason = availabilityObj.isInSeason;

      let availabilityStatus = 'available';
      if (quantityAvailable === 0) {
        availabilityStatus = 'out-of-stock';
      } else if (quantityAvailable < 10) {
        availabilityStatus = 'low-stock';
      } else {
        availabilityStatus = 'in-stock';
      }

      // Handle images structure - extract URLs from image objects
      const imageUrls =
        listing.images?.map((img) => img.url || img) ||
        product.images?.map((img) => img.url || img) ||
        [];

      // Handle rating structure
      const rating = listing.rating?.average || product.rating?.average || 0;

      const transformed = {
        // Listing properties
        _id: listing._id,
        vendorId: listing.vendorId,
        productId: listing.productId,
        price,
        quantity: quantityAvailable,
        unit,
        availability: availabilityStatus,

        // Product properties (from nested object)
        name: product.name,
        description: product.description,
        images: imageUrls,
        category: product.category,
        rating,

        // Vendor properties (from nested object)
        vendorName: vendor.businessName || vendor.name || listing.vendorName,
        vendorLocation: vendor.address?.city || vendor.location,
        vendorRating: vendor.rating?.average || 0,

        // Additional useful properties
        qualityGrade: listing.qualityGrade,
        isInSeason,
        minimumOrderValue:
          listing.minimumOrderValue || vendor.minimumOrderValue,
        deliveryOptions: listing.deliveryOptions,
        featured: listing.featured,
      };

      return transformed;
    });

    return transformedListings;
  }, [listingsResponse]);

  const {
    data: categoriesData = [],
    isLoading: categoriesLoading,
    error: categoriesError,
  } = useGetCategoriesQuery();

  // Handle categories data structure safely
  const categories = Array.isArray(categoriesData)
    ? categoriesData
    : Array.isArray(categoriesData?.data)
      ? categoriesData.data
      : Array.isArray(categoriesData?.categories)
        ? categoriesData.categories
        : [];

  // Debounced search
  const debouncedSearch = useMemo(
    () => debounce((value) => setSearchQuery(value), 300),
    []
  );

  const handleSearchChange = (e) => {
    debouncedSearch(e.target.value);
  };

  const handleAddToCart = (product, quantity = 1) => {
    dispatch(
      addToCart({
        id: product._id,
        name: product.name,
        price: product.price,
        image: product.images?.[0],
        vendorId: product.vendorId,
        vendorName: product.vendorName,
        unit: product.unit,
        quantity,
        // Add additional fields for better cart management
        productId: product.productId,
        availability: product.availability,
      })
    );
  };

  const getAvailabilityColor = (availability) => {
    const colors = {
      'in-stock': 'bg-mint-fresh/20 text-bottle-green dark:text-green-400',
      'low-stock': 'bg-amber-100 text-amber-800',
      'out-of-stock': 'bg-tomato-red/10 text-tomato-red',
    };
    return colors[availability] || 'bg-gray-100 text-gray-600';
  };

  const getAvailabilityText = (availability) => {
    const texts = {
      'in-stock': 'In Stock',
      'low-stock': 'Low Stock',
      'out-of-stock': 'Out of Stock',
    };
    return texts[availability] || 'Available';
  };

  // Bulk selection handlers
  const handleToggleBulkMode = () => {
    setBulkMode(!bulkMode);
    setSelectedProducts([]);
  };

  const handleProductSelect = (product, selected) => {
    if (selected) {
      setSelectedProducts((prev) => [...prev, product]);
    } else {
      setSelectedProducts((prev) => prev.filter((p) => p._id !== product._id));
    }
  };

  const handleSelectAll = () => {
    const availableProducts = listings.filter(
      (p) => p.availability !== 'out-of-stock'
    );
    setSelectedProducts(availableProducts);
  };

  const handleClearSelection = (productIdsToRemove = null) => {
    if (productIdsToRemove) {
      setSelectedProducts((prev) =>
        prev.filter((p) => !productIdsToRemove.includes(p._id))
      );
    } else {
      setSelectedProducts([]);
    }
  };

  const isProductSelected = (productId) => {
    return selectedProducts.some((p) => p._id === productId);
  };

  // Favorites and comparison handlers
  const handleToggleFavorite = (product) => {
    dispatch(toggleFavorite(product));
  };

  const handleToggleComparison = (product) => {
    dispatch(toggleComparison(product));
  };

  // Helper function to check if product is favorited
  const isProductFavorited = (productId) => {
    return useSelector((state) => selectIsProductFavorited(state, productId));
  };

  // Helper function to check if product is in comparison
  const isProductInComparison = (productId) => {
    return useSelector((state) =>
      selectIsProductInComparison(state, productId)
    );
  };

  const ProductCard = ({ product }) => {
    const isSelected = isProductSelected(product._id);
    const isOutOfStock = product.availability === 'out-of-stock';
    const isFavorited = useSelector((state) =>
      selectIsProductFavorited(state, product._id)
    );
    const inComparison = useSelector((state) =>
      selectIsProductInComparison(state, product._id)
    );

    return (
      <div
        onClick={() => {
          if (bulkMode && !isOutOfStock) {
            handleProductSelect(product, !isSelected);
          } else if (!bulkMode) {
            navigate(`/restaurant/browse/${product._id}`);
          }
        }}
        className={`glass rounded-3xl p-4 hover:shadow-soft transition-all duration-200 cursor-pointer group relative ${
          bulkMode && isSelected
            ? 'ring-2 ring-bottle-green bg-bottle-green/5'
            : ''
        } ${bulkMode && isOutOfStock ? 'opacity-50 cursor-not-allowed' : ''}`}
        data-testid="product-card"
      >
        {/* Product Image */}
        <div className="relative mb-4">
          <div className="aspect-square bg-gradient-to-br from-earthy-beige/20 to-mint-fresh/10 rounded-2xl overflow-hidden">
            {product.images && product.images[0] ? (
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                  <ShoppingCart className="w-8 h-8 text-gray-400" />
                </div>
              </div>
            )}
          </div>

          {/* Availability Badge */}
          <span
            className={`absolute top-3 right-3 px-2 py-1 rounded-xl text-xs font-medium ${getAvailabilityColor(product.availability)}`}
          >
            {getAvailabilityText(product.availability)}
          </span>

          {/* Bulk Selection Checkbox */}
          {bulkMode && (
            <div className="absolute top-3 left-3">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
                  isSelected
                    ? 'bg-bottle-green text-white'
                    : 'bg-white/90 backdrop-blur-sm border-2 border-gray-300'
                } ${isOutOfStock ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-110'}`}
                onClick={(e) => {
                  e.stopPropagation();
                  if (!isOutOfStock) {
                    handleProductSelect(product, !isSelected);
                  }
                }}
              >
                {isSelected && <Check className="w-4 h-4" />}
              </div>
            </div>
          )}

          {/* Favorite Button */}
          {!bulkMode && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleToggleFavorite(product);
              }}
              className="absolute top-3 left-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors touch-target"
            >
              <Heart
                className={`w-4 h-4 transition-colors ${
                  isFavorited
                    ? 'text-tomato-red fill-current'
                    : 'text-gray-600 hover:text-tomato-red'
                }`}
              />
            </button>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-2">
          <div className="flex items-start justify-between">
            <h3 className="font-semibold text-text-dark dark:text-white text-sm line-clamp-2 flex-1 mr-2">
              {product.name}
            </h3>
            <div className="flex items-center gap-1">
              {/* Comparison Checkbox */}
              {!bulkMode && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleComparison(product);
                  }}
                  disabled={!inComparison && isComparisonFull}
                  className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all duration-200 touch-target ${
                    inComparison
                      ? 'bg-blue-500 border-blue-500 text-white'
                      : isComparisonFull
                        ? 'border-gray-300 text-gray-300 cursor-not-allowed opacity-50'
                        : 'border-gray-300 text-gray-400 hover:border-blue-400 hover:text-blue-500'
                  }`}
                  title={
                    inComparison
                      ? 'Remove from comparison'
                      : isComparisonFull
                        ? 'Comparison is full (max 4 products)'
                        : 'Add to comparison'
                  }
                >
                  {inComparison ? (
                    <Check className="w-3 h-3" />
                  ) : (
                    <Scale className="w-3 h-3" />
                  )}
                </button>
              )}
              <button
                onClick={(e) => e.stopPropagation()}
                className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 touch-target p-1"
              >
                <Info className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Vendor Info */}
          <div className="flex items-center gap-1 text-xs text-text-muted dark:text-gray-300">
            <MapPin className="w-3 h-3" />
            <span className="truncate">{product.vendorName}</span>
          </div>

          {/* Rating */}
          {product.rating && (
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 text-earthy-yellow fill-current" />
              <span className="text-xs text-text-muted dark:text-gray-300">
                {product.rating.toFixed(1)}
              </span>
            </div>
          )}

          {/* Price and Add to Cart */}
          <div className="flex items-center justify-between mt-4">
            <div>
              <p className="font-bold text-text-dark dark:text-white">
                {formatCurrency(product.price)}
              </p>
              <p className="text-xs text-text-muted dark:text-gray-300">
                per {product.unit || 'unit'}
              </p>
            </div>

            {!bulkMode && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddToCart(product);
                }}
                disabled={product.availability === 'out-of-stock'}
                className="bg-gradient-primary text-white p-2 rounded-xl hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed touch-target"
              >
                <Plus className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    );

    const ProductListItem = ({ product }) => (
      <div
        onClick={() => navigate(`/restaurant/browse/${product._id}`)}
        className="glass rounded-2xl p-4 flex items-center gap-4 hover:shadow-soft transition-all duration-200 cursor-pointer group"
      >
        {/* Product Image */}
        <div className="w-20 h-20 bg-gradient-to-br from-earthy-beige/20 to-mint-fresh/10 rounded-xl overflow-hidden flex-shrink-0">
          {product.images && product.images[0] ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-gray-400" />
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-text-dark dark:text-white truncate pr-2">
              {product.name}
            </h3>
            <span
              className={`px-2 py-1 rounded-lg text-xs font-medium whitespace-nowrap ${getAvailabilityColor(product.availability)}`}
            >
              {getAvailabilityText(product.availability)}
            </span>
          </div>

          <div className="flex items-center gap-3 text-sm text-text-muted dark:text-gray-300 mb-2">
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              <span className="truncate">{product.vendorName}</span>
            </div>
            {product.rating && (
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 text-earthy-yellow fill-current" />
                <span>{product.rating.toFixed(1)}</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-text-dark dark:text-white">
                {formatCurrency(product.price)}
              </p>
              <p className="text-xs text-text-muted dark:text-gray-300">
                per {product.unit || 'unit'}
              </p>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleAddToCart(product);
              }}
              disabled={product.availability === 'out-of-stock'}
              className="bg-gradient-primary text-white px-4 py-2 rounded-xl font-medium hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed touch-target flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-dark dark:text-white">
            Browse Products
          </h1>
          <p className="text-text-muted dark:text-gray-300 mt-2">
            Fresh vegetables from local vendors
          </p>
        </div>
        <button
          onClick={() => navigate('/restaurant/cart')}
          className="bg-gradient-secondary text-white px-6 py-3 rounded-2xl font-medium hover:shadow-lg transition-all duration-200 touch-target"
        >
          View Cart
        </button>
      </div>

      {/* Search and Filters */}
      <div className="glass rounded-3xl p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search Bar */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search fresh vegetables..."
              onChange={handleSearchChange}
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-bottle-green/20 focus:border-bottle-green transition-all duration-200"
            />
          </div>

          {/* Quick Filters */}
          <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-bottle-green/20 focus:border-bottle-green transition-all duration-200"
            >
              <option value="">All Categories</option>
              {categories && categories.length > 0 ? (
                categories.map((category) => (
                  <option
                    key={category._id || category.id}
                    value={category._id || category.id}
                  >
                    {category.name}
                  </option>
                ))
              ) : categoriesLoading ? (
                <option disabled>Loading categories...</option>
              ) : (
                <option disabled>No categories available</option>
              )}
            </select>

            {/* Sort By */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-bottle-green/20 focus:border-bottle-green transition-all duration-200"
            >
              <option value="relevance">Relevance</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="newest">Newest First</option>
            </select>

            {/* Advanced Filters Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-3 rounded-2xl border transition-all duration-200 touch-target ${
                showFilters
                  ? 'bg-bottle-green text-white border-bottle-green dark:bg-green-600 dark:border-green-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-bottle-green/30 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:border-green-500/30'
              }`}
            >
              <Filter className="w-5 h-5" />
            </button>

            {/* View Mode Toggle */}
            <div className="flex bg-gray-100 rounded-2xl p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-xl transition-all duration-200 ${
                  viewMode === 'grid'
                    ? 'bg-white shadow-sm text-bottle-green dark:text-green-400'
                    : 'text-gray-600 hover:text-bottle-green dark:text-gray-300 dark:hover:text-green-400'
                }`}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-xl transition-all duration-200 ${
                  viewMode === 'list'
                    ? 'bg-white shadow-sm text-bottle-green dark:text-green-400'
                    : 'text-gray-600 hover:text-bottle-green dark:text-gray-300 dark:hover:text-green-400'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            {/* Bulk Mode Toggle */}
            <button
              onClick={handleToggleBulkMode}
              className={`p-3 rounded-2xl border transition-all duration-200 touch-target flex items-center gap-2 ${
                bulkMode
                  ? 'bg-bottle-green text-white border-bottle-green'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-bottle-green/30'
              }`}
            >
              <Package className="w-5 h-5" />
              <span className="hidden sm:inline">
                {bulkMode ? 'Exit Bulk' : 'Bulk Select'}
              </span>
            </button>
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="mt-6 pt-6 border-t border-gray-100">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-dark dark:text-white mb-2">
                  Min Price
                </label>
                <input
                  type="number"
                  value={filters.minPrice}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      minPrice: e.target.value,
                    }))
                  }
                  placeholder="0"
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-bottle-green/20 focus:border-bottle-green"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-dark dark:text-white mb-2">
                  Max Price
                </label>
                <input
                  type="number"
                  value={filters.maxPrice}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      maxPrice: e.target.value,
                    }))
                  }
                  placeholder="1000"
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-bottle-green/20 focus:border-bottle-green"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-dark dark:text-white mb-2">
                  Location
                </label>
                <input
                  type="text"
                  value={filters.location}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      location: e.target.value,
                    }))
                  }
                  placeholder="Near me"
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-bottle-green/20 focus:border-bottle-green"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-dark dark:text-white mb-2">
                  Minimum Rating
                </label>
                <select
                  value={filters.rating}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, rating: e.target.value }))
                  }
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-bottle-green/20 focus:border-bottle-green"
                >
                  <option value="">Any Rating</option>
                  <option value="4">4+ Stars</option>
                  <option value="3">3+ Stars</option>
                  <option value="2">2+ Stars</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bulk Action Toolbar */}
      {bulkMode && (
        <div className="glass rounded-2xl p-4 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-text-dark">
                {selectedProducts.length} selected
              </span>
              {selectedProducts.length > 0 && (
                <button
                  onClick={handleClearSelection}
                  className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
                >
                  <X className="w-3 h-3" />
                  Clear
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              {listings.length > 0 && (
                <button
                  onClick={handleSelectAll}
                  className="text-sm text-bottle-green hover:text-bottle-green/80 font-medium"
                >
                  Select All Available
                </button>
              )}

              {selectedProducts.length > 0 && (
                <button
                  onClick={() => setShowBulkModal(true)}
                  className="bg-gradient-primary text-white px-6 py-2 rounded-xl font-medium hover:shadow-lg transition-all duration-200 flex items-center gap-2 min-h-[44px]"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Add {selectedProducts.length} to Cart
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Products Grid/List */}
      <div>
        {listingsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 aspect-square rounded-2xl mb-4"></div>
                <div className="bg-gray-200 h-4 rounded mb-2"></div>
                <div className="bg-gray-200 h-3 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-tomato-red mb-4">
              <ShoppingCart className="w-12 h-12 mx-auto" />
            </div>
            <p className="text-text-muted dark:text-gray-300">
              Failed to load products
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 bg-gradient-primary text-white px-6 py-2 rounded-xl hover:shadow-lg transition-all duration-200"
            >
              Retry
            </button>
          </div>
        ) : listings.length > 0 ? (
          viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {listings.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {listings.map((product) => (
                <ProductListItem key={product._id} product={product} />
              ))}
            </div>
          )
        ) : (
          <div className="text-center py-12">
            <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-text-muted dark:text-gray-300">
              No products found
            </p>
            <p className="text-sm text-text-muted/70 dark:text-gray-400 mt-1">
              Try adjusting your search or filters
            </p>
          </div>
        )}
      </div>

      {/* Bulk Order Modal */}
      <BulkOrderModal
        isOpen={showBulkModal}
        onClose={() => setShowBulkModal(false)}
        selectedProducts={selectedProducts}
        onClearSelection={handleClearSelection}
      />

      {/* Floating Comparison Button */}
      {comparisonCount > 0 && (
        <div className="fixed bottom-6 right-6 z-40">
          <button
            onClick={() => navigate('/restaurant/comparison')}
            className="bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-3 min-h-[56px] touch-target"
          >
            <Scale className="w-6 h-6" />
            <span className="font-medium">Compare ({comparisonCount})</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductBrowsing;
