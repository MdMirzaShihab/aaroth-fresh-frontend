import React from 'react';
import {
  Star,
  MapPin,
  ArrowRight,
  Leaf,
  ShieldCheck,
  Clock,
  Thermometer,
  Package2,
  TrendingUp,
  Award,
} from 'lucide-react';
import { Card } from '../ui/Card';

const ProductCard = ({
  product,
  onClick,
  showDetailed = false,
  className = '',
}) => {
  // Format price for display
  const formatPrice = (price) => {
    if (typeof price === 'number') {
      return `৳${price.toFixed(2)}`;
    }
    return price || 'Price on request';
  };

  // Get primary image URL
  const getPrimaryImageUrl = () => {
    if (product.images && product.images.length > 0) {
      const primaryImage = product.images.find((img) => img.isPrimary);
      return primaryImage?.url || product.images[0]?.url || product.images[0];
    }
    return null;
  };

  // Get nutritional highlights
  const getNutritionalHighlights = () => {
    const nutrition = product.nutritionalInfo;
    if (!nutrition) return [];

    const highlights = [];
    if (nutrition.calories) highlights.push(`${nutrition.calories} cal/100g`);
    if (nutrition.protein && nutrition.protein > 5)
      highlights.push(`${nutrition.protein}g protein`);
    if (nutrition.vitamins && nutrition.vitamins.length > 0) {
      highlights.push(`Rich in ${nutrition.vitamins[0].name}`);
    }

    return highlights.slice(0, 2); // Show max 2 highlights
  };

  // Get certification badges
  const getCertificationBadges = () => {
    const badges = [];
    if (product.isOrganic)
      badges.push({ text: 'Organic', icon: Leaf, color: 'mint-fresh' });
    if (product.isLocallySourced)
      badges.push({ text: 'Local', icon: MapPin, color: 'bottle-green' });
    if (product.certifications && product.certifications.length > 0) {
      badges.push({
        text: 'Certified',
        icon: ShieldCheck,
        color: 'earthy-yellow',
      });
    }
    return badges.slice(0, 2); // Show max 2 badges
  };

  // Get seasonality indicator
  const getSeasonalityInfo = () => {
    if (!product.seasonality) return null;
    if (product.seasonality.includes('year-round'))
      return { text: 'Year-round', color: 'bottle-green' };
    return { text: 'Seasonal', color: 'earthy-yellow' };
  };

  const primaryImageUrl = getPrimaryImageUrl();
  const nutritionalHighlights = getNutritionalHighlights();
  const certificationBadges = getCertificationBadges();
  const seasonalityInfo = getSeasonalityInfo();

  return (
    <Card
      className={`overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer group ${className}`}
      onClick={onClick}
    >
      {/* Product Image */}
      <div className="aspect-video bg-gray-200 rounded-t-2xl relative overflow-hidden">
        {primaryImageUrl ? (
          <img
            src={primaryImageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}

        {/* Fallback background */}
        <div
          className="w-full h-full bg-gradient-to-br from-mint-fresh/20 to-bottle-green/20 flex items-center justify-center"
          style={{ display: primaryImageUrl ? 'none' : 'flex' }}
        >
          <div className="text-6xl opacity-20">🥬</div>
        </div>

        {/* Overlay badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
          {certificationBadges.map((badge, index) => {
            const IconComponent = badge.icon;
            return (
              <span
                key={index}
                className={`bg-${badge.color}/20 backdrop-blur-sm border border-${badge.color}/30 text-${badge.color === 'mint-fresh' ? 'bottle-green' : 'text-dark'} text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1`}
              >
                <IconComponent className="w-3 h-3" />
                {badge.text}
              </span>
            );
          })}
        </div>

        {/* Vendor count */}
        <div className="absolute top-3 right-3">
          <span className="bg-white/90 backdrop-blur-sm text-bottle-green text-xs px-2 py-1 rounded-full font-medium">
            {product.activeListingsCount || product.vendorCount || 0} vendors
          </span>
        </div>

        {/* Seasonality indicator */}
        {seasonalityInfo && (
          <div className="absolute bottom-3 left-3">
            <span
              className={`bg-${seasonalityInfo.color}/20 backdrop-blur-sm border border-${seasonalityInfo.color}/30 text-text-dark text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1`}
            >
              <Clock className="w-3 h-3" />
              {seasonalityInfo.text}
            </span>
          </div>
        )}
      </div>

      {/* Product Content */}
      <div className="p-4">
        {/* Product Name & Category */}
        <div className="mb-3">
          <h3 className="font-semibold text-text-dark mb-1 group-hover:text-bottle-green transition-colors line-clamp-2">
            {product.name}
          </h3>
          <p className="text-text-muted text-sm">
            {product.category?.name || 'Fresh Produce'}
            {product.variety && (
              <span className="text-text-muted/60"> • {product.variety}</span>
            )}
          </p>
          {product.origin && (
            <p className="text-text-muted/80 text-xs flex items-center gap-1 mt-1">
              <MapPin className="w-3 h-3" />
              {product.origin}
            </p>
          )}
        </div>

        {/* Price Information */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            {product.priceRange ? (
              <div className="flex flex-col">
                <span className="text-lg font-bold text-bottle-green">
                  {formatPrice(product.priceRange.min)} -{' '}
                  {formatPrice(product.priceRange.max)}
                </span>
                <span className="text-xs text-text-muted">
                  per {product.standardUnits?.[0]?.name || 'unit'}
                </span>
              </div>
            ) : (
              <div className="flex flex-col">
                <span className="text-lg font-bold text-bottle-green">
                  {formatPrice(product.averagePrice || product.price)}
                </span>
                <span className="text-xs text-text-muted">
                  per{' '}
                  {product.unit || product.standardUnits?.[0]?.name || 'unit'}
                </span>
              </div>
            )}

            {/* Rating if available */}
            {product.rating && product.rating.average > 0 && (
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-earthy-yellow fill-current" />
                <span className="text-sm font-medium text-text-dark">
                  {product.rating.average.toFixed(1)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Nutritional Highlights */}
        {nutritionalHighlights.length > 0 && (
          <div className="mb-3">
            <div className="flex flex-wrap gap-2">
              {nutritionalHighlights.map((highlight, index) => (
                <span
                  key={index}
                  className="bg-mint-fresh/10 text-bottle-green text-xs px-2 py-1 rounded-lg font-medium"
                >
                  {highlight}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Quality Grades Available */}
        {product.qualityGrades && product.qualityGrades.length > 0 && (
          <div className="mb-3">
            <p className="text-xs text-text-muted mb-1">Quality Grades:</p>
            <div className="flex flex-wrap gap-1">
              {product.qualityGrades.slice(0, 3).map((grade, index) => (
                <span
                  key={index}
                  className="bg-earthy-yellow/10 text-earthy-brown text-xs px-2 py-0.5 rounded font-medium"
                >
                  {grade.name}
                </span>
              ))}
              {product.qualityGrades.length > 3 && (
                <span className="text-xs text-text-muted">
                  +{product.qualityGrades.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Storage Requirements (if detailed view) */}
        {showDetailed && product.storageRequirements && (
          <div className="mb-3 text-xs text-text-muted">
            <div className="flex items-center gap-1 mb-1">
              <Thermometer className="w-3 h-3" />
              Storage: {product.storageRequirements.temperature?.min}°-
              {product.storageRequirements.temperature?.max}°C
            </div>
            {product.shelfLife && (
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Shelf Life: {product.shelfLife.value} {product.shelfLife.unit}
              </div>
            )}
          </div>
        )}

        {/* Action Button */}
        <div className="flex items-center justify-between">
          <button className="text-sm text-bottle-green hover:text-bottle-green/80 transition-colors flex items-center gap-1 group">
            View Details
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </button>

          {/* Additional indicators */}
          <div className="flex items-center gap-1 text-xs text-text-muted">
            {product.isSeasonal && (
              <Clock className="w-3 h-3 text-earthy-yellow" />
            )}
            {product.isOrganic && <Leaf className="w-3 h-3 text-mint-fresh" />}
            {product.isLocallySourced && (
              <MapPin className="w-3 h-3 text-bottle-green" />
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default React.memo(ProductCard);
