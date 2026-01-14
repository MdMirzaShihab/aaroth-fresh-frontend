import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { Sprout } from 'lucide-react';
import PublicNavbar from '../../components/public/PublicNavbar';
import RegisterForm from '../../components/forms/RegisterForm';
import { GuestRoute } from '../../components/auth/ProtectedRoute';
import { toggleTheme, selectThemeMode } from '../../store/slices/themeSlice';
import Toast from '../../components/ui/Toast';

/**
 * RegisterPage Component
 *
 * Registration page with organic futurism design:
 * - PublicNavbar with theme toggle
 * - Glassmorphism effects
 * - Floating organic orbs
 * - Mobile-first responsive design
 * - Zen-like registration experience
 */
const RegisterPage = () => {
  const dispatch = useDispatch();
  const themeMode = useSelector(selectThemeMode);

  const handleThemeToggle = () => {
    dispatch(toggleTheme());
  };

  return (
    <GuestRoute>
      <div className="min-h-screen bg-background dark:bg-dark-bg transition-colors duration-300 relative overflow-hidden">
        {/* PublicNavbar - Fixed at top */}
        <PublicNavbar
          themeMode={themeMode}
          onThemeToggle={handleThemeToggle}
        />

        {/* Floating Background Orbs - Organic shapes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-32 left-1/4 w-[500px] h-[500px] bg-sage-green/6 dark:bg-dark-sage-accent/6 rounded-full blur-3xl animate-float" />
          <div
            className="absolute top-1/2 right-1/4 w-72 h-72 bg-muted-olive/5 dark:bg-dark-cedar-warm/6 rounded-full blur-3xl animate-float"
            style={{ animationDelay: '2s', animationDuration: '4.5s' }}
          />
          <div
            className="absolute bottom-32 left-1/3 w-96 h-96 bg-earthy-beige/7 dark:bg-dark-sage-accent/5 rounded-full blur-3xl animate-float"
            style={{ animationDelay: '4s', animationDuration: '5.5s' }}
          />
        </div>

        {/* Organic Grid Pattern */}
        <div
          className="absolute inset-0 opacity-[0.025] dark:opacity-[0.018] pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(to right, #7f8966 1px, transparent 1px),
                              linear-gradient(to bottom, #7f8966 1px, transparent 1px)`,
            backgroundSize: '56px 56px',
          }}
        />

        {/* Main Content - Scrollable */}
        <div className="relative z-10 min-h-screen flex items-center justify-center px-4 sm:px-6 py-20 sm:py-24 md:py-28">
          <div className="w-full max-w-md lg:max-w-2xl">
            {/* Floating Welcome Card */}
            <div className="text-center mb-6 sm:mb-8 animate-fade-in">
              <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-mint-fresh/20 to-sage-green/25 dark:from-dark-sage-accent/25 dark:to-dark-cedar-warm/20 backdrop-blur-xl border-2 border-white/40 dark:border-dark-sage-accent/30 shadow-depth-2 dark:shadow-dark-depth-1 mb-4 sm:mb-6 mx-auto animate-float">
                <Sprout className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 text-bottle-green dark:text-dark-sage-accent" />
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-bottle-green dark:text-dark-sage-accent mb-2 sm:mb-3 transition-colors duration-300 px-4">
                Join Aaroth Fresh
              </h1>
              <p className="text-sm sm:text-base md:text-lg text-text-dark/80 dark:text-dark-text-primary/90 leading-relaxed max-w-xl mx-auto transition-colors duration-300 px-4">
                Create your account and start connecting with the freshest produce network
              </p>
            </div>

            {/* Registration Form - Enhanced glassmorphism */}
            <div
              className="glass-3 dark:bg-dark-glass-olive/60 rounded-2xl sm:rounded-3xl border-2 border-white/40 dark:border-dark-sage-accent/30 shadow-depth-3 dark:shadow-dark-depth-2 backdrop-blur-xl p-5 sm:p-6 md:p-8 animate-slide-up"
              style={{
                backdropFilter: 'blur(32px) saturate(180%)',
                WebkitBackdropFilter: 'blur(32px) saturate(180%)',
              }}
            >
              <RegisterForm />
            </div>

            {/* Footer Links - Organic spacing */}
            <div className="mt-6 sm:mt-8 text-center space-y-3 sm:space-y-4 animate-fade-in pb-6" style={{ animationDelay: '200ms' }}>
              <p className="text-sm text-text-dark/70 dark:text-dark-text-primary/80 transition-colors duration-300 px-4">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="text-bottle-green dark:text-dark-sage-accent hover:text-bottle-green/80 dark:hover:text-dark-sage-accent/80 font-semibold transition-colors duration-200 focus:outline-none focus:underline inline-block min-h-[44px] leading-[44px]"
                >
                  Sign in here
                </Link>
              </p>
              <div className="flex items-center justify-center gap-3 sm:gap-4 text-xs text-text-dark/60 dark:text-dark-text-primary/70 flex-wrap px-4">
                <Link
                  to="/privacy"
                  className="hover:text-muted-olive dark:hover:text-dark-sage-accent transition-colors duration-200 focus:outline-none focus:underline min-h-[44px] flex items-center"
                >
                  Privacy
                </Link>
                <span>•</span>
                <Link
                  to="/terms"
                  className="hover:text-muted-olive dark:hover:text-dark-sage-accent transition-colors duration-200 focus:outline-none focus:underline min-h-[44px] flex items-center"
                >
                  Terms
                </Link>
                <span>•</span>
                <Link
                  to="/support"
                  className="hover:text-muted-olive dark:hover:text-dark-sage-accent transition-colors duration-200 focus:outline-none focus:underline min-h-[44px] flex items-center"
                >
                  Support
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Toast Notifications */}
        <Toast />
      </div>
    </GuestRoute>
  );
};

export default RegisterPage;
