import React from 'react';
import { ArrowRight, Search } from 'lucide-react';
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

  // Show first 4 categories as quick filters
  const topCategories = categories.slice(0, 4);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    // Search is handled by debounced onChange
  };

  return (
    <section
      className={cn(
        'relative bg-gradient-to-br from-earthy-beige via-white to-sage-green/10 dark:from-dark-olive-bg dark:via-dark-bg dark:to-dark-sage-accent/5 overflow-hidden transition-colors duration-300',
        className
      )}
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating Gradient Orbs */}
        <div className="absolute top-20 left-10 w-64 h-64 bg-sage-green/20 dark:bg-dark-sage-accent/15 rounded-full blur-3xl animate-float" />
        <div
          className="absolute bottom-20 right-10 w-96 h-96 bg-muted-olive/10 dark:bg-dark-cedar-warm/10 rounded-full blur-3xl animate-float"
          style={{ animationDelay: '1s', animationDuration: '4s' }}
        />
        <div
          className="absolute top-1/2 left-1/3 w-48 h-48 bg-earthy-yellow/10 dark:bg-dark-sage-accent/8 rounded-full blur-2xl animate-float"
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
      <div className="relative max-w-6xl mx-auto px-4 py-12 md:py-16 lg:py-20">
        {/* Main Heading */}
        <h1
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-text-dark dark:text-dark-text-primary mb-6 animate-fade-in leading-tight transition-colors duration-300"
          style={{ animationDelay: '100ms' }}
        >
          <span className="text-muted-olive dark:text-dark-sage-accent">Fresh Produce</span> for Restaurants
        </h1>

        {/* Subtitle */}
        <p
          className="text-lg sm:text-xl md:text-2xl text-text-muted dark:text-dark-text-muted mb-8 max-w-2xl animate-fade-in leading-relaxed transition-colors duration-300"
          style={{ animationDelay: '200ms' }}
        >
          Browse thousands of products from local vendors
        </p>

        {/* Search Bar */}
        <div
          className="mb-8 animate-fade-in"
          style={{ animationDelay: '300ms' }}
        >
          <form onSubmit={handleSearchSubmit} className="relative max-w-2xl">
            <div className="relative flex items-center">
              <Search className="absolute left-6 w-5 h-5 text-text-muted dark:text-dark-text-muted pointer-events-none transition-colors duration-300" />
              <input
                type="text"
                value={searchValue}
                onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
                placeholder="Search products, categories, or vendors..."
                className="glass-4 dark:bg-dark-glass-olive dark:border-dark-sage-accent/40 w-full pl-14 pr-6 py-5 rounded-2xl border-2 border-white/40 focus:shadow-glow-olive dark:focus:shadow-dark-glow-olive focus:border-muted-olive/60 dark:focus:border-dark-sage-accent focus:ring-4 focus:ring-muted-olive/30 dark:focus:ring-dark-sage-accent/30 hover:shadow-glow-olive dark:hover:shadow-dark-glow-olive hover:border-white/60 dark:hover:border-dark-sage-accent/60 outline-none transition-all duration-300 text-base md:text-lg text-text-dark dark:text-dark-text-primary placeholder:text-text-muted/60 dark:placeholder:text-dark-text-muted/60 touch-target"
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
            style={{ animationDelay: '400ms' }}
          >
            <div className="flex overflow-x-auto gap-3 justify-start md:justify-start scrollbar-hide snap-x snap-mandatory pb-2">
              <button
                onClick={() => onCategorySelect && onCategorySelect('all')}
                className={cn(
                  'px-5 py-2.5 rounded-full font-medium transition-all duration-200 text-sm md:text-base touch-target snap-center flex-shrink-0 hover:scale-105 active:scale-95',
                  selectedCategory === 'all'
                    ? 'glass-3 shadow-glow-sage dark:shadow-dark-glow-olive border border-white/30 dark:border-dark-sage-accent/40 text-white bg-muted-olive dark:bg-dark-sage-accent'
                    : 'bg-white/80 dark:bg-dark-glass-olive backdrop-blur-sm text-text-dark dark:text-dark-text-primary hover:bg-white dark:hover:bg-dark-glass-sage hover:shadow-soft dark:hover:shadow-dark-depth-1 border border-gray-200 dark:border-dark-border'
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
                    'px-5 py-2.5 rounded-full font-medium transition-all duration-200 text-sm md:text-base touch-target animate-scale-in snap-center flex-shrink-0 hover:scale-105 active:scale-95',
                    selectedCategory === (category._id || category.id)
                      ? 'glass-3 shadow-glow-sage dark:shadow-dark-glow-olive border border-white/30 dark:border-dark-sage-accent/40 text-white bg-sage-green dark:bg-dark-sage-accent'
                      : 'bg-white/80 dark:bg-dark-glass-olive backdrop-blur-sm text-text-dark dark:text-dark-text-primary hover:bg-white dark:hover:bg-dark-glass-sage hover:shadow-soft dark:hover:shadow-dark-depth-1 border border-gray-200 dark:border-dark-border'
                  )}
                  style={{ animationDelay: `${(index + 1) * 50}ms` }}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* CTA Button */}
        <div
          className="flex justify-center md:justify-start animate-fade-in"
          style={{ animationDelay: '500ms' }}
        >
          <button
            onClick={(e) => {
              e.preventDefault();
              const browseSection = document.querySelector('#browse-all-products');
              if (browseSection) {
                browseSection.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="bg-gradient-secondary text-white px-8 py-4 rounded-2xl font-semibold hover:shadow-depth-3 hover:scale-105 active:scale-100 transition-all duration-200 flex items-center gap-2 justify-center touch-target group"
          >
            <span>Browse Products</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* Bottom Gradient Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white dark:from-dark-bg to-transparent pointer-events-none transition-colors duration-300" />
    </section>
  );
};

export default HeroSection;
