import React from 'react';
import { Link } from 'react-router-dom';
import {
  Leaf,
  Users,
  ShoppingCart,
  ArrowRight,
  Star,
  MapPin,
  Clock,
  TrendingUp,
  Package,
} from 'lucide-react';
import {
  useGetFeaturedProductsQuery,
  useGetCategoriesQuery,
} from '../../store/slices/apiSlice';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { Card } from '../../components/ui/Card';

const Homepage = () => {
  // Fetch real data from APIs
  const {
    data: featuredData,
    isLoading: featuredLoading,
    error: featuredError,
  } = useGetFeaturedProductsQuery();

  const { data: categoriesData, isLoading: categoriesLoading } =
    useGetCategoriesQuery();

  // Fix data access patterns to match actual API response
  const featuredListings = featuredData?.data || [];
  const categories = categoriesData?.data || [];

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

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-earthy-beige via-white to-mint-fresh/10 py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full text-bottle-green font-medium mb-6">
              <Leaf className="w-4 h-4" />
              Fresh • Local • Organic
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-text-dark mb-6">
              Fresh Vegetables
              <br />
              <span className="text-bottle-green">Direct from Farms</span>
            </h1>
            <p className="text-xl text-text-muted mb-8 max-w-2xl mx-auto">
              Connect with local vegetable vendors and get the freshest produce
              delivered to your restaurant. Quality guaranteed.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="bg-gradient-primary text-white px-8 py-4 rounded-2xl font-semibold hover:shadow-lg transition-all duration-200 flex items-center gap-2 justify-center touch-target"
            >
              Get Started
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/products"
              className="bg-white border border-gray-200 text-text-dark px-8 py-4 rounded-2xl font-semibold hover:border-bottle-green/30 transition-all duration-200 flex items-center gap-2 justify-center touch-target"
            >
              Browse Products
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-text-dark mb-4">
              Why Choose Aaroth Fresh?
            </h2>
            <p className="text-xl text-text-muted max-w-2xl mx-auto">
              We connect restaurants with local farmers for the freshest
              ingredients
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass rounded-3xl p-8 text-center hover:shadow-soft transition-all duration-200">
              <div className="w-16 h-16 bg-mint-fresh/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Leaf className="w-8 h-8 text-bottle-green" />
              </div>
              <h3 className="text-xl font-semibold text-text-dark mb-4">
                Farm Fresh
              </h3>
              <p className="text-text-muted">
                Direct from local farms to your kitchen. No middlemen, maximum
                freshness.
              </p>
            </div>

            <div className="glass rounded-3xl p-8 text-center hover:shadow-soft transition-all duration-200">
              <div className="w-16 h-16 bg-earthy-yellow/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8 text-earthy-brown" />
              </div>
              <h3 className="text-xl font-semibold text-text-dark mb-4">
                Local Vendors
              </h3>
              <p className="text-text-muted">
                Support local farmers and get access to seasonal specialties.
              </p>
            </div>

            <div className="glass rounded-3xl p-8 text-center hover:shadow-soft transition-all duration-200">
              <div className="w-16 h-16 bg-gradient-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <ShoppingCart className="w-8 h-8 text-bottle-green" />
              </div>
              <h3 className="text-xl font-semibold text-text-dark mb-4">
                Easy Ordering
              </h3>
              <p className="text-text-muted">
                Simple ordering process with reliable delivery to your
                restaurant.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-text-dark mb-4">
              Featured Products
            </h2>
            <p className="text-xl text-text-muted max-w-2xl mx-auto">
              Discover premium quality produce from our verified vendors
            </p>
          </div>

          {featuredLoading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : featuredError ? (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-text-muted">
                Unable to load featured products
              </p>
            </div>
          ) : featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {featuredProducts.slice(0, 6).map((product) => (
                <Card
                  key={product.id}
                  className="overflow-hidden hover:shadow-lg transition-all duration-200"
                >
                  <div className="aspect-video bg-gradient-to-br from-mint-fresh/20 to-bottle-green/20 rounded-t-2xl relative overflow-hidden">
                    {product.images && product.images.length > 0 ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-6xl opacity-20">🥬</div>
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-text-dark mb-2">
                      {product.name}
                    </h3>
                    <p className="text-text-muted mb-4">
                      {product.category?.name || 'Fresh Produce'}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-bottle-green">
                          {product.averagePrice
                            ? `৳${product.averagePrice.toFixed(2)}`
                            : 'Price on request'}
                        </span>
                        <span className="text-sm text-text-muted">
                          per {product.unit}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-text-muted">
                          {product.vendorName}
                        </div>
                        {product.qualityGrade && (
                          <div className="text-xs text-bottle-green mt-1">
                            {product.qualityGrade}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-text-muted">No featured products available</p>
            </div>
          )}
        </div>
      </section>

      {/* Categories Preview Section */}
      {categories.length > 0 && (
        <section className="py-20 px-4 bg-gradient-to-br from-mint-fresh/5 to-earthy-beige/20">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-text-dark mb-4">
                Product Categories
              </h2>
              <p className="text-xl text-text-muted max-w-2xl mx-auto">
                Browse by category to find exactly what you need
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {categories.slice(0, 8).map((category) => (
                <Link
                  key={category.id}
                  to="/products"
                  className="glass rounded-3xl p-6 text-center hover:shadow-soft transition-all duration-200 group"
                >
                  <div className="w-16 h-16 bg-gradient-secondary rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-200">
                    <Leaf className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-semibold text-text-dark mb-2">
                    {category.name}
                  </h3>
                  <p className="text-sm text-text-muted">
                    {category.productCount || 0} products
                  </p>
                </Link>
              ))}
            </div>

            <div className="text-center mt-12">
              <Link
                to="/products"
                className="inline-flex items-center gap-2 text-bottle-green hover:text-bottle-green/80 font-medium transition-colors"
              >
                View All Categories
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Stats Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-text-dark mb-4">
              Growing Every Day
            </h2>
            <p className="text-xl text-text-muted max-w-2xl mx-auto">
              Join our thriving marketplace community
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div className="glass rounded-3xl p-8">
              <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <div className="text-4xl font-bold text-bottle-green mb-2">
                {categories.length > 0
                  ? categories.reduce(
                      (total, cat) => total + (cat.productCount || 0),
                      0
                    ) || categories.length * 10
                  : '150+'}
              </div>
              <div className="text-text-muted">Local Vendors</div>
            </div>
            <div className="glass rounded-3xl p-8">
              <div className="w-16 h-16 bg-gradient-secondary rounded-2xl flex items-center justify-center mx-auto mb-4">
                <ShoppingCart className="w-8 h-8 text-white" />
              </div>
              <div className="text-4xl font-bold text-bottle-green mb-2">
                500+
              </div>
              <div className="text-text-muted">Restaurants</div>
            </div>
            <div className="glass rounded-3xl p-8">
              <div className="w-16 h-16 bg-mint-fresh/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-bottle-green" />
              </div>
              <div className="text-4xl font-bold text-bottle-green mb-2">
                10k+
              </div>
              <div className="text-text-muted">Orders Delivered</div>
            </div>
            <div className="glass rounded-3xl p-8">
              <div className="w-16 h-16 bg-earthy-yellow/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-earthy-brown" />
              </div>
              <div className="text-4xl font-bold text-bottle-green mb-2">
                4.8
              </div>
              <div className="text-text-muted flex items-center justify-center gap-1">
                <Star className="w-4 h-4 text-earthy-yellow fill-current" />
                Rating
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="glass rounded-3xl p-12">
            <h2 className="text-3xl md:text-4xl font-bold text-text-dark mb-4">
              Ready to Get Fresh?
            </h2>
            <p className="text-xl text-text-muted mb-8">
              Join hundreds of restaurants already using Aaroth Fresh
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="bg-gradient-primary text-white px-8 py-4 rounded-2xl font-semibold hover:shadow-lg transition-all duration-200 flex items-center gap-2 justify-center touch-target"
              >
                Start Ordering
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/vendors"
                className="bg-gradient-secondary text-white px-8 py-4 rounded-2xl font-semibold hover:shadow-lg transition-all duration-200 flex items-center gap-2 justify-center touch-target"
              >
                Become a Vendor
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Homepage;
