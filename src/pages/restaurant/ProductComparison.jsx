import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  X,
  Star,
  ShoppingCart,
  RotateCcw,
  TrendingUp,
  Award,
  MapPin,
  Info,
  Plus,
  Heart,
  Scale,
  AlertCircle,
  CheckCircle,
  Package,
} from 'lucide-react';
import {
  selectComparisonItems,
  selectComparisonTableData,
  selectComparisonStats,
  selectComparisonError,
  removeFromComparison,
  clearComparison,
  clearComparisonError,
} from '../../store/slices/comparisonSlice';
import { addToCart } from '../../store/slices/cartSlice';
import { formatCurrency } from '../../utils';
import Button from '../../components/ui/Button';

const ProductComparison = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const comparisonItems = useSelector(selectComparisonItems);
  const tableData = useSelector(selectComparisonTableData);
  const stats = useSelector(selectComparisonStats);
  const error = useSelector(selectComparisonError);

  const [showStats, setShowStats] = useState(false);

  const handleAddToCart = (product) => {
    dispatch(
      addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        vendorId: product.vendorId,
        vendorName: product.vendorName,
        unit: product.unit,
        quantity: 1,
        availability: product.availability,
      })
    );
  };

  const handleRemoveFromComparison = (productId) => {
    dispatch(removeFromComparison(productId));
  };

  const handleClearAll = () => {
    dispatch(clearComparison());
  };

  const handleDismissError = () => {
    dispatch(clearComparisonError());
  };

  const getAvailabilityColor = (availability) => {
    const colors = {
      'in-stock': 'bg-sage-green/20 text-muted-olive',
      'low-stock': 'bg-amber-100 text-amber-800',
      'out-of-stock': 'bg-tomato-red/10 text-tomato-red',
    };
    return colors[availability] || 'bg-gray-100 text-gray-600';
  };

  const getAvailabilityText = (availability) => {
    const texts = {
      'in-stock': 'In Stock',
      'low-stock': 'Low Stock',
      'out-of-stock': 'Out of Stock',
    };
    return texts[availability] || 'Available';
  };

  const renderCellValue = (value, type, index) => {
    switch (type) {
      case 'image':
        return value ? (
          <div className="w-16 h-16 bg-gradient-to-br from-earthy-beige/20 to-sage-green/10 rounded-xl overflow-hidden mx-auto">
            <img
              src={value}
              alt="Product"
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        ) : (
          <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center mx-auto">
            <Package className="w-6 h-6 text-gray-400" />
          </div>
        );

      case 'currency':
        return (
          <span className="font-semibold text-text-dark">
            {formatCurrency(value)}
          </span>
        );

      case 'rating':
        return value > 0 ? (
          <div className="flex items-center gap-1 justify-center">
            <Star className="w-4 h-4 text-earthy-yellow fill-current" />
            <span className="font-medium">{value.toFixed(1)}</span>
          </div>
        ) : (
          <span className="text-gray-400">No rating</span>
        );

      case 'availability':
        return (
          <span
            className={`px-2 py-1 rounded-lg text-xs font-medium ${getAvailabilityColor(value)}`}
          >
            {getAvailabilityText(value)}
          </span>
        );

      case 'boolean':
        return (
          <div className="flex justify-center">
            {value === 'Yes' ? (
              <CheckCircle className="w-5 h-5 text-sage-green" />
            ) : (
              <X className="w-5 h-5 text-gray-400" />
            )}
          </div>
        );

      case 'text':
      default:
        return <span className="text-text-dark">{value || 'N/A'}</span>;
    }
  };

  // Empty state
  if (comparisonItems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => navigate('/restaurant/browse')}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors touch-target"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-text-dark">
                Product Comparison
              </h1>
              <p className="text-text-muted mt-2">
                Compare products side by side to make informed decisions
              </p>
            </div>
          </div>
        </div>

        {/* Empty State */}
        <div className="glass rounded-3xl p-12 text-center">
          <Scale className="w-16 h-16 text-gray-300 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-text-dark mb-4">
            No Products to Compare
          </h2>
          <p className="text-text-muted mb-8 max-w-md mx-auto">
            Add products to comparison from the browse page to see a detailed
            side-by-side comparison of features, prices, and specifications.
          </p>
          <Button
            onClick={() => navigate('/restaurant/browse')}
            className="min-h-[48px] flex items-center gap-2"
          >
            <Package className="w-5 h-5" />
            Browse Products
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/restaurant/browse')}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors touch-target"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-text-dark">
              Product Comparison
            </h1>
            <p className="text-text-muted mt-2">
              Comparing {comparisonItems.length} products
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowStats(!showStats)}
            className="bg-blue-50 hover:bg-blue-100 text-blue-700 px-4 py-2 rounded-xl font-medium transition-colors flex items-center gap-2 touch-target"
          >
            <TrendingUp className="w-4 h-4" />
            {showStats ? 'Hide' : 'Show'} Stats
          </button>
          <button
            onClick={handleClearAll}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl font-medium transition-colors flex items-center gap-2 touch-target"
          >
            <RotateCcw className="w-4 h-4" />
            Clear All
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-tomato-red/5 border border-tomato-red/20 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-tomato-red" />
            <span className="text-tomato-red font-medium">{error}</span>
          </div>
          <button
            onClick={handleDismissError}
            className="text-tomato-red hover:text-tomato-red/80 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Statistics Panel */}
      {showStats && (
        <div className="glass rounded-3xl p-6 animate-fade-in">
          <h2 className="text-xl font-semibold text-text-dark mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-muted-olive" />
            Comparison Statistics
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-green-50 rounded-2xl p-4">
              <div className="text-2xl font-bold text-muted-olive">
                {formatCurrency(stats.averagePrice)}
              </div>
              <div className="text-sm text-green-700">Average Price</div>
            </div>

            <div className="bg-blue-50 rounded-2xl p-4">
              <div className="text-2xl font-bold text-blue-600">
                {stats.averageRating.toFixed(1)}★
              </div>
              <div className="text-sm text-blue-700">Average Rating</div>
            </div>

            <div className="bg-purple-50 rounded-2xl p-4">
              <div className="text-2xl font-bold text-purple-600">
                {stats.vendorCount}
              </div>
              <div className="text-sm text-purple-700">Vendors</div>
            </div>

            <div className="bg-amber-50 rounded-2xl p-4">
              <div className="text-2xl font-bold text-amber-600">
                {formatCurrency(stats.priceRange.max - stats.priceRange.min)}
              </div>
              <div className="text-sm text-amber-700">Price Range</div>
            </div>
          </div>
        </div>
      )}

      {/* Product Cards (Mobile View) */}
      <div className="block lg:hidden space-y-4">
        {comparisonItems.map((product) => (
          <div key={product.id} className="glass rounded-3xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-earthy-beige/20 to-sage-green/10 rounded-xl overflow-hidden flex-shrink-0">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-text-dark">
                    {product.name}
                  </h3>
                  <p className="text-sm text-text-muted flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {product.vendorName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleRemoveFromComparison(product.id)}
                className="text-gray-400 hover:text-tomato-red transition-colors p-1 touch-target"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-text-muted">Price:</span>
                <span className="font-semibold text-text-dark">
                  {formatCurrency(product.price)} per {product.unit}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-text-muted">Rating:</span>
                {product.rating > 0 ? (
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-earthy-yellow fill-current" />
                    <span>{product.rating.toFixed(1)}</span>
                  </div>
                ) : (
                  <span className="text-gray-400">No rating</span>
                )}
              </div>

              <div className="flex justify-between items-center">
                <span className="text-text-muted">Availability:</span>
                <span
                  className={`px-2 py-1 rounded-lg text-xs font-medium ${getAvailabilityColor(product.availability)}`}
                >
                  {getAvailabilityText(product.availability)}
                </span>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => handleAddToCart(product)}
                disabled={product.availability === 'out-of-stock'}
                className="flex-1 min-h-[44px] flex items-center justify-center gap-2"
              >
                <ShoppingCart className="w-4 h-4" />
                Add to Cart
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Comparison Table (Desktop View) */}
      <div className="hidden lg:block glass rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                {tableData.headers.map((header, index) => (
                  <th
                    key={index}
                    className={`p-4 text-left font-semibold text-text-dark ${
                      index === 0 ? 'bg-gray-50' : 'bg-white'
                    }`}
                  >
                    {index === 0 ? (
                      header
                    ) : (
                      <div className="space-y-2">
                        <div className="font-semibold text-sm truncate">
                          {header}
                        </div>
                        <button
                          onClick={() =>
                            handleRemoveFromComparison(
                              comparisonItems[index - 1].id
                            )
                          }
                          className="text-gray-400 hover:text-tomato-red transition-colors p-1 touch-target"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableData.rows.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className="border-b border-gray-100 last:border-b-0"
                >
                  <td className="p-4 font-medium text-text-dark bg-gray-50 sticky left-0">
                    {row.feature}
                  </td>
                  {row.values.slice(1).map((value, cellIndex) => (
                    <td key={cellIndex} className="p-4 text-center bg-white">
                      {renderCellValue(value, row.type, cellIndex)}
                    </td>
                  ))}
                </tr>
              ))}
              {/* Action Row */}
              <tr className="border-b-0">
                <td className="p-4 font-medium text-text-dark bg-gray-50 sticky left-0">
                  Actions
                </td>
                {comparisonItems.map((product, index) => (
                  <td key={product.id} className="p-4 bg-white">
                    <Button
                      onClick={() => handleAddToCart(product)}
                      disabled={product.availability === 'out-of-stock'}
                      className="w-full min-h-[44px] flex items-center justify-center gap-2"
                      size="sm"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Add to Cart
                    </Button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
        <div className="text-text-muted">
          <Info className="w-4 h-4 inline mr-2" />
          Maximum 4 products can be compared at once
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => navigate('/restaurant/browse')}
            className="min-h-[44px] flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add More Products
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductComparison;
