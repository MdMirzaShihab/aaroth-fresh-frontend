import React, { useState, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import {
  X,
  Plus,
  Minus,
  ShoppingCart,
  Package,
  Truck,
  AlertCircle,
  Check,
} from 'lucide-react';
import { addBulkToCart } from '../../store/slices/cartSlice';
import { formatCurrency } from '../../utils';
import Button from '../ui/Button';

const BulkOrderModal = ({
  isOpen,
  onClose,
  selectedProducts = [],
  onClearSelection,
}) => {
  const dispatch = useDispatch();
  const [quantities, setQuantities] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);

  // Initialize quantities for selected products when they change
  React.useEffect(() => {
    setQuantities(prevQuantities => {
      const newQuantities = { ...prevQuantities };
      let hasChanges = false;

      selectedProducts.forEach((product) => {
        if (!(product._id in newQuantities)) {
          newQuantities[product._id] = 1;
          hasChanges = true;
        }
      });

      // Only return new object if there are actual changes
      return hasChanges ? newQuantities : prevQuantities;
    });
  }, [selectedProducts]);

  // Calculate totals
  const totals = useMemo(() => {
    let totalItems = 0;
    let totalPrice = 0;
    const vendorGroups = {};

    selectedProducts.forEach((product) => {
      const quantity = quantities[product._id] || 1;
      const itemTotal = product.price * quantity;

      totalItems += quantity;
      totalPrice += itemTotal;

      // Group by vendor for delivery calculations
      const vendorId = product.vendorId;
      if (!vendorGroups[vendorId]) {
        vendorGroups[vendorId] = {
          vendorName: product.vendorName,
          items: [],
          subtotal: 0,
        };
      }
      vendorGroups[vendorId].items.push({
        ...product,
        quantity,
        itemTotal,
      });
      vendorGroups[vendorId].subtotal += itemTotal;
    });

    return {
      totalItems,
      totalPrice,
      vendorGroups: Object.values(vendorGroups),
      vendorCount: Object.keys(vendorGroups).length,
    };
  }, [selectedProducts, quantities]);

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity >= 1 && newQuantity <= 999) {
      setQuantities((prev) => ({
        ...prev,
        [productId]: newQuantity,
      }));
    }
  };

  const handleAddAllToCart = async () => {
    setIsProcessing(true);

    try {
      const bulkItems = selectedProducts.map((product) => ({
        id: product._id,
        name: product.name,
        price: product.price,
        image: product.images?.[0],
        vendorId: product.vendorId,
        vendorName: product.vendorName,
        unit: product.unit,
        quantity: quantities[product._id] || 1,
        productId: product.productId || product._id,
        availability: product.availability,
      }));

      dispatch(addBulkToCart(bulkItems));

      // Clear selection and close modal
      onClearSelection();
      onClose();
    } catch (error) {
      console.error('Failed to add bulk items to cart:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemoveProduct = (productId) => {
    const newQuantities = { ...quantities };
    delete newQuantities[productId];
    setQuantities(newQuantities);

    // Remove from selection
    onClearSelection([productId]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-layer-3 dark:glass-3-dark rounded-3xl shadow-organic dark:shadow-dark-glass max-w-4xl w-full max-h-[90vh] flex flex-col animate-scale-in border border-white/20 dark:border-gray-700/30">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-text-dark dark:text-dark-text-primary">Bulk Order</h2>
            <p className="text-text-muted dark:text-dark-text-muted mt-1">
              Add multiple products to your cart at once
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X className="w-6 h-6 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {selectedProducts.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-text-dark dark:text-dark-text-primary mb-2">
                No Products Selected
              </h3>
              <p className="text-text-muted dark:text-dark-text-muted">
                Select products from the browse page to add them in bulk
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-blue-50/80 dark:bg-blue-900/30 backdrop-blur-sm rounded-2xl p-4 border border-blue-200/50 dark:border-blue-700/30">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                      <Package className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-blue-900 dark:text-blue-300">
                        {totals.totalItems}
                      </p>
                      <p className="text-sm text-blue-700 dark:text-blue-400">Total Items</p>
                    </div>
                  </div>
                </div>

                <div className="bg-sage-green/20 dark:bg-dark-sage-accent/20 backdrop-blur-sm rounded-2xl p-4 border border-sage-green/30 dark:border-dark-sage-accent/30">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-muted-olive rounded-xl flex items-center justify-center">
                      <ShoppingCart className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-muted-olive dark:text-dark-sage-accent">
                        {formatCurrency(totals.totalPrice)}
                      </p>
                      <p className="text-sm text-muted-olive dark:text-dark-sage-accent">Total Value</p>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50/80 dark:bg-purple-900/30 backdrop-blur-sm rounded-2xl p-4 border border-purple-200/50 dark:border-purple-700/30">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center">
                      <Truck className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-purple-900 dark:text-purple-300">
                        {totals.vendorCount}
                      </p>
                      <p className="text-sm text-purple-700 dark:text-purple-400">Vendors</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Vendor Groups */}
              <div className="space-y-4">
                {totals.vendorGroups.map((vendorGroup, vendorIndex) => (
                  <div
                    key={vendorIndex}
                    className="glass-layer-1 dark:glass-1-dark border-0 rounded-2xl p-4 shadow-soft dark:shadow-dark-glass"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-text-dark dark:text-dark-text-primary">
                        {vendorGroup.vendorName}
                      </h3>
                      <span className="text-sm font-medium text-muted-olive dark:text-dark-sage-accent">
                        {formatCurrency(vendorGroup.subtotal)}
                      </span>
                    </div>

                    <div className="space-y-3">
                      {vendorGroup.items.map((product) => (
                        <div
                          key={product._id}
                          className="bg-gray-50/50 dark:bg-gray-800/30 backdrop-blur-sm rounded-xl p-4 border border-gray-200/30 dark:border-gray-700/30"
                        >
                          <div className="flex items-center gap-4">
                            {/* Product Image */}
                            <div className="w-16 h-16 bg-gradient-to-br from-earthy-beige/20 to-sage-green/10 rounded-xl overflow-hidden flex-shrink-0">
                              {product.images?.[0] ? (
                                <img
                                  src={product.images[0]}
                                  alt={product.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Package className="w-6 h-6 text-gray-400 dark:text-gray-500" />
                                </div>
                              )}
                            </div>

                            {/* Product Info */}
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-text-dark dark:text-dark-text-primary truncate">
                                {product.name}
                              </h4>
                              <p className="text-sm text-text-muted dark:text-dark-text-muted">
                                {formatCurrency(product.price)} per{' '}
                                {product.unit}
                              </p>
                              <p className="text-sm font-medium text-muted-olive dark:text-dark-sage-accent">
                                Total: {formatCurrency(product.itemTotal)}
                              </p>
                            </div>

                            {/* Quantity Controls */}
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() =>
                                  handleQuantityChange(
                                    product._id,
                                    (quantities[product._id] || 1) - 1
                                  )
                                }
                                disabled={quantities[product._id] <= 1}
                                className="w-8 h-8 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl flex items-center justify-center transition-colors border border-gray-200 dark:border-gray-600 min-h-[44px] min-w-[44px] touch-target"
                              >
                                <Minus className="w-4 h-4 text-gray-700 dark:text-gray-200" />
                              </button>
                              <span className="font-semibold text-text-dark dark:text-dark-text-primary min-w-8 text-center">
                                {quantities[product._id] || 1}
                              </span>
                              <button
                                onClick={() =>
                                  handleQuantityChange(
                                    product._id,
                                    (quantities[product._id] || 1) + 1
                                  )
                                }
                                className="w-8 h-8 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl flex items-center justify-center transition-colors border border-gray-200 dark:border-gray-600 min-h-[44px] min-w-[44px] touch-target"
                              >
                                <Plus className="w-4 h-4 text-gray-700 dark:text-gray-200" />
                              </button>
                            </div>

                            {/* Remove Button */}
                            <button
                              onClick={() => handleRemoveProduct(product._id)}
                              className="text-gray-400 dark:text-gray-500 hover:text-tomato-red dark:hover:text-tomato-red transition-colors p-2 min-h-[44px] min-w-[44px] touch-target"
                              title="Remove from bulk order"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Delivery Information */}
              {totals.vendorCount > 1 && (
                <div className="bg-amber-50/80 dark:bg-amber-900/30 backdrop-blur-sm border border-amber-200/50 dark:border-amber-700/30 rounded-2xl p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-amber-800 dark:text-amber-300 mb-1">
                        Multiple Vendors Notice
                      </h4>
                      <p className="text-sm text-amber-700 dark:text-amber-400">
                        Your order contains items from {totals.vendorCount}{' '}
                        different vendors. Items may arrive separately and
                        delivery fees may apply per vendor.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {selectedProducts.length > 0 && (
          <div className="border-t border-gray-200 dark:border-gray-700 p-6">
            <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
              <div className="text-left">
                <p className="text-lg font-semibold text-text-dark dark:text-dark-text-primary">
                  Total: {formatCurrency(totals.totalPrice)}
                </p>
                <p className="text-sm text-text-muted dark:text-dark-text-muted">
                  {totals.totalItems} items from {totals.vendorCount} vendor
                  {totals.vendorCount > 1 ? 's' : ''}
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={onClose}
                  disabled={isProcessing}
                  className="min-h-[48px]"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddAllToCart}
                  disabled={isProcessing}
                  isLoading={isProcessing}
                  className="min-h-[48px] flex items-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Adding to Cart...
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4" />
                      Add All to Cart
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BulkOrderModal;
