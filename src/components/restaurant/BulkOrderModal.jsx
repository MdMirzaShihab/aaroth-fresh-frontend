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
  onClearSelection 
}) => {
  const dispatch = useDispatch();
  const [quantities, setQuantities] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);

  // Initialize quantities for selected products
  const initializedQuantities = useMemo(() => {
    const newQuantities = { ...quantities };
    selectedProducts.forEach(product => {
      if (!(product._id in newQuantities)) {
        newQuantities[product._id] = 1;
      }
    });
    return newQuantities;
  }, [selectedProducts, quantities]);

  // Update quantities state when selectedProducts change
  React.useEffect(() => {
    setQuantities(initializedQuantities);
  }, [initializedQuantities]);

  // Calculate totals
  const totals = useMemo(() => {
    let totalItems = 0;
    let totalPrice = 0;
    const vendorGroups = {};

    selectedProducts.forEach(product => {
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
      setQuantities(prev => ({
        ...prev,
        [productId]: newQuantity,
      }));
    }
  };

  const handleAddAllToCart = async () => {
    setIsProcessing(true);
    
    try {
      const bulkItems = selectedProducts.map(product => ({
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-text-dark">
              Bulk Order
            </h2>
            <p className="text-text-muted mt-1">
              Add multiple products to your cart at once
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {selectedProducts.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-text-dark mb-2">
                No Products Selected
              </h3>
              <p className="text-text-muted">
                Select products from the browse page to add them in bulk
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded-2xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                      <Package className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-blue-900">
                        {totals.totalItems}
                      </p>
                      <p className="text-sm text-blue-700">Total Items</p>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 rounded-2xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-bottle-green rounded-xl flex items-center justify-center">
                      <ShoppingCart className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-bottle-green">
                        {formatCurrency(totals.totalPrice)}
                      </p>
                      <p className="text-sm text-green-700">Total Value</p>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 rounded-2xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center">
                      <Truck className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-purple-900">
                        {totals.vendorCount}
                      </p>
                      <p className="text-sm text-purple-700">Vendors</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Vendor Groups */}
              <div className="space-y-4">
                {totals.vendorGroups.map((vendorGroup, vendorIndex) => (
                  <div key={vendorIndex} className="border border-gray-200 rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-text-dark">
                        {vendorGroup.vendorName}
                      </h3>
                      <span className="text-sm font-medium text-bottle-green">
                        {formatCurrency(vendorGroup.subtotal)}
                      </span>
                    </div>

                    <div className="space-y-3">
                      {vendorGroup.items.map((product) => (
                        <div key={product._id} className="bg-gray-50 rounded-xl p-4">
                          <div className="flex items-center gap-4">
                            {/* Product Image */}
                            <div className="w-16 h-16 bg-gradient-to-br from-earthy-beige/20 to-mint-fresh/10 rounded-xl overflow-hidden flex-shrink-0">
                              {product.images?.[0] ? (
                                <img
                                  src={product.images[0]}
                                  alt={product.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Package className="w-6 h-6 text-gray-400" />
                                </div>
                              )}
                            </div>

                            {/* Product Info */}
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-text-dark truncate">
                                {product.name}
                              </h4>
                              <p className="text-sm text-text-muted">
                                {formatCurrency(product.price)} per {product.unit}
                              </p>
                              <p className="text-sm font-medium text-bottle-green">
                                Total: {formatCurrency(product.itemTotal)}
                              </p>
                            </div>

                            {/* Quantity Controls */}
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => handleQuantityChange(product._id, (quantities[product._id] || 1) - 1)}
                                disabled={quantities[product._id] <= 1}
                                className="w-8 h-8 bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl flex items-center justify-center transition-colors border border-gray-200 min-h-[44px] min-w-[44px] touch-target"
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <span className="font-semibold text-text-dark min-w-8 text-center">
                                {quantities[product._id] || 1}
                              </span>
                              <button
                                onClick={() => handleQuantityChange(product._id, (quantities[product._id] || 1) + 1)}
                                className="w-8 h-8 bg-white hover:bg-gray-100 rounded-xl flex items-center justify-center transition-colors border border-gray-200 min-h-[44px] min-w-[44px] touch-target"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>

                            {/* Remove Button */}
                            <button
                              onClick={() => handleRemoveProduct(product._id)}
                              className="text-gray-400 hover:text-tomato-red transition-colors p-2 min-h-[44px] min-w-[44px] touch-target"
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
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-amber-800 mb-1">
                        Multiple Vendors Notice
                      </h4>
                      <p className="text-sm text-amber-700">
                        Your order contains items from {totals.vendorCount} different vendors. 
                        Items may arrive separately and delivery fees may apply per vendor.
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
          <div className="border-t border-gray-200 p-6">
            <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
              <div className="text-left">
                <p className="text-lg font-semibold text-text-dark">
                  Total: {formatCurrency(totals.totalPrice)}
                </p>
                <p className="text-sm text-text-muted">
                  {totals.totalItems} items from {totals.vendorCount} vendor{totals.vendorCount > 1 ? 's' : ''}
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