import React from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { cva } from 'class-variance-authority';
import { cn } from '../../utils';
import Button from './Button';

// Pagination item variants following futuristic minimalism
const paginationItemVariants = cva(
  'inline-flex items-center justify-center rounded-2xl font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-muted-olive/20 active:scale-95 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'min-h-[44px] min-w-[44px] px-3 py-2 bg-earthy-beige/30 text-text-dark hover:bg-muted-olive hover:text-white hover:shadow-lg hover:shadow-glow-green/20 hover:-translate-y-0.5',
        active:
          'min-h-[44px] min-w-[44px] px-3 py-2 bg-gradient-secondary text-white shadow-lg shadow-glow-green/20',
        ghost:
          'min-h-[44px] min-w-[44px] px-3 py-2 text-text-muted hover:text-muted-olive hover:bg-muted-olive/10',
        outline:
          'min-h-[44px] min-w-[44px] px-3 py-2 border-2 border-gray-300 text-text-dark hover:border-muted-olive hover:bg-muted-olive/5',
      },
      size: {
        default: 'text-sm',
        sm: 'text-xs min-h-[40px] min-w-[40px] px-2 py-1',
        lg: 'text-base min-h-[48px] min-w-[48px] px-4 py-3',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

// Main Pagination Component with Mobile-First Design
const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  showFirstLast = false,
  showPrevNext = true,
  maxVisiblePages = 5,
  className,
  size = 'default',
  variant = 'default',
  showPageInfo = false,
  totalItems,
  itemsPerPage,
  disabled = false,
  ...props
}) => {
  if (totalPages <= 1) return null;

  const startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
  const adjustedStartPage = Math.max(1, endPage - maxVisiblePages + 1);

  const visiblePages = [];
  for (let i = adjustedStartPage; i <= endPage; i++) {
    visiblePages.push(i);
  }

  const showStartEllipsis = adjustedStartPage > 1;
  const showEndEllipsis = endPage < totalPages;

  const handlePageChange = (page) => {
    if (disabled || page === currentPage || page < 1 || page > totalPages)
      return;
    onPageChange(page);
  };

  return (
    <nav
      role="navigation"
      aria-label="Pagination"
      className={cn('space-y-4', className)}
      {...props}
    >
      {/* Page Info (Mobile/Desktop) */}
      {showPageInfo && totalItems && (
        <div className="text-center text-sm text-text-muted">
          Showing {Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)}{' '}
          to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems}{' '}
          results
        </div>
      )}

      {/* Main Pagination Controls */}
      <div className="flex items-center justify-center flex-wrap gap-1 sm:gap-2">
        {/* First Page Button (Desktop only) */}
        {showFirstLast && currentPage > 1 && (
          <button
            className={cn(paginationItemVariants({ variant, size }))}
            onClick={() => handlePageChange(1)}
            disabled={disabled}
            aria-label="Go to first page"
          >
            <span className="hidden sm:inline">First</span>
            <span className="sm:hidden">1</span>
          </button>
        )}

        {/* Previous Button */}
        {showPrevNext && (
          <button
            className={cn(paginationItemVariants({ variant, size }))}
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={disabled || currentPage === 1}
            aria-label="Go to previous page"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline ml-1">Previous</span>
          </button>
        )}

        {/* Start Ellipsis */}
        {showStartEllipsis && (
          <span
            className={cn(paginationItemVariants({ variant: 'ghost', size }))}
            aria-hidden="true"
          >
            <MoreHorizontal className="w-4 h-4" />
          </span>
        )}

        {/* Page Numbers */}
        {visiblePages.map((page) => (
          <button
            key={page}
            className={cn(
              paginationItemVariants({
                variant: page === currentPage ? 'active' : variant,
                size,
              })
            )}
            onClick={() => handlePageChange(page)}
            disabled={disabled}
            aria-label={`Go to page ${page}`}
            aria-current={page === currentPage ? 'page' : undefined}
          >
            {page}
          </button>
        ))}

        {/* End Ellipsis */}
        {showEndEllipsis && (
          <span
            className={cn(paginationItemVariants({ variant: 'ghost', size }))}
            aria-hidden="true"
          >
            <MoreHorizontal className="w-4 h-4" />
          </span>
        )}

        {/* Next Button */}
        {showPrevNext && (
          <button
            className={cn(paginationItemVariants({ variant, size }))}
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={disabled || currentPage === totalPages}
            aria-label="Go to next page"
          >
            <span className="hidden sm:inline mr-1">Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        )}

        {/* Last Page Button (Desktop only) */}
        {showFirstLast && currentPage < totalPages && (
          <button
            className={cn(paginationItemVariants({ variant, size }))}
            onClick={() => handlePageChange(totalPages)}
            disabled={disabled}
            aria-label="Go to last page"
          >
            <span className="hidden sm:inline">Last</span>
            <span className="sm:hidden">{totalPages}</span>
          </button>
        )}
      </div>
    </nav>
  );
};

// Simple Pagination for basic use cases
export const SimplePagination = ({
  currentPage,
  totalPages,
  onPageChange,
  className,
  disabled = false,
  showPageInfo = true,
  ...props
}) => {
  const handlePageChange = (page) => {
    if (disabled || page === currentPage || page < 1 || page > totalPages)
      return;
    onPageChange(page);
  };

  if (totalPages <= 1) return null;

  return (
    <div
      className={cn('flex items-center justify-between gap-4', className)}
      {...props}
    >
      {/* Page Info */}
      {showPageInfo && (
        <div className="text-sm text-text-muted">
          Page {currentPage} of {totalPages}
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="default"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={disabled || currentPage === 1}
          className="flex items-center gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Previous</span>
        </Button>

        <Button
          variant="outline"
          size="default"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={disabled || currentPage === totalPages}
          className="flex items-center gap-2"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

// Mobile-Optimized Pagination with swipe indicators
export const MobilePagination = ({
  currentPage,
  totalPages,
  onPageChange,
  className,
  disabled = false,
  showDots = true,
  ...props
}) => {
  const handlePageChange = (page) => {
    if (disabled || page === currentPage || page < 1 || page > totalPages)
      return;
    onPageChange(page);
  };

  if (totalPages <= 1) return null;

  return (
    <div
      className={cn('flex flex-col items-center gap-4 md:hidden', className)}
      {...props}
    >
      {/* Swipe Navigation */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="lg"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={disabled || currentPage === 1}
          className="rounded-full"
          aria-label="Previous page"
        >
          <ChevronLeft className="w-6 h-6" />
        </Button>

        <div className="text-center min-w-[100px]">
          <div className="text-lg font-medium text-text-dark">
            {currentPage}
          </div>
          <div className="text-xs text-text-muted">of {totalPages}</div>
        </div>

        <Button
          variant="ghost"
          size="lg"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={disabled || currentPage === totalPages}
          className="rounded-full"
          aria-label="Next page"
        >
          <ChevronRight className="w-6 h-6" />
        </Button>
      </div>

      {/* Page Indicators (Dots) */}
      {showDots && totalPages <= 10 && (
        <div className="flex items-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              className={cn(
                'w-2 h-2 rounded-full transition-all duration-300',
                page === currentPage
                  ? 'bg-muted-olive scale-125'
                  : 'bg-gray-300 hover:bg-muted-olive/50'
              )}
              onClick={() => handlePageChange(page)}
              disabled={disabled}
              aria-label={`Go to page ${page}`}
            />
          ))}
        </div>
      )}

      {/* Jump to Page (for many pages) */}
      {totalPages > 10 && (
        <div className="text-center">
          <div className="text-xs text-text-muted mb-2">Jump to page:</div>
          <select
            value={currentPage}
            onChange={(e) => handlePageChange(Number(e.target.value))}
            disabled={disabled}
            className="px-3 py-2 rounded-2xl bg-earthy-beige/30 border-0 focus:bg-white focus:shadow-lg transition-all duration-300 text-center min-h-[44px]"
          >
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <option key={page} value={page}>
                {page}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
};

// Compact Pagination for tables or lists
export const CompactPagination = ({
  currentPage,
  totalPages,
  onPageChange,
  className,
  disabled = false,
  ...props
}) => {
  const handlePageChange = (page) => {
    if (disabled || page === currentPage || page < 1 || page > totalPages)
      return;
    onPageChange(page);
  };

  if (totalPages <= 1) return null;

  return (
    <div className={cn('flex items-center gap-1', className)} {...props}>
      <button
        className={cn(
          'p-1 rounded-lg hover:bg-muted-olive/10 transition-colors duration-200 min-h-[32px] min-w-[32px] flex items-center justify-center',
          (disabled || currentPage === 1) && 'opacity-50 cursor-not-allowed'
        )}
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={disabled || currentPage === 1}
        aria-label="Previous page"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      <div className="px-3 py-1 text-sm text-text-muted min-w-[60px] text-center">
        {currentPage} / {totalPages}
      </div>

      <button
        className={cn(
          'p-1 rounded-lg hover:bg-muted-olive/10 transition-colors duration-200 min-h-[32px] min-w-[32px] flex items-center justify-center',
          (disabled || currentPage === totalPages) &&
            'opacity-50 cursor-not-allowed'
        )}
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={disabled || currentPage === totalPages}
        aria-label="Next page"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};

// Load More Button - Alternative to traditional pagination
export const LoadMore = ({
  onLoadMore,
  loading = false,
  hasMore = true,
  loadingText = 'Loading more...',
  buttonText = 'Load More',
  className,
  disabled = false,
  ...props
}) => {
  if (!hasMore) return null;

  return (
    <div className={cn('text-center py-8', className)} {...props}>
      <Button
        variant="outline"
        size="lg"
        onClick={onLoadMore}
        disabled={disabled || loading}
        loading={loading}
        className="px-8"
      >
        {loading ? loadingText : buttonText}
      </Button>
    </div>
  );
};

// Infinite Scroll Trigger - For infinite pagination
export const InfiniteScrollTrigger = ({
  onLoadMore,
  loading = false,
  hasMore = true,
  threshold = 200,
  className,
  ...props
}) => {
  const triggerRef = React.useRef(null);

  React.useEffect(() => {
    if (!hasMore || loading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting) {
          onLoadMore();
        }
      },
      {
        rootMargin: `${threshold}px`,
      }
    );

    if (triggerRef.current) {
      observer.observe(triggerRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, loading, onLoadMore, threshold]);

  if (!hasMore) return null;

  return (
    <div
      ref={triggerRef}
      className={cn('py-8 text-center', className)}
      {...props}
    >
      {loading && (
        <div className="flex items-center justify-center gap-2">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-muted-olive/20 border-t-muted-olive" />
          <span className="text-sm text-text-muted">Loading more...</span>
        </div>
      )}
    </div>
  );
};

export default Pagination;
