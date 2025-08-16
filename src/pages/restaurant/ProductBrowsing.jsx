import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
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
} from 'lucide-react';
import {
  useGetProductListingsQuery,
  useGetCategoriesQuery,
} from '../../store/slices/apiSlice';
import { addToCart } from '../../store/slices/cartSlice';
import { formatCurrency, debounce } from '../../utils';

const ProductBrowsing = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

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

  // API queries
  const {
    data: listings = [],
    isLoading: listingsLoading,
    error,
  } = useGetProductListingsQuery({
    search: searchQuery,
    category: selectedCategory,
    sortBy,
    ...filters,
    limit: 50,
  });

  const { data: categories = [] } = useGetCategoriesQuery();

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
      })
    );
  };

  const getAvailabilityColor = (availability) => {
    const colors = {
      'in-stock': 'bg-mint-fresh/20 text-bottle-green',
      'low-stock': 'bg-amber-100 text-amber-800',
      'out-of-stock': 'bg-tomato-red/10 text-tomato-red',
    };
    return colors[availability] || 'bg-gray-100 text-gray-600';
  };

  const ProductCard = ({ product }) => (
    <div className="glass rounded-3xl p-4 hover:shadow-soft transition-all duration-200">
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
          {product.availability?.replace('-', ' ') || 'Available'}
        </span>

        {/* Favorite Button */}
        <button className="absolute top-3 left-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors">
          <Heart className="w-4 h-4 text-gray-600 hover:text-tomato-red transition-colors" />
        </button>
      </div>

      {/* Product Info */}
      <div className="space-y-2">
        <div className="flex items-start justify-between">
          <h3 className="font-semibold text-text-dark text-sm line-clamp-2">
            {product.name}
          </h3>
          <button className="text-gray-400 hover:text-gray-600 ml-2">
            <Info className="w-4 h-4" />
          </button>
        </div>

        {/* Vendor Info */}
        <div className="flex items-center gap-1 text-xs text-text-muted">
          <MapPin className="w-3 h-3" />
          <span className="truncate">{product.vendorName}</span>
        </div>

        {/* Rating */}
        {product.rating && (
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 text-earthy-yellow fill-current" />
            <span className="text-xs text-text-muted">
              {product.rating.toFixed(1)}
            </span>
          </div>
        )}

        {/* Price and Add to Cart */}
        <div className="flex items-center justify-between mt-4">
          <div>
            <p className="font-bold text-text-dark">
              {formatCurrency(product.price)}
            </p>
            <p className="text-xs text-text-muted">
              per {product.unit || 'unit'}
            </p>
          </div>

          <button
            onClick={() => handleAddToCart(product)}
            disabled={product.availability === 'out-of-stock'}
            className="bg-gradient-primary text-white p-2 rounded-xl hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed touch-target"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  const ProductListItem = ({ product }) => (
    <div className="glass rounded-2xl p-4 flex items-center gap-4 hover:shadow-soft transition-all duration-200">
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
          <h3 className="font-semibold text-text-dark truncate pr-2">
            {product.name}
          </h3>
          <span
            className={`px-2 py-1 rounded-lg text-xs font-medium whitespace-nowrap ${getAvailabilityColor(product.availability)}`}
          >
            {product.availability?.replace('-', ' ') || 'Available'}
          </span>
        </div>

        <div className="flex items-center gap-3 text-sm text-text-muted mb-2">
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
            <p className="font-bold text-text-dark">
              {formatCurrency(product.price)}
            </p>
            <p className="text-xs text-text-muted">
              per {product.unit || 'unit'}
            </p>
          </div>

          <button
            onClick={() => handleAddToCart(product)}
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-dark">Browse Products</h1>
          <p className="text-text-muted mt-2">
            Fresh vegetables from local vendors
          </p>
        </div>
        <button
          onClick={() => navigate('/restaurant/order')}
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
              {categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
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
                  ? 'bg-bottle-green text-white border-bottle-green'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-bottle-green/30'
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
                    ? 'bg-white shadow-sm text-bottle-green'
                    : 'text-gray-600 hover:text-bottle-green'
                }`}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-xl transition-all duration-200 ${
                  viewMode === 'list'
                    ? 'bg-white shadow-sm text-bottle-green'
                    : 'text-gray-600 hover:text-bottle-green'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="mt-6 pt-6 border-t border-gray-100">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-dark mb-2">
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
                <label className="block text-sm font-medium text-text-dark mb-2">
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
                <label className="block text-sm font-medium text-text-dark mb-2">
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
                <label className="block text-sm font-medium text-text-dark mb-2">
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
            <p className="text-text-muted">Failed to load products</p>
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
            <p className="text-text-muted">No products found</p>
            <p className="text-sm text-text-muted/70 mt-1">
              Try adjusting your search or filters
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductBrowsing;
