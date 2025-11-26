import React from 'react';
import { X, Filter } from 'lucide-react';
import { Card } from '../../../../../components/ui/Card';
import Button from '../../../../../components/ui/Button';
import { useGetAdminCategoriesQuery } from '../../../../../store/slices/apiSlice';
import MarketSelector from '../../../../../components/common/MarketSelector';

const ProductFilters = ({ filters, onFiltersChange, onClose }) => {
  const { data: categoriesData } = useGetAdminCategoriesQuery({ limit: 100 });
  const categories = categoriesData?.data || [];

  const handleClearFilters = () => {
    onFiltersChange({
      search: '',
      category: 'all',
      marketId: '', // Clear market filter
      status: 'all',
      stockLevel: 'all',
      page: 1,
      limit: 20,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
  };

  return (
    <Card className="p-6 glass">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-muted-olive" />
          <h3 className="text-lg font-semibold text-text-dark">Filters</h3>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
        >
          <X className="w-4 h-4 text-text-muted" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Market Filter */}
        <div>
          <MarketSelector
            value={filters.marketId}
            onChange={(value) =>
              onFiltersChange({ ...filters, marketId: value, page: 1 })
            }
            showAllOption
            label="Market"
            className="w-full"
          />
        </div>

        {/* Category Filter */}
        <div>
          <label className="block text-sm font-medium text-text-dark mb-2">
            Category
          </label>
          <select
            value={filters.category}
            onChange={(e) =>
              onFiltersChange({ ...filters, category: e.target.value, page: 1 })
            }
            className="w-full px-4 py-2 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-muted-olive/20"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-text-dark mb-2">
            Status
          </label>
          <select
            value={filters.status}
            onChange={(e) =>
              onFiltersChange({ ...filters, status: e.target.value, page: 1 })
            }
            className="w-full px-4 py-2 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-muted-olive/20"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="flagged">Flagged</option>
          </select>
        </div>

        {/* Stock Level Filter */}
        <div>
          <label className="block text-sm font-medium text-text-dark mb-2">
            Stock Level
          </label>
          <select
            value={filters.stockLevel}
            onChange={(e) =>
              onFiltersChange({ ...filters, stockLevel: e.target.value, page: 1 })
            }
            className="w-full px-4 py-2 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-muted-olive/20"
          >
            <option value="all">All Levels</option>
            <option value="in_stock">In Stock</option>
            <option value="low_stock">Low Stock</option>
            <option value="out_of_stock">Out of Stock</option>
          </select>
        </div>

        {/* Sort By */}
        <div>
          <label className="block text-sm font-medium text-text-dark mb-2">
            Sort By
          </label>
          <select
            value={filters.sortBy}
            onChange={(e) =>
              onFiltersChange({ ...filters, sortBy: e.target.value, page: 1 })
            }
            className="w-full px-4 py-2 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-muted-olive/20"
          >
            <option value="createdAt">Newest First</option>
            <option value="name">Name (A-Z)</option>
            <option value="performanceScore">Performance Score</option>
            <option value="updatedAt">Recently Updated</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end mt-4">
        <Button variant="outline" onClick={handleClearFilters} size="sm">
          Clear All Filters
        </Button>
      </div>
    </Card>
  );
};

export default ProductFilters;
