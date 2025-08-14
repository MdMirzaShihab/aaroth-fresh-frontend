import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  useGetCategoriesQuery, 
  useGetPublicProductsQuery,
  useGetFeaturedProductsQuery 
} from '../../store/slices/apiSlice';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { Card } from '../../components/ui/Card';
import { 
  Search, 
  Filter, 
  Leaf, 
  Apple, 
  Carrot, 
  ShoppingBag,
  Star,
  MapPin,
  ArrowRight,
  Package,
  AlertCircle
} from 'lucide-react';

const ProductCatalog = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  const { 
    data: categoriesData, 
    isLoading: categoriesLoading,
    error: categoriesError 
  } = useGetCategoriesQuery();
  
  const { 
    data: featuredData, 
    isLoading: featuredLoading,
    error: featuredError 
  } = useGetFeaturedProductsQuery();
  
  // Query params for products with search and category filtering
  const productQueryParams = useMemo(() => {
    const params = { limit: 20 };
    if (searchTerm) params.search = searchTerm;
    // Note: The API might expect category ID, not name - adjust based on your backend
    if (selectedCategory !== 'all') {
      const category = categoriesData?.data?.find(cat => cat.name === selectedCategory);
      params.category = category?.id || selectedCategory;
    }
    return params;
  }, [searchTerm, selectedCategory, categoriesData]);
  
  const { 
    data: productsData, 
    isLoading: productsLoading,
    error: productsError 
  } = useGetPublicProductsQuery(productQueryParams);
  
  // Fix data access patterns to match actual API response
  const categories = categoriesData?.data || [];
  const featuredListings = featuredData?.data || [];
  const products = productsData?.data || [];
  
  // Debug logging - remove in production
  console.log('ProductCatalog - Categories Data:', categoriesData);
  console.log('ProductCatalog - Featured Data:', featuredData);
  console.log('ProductCatalog - Products Data:', productsData);
  
  // Transform featured listings to expected product format
  const featuredProducts = featuredListings.map(listing => ({
    id: listing.id,
    name: listing.productId?.name || 'Unknown Product',
    category: listing.productId?.category,
    images: listing.images?.length > 0 ? listing.images.map(img => img.url) : (listing.productId?.images || []),
    averagePrice: listing.effectivePrice || (listing.pricing?.[0]?.pricePerUnit),
    unit: listing.pricing?.[0]?.unit || listing.availability?.unit || 'unit',
    activeListingsCount: 1,
    vendorName: listing.vendorId?.businessName || 'Local Vendor',
    qualityGrade: listing.qualityGrade,
    isInSeason: listing.availability?.isInSeason
  }));

  // Category filter handler
  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
  };
  
  // Format price for display
  const formatPrice = (price) => {
    if (typeof price === 'number') {
      return `৳${price.toFixed(2)}`;
    }
    return price || 'Price on request';
  };

  const categoryIcons = {
    'Leafy Greens': Leaf,
    'Fruits': Apple,
    'Vegetables': Carrot,
    'Root Vegetables': Carrot,
    'Herbs': Leaf,
    'Spices': Leaf
  };

  const handleSignUpClick = () => {
    navigate('/register');
  };

  if (categoriesLoading && featuredLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading catalog..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-mint-fresh/20 to-bottle-green/10">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-text-dark mb-6">
              Fresh Products, Direct from Farms
            </h1>
            <p className="text-xl text-text-muted mb-8 max-w-3xl mx-auto">
              Discover premium quality produce from local vendors. Join thousands of restaurants 
              sourcing the freshest ingredients for their kitchens.
            </p>
            
            {/* Search and Filter Bar */}
            <div className="max-w-4xl mx-auto mb-8">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search for products, vendors, or categories..."
                    className="w-full pl-12 pr-4 py-4 text-lg rounded-2xl border-0 bg-white shadow-lg focus:outline-none focus:ring-2 focus:ring-bottle-green/20"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <div className="lg:w-64">
                  <select
                    value={selectedCategory}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="w-full px-4 py-4 text-lg rounded-2xl border-0 bg-white shadow-lg focus:outline-none focus:ring-2 focus:ring-bottle-green/20"
                  >
                    <option value="all">All Categories</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.name}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleSignUpClick}
                className="bg-gradient-primary text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:shadow-lg transition-all duration-200 flex items-center gap-2 justify-center"
              >
                <ShoppingBag className="w-5 h-5" />
                Start Shopping Today
                <ArrowRight className="w-4 h-4" />
              </button>
              <button 
                onClick={() => navigate('/about')}
                className="border-2 border-bottle-green text-bottle-green px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-bottle-green hover:text-white transition-all duration-200"
              >
                Learn More
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Section */}
      {categoriesLoading ? (
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="flex justify-center">
            <LoadingSpinner size="md" text="Loading categories..." />
          </div>
        </div>
      ) : categoriesError ? (
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-text-muted">Unable to load categories</p>
        </div>
      ) : categories.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-text-dark mb-4">
              Browse by Category
            </h2>
            <p className="text-text-muted text-lg">
              Find exactly what you're looking for
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {categories.slice(0, 8).map((category) => {
              const IconComponent = categoryIcons[category.name] || Leaf;
              return (
                <Card 
                  key={category.id}
                  className={`p-6 text-center hover:shadow-lg transition-all duration-200 cursor-pointer group ${
                    selectedCategory === category.id ? 'ring-2 ring-bottle-green bg-mint-fresh/10' : ''
                  }`}
                  onClick={() => handleCategoryChange(category.id)}
                >
                  <div className="w-16 h-16 bg-gradient-secondary rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-200">
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-semibold text-text-dark mb-2">
                    {category.name}
                  </h3>
                  <p className="text-sm text-text-muted mb-1">
                    {category.description || `Fresh ${category.name.toLowerCase()}`}
                  </p>
                  <p className="text-xs text-bottle-green font-medium">
                    {category.productCount || 0} products
                  </p>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Products Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4">
          {/* Search Results or Featured Products */}
          {searchTerm || selectedCategory !== 'all' ? (
            // Search/Filter Results
            <div>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-bold text-text-dark mb-2">
                    {searchTerm ? `Search Results for "${searchTerm}"` : `Products in ${categories.find(cat => cat.id === selectedCategory)?.name || 'Selected Category'}`}
                  </h2>
                  <p className="text-text-muted">
                    {productsLoading ? 'Loading...' : `${products.length} products found`}
                  </p>
                </div>
                {(searchTerm || selectedCategory !== 'all') && (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedCategory('all');
                    }}
                    className="text-bottle-green hover:text-bottle-green/80 font-medium flex items-center gap-2"
                  >
                    Clear Filters
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
              
              {productsLoading ? (
                <div className="flex justify-center py-12">
                  <LoadingSpinner size="md" text="Searching products..." />
                </div>
              ) : productsError ? (
                <div className="text-center py-12">
                  <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-text-muted">Unable to load products</p>
                </div>
              ) : products.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {products.map((product) => (
                    <Card 
                      key={product.id}
                      className="overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer group"
                      onClick={handleSignUpClick}
                    >
                      <div className="aspect-video bg-gray-200 rounded-t-2xl relative overflow-hidden">
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
                        <div className="w-full h-full bg-gradient-to-br from-mint-fresh/20 to-bottle-green/20 flex items-center justify-center">
                          <div className="text-6xl opacity-20">🥬</div>
                        </div>
                        <span className="absolute top-3 left-3 bg-white/90 text-bottle-green text-xs px-2 py-1 rounded-full font-medium">
                          {product.activeListingsCount || 0} vendors
                        </span>
                      </div>
                      
                      <div className="p-4">
                        <h3 className="font-semibold text-text-dark mb-2 group-hover:text-bottle-green transition-colors">
                          {product.name}
                        </h3>
                        <p className="text-text-muted text-sm mb-3">{product.category?.name || 'Fresh Produce'}</p>
                        
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-lg font-bold text-bottle-green">
                            {formatPrice(product.averagePrice)}
                          </span>
                          <span className="text-sm text-text-muted">
                            per {product.unit || 'unit'}
                          </span>
                        </div>
                        
                        {product.priceRange && (
                          <p className="text-xs text-text-muted mb-2">
                            Range: ৳{product.priceRange.min} - ৳{product.priceRange.max}
                          </p>
                        )}
                        
                        <button className="text-sm text-bottle-green hover:text-bottle-green/80 transition-colors flex items-center gap-1">
                          View Details
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-text-dark mb-2">No products found</h3>
                  <p className="text-text-muted mb-6">
                    {searchTerm 
                      ? `No products match "${searchTerm}". Try different keywords.`
                      : `No products in this category yet.`
                    }
                  </p>
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedCategory('all');
                    }}
                    className="text-bottle-green hover:text-bottle-green/80 font-medium"
                  >
                    Browse All Products
                  </button>
                </div>
              )}
            </div>
          ) : (
            // Featured Products (default view)
            <div>
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-text-dark mb-4">
                  Featured Products
                </h2>
                <p className="text-text-muted text-lg">
                  Premium products from our verified vendor network
                </p>
              </div>

              {featuredLoading ? (
                <div className="flex justify-center py-12">
                  <LoadingSpinner size="md" text="Loading featured products..." />
                </div>
              ) : featuredError ? (
                <div className="text-center py-12">
                  <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-text-muted">Unable to load featured products</p>
                </div>
              ) : featuredProducts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                  {featuredProducts.slice(0, 8).map((product) => (
                    <Card 
                      key={product.id}
                      className="overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer group"
                      onClick={handleSignUpClick}
                    >
                      <div className="aspect-video bg-gray-200 rounded-t-2xl relative overflow-hidden">
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
                        <div className="w-full h-full bg-gradient-to-br from-mint-fresh/20 to-bottle-green/20 flex items-center justify-center">
                          <div className="text-6xl opacity-20">🥬</div>
                        </div>
                        <span className="absolute top-3 left-3 bg-mint-fresh text-bottle-green text-xs px-2 py-1 rounded-full font-medium">
                          Featured
                        </span>
                      </div>
                      
                      <div className="p-4">
                        <h3 className="font-semibold text-text-dark mb-2 group-hover:text-bottle-green transition-colors">
                          {product.name}
                        </h3>
                        <p className="text-text-muted text-sm mb-3">{product.category?.name || 'Fresh Produce'}</p>
                        
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-lg font-bold text-bottle-green">
                            {formatPrice(product.averagePrice)}
                          </span>
                          <span className="text-sm text-text-muted">
                            {product.activeListingsCount || 0} vendors
                          </span>
                        </div>
                        
                        <button className="text-sm text-bottle-green hover:text-bottle-green/80 transition-colors flex items-center gap-1">
                          View Details
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-text-dark mb-2">No featured products available</h3>
                  <p className="text-text-muted">Check back soon for featured products from our vendors.</p>
                </div>
              )}

              <div className="text-center mt-12">
                <p className="text-text-muted mb-6">
                  Join to access our full catalog and place orders with local vendors.
                </p>
                <button
                  onClick={handleSignUpClick}
                  className="bg-gradient-primary text-white px-8 py-3 rounded-2xl font-semibold hover:shadow-lg transition-all duration-200 inline-flex items-center gap-2"
                >
                  <ShoppingBag className="w-5 h-5" />
                  Sign Up to Start Shopping
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCatalog;