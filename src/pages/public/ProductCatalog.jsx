import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetCategoriesQuery } from '../../store/slices/apiSlice';
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
  ArrowRight
} from 'lucide-react';

const ProductCatalog = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  const { 
    data: categoriesData, 
    isLoading: categoriesLoading 
  } = useGetCategoriesQuery();
  
  const categories = categoriesData?.data?.categories || [];

  // Mock featured products for public display
  const featuredProducts = [
    {
      id: 1,
      name: 'Organic Spinach',
      category: 'Leafy Greens',
      price: '$3.99/lb',
      vendor: 'Green Valley Farm',
      rating: 4.8,
      image: '/api/placeholder/300/200',
      organic: true,
      location: 'California'
    },
    {
      id: 2,
      name: 'Fresh Tomatoes',
      category: 'Vegetables',
      price: '$2.49/lb',
      vendor: 'Sunshine Farms',
      rating: 4.6,
      image: '/api/placeholder/300/200',
      organic: false,
      location: 'Florida'
    },
    {
      id: 3,
      name: 'Crisp Apples',
      category: 'Fruits',
      price: '$4.99/lb',
      vendor: 'Mountain Orchards',
      rating: 4.9,
      image: '/api/placeholder/300/200',
      organic: true,
      location: 'Washington'
    },
    {
      id: 4,
      name: 'Fresh Carrots',
      category: 'Root Vegetables',
      price: '$1.99/lb',
      vendor: 'Valley Fresh',
      rating: 4.7,
      image: '/api/placeholder/300/200',
      organic: true,
      location: 'Oregon'
    }
  ];

  const categoryIcons = {
    'Leafy Greens': Leaf,
    'Fruits': Apple,
    'Vegetables': Carrot,
    'Root Vegetables': Carrot
  };

  const handleSignUpClick = () => {
    navigate('/register');
  };

  if (categoriesLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner size="lg" />
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
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto relative mb-8">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted w-5 h-5" />
              <input
                type="text"
                placeholder="Search for products, vendors, or categories..."
                className="w-full pl-12 pr-4 py-4 text-lg rounded-2xl border-0 bg-white shadow-lg focus:outline-none focus:ring-2 focus:ring-bottle-green/20"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
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
      {categories.length > 0 && (
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
                  className="p-6 text-center hover:shadow-lg transition-all duration-200 cursor-pointer group"
                  onClick={handleSignUpClick}
                >
                  <div className="w-16 h-16 bg-gradient-secondary rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-200">
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-semibold text-text-dark mb-2">
                    {category.name}
                  </h3>
                  <p className="text-sm text-text-muted">
                    {category.description || `Fresh ${category.name.toLowerCase()}`}
                  </p>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Featured Products */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-text-dark mb-4">
              Featured Products
            </h2>
            <p className="text-text-muted text-lg">
              Sample of premium products from our vendor network
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {featuredProducts.map((product) => (
              <Card 
                key={product.id}
                className="overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer group"
                onClick={handleSignUpClick}
              >
                <div className="aspect-video bg-gray-200 rounded-t-2xl relative overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-br from-mint-fresh/20 to-bottle-green/20 flex items-center justify-center">
                    <div className="text-6xl opacity-20">🥬</div>
                  </div>
                  {product.organic && (
                    <span className="absolute top-3 left-3 bg-mint-fresh text-bottle-green text-xs px-2 py-1 rounded-full font-medium">
                      Organic
                    </span>
                  )}
                </div>
                
                <div className="p-4">
                  <h3 className="font-semibold text-text-dark mb-2 group-hover:text-bottle-green transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-text-muted text-sm mb-3">{product.category}</p>
                  
                  <div className="flex items-center gap-2 mb-3">
                    <Star className="w-4 h-4 text-earthy-yellow fill-current" />
                    <span className="text-sm font-medium">{product.rating}</span>
                    <span className="text-sm text-text-muted">({Math.floor(Math.random() * 100) + 20} reviews)</span>
                  </div>
                  
                  <div className="flex items-center gap-1 mb-3">
                    <MapPin className="w-4 h-4 text-text-muted" />
                    <span className="text-sm text-text-muted">{product.vendor} • {product.location}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-bottle-green">
                      {product.price}
                    </span>
                    <button className="text-sm text-bottle-green hover:text-bottle-green/80 transition-colors">
                      View Details →
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <p className="text-text-muted mb-6">
              This is just a sample. Join to access our full catalog of premium products.
            </p>
            <button
              onClick={handleSignUpClick}
              className="bg-gradient-primary text-white px-8 py-3 rounded-2xl font-semibold hover:shadow-lg transition-all duration-200 inline-flex items-center gap-2"
            >
              <ShoppingBag className="w-5 h-5" />
              Sign Up to See All Products
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCatalog;