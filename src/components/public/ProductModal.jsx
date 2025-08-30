import React, { useState } from 'react';
import {
  X,
  Star,
  MapPin,
  Leaf,
  ShieldCheck,
  Clock,
  Thermometer,
  Package,
  Truck,
  Phone,
  Award,
  Info,
  Heart,
  Share2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import {
  useGetPublicProductQuery,
  useGetPublicListingsQuery,
} from '../../store/slices/apiSlice';
import LoadingSpinner from '../ui/LoadingSpinner';

const ProductModal = ({ productId, isOpen, onClose, onSignUpClick }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('overview');

  const {
    data: productData,
    isLoading: productLoading,
    error: productError,
  } = useGetPublicProductQuery(productId, { skip: !productId });

  const { data: listingsData, isLoading: listingsLoading } =
    useGetPublicListingsQuery(
      { category: productData?.data?.category?._id, limit: 20 },
      { skip: !productData?.data?.category?._id }
    );

  const product = productData?.data;
  const listings = product?.listings || [];

  // Format price for display
  const formatPrice = (price) => {
    if (typeof price === 'number') {
      return `৳${price.toFixed(2)}`;
    }
    return 'Price on request';
  };

  // Calculate price range from listings
  const getPriceRange = () => {
    if (!listings || listings.length === 0) return null;

    const prices = listings
      .flatMap((listing) => listing.pricing?.map((p) => p.pricePerUnit) || [])
      .filter(Boolean);

    if (prices.length === 0) return null;

    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
    };
  };

  // Get image navigation handlers
  const handlePrevImage = () => {
    if (product?.images && product.images.length > 1) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? product.images.length - 1 : prev - 1
      );
    }
  };

  const handleNextImage = () => {
    if (product?.images && product.images.length > 1) {
      setCurrentImageIndex((prev) =>
        prev === product.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  if (!isOpen) return null;

  if (productLoading) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="bg-white rounded-3xl p-8">
          <LoadingSpinner size="lg" text="Loading product details..." />
        </div>
      </div>
    );
  }

  if (productError || !product) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="bg-white rounded-3xl p-8 text-center max-w-md">
          <div className="text-tomato-red mb-4">
            <Package className="w-12 h-12 mx-auto" />
          </div>
          <h3 className="text-lg font-semibold text-text-dark mb-2">
            Product Not Found
          </h3>
          <p className="text-text-muted mb-6">
            The product you're looking for is not available or has been removed.
          </p>
          <button
            onClick={onClose}
            className="bg-gradient-primary text-white px-6 py-2 rounded-xl hover:shadow-lg transition-all duration-200"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const priceRange = getPriceRange();
  const currentImage = product.images?.[currentImageIndex];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-2xl font-bold text-text-dark">{product.name}</h2>
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
              <Heart className="w-5 h-5 text-gray-400" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
              <Share2 className="w-5 h-5 text-gray-400" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        <div className="flex max-h-[calc(90vh-80px)] overflow-hidden">
          {/* Left Side - Image Gallery */}
          <div className="flex-1 p-6">
            <div className="relative aspect-square bg-gray-100 rounded-2xl overflow-hidden mb-4">
              {currentImage ? (
                <img
                  src={
                    typeof currentImage === 'string'
                      ? currentImage
                      : currentImage.url
                  }
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-sage-green/20 to-muted-olive/20 flex items-center justify-center">
                  <div className="text-8xl opacity-20">🥬</div>
                </div>
              )}

              {/* Image Navigation */}
              {product.images && product.images.length > 1 && (
                <>
                  <button
                    onClick={handlePrevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-lg hover:bg-white transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleNextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-lg hover:bg-white transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                {product.isOrganic && (
                  <span className="bg-sage-green/20 backdrop-blur-sm border border-sage-green/30 text-muted-olive text-sm px-3 py-1 rounded-full font-medium flex items-center gap-1">
                    <Leaf className="w-4 h-4" />
                    Organic
                  </span>
                )}
                {product.isLocallySourced && (
                  <span className="bg-muted-olive/20 backdrop-blur-sm border border-muted-olive/30 text-muted-olive text-sm px-3 py-1 rounded-full font-medium flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    Local
                  </span>
                )}
                {product.certifications &&
                  product.certifications.length > 0 && (
                    <span className="bg-earthy-yellow/20 backdrop-blur-sm border border-earthy-yellow/30 text-earthy-brown text-sm px-3 py-1 rounded-full font-medium flex items-center gap-1">
                      <ShieldCheck className="w-4 h-4" />
                      Certified
                    </span>
                  )}
              </div>
            </div>

            {/* Image Thumbnails */}
            {product.images && product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                      currentImageIndex === index
                        ? 'border-muted-olive'
                        : 'border-transparent'
                    }`}
                  >
                    <img
                      src={typeof image === 'string' ? image : image.url}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Side - Product Details */}
          <div className="flex-1 p-6 overflow-y-auto">
            {/* Product Header */}
            <div className="mb-6">
              <p className="text-text-muted mb-2">
                {product.category?.name}
                {product.variety && (
                  <span className="text-text-muted/60">
                    {' '}
                    • {product.variety}
                  </span>
                )}
              </p>
              {product.origin && (
                <p className="text-text-muted flex items-center gap-1 mb-4">
                  <MapPin className="w-4 h-4" />
                  Origin: {product.origin}
                </p>
              )}

              <p className="text-text-dark/80 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Price Information */}
            <div className="mb-6 p-4 bg-sage-green/10 rounded-2xl">
              <h4 className="font-semibold text-text-dark mb-2">Pricing</h4>
              {priceRange ? (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-muted-olive">
                      {formatPrice(priceRange.min)} -{' '}
                      {formatPrice(priceRange.max)}
                    </p>
                    <p className="text-text-muted text-sm">
                      per {product.standardUnits?.[0]?.name || 'unit'}
                    </p>
                  </div>
                  <p className="text-text-muted text-sm">
                    {listings.length} vendors available
                  </p>
                </div>
              ) : (
                <p className="text-text-muted">
                  Price information not available
                </p>
              )}
            </div>

            {/* Tab Navigation */}
            <div className="flex border-b border-gray-200 mb-6">
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'nutrition', label: 'Nutrition' },
                { id: 'storage', label: 'Storage' },
                { id: 'vendors', label: 'Vendors' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-muted-olive text-muted-olive'
                      : 'border-transparent text-text-muted hover:text-text-dark'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="space-y-4">
              {activeTab === 'overview' && (
                <>
                  {/* Seasonality */}
                  {product.seasonality && product.seasonality.length > 0 && (
                    <div>
                      <h5 className="font-medium text-text-dark mb-2 flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Seasonality
                      </h5>
                      <div className="flex flex-wrap gap-2">
                        {product.seasonality.map((season, index) => (
                          <span
                            key={index}
                            className="bg-earthy-yellow/10 text-earthy-brown px-3 py-1 rounded-lg text-sm font-medium capitalize"
                          >
                            {season}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Quality Grades */}
                  {product.qualityGrades &&
                    product.qualityGrades.length > 0 && (
                      <div>
                        <h5 className="font-medium text-text-dark mb-2 flex items-center gap-2">
                          <Award className="w-4 h-4" />
                          Available Quality Grades
                        </h5>
                        <div className="space-y-2">
                          {product.qualityGrades.map((grade, index) => (
                            <div
                              key={index}
                              className="flex justify-between items-center p-2 bg-gray-50 rounded-lg"
                            >
                              <span className="font-medium">{grade.name}</span>
                              {grade.description && (
                                <span className="text-text-muted text-sm">
                                  {grade.description}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  {/* Shelf Life */}
                  {product.shelfLife && (
                    <div>
                      <h5 className="font-medium text-text-dark mb-2 flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Shelf Life
                      </h5>
                      <p className="text-text-muted">
                        {product.shelfLife.value} {product.shelfLife.unit}
                      </p>
                    </div>
                  )}
                </>
              )}

              {activeTab === 'nutrition' && (
                <>
                  {product.nutritionalInfo && (
                    <div className="space-y-4">
                      {/* Basic Nutrition */}
                      <div>
                        <h5 className="font-medium text-text-dark mb-3">
                          Nutritional Information (per 100g)
                        </h5>
                        <div className="grid grid-cols-2 gap-4">
                          {product.nutritionalInfo.calories && (
                            <div className="text-center p-3 bg-sage-green/10 rounded-lg">
                              <p className="text-2xl font-bold text-muted-olive">
                                {product.nutritionalInfo.calories}
                              </p>
                              <p className="text-text-muted text-sm">
                                Calories
                              </p>
                            </div>
                          )}
                          {product.nutritionalInfo.protein && (
                            <div className="text-center p-3 bg-sage-green/10 rounded-lg">
                              <p className="text-2xl font-bold text-muted-olive">
                                {product.nutritionalInfo.protein}g
                              </p>
                              <p className="text-text-muted text-sm">Protein</p>
                            </div>
                          )}
                          {product.nutritionalInfo.carbs && (
                            <div className="text-center p-3 bg-sage-green/10 rounded-lg">
                              <p className="text-2xl font-bold text-muted-olive">
                                {product.nutritionalInfo.carbs}g
                              </p>
                              <p className="text-text-muted text-sm">Carbs</p>
                            </div>
                          )}
                          {product.nutritionalInfo.fiber && (
                            <div className="text-center p-3 bg-sage-green/10 rounded-lg">
                              <p className="text-2xl font-bold text-muted-olive">
                                {product.nutritionalInfo.fiber}g
                              </p>
                              <p className="text-text-muted text-sm">Fiber</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Vitamins */}
                      {product.nutritionalInfo.vitamins &&
                        product.nutritionalInfo.vitamins.length > 0 && (
                          <div>
                            <h6 className="font-medium text-text-dark mb-2">
                              Vitamins
                            </h6>
                            <div className="space-y-2">
                              {product.nutritionalInfo.vitamins.map(
                                (vitamin, index) => (
                                  <div
                                    key={index}
                                    className="flex justify-between items-center"
                                  >
                                    <span className="text-text-dark">
                                      {vitamin.name}
                                    </span>
                                    <span className="text-text-muted">
                                      {vitamin.amount}
                                    </span>
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        )}

                      {/* Minerals */}
                      {product.nutritionalInfo.minerals &&
                        product.nutritionalInfo.minerals.length > 0 && (
                          <div>
                            <h6 className="font-medium text-text-dark mb-2">
                              Minerals
                            </h6>
                            <div className="space-y-2">
                              {product.nutritionalInfo.minerals.map(
                                (mineral, index) => (
                                  <div
                                    key={index}
                                    className="flex justify-between items-center"
                                  >
                                    <span className="text-text-dark">
                                      {mineral.name}
                                    </span>
                                    <span className="text-text-muted">
                                      {mineral.amount}
                                    </span>
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        )}
                    </div>
                  )}
                </>
              )}

              {activeTab === 'storage' && (
                <>
                  {product.storageRequirements && (
                    <div className="space-y-4">
                      {/* Temperature */}
                      {product.storageRequirements.temperature && (
                        <div>
                          <h5 className="font-medium text-text-dark mb-2 flex items-center gap-2">
                            <Thermometer className="w-4 h-4" />
                            Temperature Requirements
                          </h5>
                          <p className="text-text-muted">
                            {product.storageRequirements.temperature.min}° -{' '}
                            {product.storageRequirements.temperature.max}°
                            {product.storageRequirements.temperature.unit ||
                              'C'}
                          </p>
                        </div>
                      )}

                      {/* Humidity */}
                      {product.storageRequirements.humidity && (
                        <div>
                          <h5 className="font-medium text-text-dark mb-2">
                            Humidity Requirements
                          </h5>
                          <p className="text-text-muted">
                            {product.storageRequirements.humidity.min}% -{' '}
                            {product.storageRequirements.humidity.max}%
                          </p>
                        </div>
                      )}

                      {/* Conditions */}
                      {product.storageRequirements.conditions &&
                        product.storageRequirements.conditions.length > 0 && (
                          <div>
                            <h5 className="font-medium text-text-dark mb-2">
                              Storage Conditions
                            </h5>
                            <div className="flex flex-wrap gap-2">
                              {product.storageRequirements.conditions.map(
                                (condition, index) => (
                                  <span
                                    key={index}
                                    className="bg-muted-olive/10 text-muted-olive px-3 py-1 rounded-lg text-sm capitalize"
                                  >
                                    {condition}
                                  </span>
                                )
                              )}
                            </div>
                          </div>
                        )}
                    </div>
                  )}
                </>
              )}

              {activeTab === 'vendors' && (
                <>
                  {listingsLoading ? (
                    <LoadingSpinner text="Loading vendor information..." />
                  ) : listings.length > 0 ? (
                    <div className="space-y-4">
                      {listings.map((listing, index) => (
                        <div
                          key={listing._id || index}
                          className="p-4 border border-gray-200 rounded-lg"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h6 className="font-medium text-text-dark">
                                {listing.vendorId?.businessName ||
                                  'Local Vendor'}
                              </h6>
                              <p className="text-text-muted text-sm">
                                Quality: {listing.qualityGrade}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-semibold text-muted-olive">
                                {formatPrice(
                                  listing.pricing?.[0]?.pricePerUnit
                                )}
                              </p>
                              <p className="text-text-muted text-xs">
                                per {listing.pricing?.[0]?.unit}
                              </p>
                            </div>
                          </div>

                          {/* Availability */}
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-text-muted">
                              Available:{' '}
                              {listing.availability?.quantityAvailable}{' '}
                              {listing.availability?.unit}
                            </span>
                            {listing.deliveryOptions?.delivery?.enabled && (
                              <span className="text-muted-olive flex items-center gap-1">
                                <Truck className="w-4 h-4" />
                                Delivery Available
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-text-muted text-center py-8">
                      No vendor listings available for this product.
                    </p>
                  )}
                </>
              )}
            </div>

            {/* CTA Button */}
            <div className="mt-8 pt-4 border-t border-gray-200">
              <button
                onClick={onSignUpClick}
                className="w-full bg-gradient-primary text-white py-4 rounded-2xl font-semibold hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
              >
                <Package className="w-5 h-5" />
                Sign Up to Order from Vendors
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
