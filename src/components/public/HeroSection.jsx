import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf, ArrowRight, Search } from 'lucide-react';
import { cn } from '../../utils';
import { useGetCategoriesQuery } from '../../store/slices/apiSlice';

/**
 * HeroSection Component
 *
 * Next-generation agritech hero section with:
 * - Animated gradient background
 * - Smart search bar with debouncing
 * - Quick category filter pills
 * - Dual CTA buttons
 * - Floating vegetable illustrations
 * - Responsive mobile-first design
 *
 * @param {Object} props
 * @param {string} props.searchValue - Current search value
 * @param {Function} props.onSearchChange - Search change handler
 * @param {string} props.selectedCategory - Currently selected category
 * @param {Function} props.onCategorySelect - Category selection handler
 * @param {string} props.className - Additional CSS classes
 */
const HeroSection = ({
  searchValue = '',
  onSearchChange,
  selectedCategory = 'all',
  onCategorySelect,
  className,
}) => {
  // Fetch categories for pills
  const { data: categoriesData, isLoading: categoriesLoading } = useGetCategoriesQuery();
  const categories = categoriesData?.data || [];

  // Show first 6 categories as quick filters
  const topCategories = categories.slice(0, 6);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    // Search is handled by debounced onChange
  };

  return (
    <section
      className={cn(
        'relative bg-gradient-to-br from-earthy-beige via-white to-sage-green/10 overflow-hidden',
        className
      )}
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating Gradient Orbs */}
        <div className="absolute top-20 left-10 w-64 h-64 bg-sage-green/20 rounded-full blur-3xl animate-float" />
        <div
          className="absolute bottom-20 right-10 w-96 h-96 bg-muted-olive/10 rounded-full blur-3xl animate-float"
          style={{ animationDelay: '1s', animationDuration: '4s' }}
        />
        <div
          className="absolute top-1/2 left-1/3 w-48 h-48 bg-earthy-yellow/10 rounded-full blur-2xl animate-float"
          style={{ animationDelay: '2s', animationDuration: '5s' }}
        />

        {/* Subtle Grid Pattern */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(to right, #7f8966 1px, transparent 1px),
                              linear-gradient(to bottom, #7f8966 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      {/* Content Container */}
      <div className="relative max-w-6xl mx-auto px-4 py-16 md:py-24 lg:py-32">
        {/* Badge */}
        <div
          className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full text-muted-olive font-medium mb-6 animate-fade-in shadow-soft"
          style={{ animationDelay: '100ms' }}
        >
          <Leaf className="w-4 h-4" />
          <span className="text-sm">Fresh • Local • Organic</span>
        </div>

        {/* Main Heading */}
        <h1
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-text-dark mb-6 animate-fade-in leading-tight"
          style={{ animationDelay: '200ms' }}
        >
          Fresh Produce,
          <br />
          <span className="text-muted-olive">Delivered Fresh</span>
        </h1>

        {/* Subtitle */}
        <p
          className="text-lg sm:text-xl md:text-2xl text-text-muted mb-8 max-w-2xl animate-fade-in leading-relaxed"
          style={{ animationDelay: '300ms' }}
        >
          B2B marketplace connecting local vegetable vendors with restaurants.
          Quality guaranteed, farm to table.
        </p>

        {/* Search Bar */}
        <div
          className="mb-8 animate-fade-in"
          style={{ animationDelay: '400ms' }}
        >
          <form onSubmit={handleSearchSubmit} className="relative max-w-2xl">
            <div className="relative flex items-center">
              <Search className="absolute left-6 w-5 h-5 text-text-muted pointer-events-none" />
              <input
                type="text"
                value={searchValue}
                onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
                placeholder="Search products, categories, or vendors..."
                className="w-full pl-14 pr-6 py-5 rounded-2xl bg-white/90 backdrop-blur-sm border-2 border-gray-200 focus:border-muted-olive focus:ring-4 focus:ring-muted-olive/20 outline-none transition-all duration-200 text-base md:text-lg placeholder:text-text-muted/60 shadow-soft hover:shadow-depth-2 touch-target"
                style={{ fontSize: '16px' }} // Prevent iOS zoom
              />
              {searchValue && (
                <button
                  type="button"
                  onClick={() => onSearchChange && onSearchChange('')}
                  className="absolute right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
                  aria-label="Clear search"
                >
                  <span className="text-text-muted text-xl leading-none">×</span>
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Category Pills */}
        {!categoriesLoading && topCategories.length > 0 && (
          <div
            className="mb-10 animate-fade-in"
            style={{ animationDelay: '500ms' }}
          >
            <div className="flex flex-wrap gap-3 justify-center md:justify-start">
              <button
                onClick={() => onCategorySelect && onCategorySelect('all')}
                className={cn(
                  'px-5 py-2.5 rounded-full font-medium transition-all duration-200 text-sm md:text-base touch-target',
                  selectedCategory === 'all'
                    ? 'bg-muted-olive text-white shadow-depth-2 scale-105'
                    : 'bg-white/80 backdrop-blur-sm text-text-dark hover:bg-white hover:shadow-soft border border-gray-200'
                )}
              >
                All Products
              </button>

              {topCategories.map((category, index) => (
                <button
                  key={category._id || category.id}
                  onClick={() =>
                    onCategorySelect && onCategorySelect(category._id || category.id)
                  }
                  className={cn(
                    'px-5 py-2.5 rounded-full font-medium transition-all duration-200 text-sm md:text-base touch-target animate-scale-in',
                    selectedCategory === (category._id || category.id)
                      ? 'bg-sage-green text-white shadow-depth-2 scale-105'
                      : 'bg-white/80 backdrop-blur-sm text-text-dark hover:bg-white hover:shadow-soft border border-gray-200'
                  )}
                  style={{ animationDelay: `${(index + 1) * 50}ms` }}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* CTA Buttons */}
        <div
          className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start animate-fade-in"
          style={{ animationDelay: '600ms' }}
        >
          <Link
            to="/products"
            className="bg-gradient-secondary text-white px-8 py-4 rounded-2xl font-semibold hover:shadow-depth-3 hover:scale-105 active:scale-100 transition-all duration-200 flex items-center gap-2 justify-center touch-target group"
          >
            <span>Browse Products</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            to="/register"
            className="bg-white/90 backdrop-blur-sm border-2 border-gray-200 text-text-dark px-8 py-4 rounded-2xl font-semibold hover:border-muted-olive/50 hover:shadow-depth-2 hover:scale-105 active:scale-100 transition-all duration-200 flex items-center gap-2 justify-center touch-target"
          >
            <Leaf className="w-5 h-5" />
            <span>Become a Vendor</span>
          </Link>
        </div>

        {/* Trust Indicators */}
        <div
          className="mt-12 flex flex-wrap items-center gap-6 justify-center md:justify-start text-sm text-text-muted animate-fade-in"
          style={{ animationDelay: '700ms' }}
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-sage-green animate-pulse" />
            <span>500+ Vendors</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-sage-green animate-pulse" />
            <span>10,000+ Products</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-sage-green animate-pulse" />
            <span>100% Fresh Guarantee</span>
          </div>
        </div>
      </div>

      {/* Bottom Gradient Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent pointer-events-none" />
    </section>
  );
};

export default HeroSection;
