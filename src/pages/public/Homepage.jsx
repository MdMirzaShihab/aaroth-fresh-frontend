import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Package,
  Filter,
  X,
} from 'lucide-react';
import {
  useGetFeaturedProductsQuery,
} from '../../store/slices/apiSlice';
import { toggleTheme, selectThemeMode } from '../../store/slices/themeSlice';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { Card } from '../../components/ui/Card';
import PublicNavbar from '../../components/public/PublicNavbar';
import SearchNavbar from '../../components/public/SearchNavbar';
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

  // Ref for explore section
  const exploreSectionRef = useRef(null);

  // Track if we should scroll on next filter change
  const shouldScrollRef = useRef(false);

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

  // Scroll to explore section when shouldScrollRef is true
  useEffect(() => {
    if (shouldScrollRef.current && exploreSectionRef.current) {
      const offset = 100; // Account for sticky navbar
      const elementPosition = exploreSectionRef.current.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });

      // Reset the flag
      shouldScrollRef.current = false;
    }
  }, [filters]); // Trigger when filters change

  // Handle filter changes from SearchNavbar - scroll to Explore section
  const handleSearchNavbarFilterChange = (filterType, value) => {
    // Set flag to scroll after filter update
    shouldScrollRef.current = true;
    // Update filter without preventing scroll
    updateFilter(filterType, value);
  };

  // Fetch real data from APIs
  const {
    data: featuredData,
    isLoading: featuredLoading,
    error: featuredError,
  } = useGetFeaturedProductsQuery();

  // Fix data access patterns to match actual API response
  const featuredListings = featuredData?.data || [];

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
      {/* Public Navigation Bar */}
      <PublicNavbar
        themeMode={themeMode}
        onThemeToggle={handleThemeToggle}
      />

      {/* Search Navigation Bar */}
      <SearchNavbar
        searchValue={filters.search}
        onSearchChange={(value) => handleSearchNavbarFilterChange('search', value)}
        selectedCategory={filters.category}
        onCategorySelect={(id) => handleSearchNavbarFilterChange('category', id)}
      />

      {/* Hero Section - Simplified without search */}
      <div className="pt-16 md:pt-20">
        <HeroSection />
      </div>

      {/* Featured Products Section */}
      <section className="py-12 md:py-16 px-4 sm:px-6 bg-white dark:bg-dark-bg transition-colors duration-300">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 md:mb-12 px-2">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-text-dark dark:text-dark-text-primary mb-3 md:mb-4 transition-colors duration-300">
              Featured Products
            </h2>
            <p className="text-base sm:text-lg text-text-muted dark:text-dark-text-muted max-w-2xl mx-auto leading-relaxed transition-colors duration-300">
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
              <>
                {/* Mobile scroll indicator hint */}
                <div className="lg:hidden text-center mb-3">
                  <p className="text-xs text-text-muted dark:text-dark-text-muted animate-pulse">
                    ← Swipe to explore →
                  </p>
                </div>

                <div className="flex lg:grid overflow-x-auto lg:overflow-visible snap-x snap-mandatory scrollbar-hide lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6 pb-6 lg:pb-0 -mx-4 px-4 sm:mx-0 sm:px-0">
                  {featuredProducts.slice(0, 4).map((product, index) => (
                    <Card
                      key={product.id}
                      className="glass-3 dark:bg-dark-glass-olive border-2 border-white/30 dark:border-dark-sage-accent/30 shadow-depth-3 dark:shadow-dark-depth-2 overflow-hidden hover:shadow-glow-olive dark:hover:shadow-dark-glow-olive active:scale-95 lg:hover:-translate-y-3 lg:hover:scale-105 transition-all duration-500 snap-center flex-shrink-0 w-[280px] sm:w-[300px] md:w-80 lg:w-auto animate-fade-in touch-target"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="aspect-video bg-gradient-to-br from-sage-green/20 to-muted-olive/20 rounded-t-2xl relative overflow-hidden">
                        {product.images && product.images.length > 0 ? (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="text-5xl sm:text-6xl opacity-20">🥬</div>
                        </div>
                      </div>

                      <div className="p-4 sm:p-5 md:p-6">
                        <h3 className="text-lg sm:text-xl font-semibold text-text-dark dark:text-dark-text-primary mb-1.5 sm:mb-2 transition-colors duration-300 line-clamp-2">
                          {product.name}
                        </h3>
                        <p className="text-sm sm:text-base text-text-muted dark:text-dark-text-muted mb-3 sm:mb-4 transition-colors duration-300 line-clamp-1">
                          {product.category?.name || 'Fresh Produce'}
                        </p>

                        <div className="space-y-2.5">
                          <div className="flex items-baseline gap-2">
                            <span className="text-lg sm:text-xl font-bold text-muted-olive dark:text-dark-sage-accent transition-colors duration-300">
                              {product.averagePrice
                                ? `৳${product.averagePrice.toFixed(2)}`
                                : 'Price on request'}
                            </span>
                            <span className="text-xs sm:text-sm text-text-muted dark:text-dark-text-muted transition-colors duration-300">
                              per {product.unit}
                            </span>
                          </div>
                          <div className="flex items-center justify-between pt-2 border-t border-sage-green/10 dark:border-dark-sage-accent/10">
                            <div className="text-xs sm:text-sm text-text-muted dark:text-dark-text-muted transition-colors duration-300 truncate flex-1">
                              {product.vendorName}
                            </div>
                            {product.qualityGrade && (
                              <div className="text-xs font-medium text-muted-olive dark:text-dark-sage-accent bg-sage-green/10 dark:bg-dark-sage-accent/10 px-2 py-1 rounded-full ml-2 transition-colors duration-300 flex-shrink-0">
                                {product.qualityGrade}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </>
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
        ref={exploreSectionRef}
        id="browse-all-products"
        className="relative py-12 sm:py-16 md:py-20 px-4 sm:px-6 bg-gradient-to-br from-sage-green/5 via-white to-earthy-beige/10 dark:from-dark-sage-accent/5 dark:via-dark-bg dark:to-dark-olive-bg/20 overflow-hidden transition-colors duration-300"
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
          <div className="text-center mb-8 md:mb-12 px-2">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-text-dark dark:text-dark-text-primary mb-3 md:mb-4 transition-colors duration-300">
              Explore Fresh Produce
            </h2>
            <p className="text-base sm:text-lg text-text-muted dark:text-dark-text-muted max-w-2xl mx-auto leading-relaxed transition-colors duration-300">
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
              className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 bg-gradient-secondary text-white px-5 sm:px-6 py-3.5 sm:py-4 rounded-full shadow-depth-3 hover:shadow-glow-olive active:scale-95 flex items-center gap-2.5 z-40 touch-target-large transition-all duration-300 backdrop-blur-sm border-2 border-white/20"
            >
              <Filter className="w-5 h-5 sm:w-6 sm:h-6" />
              <span className="font-semibold text-sm sm:text-base">Filters</span>
              {activeFilterCount > 0 && (
                <span className="bg-white text-muted-olive px-2.5 py-1 rounded-full text-xs sm:text-sm font-bold min-w-[24px] text-center animate-scale-in">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Mobile Filter Drawer */}
            {showMobileFilters && (
              <div className="fixed inset-0 z-50 lg:hidden">
                {/* Backdrop */}
                <div
                  className="absolute inset-0 bg-black/60 dark:bg-black/70 backdrop-blur-sm animate-fade-in"
                  onClick={() => setShowMobileFilters(false)}
                  aria-hidden="true"
                />

                {/* Drawer */}
                <div
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="filter-drawer-title"
                  className="absolute inset-y-0 right-0 w-full sm:w-96 bg-white dark:bg-dark-bg shadow-2xl animate-slide-left"
                >
                  <div className="h-full flex flex-col">
                    {/* Header - Enhanced for mobile */}
                    <div className="flex items-center justify-between p-5 sm:p-6 border-b border-border-light dark:border-dark-border bg-gradient-to-r from-sage-green/5 to-transparent dark:from-dark-sage-accent/5">
                      <div>
                        <h3
                          id="filter-drawer-title"
                          className="text-xl sm:text-2xl font-bold text-text-dark dark:text-dark-text-primary transition-colors duration-300"
                        >
                          Filters
                        </h3>
                        {activeFilterCount > 0 && (
                          <p className="text-xs sm:text-sm text-text-muted dark:text-dark-text-muted mt-1">
                            {activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''} active
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => setShowMobileFilters(false)}
                        aria-label="Close filters"
                        className="p-2.5 hover:bg-gray-100 dark:hover:bg-dark-glass-olive rounded-xl touch-target-large transition-colors duration-200 active:scale-95"
                      >
                        <X className="w-6 h-6 text-text-dark dark:text-dark-text-primary" />
                      </button>
                    </div>

                    {/* Filter Content - Scrollable */}
                    <div className="flex-1 overflow-y-auto overscroll-contain">
                      <FilterSidebar
                        filters={filters}
                        updateFilter={updateFilter}
                        clearFilters={clearFilters}
                        mobile
                      />
                    </div>

                    {/* Footer Actions - Sticky bottom */}
                    <div className="p-4 sm:p-6 border-t border-border-light dark:border-dark-border bg-white/95 dark:bg-dark-bg/95 backdrop-blur-xl flex gap-3 sm:gap-4">
                      <button
                        onClick={clearFilters}
                        className="flex-1 px-5 py-3.5 sm:py-4 border-2 border-border-light dark:border-dark-border rounded-2xl font-semibold text-sm sm:text-base hover:bg-gray-50 dark:hover:bg-dark-glass-olive active:scale-95 transition-all duration-200 touch-target-large text-text-dark dark:text-dark-text-primary"
                      >
                        Clear All
                      </button>
                      <button
                        onClick={() => setShowMobileFilters(false)}
                        className="flex-1 bg-gradient-secondary text-white px-5 py-3.5 sm:py-4 rounded-2xl font-semibold text-sm sm:text-base hover:shadow-depth-3 active:scale-95 transition-all duration-200 touch-target-large"
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
