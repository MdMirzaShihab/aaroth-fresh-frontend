import { Search } from 'lucide-react';
import { cn } from '../../utils';
import { useGetCategoriesQuery } from '../../store/slices/apiSlice';

/**
 * SearchNavbar Component
 *
 * Secondary navigation bar with:
 * - Smart search bar with debouncing
 * - Quick category filter pills
 * - Sticky positioning below main navbar
 * - Mobile-responsive design
 *
 * @param {Object} props
 * @param {string} props.searchValue - Current search value
 * @param {Function} props.onSearchChange - Search change handler
 * @param {string} props.selectedCategory - Currently selected category
 * @param {Function} props.onCategorySelect - Category selection handler
 * @param {string} props.className - Additional CSS classes
 */
const SearchNavbar = ({
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
    <div
      className={cn(
        'sticky top-16 md:top-20 z-40 border-b border-white/40 dark:border-dark-sage-accent/20 transition-colors duration-300 shadow-soft dark:shadow-dark-glass overflow-hidden',
        className
      )}
      style={{
        backdropFilter: 'blur(24px) saturate(180%)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
      }}
    >
      {/* Gradient Background Layer - Horizontal matching PublicNavbar */}
      <div
        className="absolute inset-0 bg-gradient-to-r from-earthy-beige/50 via-white/55 to-sage-green/20 dark:from-dark-olive-bg/60 dark:via-dark-bg/65 dark:to-dark-sage-accent/10 transition-colors duration-300"
        style={{ zIndex: -1 }}
      />

      {/* Floating Orbs - Offset positioning for seamless blend */}
      <div
        className="absolute top-8 right-1/3 w-48 h-48 bg-sage-green/8 dark:bg-dark-sage-accent/5 rounded-full blur-3xl animate-float pointer-events-none"
        style={{ animationDelay: '0.8s' }}
      />
      <div
        className="absolute top-4 left-1/4 w-32 h-32 bg-muted-olive/6 dark:bg-dark-cedar-warm/4 rounded-full blur-2xl animate-float pointer-events-none"
        style={{ animationDelay: '2s', animationDuration: '4s' }}
      />

      {/* Subtle Grid Pattern Overlay - Matching PublicNavbar */}
      <div
        className="absolute inset-0 opacity-[0.015] dark:opacity-[0.01] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(to right, #7f8966 1px, transparent 1px),
                            linear-gradient(to bottom, #7f8966 1px, transparent 1px)`,
          backgroundSize: '32px 32px',
        }}
      />
      {/* Content - Positioned above background layers */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Search Bar */}
        <div className="mb-4">
          <form onSubmit={handleSearchSubmit} className="relative max-w-3xl mx-auto">
            <div className="relative flex items-center">
              <Search className="absolute left-6 w-5 h-5 text-muted-olive/70 dark:text-dark-text-muted pointer-events-none transition-colors duration-300" />
              <input
                type="text"
                value={searchValue}
                onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
                placeholder="Search products, categories, or vendors..."
                className="bg-white/70 dark:bg-dark-glass-olive backdrop-blur-xl w-full pl-14 pr-6 py-4 md:py-5 rounded-2xl border-2 border-sage-green/30 dark:border-dark-sage-accent/30 focus:bg-white/90 dark:focus:bg-dark-glass-olive focus:shadow-lg focus:shadow-sage-green/10 dark:focus:shadow-dark-glow-olive focus:border-sage-green/50 dark:focus:border-dark-sage-accent/50 focus:ring-4 focus:ring-sage-green/10 dark:focus:ring-dark-sage-accent/20 hover:border-sage-green/40 dark:hover:border-dark-sage-accent/50 outline-none transition-all duration-300 text-base md:text-lg text-text-dark dark:text-dark-text-primary placeholder:text-muted-olive/50 dark:placeholder:text-dark-text-muted/60 touch-target shadow-sm"
                style={{ fontSize: '16px' }} // Prevent iOS zoom
              />
              {searchValue && (
                <button
                  type="button"
                  onClick={() => onSearchChange && onSearchChange('')}
                  className="absolute right-4 p-2 hover:bg-sage-green/10 dark:hover:bg-dark-glass-olive rounded-full transition-colors"
                  aria-label="Clear search"
                >
                  <span className="text-muted-olive dark:text-dark-text-muted text-xl leading-none">×</span>
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Category Pills */}
        {!categoriesLoading && topCategories.length > 0 && (
          <div className="flex overflow-x-auto gap-3 justify-start md:justify-center scrollbar-hide snap-x snap-mandatory pb-2">
            <button
              onClick={() => onCategorySelect && onCategorySelect('all')}
              className={cn(
                'px-5 py-2.5 rounded-full font-medium transition-all duration-200 text-sm md:text-base touch-target snap-center flex-shrink-0 hover:scale-105 active:scale-95 backdrop-blur-xl',
                selectedCategory === 'all'
                  ? 'bg-muted-olive dark:bg-dark-sage-accent border-2 border-muted-olive/30 dark:border-dark-sage-accent/50 text-white shadow-depth-2 dark:shadow-dark-glow-olive'
                  : 'bg-white/70 dark:bg-dark-glass-olive text-muted-olive dark:text-dark-text-primary hover:bg-sage-green/15 dark:hover:bg-dark-glass-sage hover:shadow-soft border-2 border-sage-green/25 dark:border-dark-sage-accent/20'
              )}
            >
              All Products
            </button>

            {topCategories.map((category) => (
              <button
                key={category._id || category.id}
                onClick={() =>
                  onCategorySelect && onCategorySelect(category._id || category.id)
                }
                className={cn(
                  'px-5 py-2.5 rounded-full font-medium transition-all duration-200 text-sm md:text-base touch-target snap-center flex-shrink-0 hover:scale-105 active:scale-95 backdrop-blur-xl',
                  selectedCategory === (category._id || category.id)
                    ? 'bg-sage-green dark:bg-dark-sage-accent border-2 border-sage-green/30 dark:border-dark-sage-accent/50 text-white shadow-depth-2 dark:shadow-dark-glow-olive'
                    : 'bg-white/70 dark:bg-dark-glass-olive text-muted-olive dark:text-dark-text-primary hover:bg-sage-green/15 dark:hover:bg-dark-glass-sage hover:shadow-soft border-2 border-sage-green/25 dark:border-dark-sage-accent/20'
                )}
              >
                {category.name}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchNavbar;
