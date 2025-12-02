import React, { useState } from 'react';
import { useProductFilters } from '../../hooks/useProductFilters';
import HeroSection from './HeroSection';

/**
 * HeroTestPage Component
 *
 * Test page for Phase 2: Hero Section Redesign
 * - Tests hero section with search integration
 * - Tests category pill filtering
 * - Tests responsive behavior
 * - Shows URL state changes
 */
const HeroTestPage = () => {
  const {
    filters,
    updateFilter,
    clearFilters,
    hasActiveFilters,
  } = useProductFilters();

  const [debugMode, setDebugMode] = useState(true);

  const handleSearchChange = (value) => {
    updateFilter('search', value);
  };

  const handleCategorySelect = (categoryId) => {
    updateFilter('category', categoryId);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <HeroSection
        searchValue={filters.search}
        onSearchChange={handleSearchChange}
        selectedCategory={filters.category}
        onCategorySelect={handleCategorySelect}
      />

      {/* Debug Panel */}
      {debugMode && (
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-blue-900">
                Phase 2 Debug Panel
              </h2>
              <button
                onClick={() => setDebugMode(false)}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                Hide
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div>
                <strong className="text-blue-900">Current URL:</strong>
                <code className="ml-2 text-blue-700 bg-blue-100 px-2 py-1 rounded">
                  {window.location.pathname + window.location.search}
                </code>
              </div>

              <div>
                <strong className="text-blue-900">Search Value:</strong>
                <code className="ml-2 text-blue-700 bg-blue-100 px-2 py-1 rounded">
                  {filters.search || '(empty)'}
                </code>
              </div>

              <div>
                <strong className="text-blue-900">Selected Category:</strong>
                <code className="ml-2 text-blue-700 bg-blue-100 px-2 py-1 rounded">
                  {filters.category || 'all'}
                </code>
              </div>

              <div>
                <strong className="text-blue-900">Has Active Filters:</strong>
                <code className="ml-2 text-blue-700 bg-blue-100 px-2 py-1 rounded">
                  {hasActiveFilters ? 'Yes' : 'No'}
                </code>
              </div>

              <div>
                <strong className="text-blue-900">Full Filter State:</strong>
                <pre className="mt-2 text-blue-700 bg-blue-100 px-3 py-2 rounded overflow-x-auto">
                  {JSON.stringify(filters, null, 2)}
                </pre>
              </div>

              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          </div>

          {/* Test Instructions */}
          <div className="mt-8 bg-green-50 border border-green-200 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-green-900 mb-3">
              Test Instructions
            </h3>
            <ul className="space-y-2 text-sm text-green-800">
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">1.</span>
                <span>
                  <strong>Search Test:</strong> Type in the search bar, watch URL update
                  after 300ms debounce
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">2.</span>
                <span>
                  <strong>Category Pills:</strong> Click any category pill, observe URL
                  and pill styling change
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">3.</span>
                <span>
                  <strong>Responsive Test:</strong> Resize browser to test mobile/tablet
                  layouts
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">4.</span>
                <span>
                  <strong>Animation Test:</strong> Refresh page to see staggered fade-in
                  animations
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">5.</span>
                <span>
                  <strong>CTA Buttons:</strong> Hover over buttons to see scale/shadow
                  effects
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">6.</span>
                <span>
                  <strong>Background Animation:</strong> Watch the floating gradient orbs
                  (subtle)
                </span>
              </li>
            </ul>
          </div>

          {/* Design System Verification */}
          <div className="mt-8 bg-purple-50 border border-purple-200 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-purple-900 mb-3">
              Design System Verification
            </h3>
            <ul className="space-y-2 text-sm text-purple-800">
              <li>✅ Glassmorphism: backdrop-blur-sm on pills and search</li>
              <li>✅ Organic curves: rounded-2xl (24px) for buttons/inputs</li>
              <li>✅ Earth-tech colors: muted-olive, sage-green, earthy-beige</li>
              <li>✅ Animations: animate-fade-in with staggered delays</li>
              <li>✅ Touch targets: 44px minimum (touch-target class)</li>
              <li>✅ Shadows: shadow-soft, shadow-depth-2, shadow-depth-3</li>
              <li>✅ Gradients: bg-gradient-secondary for primary CTA</li>
              <li>✅ Typography: text-4xl → text-7xl responsive heading</li>
            </ul>
          </div>

          {/* Responsive Breakpoints */}
          <div className="mt-8 bg-amber-50 border border-amber-200 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-amber-900 mb-3">
              Responsive Breakpoints
            </h3>
            <div className="space-y-2 text-sm text-amber-800">
              <div className="flex items-center gap-3">
                <span className="font-bold w-24">Mobile:</span>
                <span>&lt; 640px - Single column, centered content, 4xl heading</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-bold w-24">SM:</span>
                <span>640px+ - Flex buttons horizontal, 5xl heading</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-bold w-24">MD:</span>
                <span>768px+ - Left-aligned content, 6xl heading, larger text</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-bold w-24">LG:</span>
                <span>1024px+ - 7xl heading, more spacing (py-32)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {!debugMode && (
        <div className="fixed bottom-4 right-4">
          <button
            onClick={() => setDebugMode(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-blue-700 transition-colors"
          >
            Show Debug
          </button>
        </div>
      )}
    </div>
  );
};

export default HeroTestPage;
