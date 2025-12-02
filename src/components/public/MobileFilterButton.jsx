import React, { useState } from 'react';
import { Filter } from 'lucide-react';
import { cn } from '../../utils';
import { Drawer } from '../ui/Modal';
import FilterSidebar from './FilterSidebar';

/**
 * MobileFilterButton Component
 *
 * Floating action button for mobile that opens filter drawer
 * Shows active filter count badge
 *
 * @param {Object} props
 * @param {Object} props.filters - Current filter state
 * @param {Function} props.updateFilter - Function to update a filter
 * @param {Function} props.clearFilters - Function to clear all filters
 * @param {number} props.activeFilterCount - Number of active filters
 * @param {string} props.className - Additional CSS classes
 */
const MobileFilterButton = ({
  filters,
  updateFilter,
  clearFilters,
  activeFilterCount = 0,
  className,
}) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Expose close function globally for FilterSidebar apply button
  React.useEffect(() => {
    window.closeFilterDrawer = () => setIsDrawerOpen(false);
    return () => {
      delete window.closeFilterDrawer;
    };
  }, []);

  return (
    <>
      {/* Floating Filter Button */}
      <button
        onClick={() => setIsDrawerOpen(true)}
        className={cn(
          'fixed bottom-6 right-6 z-40 bg-muted-olive text-white p-4 rounded-full shadow-depth-3 hover:shadow-depth-4 active:scale-95 transition-all duration-200 touch-target flex items-center justify-center group',
          'lg:hidden', // Hide on desktop
          className
        )}
        aria-label="Open filters"
      >
        <Filter className="w-6 h-6" />

        {/* Active Filter Count Badge */}
        {activeFilterCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-tomato-red text-white text-xs w-6 h-6 rounded-full flex items-center justify-center font-semibold animate-scale-in shadow-lg">
            {activeFilterCount}
          </span>
        )}

        {/* Ripple Effect on Hover */}
        <span className="absolute inset-0 rounded-full bg-white/20 scale-0 group-hover:scale-100 transition-transform duration-300" />
      </button>

      {/* Filter Drawer */}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title="Filter Products"
        position="bottom"
      >
        <FilterSidebar
          filters={filters}
          updateFilter={updateFilter}
          clearFilters={clearFilters}
          mobile
        />
      </Drawer>
    </>
  );
};

export default MobileFilterButton;
