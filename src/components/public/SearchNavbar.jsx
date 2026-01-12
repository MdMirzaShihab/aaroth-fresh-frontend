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
        'sticky top-16 md:top-20 z-40 bg-white/95 dark:bg-dark-bg/95 backdrop-blur-xl border-b border-gray-200/50 dark:border-dark-border/50 transition-colors duration-300 shadow-sm',
        className
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
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
                className="bg-white/90 dark:bg-dark-glass-olive w-full pl-14 pr-6 py-4 md:py-5 rounded-2xl border-2 border-sage-green/20 dark:border-dark-sage-accent/40 focus:bg-white focus:shadow-lg focus:shadow-sage-green/10 dark:focus:shadow-dark-glow-olive focus:border-sage-green/40 dark:focus:border-dark-sage-accent focus:ring-4 focus:ring-sage-green/10 dark:focus:ring-dark-sage-accent/30 hover:border-sage-green/30 dark:hover:border-dark-sage-accent/60 outline-none transition-all duration-300 text-base md:text-lg text-text-dark dark:text-dark-text-primary placeholder:text-muted-olive/50 dark:placeholder:text-dark-text-muted/60 touch-target shadow-sm"
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
                'px-5 py-2.5 rounded-full font-medium transition-all duration-200 text-sm md:text-base touch-target snap-center flex-shrink-0 hover:scale-105 active:scale-95 shadow-sm',
                selectedCategory === 'all'
                  ? 'bg-muted-olive dark:bg-dark-sage-accent border-2 border-muted-olive/20 dark:border-dark-sage-accent/40 text-white shadow-md'
                  : 'bg-white dark:bg-dark-glass-olive text-muted-olive dark:text-dark-text-primary hover:bg-sage-green/10 dark:hover:bg-dark-glass-sage hover:shadow-md border-2 border-sage-green/20 dark:border-dark-border'
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
                  'px-5 py-2.5 rounded-full font-medium transition-all duration-200 text-sm md:text-base touch-target snap-center flex-shrink-0 hover:scale-105 active:scale-95 shadow-sm',
                  selectedCategory === (category._id || category.id)
                    ? 'bg-sage-green dark:bg-dark-sage-accent border-2 border-sage-green/20 dark:border-dark-sage-accent/40 text-white shadow-md'
                    : 'bg-white dark:bg-dark-glass-olive text-muted-olive dark:text-dark-text-primary hover:bg-sage-green/10 dark:hover:bg-dark-glass-sage hover:shadow-md border-2 border-sage-green/20 dark:border-dark-border'
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
