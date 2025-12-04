import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Leaf,
  Users,
  ShoppingCart,
  ArrowRight,
  Star,
  TrendingUp,
  Package,
  Filter,
  X,
} from 'lucide-react';
import {
  useGetFeaturedProductsQuery,
  useGetCategoriesQuery,
} from '../../store/slices/apiSlice';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { Card } from '../../components/ui/Card';
import HeroSection from '../../components/public/HeroSection';
import ProductGrid from '../../components/public/ProductGrid';
import FilterSidebar from '../../components/public/FilterSidebar';
import { useProductFilters } from '../../hooks/useProductFilters';

const Homepage = () => {
  // Mobile filter drawer state
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Filter state management
  const {
    filters,
    updateFilter,
    removeFilter,
    clearFilters,
    getFilterLabel,
    hasActiveFilters,
    activeFilterCount,
  } = useProductFilters();

  // Fetch real data from APIs
  const {
    data: featuredData,
    isLoading: featuredLoading,
    error: featuredError,
  } = useGetFeaturedProductsQuery();

  const { data: categoriesData } = useGetCategoriesQuery();

  // Fix data access patterns to match actual API response
  const featuredListings = featuredData?.data || [];
  const categories = categoriesData?.data || [];

  // Debug logging removed

  // Transform featured listings to expected product format
  const featuredProducts = featuredListings.map((listing) => ({
    id: listing.id,
    name: listing.productId?.name || 'Unknown Product',
    category: listing.productId?.category,
    images:
      listing.images?.length > 0
        ? listing.images.map((img) => img.url)
        : listing.productId?.images || [],
    averagePrice: listing.effectivePrice || listing.pricing?.[0]?.pricePerUnit,
    unit: listing.pricing?.[0]?.unit || listing.availability?.unit || 'unit',
    activeListingsCount: 1, // Each listing represents one vendor
    vendorName: listing.vendorId?.businessName || 'Local Vendor',
    qualityGrade: listing.qualityGrade,
    isInSeason: listing.availability?.isInSeason,
    quantityAvailable: listing.availability?.quantityAvailable,
  }));

  // Handle Escape key to close mobile filter drawer
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && showMobileFilters) {
        setShowMobileFilters(false);
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [showMobileFilters]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (showMobileFilters) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [showMobileFilters]);

  return (
    <div className="min-h-screen bg-background">
      {/* New Hero Section with Search & Category Filters */}
      <HeroSection
        searchValue={filters.search}
        onSearchChange={(value) => updateFilter('search', value)}
        selectedCategory={filters.category}
        onCategorySelect={(id) => updateFilter('category', id)}
      />

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-text-dark mb-4">
              Why Choose Aaroth Fresh?
            </h2>
            <p className="text-xl text-text-muted max-w-2xl mx-auto">
              We connect buyers with local farmers for the freshest ingredients
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass rounded-3xl p-8 text-center hover:shadow-soft transition-all duration-200">
              <div className="w-16 h-16 bg-sage-green/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Leaf className="w-8 h-8 text-muted-olive" />
              </div>
              <h3 className="text-xl font-semibold text-text-dark mb-4">
                Farm Fresh
              </h3>
              <p className="text-text-muted">
                Direct from local farms to your kitchen. No middlemen, maximum
                freshness.
              </p>
            </div>

            <div className="glass rounded-3xl p-8 text-center hover:shadow-soft transition-all duration-200">
              <div className="w-16 h-16 bg-earthy-yellow/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8 text-earthy-brown" />
              </div>
              <h3 className="text-xl font-semibold text-text-dark mb-4">
                Local Vendors
              </h3>
              <p className="text-text-muted">
                Support local farmers and get access to seasonal specialties.
              </p>
            </div>

            <div className="glass rounded-3xl p-8 text-center hover:shadow-soft transition-all duration-200">
              <div className="w-16 h-16 bg-gradient-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <ShoppingCart className="w-8 h-8 text-muted-olive" />
              </div>
              <h3 className="text-xl font-semibold text-text-dark mb-4">
                Easy Ordering
              </h3>
              <p className="text-text-muted">
                Simple ordering process with reliable delivery to your buyer.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-text-dark mb-4">
              Featured Products
            </h2>
            <p className="text-xl text-text-muted max-w-2xl mx-auto">
              Discover premium quality produce from our verified vendors
            </p>
          </div>

          {featuredLoading && (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          )}

          {!featuredLoading && featuredError && (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-text-muted">
                Unable to load featured products
              </p>
            </div>
          )}

          {!featuredLoading &&
            !featuredError &&
            featuredProducts.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                {featuredProducts.slice(0, 6).map((product) => (
                  <Card
                    key={product.id}
                    className="overflow-hidden hover:shadow-lg transition-all duration-200"
                  >
                    <div className="aspect-video bg-gradient-to-br from-sage-green/20 to-muted-olive/20 rounded-t-2xl relative overflow-hidden">
                      {product.images && product.images.length > 0 ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="text-6xl opacity-20">🥬</div>
                      </div>
                    </div>

                    <div className="p-6">
                      <h3 className="text-xl font-semibold text-text-dark mb-2">
                        {product.name}
                      </h3>
                      <p className="text-text-muted mb-4">
                        {product.category?.name || 'Fresh Produce'}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-muted-olive">
                            {product.averagePrice
                              ? `৳${product.averagePrice.toFixed(2)}`
                              : 'Price on request'}
                          </span>
                          <span className="text-sm text-text-muted">
                            per {product.unit}
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-text-muted">
                            {product.vendorName}
                          </div>
                          {product.qualityGrade && (
                            <div className="text-xs text-muted-olive mt-1">
                              {product.qualityGrade}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}

          {!featuredLoading &&
            !featuredError &&
            featuredProducts.length === 0 && (
              <div className="text-center py-12">
                <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-text-muted">
                  No featured products available
                </p>
              </div>
            )}

          {/* View All Products Button */}
          <div className="text-center mt-12">
            <a
              href="#browse-all-products"
              className="inline-flex items-center gap-2 bg-gradient-secondary text-white px-8 py-4 rounded-2xl font-semibold hover:shadow-lg transition-all duration-200 touch-target"
            >
              View All Products
              <ArrowRight className="w-5 h-5" />
            </a>
          </div>
        </div>
      </section>

      {/* Browse All Products Section - NEW */}
      <section
        id="browse-all-products"
        className="py-20 px-4 bg-gradient-to-br from-sage-green/5 to-earthy-beige/20"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-text-dark mb-4">
              Browse All Products
            </h2>
            <p className="text-xl text-text-muted max-w-2xl mx-auto">
              Explore our full catalog with advanced filtering
            </p>
          </div>

          {/* Desktop Layout: Sidebar + Grid */}
          <div className="hidden lg:flex gap-8">
            <FilterSidebar
              filters={filters}
              updateFilter={updateFilter}
              clearFilters={clearFilters}
              className="w-72 flex-shrink-0 sticky top-24 self-start"
              mobile={false}
            />

            <ProductGrid
              filters={filters}
              updateFilter={updateFilter}
              removeFilter={removeFilter}
              clearFilters={clearFilters}
              getFilterLabel={getFilterLabel}
              hasActiveFilters={hasActiveFilters}
              activeFilterCount={activeFilterCount}
              className="flex-1"
            />
          </div>

          {/* Mobile/Tablet Layout: Grid + Floating Filter Button */}
          <div className="lg:hidden">
            <ProductGrid
              filters={filters}
              updateFilter={updateFilter}
              removeFilter={removeFilter}
              clearFilters={clearFilters}
              getFilterLabel={getFilterLabel}
              hasActiveFilters={hasActiveFilters}
              activeFilterCount={activeFilterCount}
            />

            {/* Mobile Filter Button - Floating */}
            <button
              onClick={() => setShowMobileFilters(true)}
              aria-label="Open filters"
              aria-expanded={showMobileFilters}
              className="fixed bottom-6 right-6 bg-gradient-secondary text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2 z-40 touch-target"
            >
              <Filter className="w-5 h-5" />
              Filters
              {activeFilterCount > 0 && (
                <span className="bg-white text-muted-olive px-2 py-0.5 rounded-full text-sm font-semibold">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Mobile Filter Drawer */}
            {showMobileFilters && (
              <div className="fixed inset-0 z-50">
                {/* Backdrop */}
                <div
                  className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                  onClick={() => setShowMobileFilters(false)}
                  aria-hidden="true"
                />

                {/* Drawer */}
                <div
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="filter-drawer-title"
                  className="absolute inset-y-0 right-0 w-full sm:w-96 bg-white shadow-xl animate-slide-left"
                >
                  <div className="h-full flex flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-border-light">
                      <h3
                        id="filter-drawer-title"
                        className="text-xl font-semibold text-text-dark"
                      >
                        Filters
                      </h3>
                      <button
                        onClick={() => setShowMobileFilters(false)}
                        aria-label="Close filters"
                        className="p-2 hover:bg-gray-100 rounded-xl touch-target"
                      >
                        <X className="w-6 h-6" />
                      </button>
                    </div>

                    {/* Filter Content */}
                    <div className="flex-1 overflow-y-auto">
                      <FilterSidebar
                        filters={filters}
                        updateFilter={updateFilter}
                        clearFilters={clearFilters}
                        mobile
                      />
                    </div>

                    {/* Footer Actions */}
                    <div className="p-6 border-t border-border-light flex gap-3">
                      <button
                        onClick={clearFilters}
                        className="flex-1 px-6 py-3 border border-border-light rounded-2xl font-medium hover:bg-gray-50 transition-colors touch-target"
                      >
                        Clear All
                      </button>
                      <button
                        onClick={() => setShowMobileFilters(false)}
                        className="flex-1 bg-gradient-secondary text-white px-6 py-3 rounded-2xl font-medium hover:shadow-lg transition-all duration-200 touch-target"
                      >
                        Show Results
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Categories Preview Section */}
      {categories.length > 0 && (
        <section className="py-20 px-4 bg-gradient-to-br from-sage-green/5 to-earthy-beige/20">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-text-dark mb-4">
                Product Categories
              </h2>
              <p className="text-xl text-text-muted max-w-2xl mx-auto">
                Browse by category to find exactly what you need
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {categories.slice(0, 8).map((category) => (
                <Link
                  key={category.id}
                  to="/products"
                  className="glass rounded-3xl p-6 text-center hover:shadow-soft transition-all duration-200 group"
                >
                  <div className="w-16 h-16 bg-gradient-secondary rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-200">
                    <Leaf className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-semibold text-text-dark mb-2">
                    {category.name}
                  </h3>
                  <p className="text-sm text-text-muted">
                    {category.productCount || 0} products
                  </p>
                </Link>
              ))}
            </div>

            <div className="text-center mt-12">
              <Link
                to="/products"
                className="inline-flex items-center gap-2 text-muted-olive hover:text-muted-olive/80 font-medium transition-colors"
              >
                View All Categories
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Stats Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-text-dark mb-4">
              Growing Every Day
            </h2>
            <p className="text-xl text-text-muted max-w-2xl mx-auto">
              Join our thriving marketplace community
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div className="glass rounded-3xl p-8">
              <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <div className="text-4xl font-bold text-muted-olive mb-2">
                {categories.length > 0
                  ? categories.reduce(
                      (total, cat) => total + (cat.productCount || 0),
                      0
                    ) || categories.length * 10
                  : '150+'}
              </div>
              <div className="text-text-muted">Local Vendors</div>
            </div>
            <div className="glass rounded-3xl p-8">
              <div className="w-16 h-16 bg-gradient-secondary rounded-2xl flex items-center justify-center mx-auto mb-4">
                <ShoppingCart className="w-8 h-8 text-white" />
              </div>
              <div className="text-4xl font-bold text-muted-olive mb-2">5+</div>
              <div className="text-text-muted">Buyers</div>
            </div>
            <div className="glass rounded-3xl p-8">
              <div className="w-16 h-16 bg-sage-green/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-muted-olive" />
              </div>
              <div className="text-4xl font-bold text-muted-olive mb-2">
                100+
              </div>
              <div className="text-text-muted">Orders Delivered</div>
            </div>
            <div className="glass rounded-3xl p-8">
              <div className="w-16 h-16 bg-earthy-yellow/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-earthy-brown" />
              </div>
              <div className="text-4xl font-bold text-muted-olive mb-2">
                4.8
              </div>
              <div className="text-text-muted flex items-center justify-center gap-1">
                <Star className="w-4 h-4 text-earthy-yellow fill-current" />
                Rating
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="glass rounded-3xl p-12">
            <h2 className="text-3xl md:text-4xl font-bold text-text-dark mb-4">
              Ready to Get Fresh?
            </h2>
            <p className="text-xl text-text-muted mb-8">
              Join hundreds of buyers already using Aaroth Fresh
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="bg-gradient-primary text-white px-8 py-4 rounded-2xl font-semibold hover:shadow-lg transition-all duration-200 flex items-center gap-2 justify-center touch-target"
              >
                Start Ordering
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/vendors"
                className="bg-gradient-secondary text-white px-8 py-4 rounded-2xl font-semibold hover:shadow-lg transition-all duration-200 flex items-center gap-2 justify-center touch-target"
              >
                Become a Vendor
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Homepage;
