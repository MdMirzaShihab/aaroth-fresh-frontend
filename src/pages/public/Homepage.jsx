import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Leaf, 
  Users, 
  ShoppingCart, 
  ArrowRight,
  Star,
  MapPin,
  Clock
} from 'lucide-react';

const Homepage = () => {
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
              We connect restaurants with local farmers for the freshest ingredients
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass rounded-3xl p-8 text-center hover:shadow-soft transition-all duration-200">
              <div className="w-16 h-16 bg-mint-fresh/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Leaf className="w-8 h-8 text-bottle-green" />
              </div>
              <h3 className="text-xl font-semibold text-text-dark mb-4">Farm Fresh</h3>
              <p className="text-text-muted">
                Direct from local farms to your kitchen. No middlemen, maximum freshness.
              </p>
            </div>
            
            <div className="glass rounded-3xl p-8 text-center hover:shadow-soft transition-all duration-200">
              <div className="w-16 h-16 bg-earthy-yellow/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8 text-earthy-brown" />
              </div>
              <h3 className="text-xl font-semibold text-text-dark mb-4">Local Vendors</h3>
              <p className="text-text-muted">
                Support local farmers and get access to seasonal specialties.
              </p>
            </div>
            
            <div className="glass rounded-3xl p-8 text-center hover:shadow-soft transition-all duration-200">
              <div className="w-16 h-16 bg-gradient-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <ShoppingCart className="w-8 h-8 text-bottle-green" />
              </div>
              <h3 className="text-xl font-semibold text-text-dark mb-4">Easy Ordering</h3>
              <p className="text-text-muted">
                Simple ordering process with reliable delivery to your restaurant.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-mint-fresh/5 to-earthy-beige/20">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-bottle-green mb-2">150+</div>
              <div className="text-text-muted">Local Vendors</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-bottle-green mb-2">500+</div>
              <div className="text-text-muted">Restaurants</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-bottle-green mb-2">10k+</div>
              <div className="text-text-muted">Orders Delivered</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-bottle-green mb-2">4.8</div>
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