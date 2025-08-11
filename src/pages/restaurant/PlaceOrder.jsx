import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  X, 
  MapPin, 
  Clock,
  CreditCard,
  Truck,
  CheckCircle,
  AlertCircle,
  Calendar,
  Edit
} from 'lucide-react';
import { selectCart, updateQuantity, removeFromCart, clearCart } from '../../store/slices/cartSlice';
import { selectAuth } from '../../store/slices/authSlice';
import { useCreateOrderMutation } from '../../store/slices/apiSlice';
import { formatCurrency, formatPhoneForDisplay } from '../../utils';

const PlaceOrder = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { items: cartItems, total } = useSelector(selectCart);
  const { user } = useSelector(selectAuth);

  // State management
  const [deliveryInfo, setDeliveryInfo] = useState({
    address: user?.restaurantAddress || '',
    phone: user?.phone || '',
    notes: '',
    preferredDeliveryTime: 'asap',
    customDeliveryTime: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [step, setStep] = useState(1); // 1: Cart Review, 2: Delivery, 3: Payment, 4: Confirmation

  // API mutation
  const [createOrder, { isLoading: isCreatingOrder }] = useCreateOrderMutation();

  // Calculations
  const subtotal = total;
  const deliveryFee = subtotal >= 1000 ? 0 : 50; // Free delivery for orders above 1000
  const tax = subtotal * 0.05; // 5% tax
  const finalTotal = subtotal + deliveryFee + tax;

  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      dispatch(removeFromCart(itemId));
    } else {
      dispatch(updateQuantity({ id: itemId, quantity: newQuantity }));
    }
  };

  const handleRemoveItem = (itemId) => {
    dispatch(removeFromCart(itemId));
  };

  const handleSubmitOrder = async () => {
    if (cartItems.length === 0) return;

    try {
      const orderData = {
        items: cartItems.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price,
          vendorId: item.vendorId
        })),
        deliveryAddress: deliveryInfo.address,
        phone: deliveryInfo.phone,
        notes: deliveryInfo.notes,
        preferredDeliveryTime: deliveryInfo.preferredDeliveryTime === 'custom' 
          ? deliveryInfo.customDeliveryTime 
          : deliveryInfo.preferredDeliveryTime,
        paymentMethod,
        subtotal,
        deliveryFee,
        tax,
        totalAmount: finalTotal
      };

      const response = await createOrder(orderData).unwrap();
      
      // Clear cart and redirect
      dispatch(clearCart());
      navigate(`/restaurant/orders/${response.orderId}`, { 
        state: { orderPlaced: true } 
      });

    } catch (error) {
      console.error('Failed to create order:', error);
      // Handle error (could show a toast notification)
    }
  };

  // If cart is empty, show empty state
  if (cartItems.length === 0) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className="glass rounded-3xl p-12">
          <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-text-dark mb-4">Your cart is empty</h2>
          <p className="text-text-muted mb-8">
            Add some fresh products to get started
          </p>
          <button
            onClick={() => navigate('/restaurant/browse')}
            className="bg-gradient-primary text-white px-8 py-3 rounded-2xl font-medium hover:shadow-lg transition-all duration-200 touch-target"
          >
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-dark">Place Order</h1>
        <p className="text-text-muted mt-2">Review and confirm your order</p>
      </div>

      {/* Step Progress */}
      <div className="glass rounded-2xl p-4 mb-8">
        <div className="flex items-center justify-between">
          {[
            { step: 1, title: 'Cart Review', icon: ShoppingCart },
            { step: 2, title: 'Delivery Details', icon: MapPin },
            { step: 3, title: 'Payment', icon: CreditCard },
            { step: 4, title: 'Confirmation', icon: CheckCircle }
          ].map(({ step: stepNum, title, icon: Icon }) => (
            <div key={stepNum} className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200 ${
                step >= stepNum 
                  ? 'bg-gradient-primary text-white' 
                  : 'bg-gray-200 text-gray-500'
              }`}>
                {step > stepNum ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <Icon className="w-5 h-5" />
                )}
              </div>
              <span className={`ml-3 font-medium hidden sm:inline ${
                step >= stepNum ? 'text-text-dark' : 'text-text-muted'
              }`}>
                {title}
              </span>
              {stepNum < 4 && (
                <div className={`hidden sm:block w-16 h-0.5 ml-4 ${
                  step > stepNum ? 'bg-bottle-green' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Step 1: Cart Review */}
          {step === 1 && (
            <div className="glass rounded-3xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-text-dark">Cart Review</h2>
                <span className="text-text-muted">{cartItems.length} items</span>
              </div>

              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="bg-white/50 border border-gray-100 rounded-2xl p-4">
                    <div className="flex items-center gap-4">
                      {/* Product Image */}
                      <div className="w-16 h-16 bg-gradient-to-br from-earthy-beige/20 to-mint-fresh/10 rounded-xl overflow-hidden flex-shrink-0">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ShoppingCart className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-text-dark truncate">{item.name}</h3>
                        <p className="text-sm text-text-muted">{item.vendorName}</p>
                        <p className="text-sm font-medium text-text-dark">
                          {formatCurrency(item.price)} per {item.unit}
                        </p>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center justify-center transition-colors touch-target"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="font-semibold text-text-dark min-w-8 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center justify-center transition-colors touch-target"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Total Price */}
                      <div className="text-right">
                        <p className="font-semibold text-text-dark">
                          {formatCurrency(item.price * item.quantity)}
                        </p>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-gray-400 hover:text-tomato-red transition-colors p-1 touch-target"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-100">
                <button
                  onClick={() => navigate('/restaurant/browse')}
                  className="text-bottle-green hover:text-bottle-green/80 font-medium transition-colors"
                >
                  Continue Shopping
                </button>
                <button
                  onClick={() => setStep(2)}
                  className="bg-gradient-primary text-white px-6 py-3 rounded-2xl font-medium hover:shadow-lg transition-all duration-200 touch-target"
                >
                  Continue to Delivery
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Delivery Details */}
          {step === 2 && (
            <div className="glass rounded-3xl p-6">
              <h2 className="text-xl font-semibold text-text-dark mb-6">Delivery Details</h2>

              <div className="space-y-6">
                {/* Delivery Address */}
                <div>
                  <label className="block text-sm font-medium text-text-dark mb-2">
                    Delivery Address
                  </label>
                  <textarea
                    value={deliveryInfo.address}
                    onChange={(e) => setDeliveryInfo(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="Enter your complete delivery address"
                    rows={3}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-bottle-green/20 focus:border-bottle-green transition-all duration-200"
                    required
                  />
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-sm font-medium text-text-dark mb-2">
                    Contact Phone
                  </label>
                  <input
                    type="tel"
                    value={deliveryInfo.phone}
                    onChange={(e) => setDeliveryInfo(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+880 1712-345-678"
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-bottle-green/20 focus:border-bottle-green transition-all duration-200"
                    required
                  />
                </div>

                {/* Delivery Time */}
                <div>
                  <label className="block text-sm font-medium text-text-dark mb-2">
                    Preferred Delivery Time
                  </label>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="deliveryTime"
                        value="asap"
                        checked={deliveryInfo.preferredDeliveryTime === 'asap'}
                        onChange={(e) => setDeliveryInfo(prev => ({ ...prev, preferredDeliveryTime: e.target.value }))}
                        className="text-bottle-green focus:ring-bottle-green/20"
                      />
                      <span className="text-text-dark">As soon as possible</span>
                    </label>
                    <label className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="deliveryTime"
                        value="custom"
                        checked={deliveryInfo.preferredDeliveryTime === 'custom'}
                        onChange={(e) => setDeliveryInfo(prev => ({ ...prev, preferredDeliveryTime: e.target.value }))}
                        className="text-bottle-green focus:ring-bottle-green/20"
                      />
                      <span className="text-text-dark">Schedule for later</span>
                    </label>
                    {deliveryInfo.preferredDeliveryTime === 'custom' && (
                      <input
                        type="datetime-local"
                        value={deliveryInfo.customDeliveryTime}
                        onChange={(e) => setDeliveryInfo(prev => ({ ...prev, customDeliveryTime: e.target.value }))}
                        min={new Date().toISOString().slice(0, 16)}
                        className="ml-6 px-4 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-bottle-green/20 focus:border-bottle-green"
                      />
                    )}
                  </div>
                </div>

                {/* Special Instructions */}
                <div>
                  <label className="block text-sm font-medium text-text-dark mb-2">
                    Special Instructions (Optional)
                  </label>
                  <textarea
                    value={deliveryInfo.notes}
                    onChange={(e) => setDeliveryInfo(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Any special delivery instructions..."
                    rows={2}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-bottle-green/20 focus:border-bottle-green transition-all duration-200"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-100">
                <button
                  onClick={() => setStep(1)}
                  className="text-gray-600 hover:text-gray-800 font-medium transition-colors"
                >
                  Back to Cart
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!deliveryInfo.address || !deliveryInfo.phone}
                  className="bg-gradient-primary text-white px-6 py-3 rounded-2xl font-medium hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed touch-target"
                >
                  Continue to Payment
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Payment Method */}
          {step === 3 && (
            <div className="glass rounded-3xl p-6">
              <h2 className="text-xl font-semibold text-text-dark mb-6">Payment Method</h2>

              <div className="space-y-4">
                <label className="flex items-center p-4 bg-white/50 border border-gray-200 rounded-2xl cursor-pointer hover:border-bottle-green/30 transition-all duration-200">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cash"
                    checked={paymentMethod === 'cash'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="text-bottle-green focus:ring-bottle-green/20 mr-4"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                        <CreditCard className="w-4 h-4 text-green-600" />
                      </div>
                      <span className="font-medium text-text-dark">Cash on Delivery</span>
                    </div>
                    <p className="text-sm text-text-muted mt-1">Pay when your order arrives</p>
                  </div>
                </label>

                <label className="flex items-center p-4 bg-white/50 border border-gray-200 rounded-2xl cursor-pointer hover:border-bottle-green/30 transition-all duration-200 opacity-50">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="card"
                    disabled
                    className="text-bottle-green focus:ring-bottle-green/20 mr-4"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <CreditCard className="w-4 h-4 text-blue-600" />
                      </div>
                      <span className="font-medium text-text-dark">Credit/Debit Card</span>
                      <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-lg">
                        Coming Soon
                      </span>
                    </div>
                    <p className="text-sm text-text-muted mt-1">Secure online payment</p>
                  </div>
                </label>

                <label className="flex items-center p-4 bg-white/50 border border-gray-200 rounded-2xl cursor-pointer hover:border-bottle-green/30 transition-all duration-200 opacity-50">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="mobile"
                    disabled
                    className="text-bottle-green focus:ring-bottle-green/20 mr-4"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                        <CreditCard className="w-4 h-4 text-purple-600" />
                      </div>
                      <span className="font-medium text-text-dark">Mobile Banking</span>
                      <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-lg">
                        Coming Soon
                      </span>
                    </div>
                    <p className="text-sm text-text-muted mt-1">bKash, Rocket, Nagad</p>
                  </div>
                </label>
              </div>

              <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-100">
                <button
                  onClick={() => setStep(2)}
                  className="text-gray-600 hover:text-gray-800 font-medium transition-colors"
                >
                  Back to Delivery
                </button>
                <button
                  onClick={() => setStep(4)}
                  className="bg-gradient-primary text-white px-6 py-3 rounded-2xl font-medium hover:shadow-lg transition-all duration-200 touch-target"
                >
                  Review Order
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Final Review */}
          {step === 4 && (
            <div className="glass rounded-3xl p-6">
              <h2 className="text-xl font-semibold text-text-dark mb-6">Order Confirmation</h2>

              <div className="space-y-6">
                {/* Delivery Details Summary */}
                <div className="bg-white/50 border border-gray-100 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-text-dark">Delivery Details</h3>
                    <button
                      onClick={() => setStep(2)}
                      className="text-bottle-green hover:text-bottle-green/80 text-sm font-medium"
                    >
                      <Edit className="w-4 h-4 inline mr-1" />
                      Edit
                    </button>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <span className="text-text-muted">{deliveryInfo.address}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-text-muted">
                        {deliveryInfo.preferredDeliveryTime === 'asap' 
                          ? 'As soon as possible' 
                          : `Scheduled for ${new Date(deliveryInfo.customDeliveryTime).toLocaleDateString()} at ${new Date(deliveryInfo.customDeliveryTime).toLocaleTimeString()}`
                        }
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-4 h-4 text-center text-gray-400">📞</span>
                      <span className="text-text-muted">{formatPhoneForDisplay(deliveryInfo.phone)}</span>
                    </div>
                    {deliveryInfo.notes && (
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-gray-400 mt-0.5" />
                        <span className="text-text-muted">{deliveryInfo.notes}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Payment Method Summary */}
                <div className="bg-white/50 border border-gray-100 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-text-dark">Payment Method</h3>
                    <button
                      onClick={() => setStep(3)}
                      className="text-bottle-green hover:text-bottle-green/80 text-sm font-medium"
                    >
                      <Edit className="w-4 h-4 inline mr-1" />
                      Change
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-5 h-5 text-gray-400" />
                    <span className="text-text-muted">Cash on Delivery</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-100">
                <button
                  onClick={() => setStep(3)}
                  className="text-gray-600 hover:text-gray-800 font-medium transition-colors"
                >
                  Back to Payment
                </button>
                <button
                  onClick={handleSubmitOrder}
                  disabled={isCreatingOrder}
                  className="bg-gradient-primary text-white px-8 py-3 rounded-2xl font-medium hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed touch-target flex items-center gap-2"
                >
                  {isCreatingOrder ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Placing Order...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Place Order
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-1">
          <div className="glass rounded-3xl p-6 sticky top-6">
            <h3 className="text-lg font-semibold text-text-dark mb-4">Order Summary</h3>
            
            <div className="space-y-3 pb-4 border-b border-gray-100">
              <div className="flex justify-between">
                <span className="text-text-muted">Subtotal ({cartItems.length} items)</span>
                <span className="font-medium text-text-dark">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Delivery Fee</span>
                <span className="font-medium text-text-dark">
                  {deliveryFee === 0 ? (
                    <span className="text-mint-fresh">Free</span>
                  ) : (
                    formatCurrency(deliveryFee)
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Tax</span>
                <span className="font-medium text-text-dark">{formatCurrency(tax)}</span>
              </div>
            </div>
            
            <div className="flex justify-between pt-4 mb-6">
              <span className="text-lg font-semibold text-text-dark">Total</span>
              <span className="text-lg font-bold text-text-dark">{formatCurrency(finalTotal)}</span>
            </div>

            {deliveryFee > 0 && (
              <div className="bg-amber-50/80 border border-amber-200/50 text-amber-800 p-3 rounded-2xl text-sm mb-4">
                <Truck className="w-4 h-4 inline mr-2" />
                Add {formatCurrency(1000 - subtotal)} more for free delivery
              </div>
            )}

            <div className="text-xs text-text-muted space-y-1">
              <p>• Estimated delivery: 30-60 minutes</p>
              <p>• Fresh vegetables from local vendors</p>
              <p>• Quality guaranteed or money back</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaceOrder;