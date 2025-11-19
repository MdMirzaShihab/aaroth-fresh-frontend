import React, { useState, useEffect } from 'react';
import {
  Plus,
  Filter,
  Search,
  Building2,
  Users,
  MapPin,
  AlertTriangle,
  RefreshCcw,
} from 'lucide-react';
import toast from 'react-hot-toast';

// UI Components
import { Card } from '../../../../components/ui/Card';
import Button from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import LoadingSpinner from '../../../../components/ui/LoadingSpinner';

// Market Components
import MarketDirectoryTable from '../../../../components/admin/markets/MarketDirectoryTable';
import MarketDetailsModal from '../../../../components/admin/markets/MarketDetailsModal';
import MarketEditModal from '../../../../components/admin/markets/MarketEditModal';
import MarketFilters from '../../../../components/admin/markets/MarketFilters';

// API Hooks
import { useGetAdminMarketsQuery } from '../../../../store/slices/admin/adminApiSlice';

const MarketManagementPage = () => {
  // ========================================
  // STATE MANAGEMENT
  // ========================================

  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    city: 'all',
    page: 1,
    limit: 20,
    sortBy: 'name',
    sortOrder: 'asc',
  });

  const [selectedMarkets, setSelectedMarkets] = useState([]);
  const [selectedMarket, setSelectedMarket] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [searchInput, setSearchInput] = useState('');

  // ========================================
  // RTK QUERY
  // ========================================

  const {
    data: marketsData,
    isLoading,
    error,
    refetch,
  } = useGetAdminMarketsQuery(filters);

  const markets = marketsData?.data || [];
  const stats = marketsData?.stats || {};
  const pagination = marketsData?.pagination || {};

  // ========================================
  // EFFECTS
  // ========================================

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== filters.search) {
        setFilters((prev) => ({ ...prev, search: searchInput, page: 1 }));
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInput]);

  // ========================================
  // EVENT HANDLERS
  // ========================================

  const handleFilterChange = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }));
  };

  const handlePageChange = (page) => {
    setFilters((prev) => ({ ...prev, page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewMarket = (market) => {
    setSelectedMarket(market);
    setShowDetailsModal(true);
  };

  const handleEditMarket = (market = null) => {
    setSelectedMarket(market);
    setShowEditModal(true);
  };

  const handleCreateMarket = () => {
    setSelectedMarket(null);
    setShowEditModal(true);
  };

  const handleModalSuccess = () => {
    refetch();
    setSelectedMarket(null);
  };

  const handleRefresh = () => {
    refetch();
    toast.success('Markets refreshed');
  };

  // ========================================
  // COMPUTED VALUES
  // ========================================

  const totalMarkets = stats.total || 0;
  const activeMarkets = stats.active || 0;
  const flaggedMarkets = stats.flagged || 0;
  const popularCity = stats.mostPopularCity || 'N/A';

  // Active filter count
  const activeFilterCount = [
    filters.status !== 'all',
    filters.city !== 'all',
    filters.search,
  ].filter(Boolean).length;

  // ========================================
  // RENDER
  // ========================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-earthy-beige/20 to-white">
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-text-dark mb-2">
                Market Management
              </h1>
              <p className="text-text-muted">
                Manage markets and their assignments to vendors
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={handleRefresh}
                className="flex items-center gap-2"
              >
                <RefreshCcw className="w-4 h-4" />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
              <Button
                onClick={handleCreateMarket}
                className="bg-gradient-secondary text-white flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Create Market
              </Button>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Markets */}
          <Card className="p-6 glass hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-muted mb-1">
                  Total Markets
                </p>
                <p className="text-3xl font-bold text-text-dark">
                  {totalMarkets}
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-bottle-green/20 to-mint-fresh/20 flex items-center justify-center">
                <Building2 className="w-6 h-6 text-bottle-green" />
              </div>
            </div>
          </Card>

          {/* Active Markets */}
          <Card className="p-6 glass hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-muted mb-1">
                  Active Markets
                </p>
                <p className="text-3xl font-bold text-mint-fresh">
                  {activeMarkets}
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-mint-fresh/20 to-sage-green/20 flex items-center justify-center">
                <Building2 className="w-6 h-6 text-mint-fresh" />
              </div>
            </div>
          </Card>

          {/* Flagged Markets */}
          <Card className="p-6 glass hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-muted mb-1">
                  Flagged Markets
                </p>
                <p className="text-3xl font-bold text-amber-600">
                  {flaggedMarkets}
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </Card>

          {/* Popular City */}
          <Card className="p-6 glass hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-muted mb-1">
                  Popular City
                </p>
                <p className="text-xl font-bold text-text-dark truncate">
                  {popularCity}
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sage-green/20 to-muted-olive/20 flex items-center justify-center">
                <MapPin className="w-6 h-6 text-sage-green" />
              </div>
            </div>
          </Card>
        </div>

        {/* Search and Filters Bar */}
        <Card className="p-6 glass mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
              <Input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search markets by name, city, or description..."
                className="pl-12"
              />
            </div>

            {/* Filter Button */}
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 relative"
            >
              <Filter className="w-5 h-5" />
              Filters
              {activeFilterCount > 0 && (
                <span className="absolute -top-2 -right-2 w-6 h-6 bg-bottle-green text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </Button>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <MarketFilters
                filters={filters}
                onFilterChange={handleFilterChange}
                onClose={() => setShowFilters(false)}
              />
            </div>
          )}
        </Card>

        {/* Selected Markets Actions */}
        {selectedMarkets.length > 0 && (
          <Card className="p-4 glass mb-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-text-dark">
                {selectedMarkets.length} market(s) selected
              </p>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedMarkets([])}
                >
                  Clear Selection
                </Button>
                {/* Add bulk actions here if needed */}
              </div>
            </div>
          </Card>
        )}

        {/* Markets Directory Table */}
        {error ? (
          <Card className="p-12 glass text-center">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-text-dark mb-2">
              Error Loading Markets
            </h3>
            <p className="text-text-muted mb-6">
              {error?.data?.message || 'Failed to load markets. Please try again.'}
            </p>
            <Button onClick={handleRefresh} variant="outline">
              Try Again
            </Button>
          </Card>
        ) : (
          <MarketDirectoryTable
            markets={markets}
            isLoading={isLoading}
            pagination={pagination}
            selectedMarkets={selectedMarkets}
            onSelectMarkets={setSelectedMarkets}
            onEdit={handleEditMarket}
            onView={handleViewMarket}
            onPageChange={handlePageChange}
            onRefresh={handleRefresh}
          />
        )}

        {/* Modals */}
        <MarketEditModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedMarket(null);
          }}
          market={selectedMarket}
          onSuccess={handleModalSuccess}
        />

        <MarketDetailsModal
          isOpen={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedMarket(null);
          }}
          market={selectedMarket}
          onEdit={handleEditMarket}
        />
      </div>
    </div>
  );
};

export default MarketManagementPage;
