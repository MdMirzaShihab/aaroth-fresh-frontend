import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  MapPin,
  Star,
  Users,
  Package,
  ShoppingBag,
  Award,
  Truck,
  Clock,
  ArrowRight,
  CheckCircle,
  Leaf,
  AlertCircle,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import {
  useGetListingsQuery,
  useGetCategoriesQuery,
} from '../../store/slices/apiSlice';
import { useGetAdminMarketsQuery } from '../../store/slices/admin/adminApiSlice';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const VendorDirectory = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedMarket, setSelectedMarket] = useState('all');

  // Fetch listings to extract vendor information
  const {
    data: listingsData,
    isLoading: listingsLoading,
    error: listingsError,
  } = useGetListingsQuery({ limit: 100 });

  const { data: categoriesData, isLoading: categoriesLoading } =
    useGetCategoriesQuery();

  // Fetch active markets
  const { data: marketsData } = useGetAdminMarketsQuery({
    status: 'active',
    limit: 100,
  });

  const categories = categoriesData?.data || [];
  const listings = listingsData?.data || [];
  const markets = marketsData?.data || [];

  // Extract unique vendors from listings
  const vendors = useMemo(() => {
    const vendorMap = new Map();

    listings.forEach((listing) => {
      if (listing.vendor && listing.vendor.id) {
        const vendorId = listing.vendor.id;
        const existingVendor = vendorMap.get(vendorId);

        if (existingVendor) {
          // Update existing vendor data
          existingVendor.totalProducts += 1;
          existingVendor.categories.add(
            listing.product?.category?.name || 'Other'
          );
          existingVendor.totalRevenue += listing.price || 0;
          existingVendor.listings.push(listing);
        } else {
          // Create new vendor entry
          vendorMap.set(vendorId, {
            id: vendorId,
            name:
              listing.vendor.businessName ||
              listing.vendor.name ||
              'Unknown Vendor',
            location:
              listing.vendor.businessAddress?.city || 'Location not specified',
            description: `Quality supplier offering ${listing.product?.category?.name || 'fresh produce'} and more`,
            totalProducts: 1,
            categories: new Set([listing.product?.category?.name || 'Other']),
            totalRevenue: listing.price || 0,
            listings: [listing],
            verified: Math.random() > 0.3, // Mock verification status
            rating: (4.2 + Math.random() * 0.7).toFixed(1), // Mock rating 4.2-4.9
            yearsInBusiness: Math.floor(Math.random() * 10) + 2,
          });
        }
      }
    });

    return Array.from(vendorMap.values()).map((vendor) => ({
      ...vendor,
      categories: Array.from(vendor.categories),
      averagePrice: vendor.totalRevenue / vendor.totalProducts,
    }));
  }, [listings]);

  // Filter vendors based on search, category, and market
  const filteredVendors = useMemo(() => {
    return vendors.filter((vendor) => {
      const matchesSearch =
        !searchTerm ||
        vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vendor.categories.some((cat) =>
          cat.toLowerCase().includes(searchTerm.toLowerCase())
        );

      const matchesCategory =
        selectedCategory === 'all' ||
        vendor.categories.includes(selectedCategory);

      const matchesMarket =
        selectedMarket === 'all' ||
        (vendor.markets && vendor.markets.includes(selectedMarket));

      return matchesSearch && matchesCategory && matchesMarket;
    });
  }, [vendors, searchTerm, selectedCategory, selectedMarket]);

  // Get stats from real data
  const stats = useMemo(() => {
    const totalProducts = listings.length;
    const uniqueLocations = new Set(
      vendors.map((v) => v.location).filter(Boolean)
    ).size;
    const avgRating =
      vendors.length > 0
        ? (
            vendors.reduce((sum, v) => sum + parseFloat(v.rating), 0) /
            vendors.length
          ).toFixed(1)
        : '4.8';

    return {
      totalVendors: vendors.length || 50,
      totalProducts: totalProducts || 500,
      locationsCount: uniqueLocations || 25,
      averageRating: avgRating,
    };
  }, [vendors, listings]);

  const handleSignUpClick = () => {
    navigate('/register');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-muted-olive/10 to-sage-green/20">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-text-dark mb-6">
              Meet Our Trusted Vendors
            </h1>
            <p className="text-xl text-text-muted mb-8 max-w-3xl mx-auto">
              Connect with verified farms and suppliers committed to quality,
              sustainability, and reliable delivery for your buyer needs.
            </p>

            {/* Search and Filter Bar */}
            <div className="max-w-4xl mx-auto">
              <div className="flex flex-col md:flex-row gap-4 mb-8">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search vendors by name or specialty..."
                    className="w-full pl-12 pr-4 py-4 text-lg rounded-2xl border-0 bg-white shadow-lg focus:outline-none focus:ring-2 focus:ring-muted-olive/20"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <select
                  className="px-4 py-4 text-lg rounded-2xl border-0 bg-white shadow-lg focus:outline-none focus:ring-2 focus:ring-muted-olive/20 min-w-[180px]"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="all">All Categories</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <select
                  className="px-4 py-4 text-lg rounded-2xl border-0 bg-white shadow-lg focus:outline-none focus:ring-2 focus:ring-muted-olive/20 min-w-[180px]"
                  value={selectedMarket}
                  onChange={(e) => setSelectedMarket(e.target.value)}
                >
                  <option value="all">All Markets</option>
                  {markets.map((market) => (
                    <option key={market._id} value={market._id}>
                      {market.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleSignUpClick}
                className="bg-gradient-primary text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:shadow-lg transition-all duration-200 flex items-center gap-2 justify-center"
              >
                <Users className="w-5 h-5" />
                Partner with Vendors
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => navigate('/products')}
                className="border-2 border-muted-olive text-muted-olive px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-muted-olive hover:text-white transition-all duration-200"
              >
                Browse Products
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        {listingsLoading || categoriesLoading ? (
          <div className="flex justify-center py-16">
            <LoadingSpinner size="lg" text="Loading vendor data..." />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <div className="text-3xl font-bold text-text-dark mb-2">
                  {stats.totalVendors}
                </div>
                <p className="text-text-muted">Active Vendors</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-secondary rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-8 h-8 text-white" />
                </div>
                <div className="text-3xl font-bold text-text-dark mb-2">
                  {stats.locationsCount}+
                </div>
                <p className="text-text-muted">Locations</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-sage-green to-muted-olive rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Package className="w-8 h-8 text-white" />
                </div>
                <div className="text-3xl font-bold text-text-dark mb-2">
                  {stats.totalProducts}
                </div>
                <p className="text-text-muted">Products Available</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-earthy-yellow to-earthy-brown rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Star className="w-8 h-8 text-white" />
                </div>
                <div className="text-3xl font-bold text-text-dark mb-2">
                  {stats.averageRating}
                </div>
                <p className="text-text-muted">Average Rating</p>
              </div>
            </div>

            {/* Vendor Directory */}
            <div>
              <div className="flex items-center justify-between mb-12">
                <div className="text-center flex-1">
                  <h2 className="text-3xl font-bold text-text-dark mb-4">
                    {searchTerm || selectedCategory !== 'all'
                      ? 'Search Results'
                      : 'Our Vendor Network'}
                  </h2>
                  <p className="text-text-muted text-lg">
                    {filteredVendors.length === 0
                      ? 'No vendors found'
                      : searchTerm || selectedCategory !== 'all'
                        ? `${filteredVendors.length} vendors found`
                        : 'Quality suppliers serving buyers nationwide'}
                  </p>
                </div>
              </div>

              {listingsError ? (
                <div className="text-center py-12">
                  <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-text-muted">
                    Unable to load vendor information
                  </p>
                </div>
              ) : filteredVendors.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-text-dark mb-2">
                    No vendors found
                  </h3>
                  <p className="text-text-muted mb-6">
                    {searchTerm
                      ? `No vendors match "${searchTerm}". Try different keywords.`
                      : selectedCategory !== 'all'
                        ? `No vendors found in ${selectedCategory} category.`
                        : 'No vendor data available at the moment.'}
                  </p>
                  {(searchTerm || selectedCategory !== 'all') && (
                    <button
                      onClick={() => {
                        setSearchTerm('');
                        setSelectedCategory('all');
                      }}
                      className="text-muted-olive hover:text-muted-olive/80 font-medium"
                    >
                      Show All Vendors
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                  {filteredVendors.slice(0, 8).map((vendor) => (
                    <Card
                      key={vendor.id}
                      className="overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer group"
                      onClick={handleSignUpClick}
                    >
                      <div className="aspect-[2/1] bg-gradient-to-br from-sage-green/20 to-muted-olive/20 relative overflow-hidden">
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="text-8xl opacity-20">🚜</div>
                        </div>
                        {vendor.verified && (
                          <span className="absolute top-4 left-4 bg-muted-olive text-white text-xs px-3 py-1 rounded-full font-medium flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            Verified
                          </span>
                        )}
                        <span className="absolute top-4 right-4 bg-sage-green text-muted-olive text-xs px-3 py-1 rounded-full font-medium flex items-center gap-1">
                          <Leaf className="w-3 h-3" />
                          Fresh
                        </span>
                      </div>

                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-xl font-bold text-text-dark mb-2 group-hover:text-muted-olive transition-colors truncate">
                              {vendor.name}
                            </h3>
                            <div className="flex items-center gap-2 mb-2">
                              <MapPin className="w-4 h-4 text-text-muted flex-shrink-0" />
                              <span className="text-text-muted text-sm truncate">
                                {vendor.location}
                              </span>
                            </div>
                          </div>
                          <div className="text-right ml-4">
                            <div className="flex items-center gap-1 mb-1">
                              <Star className="w-4 h-4 text-earthy-yellow fill-current" />
                              <span className="font-semibold">
                                {vendor.rating}
                              </span>
                            </div>
                            <p className="text-sm text-text-muted">
                              {vendor.yearsInBusiness} years
                            </p>
                          </div>
                        </div>

                        <p className="text-text-muted mb-4 text-sm line-clamp-2">
                          {vendor.description}
                        </p>

                        <div className="flex flex-wrap gap-2 mb-4">
                          {vendor.categories
                            .slice(0, 3)
                            .map((category, index) => (
                              <span
                                key={index}
                                className="bg-earthy-beige text-earthy-brown text-xs px-2 py-1 rounded-full"
                              >
                                {category}
                              </span>
                            ))}
                          {vendor.categories.length > 3 && (
                            <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                              +{vendor.categories.length - 3} more
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                          <div className="flex items-center gap-4 text-sm text-text-muted">
                            <span className="flex items-center gap-1">
                              <Package className="w-4 h-4" />
                              {vendor.totalProducts} products
                            </span>
                            <span className="flex items-center gap-1 text-sage-green">
                              <Star className="w-4 h-4" />
                              Top rated
                            </span>
                          </div>
                          <button className="text-muted-olive hover:text-muted-olive/80 transition-colors font-medium text-sm">
                            View Profile →
                          </button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {!listingsLoading && !listingsError && (
          <div className="text-center bg-gradient-to-br from-muted-olive/5 to-sage-green/10 rounded-3xl p-12">
            <h3 className="text-2xl font-bold text-text-dark mb-4">
              Ready to Connect with Premium Vendors?
            </h3>
            <p className="text-text-muted mb-8 max-w-2xl mx-auto">
              Join our network to access detailed vendor profiles, direct
              communication tools, and start sourcing fresh produce for your
              buyer.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleSignUpClick}
                className="bg-gradient-primary text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:shadow-lg transition-all duration-200 inline-flex items-center gap-2 justify-center"
              >
                <ShoppingBag className="w-5 h-5" />
                Start Shopping Today
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => navigate('/products')}
                className="border-2 border-muted-olive text-muted-olive px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-muted-olive hover:text-white transition-all duration-200"
              >
                Browse Products
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorDirectory;
