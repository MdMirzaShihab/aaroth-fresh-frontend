import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Package,
  Filter,
  X,
  Moon,
  Sun,
} from 'lucide-react';
import {
  useGetFeaturedProductsQuery,
  useGetCategoriesQuery,
} from '../../store/slices/apiSlice';
import { toggleTheme, selectThemeMode } from '../../store/slices/themeSlice';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { Card } from '../../components/ui/Card';
import HeroSection from '../../components/public/HeroSection';
import ProductGrid from '../../components/public/ProductGrid';
import FilterSidebar from '../../components/public/FilterSidebar';
import { useProductFilters } from '../../hooks/useProductFilters';

const Homepage = () => {
  // Theme management
  const dispatch = useDispatch();
  const themeMode = useSelector(selectThemeMode);

  const handleThemeToggle = () => {
    dispatch(toggleTheme());
  };

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
    <div className="min-h-screen bg-background dark:bg-dark-bg transition-colors duration-300 relative">
      {/* Floating Theme Toggle Button */}
      <button
        onClick={handleThemeToggle}
        className="fixed top-6 right-6 z-50 w-14 h-14 rounded-2xl glass-3 dark:bg-dark-glass-olive border-2 border-white/40 dark:border-dark-sage-accent/40 shadow-depth-2 dark:shadow-dark-depth-2 hover:shadow-glow-olive dark:hover:shadow-dark-glow-olive flex items-center justify-center text-text-dark dark:text-dark-text-primary hover:scale-110 active:scale-95 transition-all duration-300 touch-target group"
        aria-label={`Switch to ${themeMode === 'light' ? 'dark' : 'light'} mode`}
      >
        {themeMode === 'light' ? (
          <Moon className="w-6 h-6 group-hover:rotate-12 transition-transform duration-300" />
        ) : (
          <Sun className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
        )}
      </button>

      {/* New Hero Section with Search & Category Filters */}
      <HeroSection
        searchValue={filters.search}
        onSearchChange={(value) => updateFilter('search', value)}
        selectedCategory={filters.category}
        onCategorySelect={(id) => updateFilter('category', id)}
      />

      {/* Featured Products Section */}
      <section className="py-12 px-4 bg-white dark:bg-dark-bg transition-colors duration-300">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-text-dark dark:text-dark-text-primary mb-4 transition-colors duration-300">
              Featured Products
            </h2>
            <p className="text-lg text-text-muted dark:text-dark-text-muted max-w-2xl mx-auto transition-colors duration-300">
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
              <div className="flex lg:grid overflow-x-auto lg:overflow-visible snap-x snap-mandatory scrollbar-hide lg:grid-cols-4 gap-6 pb-4 lg:pb-0">
                {featuredProducts.slice(0, 4).map((product, index) => (
                  <Card
                    key={product.id}
                    className="glass-3 dark:bg-dark-glass-olive border-2 border-white/30 dark:border-dark-sage-accent/30 shadow-depth-3 dark:shadow-dark-depth-2 overflow-hidden hover:shadow-glow-olive dark:hover:shadow-dark-glow-olive hover:-translate-y-3 hover:scale-105 transition-all duration-500 snap-center flex-shrink-0 w-80 lg:w-auto animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
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
                      <h3 className="text-xl font-semibold text-text-dark dark:text-dark-text-primary mb-2 transition-colors duration-300">
                        {product.name}
                      </h3>
                      <p className="text-text-muted dark:text-dark-text-muted mb-4 transition-colors duration-300">
                        {product.category?.name || 'Fresh Produce'}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-muted-olive dark:text-dark-sage-accent transition-colors duration-300">
                            {product.averagePrice
                              ? `৳${product.averagePrice.toFixed(2)}`
                              : 'Price on request'}
                          </span>
                          <span className="text-sm text-text-muted dark:text-dark-text-muted transition-colors duration-300">
                            per {product.unit}
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-text-muted dark:text-dark-text-muted transition-colors duration-300">
                            {product.vendorName}
                          </div>
                          {product.qualityGrade && (
                            <div className="text-xs text-muted-olive dark:text-dark-sage-accent mt-1 transition-colors duration-300">
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
        </div>
      </section>

      {/* Browse All Products Section - MAIN FOCUS */}
      <section
        id="browse-all-products"
        className="relative py-20 px-4 bg-gradient-to-br from-sage-green/5 via-white to-earthy-beige/10 dark:from-dark-sage-accent/5 dark:via-dark-bg dark:to-dark-olive-bg/20 overflow-hidden transition-colors duration-300"
      >
        {/* Floating Background Orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-64 h-64 bg-sage-green/10 dark:bg-dark-sage-accent/10 rounded-full blur-3xl animate-float" />
          <div
            className="absolute bottom-20 right-10 w-96 h-96 bg-muted-olive/5 dark:bg-dark-cedar-warm/8 rounded-full blur-3xl animate-float"
            style={{ animationDelay: '1s', animationDuration: '4s' }}
          />
        </div>
        <div className="relative max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-text-dark dark:text-dark-text-primary mb-4 transition-colors duration-300">
              Explore Fresh Produce
            </h2>
            <p className="text-lg text-text-muted dark:text-dark-text-muted max-w-2xl mx-auto transition-colors duration-300">
              Browse thousands of products with smart filtering
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

      {/* Stats Section - REMOVED */}
      {/* Categories Preview Section - REMOVED */}
      {/* Final CTA Section - REMOVED */}
    </div>
  );
};

export default Homepage;
