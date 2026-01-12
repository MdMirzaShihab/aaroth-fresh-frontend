import React from 'react';
import { ArrowRight } from 'lucide-react';
import { cn } from '../../utils';

/**
 * HeroSection Component
 *
 * Next-generation agritech hero section with:
 * - Animated gradient background
 * - Hero heading and subtitle
 * - CTA button
 * - Floating vegetable illustrations
 * - Responsive mobile-first design
 *
 * @param {Object} props
 * @param {string} props.className - Additional CSS classes
 */
const HeroSection = ({ className }) => {

  return (
    <section
      className={cn(
        'relative bg-gradient-to-br from-earthy-beige via-white to-sage-green/10 dark:from-dark-olive-bg dark:via-dark-bg dark:to-dark-sage-accent/5 overflow-hidden transition-colors duration-300',
        className
      )}
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating Gradient Orbs */}
        <div className="absolute top-20 left-10 w-64 h-64 bg-sage-green/20 dark:bg-dark-sage-accent/15 rounded-full blur-3xl animate-float" />
        <div
          className="absolute bottom-20 right-10 w-96 h-96 bg-muted-olive/10 dark:bg-dark-cedar-warm/10 rounded-full blur-3xl animate-float"
          style={{ animationDelay: '1s', animationDuration: '4s' }}
        />
        <div
          className="absolute top-1/2 left-1/3 w-48 h-48 bg-earthy-yellow/10 dark:bg-dark-sage-accent/8 rounded-full blur-2xl animate-float"
          style={{ animationDelay: '2s', animationDuration: '5s' }}
        />

        {/* Subtle Grid Pattern */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(to right, #7f8966 1px, transparent 1px),
                              linear-gradient(to bottom, #7f8966 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      {/* Content Container */}
      <div className="relative max-w-6xl mx-auto px-4 py-16 md:py-20 lg:py-24 text-center">
        {/* Main Heading */}
        <h1
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-text-dark dark:text-dark-text-primary mb-6 animate-fade-in leading-tight transition-colors duration-300"
          style={{ animationDelay: '100ms' }}
        >
          <span className="text-muted-olive dark:text-dark-sage-accent">Fresh Produce</span> for Restaurants
        </h1>

        {/* Subtitle */}
        <p
          className="text-lg sm:text-xl md:text-2xl text-muted-olive/80 dark:text-dark-text-muted mb-10 max-w-2xl mx-auto animate-fade-in leading-relaxed transition-colors duration-300"
          style={{ animationDelay: '200ms' }}
        >
          Browse thousands of products from local vendors
        </p>

        {/* CTA Button */}
        <div
          className="flex justify-center animate-fade-in"
          style={{ animationDelay: '300ms' }}
        >
          <button
            onClick={(e) => {
              e.preventDefault();
              const browseSection = document.querySelector('#browse-all-products');
              if (browseSection) {
                browseSection.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="bg-gradient-secondary text-white px-8 py-4 rounded-2xl font-semibold hover:shadow-depth-3 hover:scale-105 active:scale-100 transition-all duration-200 flex items-center gap-2 justify-center touch-target group"
          >
            <span>Browse Products</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* Bottom Gradient Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white dark:from-dark-bg to-transparent pointer-events-none transition-colors duration-300" />
    </section>
  );
};

export default HeroSection;
