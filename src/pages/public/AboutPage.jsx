import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Heart,
  Leaf,
  Users,
  Target,
  CheckCircle,
  ArrowRight,
  ShoppingBag,
  Phone,
  Mail,
  MapPin,
  Globe,
  Award,
  Truck,
  Shield,
  Clock,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';

const AboutPage = () => {
  const navigate = useNavigate();

  const values = [
    {
      icon: Leaf,
      title: 'Sustainability',
      description:
        'Promoting eco-friendly farming practices and reducing food waste through direct supplier connections.',
    },
    {
      icon: Heart,
      title: 'Quality First',
      description:
        'Ensuring only the freshest, highest-quality produce reaches restaurant kitchens across the nation.',
    },
    {
      icon: Users,
      title: 'Community',
      description:
        'Building lasting relationships between local vendors and restaurant owners for mutual growth.',
    },
    {
      icon: Shield,
      title: 'Trust & Security',
      description:
        'Verified vendors, secure transactions, and reliable delivery for peace of mind in every order.',
    },
  ];

  const features = [
    {
      icon: Award,
      title: 'Verified Vendors Only',
      description:
        'All suppliers undergo rigorous quality and reliability assessments',
    },
    {
      icon: Truck,
      title: 'Reliable Logistics',
      description:
        'Temperature-controlled delivery ensuring freshness from farm to kitchen',
    },
    {
      icon: Clock,
      title: 'Real-time Tracking',
      description:
        'Monitor your orders from pickup to delivery with live updates',
    },
    {
      icon: Globe,
      title: 'Nationwide Network',
      description: 'Access to premium suppliers across all 50 states',
    },
  ];

  const stats = [
    { number: '500+', label: 'Verified Vendors' },
    { number: '2,000+', label: 'Restaurant Partners' },
    { number: '10M+', label: 'Pounds Delivered' },
    { number: '99.2%', label: 'On-time Delivery' },
  ];

  const handleGetStarted = () => {
    navigate('/register');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-sage-green/20 to-muted-olive/10">
        <div className="max-w-7xl mx-auto px-4 py-20">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-text-dark mb-8">
              Revolutionizing
              <span className="text-muted-olive block">
                Restaurant Sourcing
              </span>
            </h1>
            <p className="text-xl text-text-muted mb-12 max-w-3xl mx-auto leading-relaxed">
              Aaroth Fresh bridges the gap between local farms and professional
              kitchens, delivering premium produce with transparency,
              reliability, and sustainability at its core.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleGetStarted}
                className="bg-gradient-primary text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:shadow-lg transition-all duration-200 flex items-center gap-2 justify-center"
              >
                <ShoppingBag className="w-5 h-5" />
                Start Your Journey
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => navigate('/products')}
                className="border-2 border-muted-olive text-muted-olive px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-muted-olive hover:text-white transition-all duration-200"
              >
                Explore Products
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-muted-olive mb-2">
                  {stat.number}
                </div>
                <p className="text-text-muted font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mission Section */}
      <div className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-text-dark mb-6">
              Our Mission
            </h2>
            <div className="max-w-4xl mx-auto">
              <p className="text-xl text-text-muted leading-relaxed mb-8">
                To transform how restaurants source their ingredients by
                creating transparent, sustainable connections between local
                producers and professional kitchens.
              </p>
              <div className="bg-white rounded-3xl p-8 shadow-lg">
                <p className="text-lg text-text-dark leading-relaxed">
                  "We believe that great food starts with great ingredients. By
                  eliminating the middleman and fostering direct relationships,
                  we ensure restaurants get the freshest produce while
                  supporting local farming communities. Every order placed on
                  Aaroth Fresh is a step towards a more sustainable and
                  connected food ecosystem."
                </p>
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <p className="font-semibold text-muted-olive">
                    — Aaroth Fresh Team
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-text-dark mb-6">
              Our Values
            </h2>
            <p className="text-xl text-text-muted max-w-3xl mx-auto">
              These core principles guide everything we do, from vendor
              partnerships to delivery excellence.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {values.map((value, index) => {
              const IconComponent = value.icon;
              return (
                <Card
                  key={index}
                  className="p-8 hover:shadow-lg transition-all duration-200"
                >
                  <div className="w-16 h-16 bg-gradient-secondary rounded-2xl flex items-center justify-center mb-6">
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-text-dark mb-4">
                    {value.title}
                  </h3>
                  <p className="text-text-muted leading-relaxed">
                    {value.description}
                  </p>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-text-dark mb-6">
              Why Choose Aaroth Fresh?
            </h2>
            <p className="text-xl text-text-muted max-w-3xl mx-auto">
              We've built our platform with the specific needs of professional
              kitchens in mind.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <Card
                  key={index}
                  className="p-6 text-center hover:shadow-lg transition-all duration-200"
                >
                  <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-text-dark mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-text-muted text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-text-dark mb-6">
              How It Works
            </h2>
            <p className="text-xl text-text-muted max-w-3xl mx-auto">
              Simple, streamlined process designed for busy restaurant
              professionals.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-xl font-bold text-text-dark mb-4">
                Browse & Order
              </h3>
              <p className="text-text-muted">
                Explore our catalog of premium produce from verified local
                vendors. Place orders with just a few clicks.
              </p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-secondary rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-xl font-bold text-text-dark mb-4">
                Direct Connection
              </h3>
              <p className="text-text-muted">
                Your order goes directly to the vendor for immediate processing.
                No middleman delays or quality compromises.
              </p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-sage-green to-muted-olive rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-xl font-bold text-text-dark mb-4">
                Fresh Delivery
              </h3>
              <p className="text-text-muted">
                Temperature-controlled delivery ensures your ingredients arrive
                fresh and ready for your kitchen.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="bg-gradient-to-br from-muted-olive/10 to-sage-green/20 py-20">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-text-dark mb-6">
              Get In Touch
            </h2>
            <p className="text-xl text-text-muted">
              Questions about our platform? We're here to help you get started.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <Card className="p-6 text-center">
              <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Phone className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-bold text-text-dark mb-2">Call Us</h3>
              <p className="text-text-muted">Mon-Fri, 8AM-6PM EST</p>
              <p className="text-muted-olive font-semibold">01335156145</p>
            </Card>
            <Card className="p-6 text-center">
              <div className="w-16 h-16 bg-gradient-secondary rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-bold text-text-dark mb-2">
                Email Us
              </h3>
              <p className="text-text-muted">Response within 24 hours</p>
              <p className="text-muted-olive font-semibold">
                hello@aaroth.com
              </p>
            </Card>
          </div>
          <div className="text-center">
            <button
              onClick={handleGetStarted}
              className="bg-gradient-primary text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:shadow-lg transition-all duration-200 inline-flex items-center gap-2"
            >
              <ShoppingBag className="w-5 h-5" />
              Start Your Free Account
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
