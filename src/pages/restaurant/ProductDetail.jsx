import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  ArrowLeft,
  Star,
  MapPin,
  Leaf,
  ShieldCheck,
  Clock,
  Thermometer,
  Package,
  Truck,
  Plus,
  Minus,
  Heart,
  Share2,
  ChevronLeft,
  ChevronRight,
  Award,
  Info,
} from 'lucide-react';
import { useGetListingByIdQuery } from '../../store/slices/apiSlice';
import { addToCart } from '../../store/slices/cartSlice';
import { formatCurrency } from '../../utils';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const ProductDetail = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('overview');
  const [quantity, setQuantity] = useState(1);

  const {
    data: listingResponse,
    isLoading,
    error,
  } = useGetListingByIdQuery(productId, { skip: !productId });

  // Transform API response to match expected structure
  const listing = listingResponse?.data || listingResponse;
  const product = listing?.product || {};
  const vendor = listing?.vendor || {};

  // Handle pricing structure
  const pricing = listing?.pricing?.[0] || {};
  const price = pricing.pricePerUnit || listing?.price || 0;
  const unit = pricing.unit || listing?.availability?.unit || 'unit';

  // Handle availability
  const availabilityObj = listing?.availability || {};
  const quantityAvailable = availabilityObj.quantityAvailable || 0;
  const isInSeason = availabilityObj.isInSeason;

  // Handle images
  const imageUrls =
    listing?.images?.map((img) => img.url || img) ||
    product.images?.map((img) => img.url || img) ||
    [];

  // Handle rating
  const rating = listing?.rating?.average || product.rating?.average || 0;

  const handleAddToCart = () => {
    if (!listing) return;

    dispatch(
      addToCart({
        id: listing._id,
        name: product.name,
        price: price,
        image: imageUrls[0],
        vendorId: listing.vendorId,
        vendorName: vendor.businessName || vendor.name,
        unit: unit,
        quantity: quantity,
        productId: listing.productId,
        availability: quantityAvailable > 0 ? 'in-stock' : 'out-of-stock',
      })
    );
  };

  const handleQuantityChange = (delta) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && newQuantity <= quantityAvailable) {
      setQuantity(newQuantity);
    }
  };

  const handleImageNavigation = (direction) => {
    if (imageUrls.length <= 1) return;

    if (direction === 'prev') {
      setCurrentImageIndex((prev) =>
        prev === 0 ? imageUrls.length - 1 : prev - 1
      );
    } else {
      setCurrentImageIndex((prev) =>
        prev === imageUrls.length - 1 ? 0 : prev + 1
      );
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <LoadingSpinner size="large" text="Loading product details..." />
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className="glass rounded-3xl p-12">
          <div className="text-tomato-red mb-4">
            <Package className="w-16 h-16 mx-auto" />
          </div>
          <h2 className="text-2xl font-bold text-text-dark dark:text-white mb-4">
            Product Not Found
          </h2>
          <p className="text-text-muted dark:text-gray-300 mb-8">
            The product you're looking for is not available or has been removed.
          </p>
          <button
            onClick={() => navigate('/restaurant/browse')}
            className="bg-gradient-primary text-white px-8 py-3 rounded-2xl font-medium hover:shadow-lg transition-all duration-200 touch-target"
          >
            Back to Browse
          </button>
        </div>
      </div>
    );
  }

  const currentImage = imageUrls[currentImageIndex];

  return (
    <div className="max-w-7xl mx-auto" data-testid="product-detail-container">
      {/* Breadcrumb */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/restaurant/browse')}
          className="flex items-center gap-2 text-text-muted dark:text-gray-300 hover:text-text-dark dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Browse Products
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Side - Images */}
        <div className="space-y-4" data-testid="image-gallery">
          {/* Main Image */}
          <div className="relative aspect-square bg-gray-100 rounded-3xl overflow-hidden">
            {currentImage ? (
              <img
                src={currentImage}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-mint-fresh/20 to-bottle-green/20 flex items-center justify-center">
                <div className="text-8xl opacity-20">🥬</div>
              </div>
            )}

            {/* Image Navigation */}
            {imageUrls.length > 1 && (
              <>
                <button
                  onClick={() => handleImageNavigation('prev')}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm p-3 rounded-full shadow-lg hover:bg-white transition-colors touch-target"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleImageNavigation('next')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm p-3 rounded-full shadow-lg hover:bg-white transition-colors touch-target"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}

            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-wrap gap-2">
              {product.isOrganic && (
                <span className="bg-mint-fresh/20 backdrop-blur-sm border border-mint-fresh/30 text-bottle-green dark:text-green-400 text-sm px-3 py-1 rounded-full font-medium flex items-center gap-1">
                  <Leaf className="w-4 h-4" />
                  Organic
                </span>
              )}
              {product.isLocallySourced && (
                <span className="bg-bottle-green/20 backdrop-blur-sm border border-bottle-green/30 text-bottle-green dark:text-green-400 text-sm px-3 py-1 rounded-full font-medium flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  Local
                </span>
              )}
              {listing.qualityGrade && (
                <span className="bg-earthy-yellow/20 backdrop-blur-sm border border-earthy-yellow/30 text-earthy-brown text-sm px-3 py-1 rounded-full font-medium flex items-center gap-1">
                  <Award className="w-4 h-4" />
                  {listing.qualityGrade}
                </span>
              )}
            </div>

            {/* Actions */}
            <div className="absolute top-4 right-4 flex gap-2">
              <button className="bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-lg hover:bg-white transition-colors">
                <Heart className="w-5 h-5 text-gray-600" />
              </button>
              <button className="bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-lg hover:bg-white transition-colors">
                <Share2 className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Image Thumbnails */}
          {imageUrls.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {imageUrls.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-2xl overflow-hidden border-2 transition-colors ${
                    currentImageIndex === index
                      ? 'border-bottle-green'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Side - Product Details */}
        <div className="space-y-6">
          {/* Product Header */}
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-text-muted dark:text-gray-300">
                {product.category?.name}
              </span>
              {rating > 0 && (
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-earthy-yellow fill-current" />
                  <span className="text-sm text-text-muted dark:text-gray-300">
                    {rating.toFixed(1)}
                  </span>
                </div>
              )}
            </div>
            <h1 className="text-3xl font-bold text-text-dark dark:text-white mb-4">
              {product.name}
            </h1>
            <p className="text-text-dark/80 dark:text-gray-300 leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Vendor Info */}
          <div className="glass rounded-2xl p-4">
            <h3 className="font-semibold text-text-dark dark:text-white mb-2">
              Vendor Information
            </h3>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-bottle-green/20 to-mint-fresh/20 rounded-xl flex items-center justify-center">
                <Package className="w-6 h-6 text-bottle-green dark:text-green-400" />
              </div>
              <div>
                <p className="font-medium text-text-dark dark:text-white">
                  {vendor.businessName || vendor.name}
                </p>
                <p className="text-text-muted dark:text-gray-300 text-sm flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {vendor.address?.city || 'Local Vendor'}
                </p>
              </div>
            </div>
          </div>

          {/* Pricing & Availability */}
          <div className="glass rounded-2xl p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-3xl font-bold text-bottle-green dark:text-green-400">
                  {formatCurrency(price)}
                </p>
                <p className="text-text-muted dark:text-gray-300">per {unit}</p>
              </div>
              <div className="text-right">
                <p
                  className={`font-medium ${quantityAvailable > 0 ? 'text-mint-fresh dark:text-green-400' : 'text-tomato-red'}`}
                >
                  {quantityAvailable > 0 ? 'In Stock' : 'Out of Stock'}
                </p>
                <p className="text-text-muted dark:text-gray-300 text-sm">
                  {quantityAvailable} {unit} available
                </p>
              </div>
            </div>

            {/* Quantity Selector */}
            {quantityAvailable > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-text-dark dark:text-white">
                    Quantity
                  </span>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleQuantityChange(-1)}
                      disabled={quantity <= 1}
                      className="w-10 h-10 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl flex items-center justify-center transition-colors touch-target"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="font-semibold text-text-dark dark:text-white min-w-8 text-center text-lg">
                      {quantity}
                    </span>
                    <button
                      onClick={() => handleQuantityChange(1)}
                      disabled={quantity >= quantityAvailable}
                      className="w-10 h-10 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl flex items-center justify-center transition-colors touch-target"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div>
                    <p className="text-sm text-text-muted dark:text-gray-300">
                      Total Price
                    </p>
                    <p className="text-xl font-bold text-text-dark dark:text-white">
                      {formatCurrency(price * quantity)}
                    </p>
                  </div>
                  <button
                    onClick={handleAddToCart}
                    className="bg-gradient-primary text-white px-8 py-3 rounded-2xl font-medium hover:shadow-lg transition-all duration-200 touch-target flex items-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Add to Cart
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Product Details Tabs */}
          <div className="glass rounded-2xl p-6">
            {/* Tab Navigation */}
            <div className="flex border-b border-gray-200 mb-4">
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'specifications', label: 'Specifications' },
                { id: 'delivery', label: 'Delivery' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-bottle-green text-bottle-green dark:text-green-400'
                      : 'border-transparent text-text-muted hover:text-text-dark dark:text-gray-300 dark:hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="space-y-4">
              {activeTab === 'overview' && (
                <div className="space-y-4">
                  {product.origin && (
                    <div>
                      <h5 className="font-medium text-text-dark dark:text-white mb-2 flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Origin
                      </h5>
                      <p className="text-text-muted dark:text-gray-300">
                        {product.origin}
                      </p>
                    </div>
                  )}

                  {product.seasonality && product.seasonality.length > 0 && (
                    <div>
                      <h5 className="font-medium text-text-dark dark:text-white mb-2 flex items-center gap-2">
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

                  {isInSeason !== undefined && (
                    <div>
                      <h5 className="font-medium text-text-dark dark:text-white mb-2">
                        Current Season
                      </h5>
                      <span
                        className={`px-3 py-1 rounded-lg text-sm font-medium ${
                          isInSeason
                            ? 'bg-mint-fresh/20 text-bottle-green dark:text-green-400'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {isInSeason ? 'In Season' : 'Out of Season'}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'specifications' && (
                <div className="space-y-4">
                  {listing.qualityGrade && (
                    <div>
                      <h5 className="font-medium text-text-dark dark:text-white mb-2 flex items-center gap-2">
                        <Award className="w-4 h-4" />
                        Quality Grade
                      </h5>
                      <p className="text-text-muted dark:text-gray-300">
                        {listing.qualityGrade}
                      </p>
                    </div>
                  )}

                  {product.storageRequirements && (
                    <div>
                      <h5 className="font-medium text-text-dark dark:text-white mb-2 flex items-center gap-2">
                        <Thermometer className="w-4 h-4" />
                        Storage Requirements
                      </h5>
                      <div className="space-y-2 text-text-muted dark:text-gray-300">
                        {product.storageRequirements.temperature && (
                          <p>
                            Temperature:{' '}
                            {product.storageRequirements.temperature.min}° -{' '}
                            {product.storageRequirements.temperature.max}°C
                          </p>
                        )}
                        {product.storageRequirements.conditions &&
                          product.storageRequirements.conditions.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {product.storageRequirements.conditions.map(
                                (condition, index) => (
                                  <span
                                    key={index}
                                    className="bg-bottle-green/10 text-bottle-green dark:text-green-400 px-2 py-1 rounded text-sm"
                                  >
                                    {condition}
                                  </span>
                                )
                              )}
                            </div>
                          )}
                      </div>
                    </div>
                  )}

                  {listing.certifications &&
                    listing.certifications.length > 0 && (
                      <div>
                        <h5 className="font-medium text-text-dark dark:text-white mb-2 flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4" />
                          Certifications
                        </h5>
                        <div className="flex flex-wrap gap-2">
                          {listing.certifications.map((cert, index) => (
                            <span
                              key={index}
                              className="bg-mint-fresh/10 text-bottle-green dark:text-green-400 px-3 py-1 rounded-lg text-sm font-medium"
                            >
                              {cert}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
              )}

              {activeTab === 'delivery' && (
                <div className="space-y-4">
                  {listing.deliveryOptions && (
                    <div>
                      <h5 className="font-medium text-text-dark dark:text-white mb-3">
                        Delivery Options
                      </h5>
                      <div className="space-y-3">
                        {listing.deliveryOptions.selfPickup?.enabled && (
                          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <Package className="w-5 h-5 text-bottle-green dark:text-green-400" />
                            <div>
                              <p className="font-medium text-text-dark dark:text-white">
                                Self Pickup
                              </p>
                              <p className="text-text-muted dark:text-gray-300 text-sm">
                                Pick up from vendor location
                              </p>
                            </div>
                          </div>
                        )}
                        {listing.deliveryOptions.delivery?.enabled && (
                          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <Truck className="w-5 h-5 text-bottle-green dark:text-green-400" />
                            <div>
                              <p className="font-medium text-text-dark dark:text-white">
                                Home Delivery
                              </p>
                              <p className="text-text-muted dark:text-gray-300 text-sm">
                                {listing.deliveryOptions.delivery.fee > 0
                                  ? `Delivery fee: ${formatCurrency(listing.deliveryOptions.delivery.fee)}`
                                  : 'Free delivery'}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {listing.leadTime !== undefined && (
                    <div>
                      <h5 className="font-medium text-text-dark dark:text-white mb-2 flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Lead Time
                      </h5>
                      <p className="text-text-muted dark:text-gray-300">
                        {listing.leadTime === 0
                          ? 'Available immediately'
                          : `${listing.leadTime} days`}
                      </p>
                    </div>
                  )}

                  {listing.minimumOrderValue > 0 && (
                    <div>
                      <h5 className="font-medium text-text-dark dark:text-white mb-2">
                        Minimum Order
                      </h5>
                      <p className="text-text-muted dark:text-gray-300">
                        {formatCurrency(listing.minimumOrderValue)}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
