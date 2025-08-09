import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Routes, Route } from 'react-router-dom';
import { useGetCurrentUserQuery } from './store/slices/apiSlice';
import { selectAuth } from './store/slices/authSlice';
import authService from './services/authService';

// Temporary component for testing
const HomePage = () => (
  <div className="min-h-screen bg-gradient-to-br from-earthy-beige via-white to-mint-fresh/10 flex flex-col items-center justify-center p-6">
    <div className="text-center max-w-4xl mx-auto">
      <h1 className="text-4xl md:text-6xl font-bold text-text-dark mb-6 animate-fade-in">
        Welcome to{' '}
        <span className="bg-gradient-secondary bg-clip-text text-transparent">
          Aaroth Fresh
        </span>
      </h1>
      <p className="text-xl text-text-muted mb-8 leading-relaxed max-w-2xl mx-auto animate-slide-up">
        The premier B2B marketplace connecting local vegetable vendors with
        restaurants. Fresh produce, transparent pricing, seamless ordering.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center animate-scale-in">
        <button className="bg-gradient-secondary text-white px-8 py-4 rounded-2xl font-medium transition-all duration-300 hover:shadow-lg hover:shadow-glow-green hover:-translate-y-0.5 min-h-[44px]">
          Browse Products
        </button>
        <button className="bg-glass backdrop-blur-sm border border-white/20 text-text-dark px-8 py-4 rounded-2xl font-medium transition-all duration-300 hover:bg-white/10 hover:border-white/30 min-h-[44px]">
          Join as Vendor
        </button>
      </div>
    </div>

    <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto animate-fade-in">
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 text-center hover:shadow-2xl hover:shadow-shadow-soft transition-all duration-500 hover:-translate-y-1">
        <div className="w-16 h-16 bg-gradient-secondary rounded-2xl mx-auto mb-4 flex items-center justify-center">
          <span className="text-white text-2xl">🥬</span>
        </div>
        <h3 className="text-xl font-semibold text-text-dark mb-3">
          Fresh Produce
        </h3>
        <p className="text-text-muted leading-relaxed">
          Direct from local farms to your restaurant kitchen. Quality
          guaranteed.
        </p>
      </div>

      <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 text-center hover:shadow-2xl hover:shadow-shadow-soft transition-all duration-500 hover:-translate-y-1">
        <div className="w-16 h-16 bg-gradient-secondary rounded-2xl mx-auto mb-4 flex items-center justify-center">
          <span className="text-white text-2xl">💰</span>
        </div>
        <h3 className="text-xl font-semibold text-text-dark mb-3">
          Best Prices
        </h3>
        <p className="text-text-muted leading-relaxed">
          Competitive pricing with transparent cost structure. No hidden fees.
        </p>
      </div>

      <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 text-center hover:shadow-2xl hover:shadow-shadow-soft transition-all duration-500 hover:-translate-y-1">
        <div className="w-16 h-16 bg-gradient-secondary rounded-2xl mx-auto mb-4 flex items-center justify-center">
          <span className="text-white text-2xl">🚚</span>
        </div>
        <h3 className="text-xl font-semibold text-text-dark mb-3">
          Fast Delivery
        </h3>
        <p className="text-text-muted leading-relaxed">
          Quick and reliable delivery to keep your kitchen stocked fresh.
        </p>
      </div>
    </div>

    <footer className="mt-16 text-center text-text-muted">
      <p>
        &copy; 2024 Aaroth Fresh. Connecting quality produce with great
        restaurants.
      </p>
    </footer>
  </div>
);

const App = () => {
  const { isAuthenticated, token } = useSelector(selectAuth);

  // Validate current user on app start if token exists
  const { isLoading, error } = useGetCurrentUserQuery(undefined, {
    skip: !isAuthenticated || !token,
  });

  // Handle authentication errors
  useEffect(() => {
    if (error && error.status === 401) {
      console.log('Authentication failed, logging out...');
      authService.logout();
    }
  }, [error]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-earthy-beige via-white to-mint-fresh/10">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-bottle-green/20 border-t-bottle-green rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-muted font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="App min-h-screen bg-background font-sans">
      <Routes>
        <Route path="/" element={<HomePage />} />
        {/* Additional routes will be added here */}
      </Routes>
    </div>
  );
};

export default App;
