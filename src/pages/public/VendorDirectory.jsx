import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
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
  Leaf
} from 'lucide-react';

const VendorDirectory = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('all');

  // Mock vendor data for public display
  const featuredVendors = [
    {
      id: 1,
      name: 'Green Valley Farm',
      location: 'California',
      description: 'Premium organic produce from sustainable farming practices',
      rating: 4.9,
      totalProducts: 145,
      yearsInBusiness: 8,
      specialties: ['Organic Vegetables', 'Herbs', 'Microgreens'],
      verified: true,
      fastDelivery: true,
      sustainablePractices: true,
      coverImage: '/api/placeholder/400/200'
    },
    {
      id: 2,
      name: 'Sunshine Farms',
      location: 'Florida',
      description: 'Fresh citrus and tropical fruits directly from our groves',
      rating: 4.7,
      totalProducts: 89,
      yearsInBusiness: 12,
      specialties: ['Citrus Fruits', 'Tropical Fruits', 'Fresh Juice'],
      verified: true,
      fastDelivery: false,
      sustainablePractices: true,
      coverImage: '/api/placeholder/400/200'
    },
    {
      id: 3,
      name: 'Mountain Orchards',
      location: 'Washington',
      description: 'Tree-ripened apples and stone fruits from mountain valleys',
      rating: 4.8,
      totalProducts: 67,
      yearsInBusiness: 15,
      specialties: ['Apples', 'Stone Fruits', 'Seasonal Varieties'],
      verified: true,
      fastDelivery: true,
      sustainablePractices: false,
      coverImage: '/api/placeholder/400/200'
    },
    {
      id: 4,
      name: 'Valley Fresh Co.',
      location: 'Oregon',
      description: 'Root vegetables and hearty produce for professional kitchens',
      rating: 4.6,
      totalProducts: 123,
      yearsInBusiness: 6,
      specialties: ['Root Vegetables', 'Storage Crops', 'Bulk Supply'],
      verified: true,
      fastDelivery: true,
      sustainablePractices: true,
      coverImage: '/api/placeholder/400/200'
    }
  ];

  const locations = ['all', 'California', 'Florida', 'Washington', 'Oregon'];

  const handleSignUpClick = () => {
    navigate('/register');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-bottle-green/10 to-mint-fresh/20">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-text-dark mb-6">
              Meet Our Trusted Vendors
            </h1>
            <p className="text-xl text-text-muted mb-8 max-w-3xl mx-auto">
              Connect with verified farms and suppliers committed to quality, 
              sustainability, and reliable delivery for your restaurant needs.
            </p>
            
            {/* Search and Filter Bar */}
            <div className="max-w-4xl mx-auto">
              <div className="flex flex-col md:flex-row gap-4 mb-8">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search vendors by name or specialty..."
                    className="w-full pl-12 pr-4 py-4 text-lg rounded-2xl border-0 bg-white shadow-lg focus:outline-none focus:ring-2 focus:ring-bottle-green/20"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <select
                  className="px-4 py-4 text-lg rounded-2xl border-0 bg-white shadow-lg focus:outline-none focus:ring-2 focus:ring-bottle-green/20 min-w-[180px]"
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                >
                  <option value="all">All Locations</option>
                  {locations.slice(1).map(location => (
                    <option key={location} value={location}>{location}</option>
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
                className="border-2 border-bottle-green text-bottle-green px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-bottle-green hover:text-white transition-all duration-200"
              >
                Browse Products
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-white" />
            </div>
            <div className="text-3xl font-bold text-text-dark mb-2">500+</div>
            <p className="text-text-muted">Verified Vendors</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-secondary rounded-2xl flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-8 h-8 text-white" />
            </div>
            <div className="text-3xl font-bold text-text-dark mb-2">50+</div>
            <p className="text-text-muted">States Covered</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-mint-fresh to-bottle-green rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-white" />
            </div>
            <div className="text-3xl font-bold text-text-dark mb-2">10k+</div>
            <p className="text-text-muted">Products Available</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-earthy-yellow to-earthy-brown rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Star className="w-8 h-8 text-white" />
            </div>
            <div className="text-3xl font-bold text-text-dark mb-2">4.8</div>
            <p className="text-text-muted">Average Rating</p>
          </div>
        </div>

        {/* Featured Vendors */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-text-dark mb-4">
            Featured Vendor Partners
          </h2>
          <p className="text-text-muted text-lg">
            Sample of our top-rated vendors serving restaurants nationwide
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {featuredVendors.map((vendor) => (
            <Card 
              key={vendor.id}
              className="overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer group"
              onClick={handleSignUpClick}
            >
              <div className="aspect-[2/1] bg-gradient-to-br from-mint-fresh/20 to-bottle-green/20 relative overflow-hidden">
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-8xl opacity-20">🚜</div>
                </div>
                {vendor.verified && (
                  <span className="absolute top-4 left-4 bg-bottle-green text-white text-xs px-3 py-1 rounded-full font-medium flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Verified
                  </span>
                )}
                {vendor.sustainablePractices && (
                  <span className="absolute top-4 right-4 bg-mint-fresh text-bottle-green text-xs px-3 py-1 rounded-full font-medium flex items-center gap-1">
                    <Leaf className="w-3 h-3" />
                    Sustainable
                  </span>
                )}
              </div>
              
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-text-dark mb-2 group-hover:text-bottle-green transition-colors">
                      {vendor.name}
                    </h3>
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="w-4 h-4 text-text-muted" />
                      <span className="text-text-muted">{vendor.location}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 mb-1">
                      <Star className="w-4 h-4 text-earthy-yellow fill-current" />
                      <span className="font-semibold">{vendor.rating}</span>
                    </div>
                    <p className="text-sm text-text-muted">{vendor.yearsInBusiness} years</p>
                  </div>
                </div>
                
                <p className="text-text-muted mb-4 line-clamp-2">
                  {vendor.description}
                </p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {vendor.specialties.slice(0, 3).map((specialty, index) => (
                    <span 
                      key={index}
                      className="bg-earthy-beige text-earthy-brown text-xs px-2 py-1 rounded-full"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-4 text-sm text-text-muted">
                    <span className="flex items-center gap-1">
                      <Package className="w-4 h-4" />
                      {vendor.totalProducts} products
                    </span>
                    {vendor.fastDelivery && (
                      <span className="flex items-center gap-1 text-mint-fresh">
                        <Truck className="w-4 h-4" />
                        Fast delivery
                      </span>
                    )}
                  </div>
                  <button className="text-bottle-green hover:text-bottle-green/80 transition-colors font-medium">
                    View Profile →
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="text-center bg-gradient-to-br from-bottle-green/5 to-mint-fresh/10 rounded-3xl p-12">
          <h3 className="text-2xl font-bold text-text-dark mb-4">
            Ready to Connect with Premium Vendors?
          </h3>
          <p className="text-text-muted mb-8 max-w-2xl mx-auto">
            Join our network to access detailed vendor profiles, direct communication tools, 
            and exclusive partnership opportunities.
          </p>
          <button
            onClick={handleSignUpClick}
            className="bg-gradient-primary text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:shadow-lg transition-all duration-200 inline-flex items-center gap-2"
          >
            <ShoppingBag className="w-5 h-5" />
            Start Partnering Today
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default VendorDirectory;