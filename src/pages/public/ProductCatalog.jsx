import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Filter,
  Leaf,
  Apple,
  Carrot,
  ShoppingBag,
  Star,
  MapPin,
  ArrowRight,
  Package,
  AlertCircle,
  SlidersHorizontal,
  X,
  TrendingUp,
  Grid3X3,
  List,
} from 'lucide-react';
import {
  useGetCategoriesQuery,
  useGetPublicProductsQuery,
  useGetFeaturedListingsQuery,
  useGetPublicListingsQuery,
} from '../../store/slices/apiSlice';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { Card } from '../../components/ui/Card';
import ProductCard from '../../components/public/ProductCard';
import ProductModal from '../../components/public/ProductModal';

const ProductCatalog = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [sortBy, setSortBy] = useState('name'); // 'name', 'price', 'popularity', 'newest'
  const [selectedProductId, setSelectedProductId] = useState(null);

  // Advanced filters
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    organic: false,
    local: false,
    seasonal: false,
    inStock: true,
  });

  const {
    data: categoriesData,
    isLoading: categoriesLoading,
    error: categoriesError,
  } = useGetCategoriesQuery();

  const {
    data: featuredData,
    isLoading: featuredLoading,
    error: featuredError,
  } = useGetFeaturedListingsQuery({ limit: 12 });

  // Always fetch public listings to get vendor/pricing data for products
  const { data: listingsData, isLoading: listingsLoading } =
    useGetPublicListingsQuery({
      limit: 100, // Get more listings to properly aggregate
    });

  // Always fetch public products as the primary data source
  const productQueryParams = useMemo(() => {
    const params = { limit: 50 }; // Get more products
    if (searchTerm) params.search = searchTerm;
    if (selectedCategory !== 'all') {
      const category = categoriesData?.data?.find(
        (cat) => cat._id === selectedCategory || cat.id === selectedCategory
      );
      params.category = category?._id || category?.id || selectedCategory;
    }
    return params;
  }, [searchTerm, selectedCategory, categoriesData]);

  const {
    data: productsData,
    isLoading: productsLoading,
    error: productsError,
  } = useGetPublicProductsQuery(productQueryParams);

  // Fix data access patterns to match actual API response
  const categories = categoriesData?.data || [];
  const featuredListings = featuredData?.data || [];
  const products = productsData?.data || []; // Primary product data
  const listings = listingsData?.data || []; // All listings data

  // Create listings map for quick lookup
  const listingsMap = useMemo(() => {
    const map = new Map();
    listings.forEach((listing) => {
      const productId = listing.productId?._id || listing.productId?.id;
      if (productId) {
        if (!map.has(productId)) {
          map.set(productId, []);
        }
        map.get(productId).push(listing);
      }
    });
    return map;
  }, [listings]);

  // Enhanced products with aggregated listing data
  const enhancedProducts = useMemo(() => {
    return products.map((product) => {
      const productId = product._id || product.id;
      const productListings = listingsMap.get(productId) || [];

      // Aggregate listing data
      let priceRange = null;
      let totalQuantity = 0;
      const qualityGrades = new Set();
      let totalRating = 0;
      let ratingCount = 0;

      if (productListings.length > 0) {
        const prices = [];

        productListings.forEach((listing) => {
          // Price aggregation
          if (listing.pricing && listing.pricing.length > 0) {
            const price = listing.pricing[0].pricePerUnit;
            if (price) prices.push(price);
          }

          // Quantity aggregation
          totalQuantity += listing.availability?.quantityAvailable || 0;

          // Quality grades
          if (listing.qualityGrade) {
            qualityGrades.add(listing.qualityGrade);
          }

          // Ratings
          if (listing.rating && listing.rating.average > 0) {
            totalRating += listing.rating.average * listing.rating.count;
            ratingCount += listing.rating.count;
          }
        });

        // Calculate price range
        if (prices.length > 0) {
          priceRange = {
            min: Math.min(...prices),
            max: Math.max(...prices),
          };
        }
      }

      return {
        ...product,
        id: productId,
        listings: productListings,
        vendorCount: productListings.length,
        priceRange,
        availableQuantity: totalQuantity,
        qualityGrades: Array.from(qualityGrades),
        averageRating: ratingCount > 0 ? totalRating / ratingCount : 0,
        ratingCount,
        activeListingsCount: productListings.length,
        inStock: totalQuantity > 0,
      };
    });
  }, [products, listingsMap]);

  // Transform featured listings to show their parent products with featured flag
  const featuredProducts = useMemo(() => {
    const featuredProductMap = new Map();

    featuredListings.forEach((listing) => {
      const product = listing.productId;
      if (!product) return;

      const productId = product._id || product.id;

      // If we haven't seen this product yet, create an enhanced version
      if (!featuredProductMap.has(productId)) {
        const productListings = listingsMap.get(productId) || [listing];

        // Calculate aggregated data from all listings of this product
        let priceRange = null;
        let totalQuantity = 0;
        const qualityGrades = new Set();
        let totalRating = 0;
        let ratingCount = 0;

        const prices = [];
        productListings.forEach((pListing) => {
          if (pListing.pricing && pListing.pricing.length > 0) {
            const price = pListing.pricing[0].pricePerUnit;
            if (price) prices.push(price);
          }
          totalQuantity += pListing.availability?.quantityAvailable || 0;
          if (pListing.qualityGrade) qualityGrades.add(pListing.qualityGrade);
          if (pListing.rating && pListing.rating.average > 0) {
            totalRating += pListing.rating.average * pListing.rating.count;
            ratingCount += pListing.rating.count;
          }
        });

        if (prices.length > 0) {
          priceRange = { min: Math.min(...prices), max: Math.max(...prices) };
        }

        featuredProductMap.set(productId, {
          ...product,
          id: productId,
          featured: true,
          featuredListing: listing, // Keep reference to the featured listing
          listings: productListings,
          vendorCount: productListings.length,
          priceRange,
          availableQuantity: totalQuantity,
          qualityGrades: Array.from(qualityGrades),
          averageRating: ratingCount > 0 ? totalRating / ratingCount : 0,
          ratingCount,
          activeListingsCount: productListings.length,
          inStock: totalQuantity > 0,
          // Combine listing and product images
          images: [...(listing.images || []), ...(product?.images || [])],
        });
      }
    });

    return Array.from(featuredProductMap.values());
  }, [featuredListings, listingsMap]);

  // Enhanced filter handlers
  const handleCategoryChange = useCallback((categoryId) => {
    setSelectedCategory(categoryId);
  }, []);

  const handleFilterChange = useCallback((key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setSelectedCategory('all');
    setFilters({
      minPrice: '',
      maxPrice: '',
      organic: false,
      local: false,
      seasonal: false,
      inStock: true,
    });
  }, []);

  const handleProductClick = useCallback((product) => {
    setSelectedProductId(product.id);
  }, []);

  // Format price for display
  const formatPrice = useCallback((price) => {
    if (typeof price === 'number') {
      return `৳${price.toFixed(2)}`;
    }
    return price || 'Price on request';
  }, []);

  // Check if any filters are active (moved before use)
  const hasActiveFilters = useMemo(() => {
    return (
      searchTerm ||
      selectedCategory !== 'all' ||
      Object.values(filters).some((value) =>
        typeof value === 'boolean' ? value : value !== ''
      )
    );
  }, [searchTerm, selectedCategory, filters]);

  // Apply filtering to enhanced products when filters are active
  const filteredProducts = useMemo(() => {
    if (!hasActiveFilters) return [];

    let filtered = [...enhancedProducts];

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (product) =>
          product.name?.toLowerCase().includes(searchLower) ||
          product.description?.toLowerCase().includes(searchLower) ||
          product.category?.name?.toLowerCase().includes(searchLower) ||
          product.variety?.toLowerCase().includes(searchLower)
      );
    }

    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((product) => {
        const productCategoryId = product.category?._id || product.category?.id;
        return productCategoryId === selectedCategory;
      });
    }

    // Apply advanced filters
    if (filters.organic) {
      filtered = filtered.filter((product) => product.isOrganic);
    }
    if (filters.local) {
      filtered = filtered.filter((product) => product.isLocallySourced);
    }
    if (filters.seasonal) {
      filtered = filtered.filter((product) => product.isSeasonal);
    }
    if (filters.inStock) {
      filtered = filtered.filter((product) => product.availableQuantity > 0);
    }
    if (filters.minPrice) {
      filtered = filtered.filter((product) => {
        const price = product.priceRange?.min || product.averagePrice;
        return price && price >= parseFloat(filters.minPrice);
      });
    }
    if (filters.maxPrice) {
      filtered = filtered.filter((product) => {
        const price = product.priceRange?.max || product.averagePrice;
        return price && price <= parseFloat(filters.maxPrice);
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price': {
          const aPrice = a.priceRange?.min || a.averagePrice || 0;
          const bPrice = b.priceRange?.min || b.averagePrice || 0;
          return aPrice - bPrice;
        }
        case 'popularity':
          return (b.vendorCount || 0) - (a.vendorCount || 0);
        case 'newest':
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        case 'rating':
          return (b.averageRating || 0) - (a.averageRating || 0);
        default: // name
          return (a.name || '').localeCompare(b.name || '');
      }
    });

    return filtered;
  }, [
    enhancedProducts,
    hasActiveFilters,
    searchTerm,
    selectedCategory,
    filters,
    sortBy,
  ]);

  const categoryIcons = {
    'Leafy Greens': Leaf,
    Fruits: Apple,
    Vegetables: Carrot,
    'Root Vegetables': Carrot,
    Herbs: Leaf,
    Spices: Leaf,
  };

  // Loading states
  const isLoading = productsLoading || listingsLoading;
  const isFeaturedLoading = featuredLoading;
  const isCategoriesLoading = categoriesLoading;

  const handleSignUpClick = () => {
    navigate('/register');
  };

  if (isCategoriesLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading catalog..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-sage-green/20 to-muted-olive/10">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-text-dark mb-6">
              Fresh Products, Direct from Farms
            </h1>
            <p className="text-xl text-text-muted mb-8 max-w-3xl mx-auto">
              Discover premium quality produce from local vendors. Join
              thousands of restaurants sourcing the freshest ingredients for
              their kitchens.
            </p>

            {/* Search and Filter Bar */}
            <div className="max-w-4xl mx-auto mb-8">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search for products, vendors, or categories..."
                    className="w-full pl-12 pr-4 py-4 text-lg rounded-2xl border-0 bg-white shadow-lg focus:outline-none focus:ring-2 focus:ring-muted-olive/20"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div className="lg:w-64">
                  <select
                    value={selectedCategory}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="w-full px-4 py-4 text-lg rounded-2xl border-0 bg-white shadow-lg focus:outline-none focus:ring-2 focus:ring-muted-olive/20"
                  >
                    <option value="all">All Categories</option>
                    {categories.map((category) => (
                      <option
                        key={category._id || category.id}
                        value={category._id || category.id}
                      >
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`px-6 py-4 rounded-2xl font-medium flex items-center gap-2 transition-all duration-200 ${
                    showFilters || hasActiveFilters
                      ? 'bg-muted-olive text-white shadow-lg'
                      : 'bg-white text-muted-olive border border-muted-olive/20 shadow-lg hover:bg-muted-olive/5'
                  }`}
                >
                  <SlidersHorizontal className="w-5 h-5" />
                  Filters
                  {hasActiveFilters && (
                    <span className="bg-white/20 text-xs px-2 py-1 rounded-full">
                      {Object.values(filters).filter((v) =>
                        typeof v === 'boolean' ? v : v !== ''
                      ).length +
                        (searchTerm ? 1 : 0) +
                        (selectedCategory !== 'all' ? 1 : 0)}
                    </span>
                  )}
                </button>
              </div>

              {/* Advanced Filters Panel */}
              {showFilters && (
                <div className="mt-4 p-6 bg-white rounded-2xl shadow-lg animate-fade-in">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-text-dark">
                      Advanced Filters
                    </h3>
                    <button
                      onClick={() => setShowFilters(false)}
                      className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                    >
                      <X className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Price Range */}
                    <div>
                      <label className="block text-sm font-medium text-text-dark mb-2">
                        Price Range
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          placeholder="Min"
                          value={filters.minPrice}
                          onChange={(e) =>
                            handleFilterChange('minPrice', e.target.value)
                          }
                          className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-muted-olive/20"
                        />
                        <input
                          type="number"
                          placeholder="Max"
                          value={filters.maxPrice}
                          onChange={(e) =>
                            handleFilterChange('maxPrice', e.target.value)
                          }
                          className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-muted-olive/20"
                        />
                      </div>
                    </div>

                    {/* Sort By */}
                    <div>
                      <label className="block text-sm font-medium text-text-dark mb-2">
                        Sort By
                      </label>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-muted-olive/20"
                      >
                        <option value="name">Name</option>
                        <option value="price">Price (Low to High)</option>
                        <option value="popularity">Popularity</option>
                        <option value="newest">Newest</option>
                        <option value="rating">Rating</option>
                      </select>
                    </div>

                    {/* Special Attributes */}
                    <div>
                      <label className="block text-sm font-medium text-text-dark mb-2">
                        Special Attributes
                      </label>
                      <div className="space-y-2">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={filters.organic}
                            onChange={(e) =>
                              handleFilterChange('organic', e.target.checked)
                            }
                            className="mr-2 rounded border-gray-300 text-muted-olive focus:ring-muted-olive/20"
                          />
                          <span className="text-sm">Organic</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={filters.local}
                            onChange={(e) =>
                              handleFilterChange('local', e.target.checked)
                            }
                            className="mr-2 rounded border-gray-300 text-muted-olive focus:ring-muted-olive/20"
                          />
                          <span className="text-sm">Local</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={filters.seasonal}
                            onChange={(e) =>
                              handleFilterChange('seasonal', e.target.checked)
                            }
                            className="mr-2 rounded border-gray-300 text-muted-olive focus:ring-muted-olive/20"
                          />
                          <span className="text-sm">Seasonal</span>
                        </label>
                      </div>
                    </div>

                    {/* View Options */}
                    <div>
                      <label className="block text-sm font-medium text-text-dark mb-2">
                        View
                      </label>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setViewMode('grid')}
                          className={`flex-1 px-3 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors ${
                            viewMode === 'grid'
                              ? 'bg-muted-olive text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          <Grid3X3 className="w-4 h-4" />
                          Grid
                        </button>
                        <button
                          onClick={() => setViewMode('list')}
                          className={`flex-1 px-3 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors ${
                            viewMode === 'list'
                              ? 'bg-muted-olive text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          <List className="w-4 h-4" />
                          List
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Clear Filters */}
                  {hasActiveFilters && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <button
                        onClick={clearFilters}
                        className="text-muted-olive hover:text-muted-olive/80 font-medium flex items-center gap-2"
                      >
                        <X className="w-4 h-4" />
                        Clear All Filters
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleSignUpClick}
                className="bg-gradient-primary text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:shadow-lg transition-all duration-200 flex items-center gap-2 justify-center"
              >
                <ShoppingBag className="w-5 h-5" />
                Start Shopping Today
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => navigate('/about')}
                className="border-2 border-muted-olive text-muted-olive px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-muted-olive hover:text-white transition-all duration-200"
              >
                Learn More
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Section */}
      {categoriesLoading ? (
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="flex justify-center">
            <LoadingSpinner size="md" text="Loading categories..." />
          </div>
        </div>
      ) : categoriesError ? (
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-text-muted">Unable to load categories</p>
        </div>
      ) : (
        categories.length > 0 && (
          <div className="max-w-7xl mx-auto px-4 py-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-text-dark mb-4">
                Browse by Category
              </h2>
              <p className="text-text-muted text-lg">
                Find exactly what you're looking for
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {categories.slice(0, 8).map((category) => {
                const IconComponent = categoryIcons[category.name] || Leaf;
                return (
                  <Card
                    key={category._id || category.id}
                    className={`p-6 text-center hover:shadow-lg transition-all duration-200 cursor-pointer group ${
                      selectedCategory === (category._id || category.id)
                        ? 'ring-2 ring-muted-olive bg-sage-green/10'
                        : ''
                    }`}
                    onClick={() =>
                      handleCategoryChange(category._id || category.id)
                    }
                  >
                    <div className="w-16 h-16 bg-gradient-secondary rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-200">
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="font-semibold text-text-dark mb-2">
                      {category.name}
                    </h3>
                    <p className="text-sm text-text-muted mb-1">
                      {category.description ||
                        `Fresh ${category.name.toLowerCase()}`}
                    </p>
                    <p className="text-xs text-muted-olive font-medium">
                      {category.productCount || 0} products
                    </p>
                  </Card>
                );
              })}
            </div>
          </div>
        )
      )}

      {/* Products Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4">
          {/* Search Results or Default View */}
          {hasActiveFilters ? (
            // Search/Filter Results
            <div>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-bold text-text-dark mb-2">
                    {searchTerm
                      ? `Search Results for "${searchTerm}"`
                      : selectedCategory !== 'all'
                        ? `Products in ${categories.find((cat) => (cat._id || cat.id) === selectedCategory)?.name || 'Selected Category'}`
                        : 'Filtered Products'}
                  </h2>
                  <p className="text-text-muted">
                    {isLoading
                      ? 'Loading...'
                      : `${filteredProducts.length} products found`}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  {/* View Mode Toggle */}
                  <div className="flex bg-white rounded-xl p-1 shadow-sm">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded-lg transition-colors ${
                        viewMode === 'grid'
                          ? 'bg-muted-olive text-white'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <Grid3X3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded-lg transition-colors ${
                        viewMode === 'list'
                          ? 'bg-muted-olive text-white'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    onClick={clearFilters}
                    className="text-muted-olive hover:text-muted-olive/80 font-medium flex items-center gap-2"
                  >
                    Clear Filters
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {isLoading ? (
                <div className="flex justify-center py-12">
                  <LoadingSpinner size="md" text="Searching products..." />
                </div>
              ) : productsError ? (
                <div className="text-center py-12">
                  <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-text-muted">Unable to load products</p>
                </div>
              ) : filteredProducts.length > 0 ? (
                <div
                  className={`${
                    viewMode === 'grid'
                      ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                      : 'space-y-4'
                  }`}
                >
                  {filteredProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onClick={() => handleProductClick(product)}
                      showDetailed={viewMode === 'list'}
                      className={viewMode === 'list' ? 'flex-row' : ''}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-text-dark mb-2">
                    No products found
                  </h3>
                  <p className="text-text-muted mb-6">
                    {searchTerm
                      ? `No products match "${searchTerm}". Try different keywords.`
                      : 'No products match your current filters. Try adjusting your criteria.'}
                  </p>
                  <button
                    onClick={clearFilters}
                    className="text-muted-olive hover:text-muted-olive/80 font-medium"
                  >
                    Clear All Filters
                  </button>
                </div>
              )}
            </div>
          ) : (
            // Default view: Featured products first, then all products
            <div className="space-y-16">
              {/* Featured Products Section */}
              <div>
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold text-text-dark mb-4">
                    Featured Products
                  </h2>
                  <p className="text-text-muted text-lg">
                    Premium products from our verified vendor network
                  </p>
                </div>

                {isFeaturedLoading ? (
                  <div className="flex justify-center py-12">
                    <LoadingSpinner
                      size="md"
                      text="Loading featured products..."
                    />
                  </div>
                ) : featuredError ? (
                  <div className="text-center py-12">
                    <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-text-muted">
                      Unable to load featured products
                    </p>
                  </div>
                ) : featuredProducts.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {featuredProducts.slice(0, 8).map((product) => (
                      <ProductCard
                        key={`featured-${product.id}`}
                        product={product}
                        onClick={() => handleProductClick(product)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-text-muted">
                      No featured products available at the moment.
                    </p>
                  </div>
                )}
              </div>

              {/* All Products Section */}
              <div>
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold text-text-dark mb-4">
                    All Products
                  </h2>
                  <p className="text-text-muted text-lg">
                    Browse our complete catalog of fresh produce
                  </p>
                </div>

                {isLoading ? (
                  <div className="flex justify-center py-12">
                    <LoadingSpinner size="md" text="Loading all products..." />
                  </div>
                ) : productsError ? (
                  <div className="text-center py-12">
                    <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-text-muted">Unable to load products</p>
                  </div>
                ) : enhancedProducts.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {enhancedProducts.slice(0, 16).map((product) => (
                      <ProductCard
                        key={`product-${product.id}`}
                        product={product}
                        onClick={() => handleProductClick(product)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-text-dark mb-2">
                      No products available
                    </h3>
                    <p className="text-text-muted">
                      Check back soon for new products from our vendors.
                    </p>
                  </div>
                )}
              </div>

              {/* Call to Action */}
              <div className="text-center">
                <p className="text-text-muted mb-6">
                  Join to access our full catalog and place orders with local
                  vendors.
                </p>
                <button
                  onClick={handleSignUpClick}
                  className="bg-gradient-primary text-white px-8 py-3 rounded-2xl font-semibold hover:shadow-lg transition-all duration-200 inline-flex items-center gap-2"
                >
                  <ShoppingBag className="w-5 h-5" />
                  Sign Up to Start Shopping
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Product Detail Modal */}
      <ProductModal
        productId={selectedProductId}
        isOpen={!!selectedProductId}
        onClose={() => setSelectedProductId(null)}
        onSignUpClick={handleSignUpClick}
      />
    </div>
  );
};

export default ProductCatalog;
