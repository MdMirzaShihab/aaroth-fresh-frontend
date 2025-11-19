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
  Edit,
} from 'lucide-react';
import {
  selectCart,
  updateQuantity,
  removeFromCart,
  clearCart,
} from '../../store/slices/cartSlice';
import { selectAuth } from '../../store/slices/authSlice';
import {
  useCreateOrderMutation,
  useGetBuyerBudgetQuery
} from '../../store/slices/apiSlice';
import { formatCurrency, formatPhoneForDisplay } from '../../utils';

const PlaceOrder = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { items: cartItems, total } = useSelector(selectCart);
  const { user } = useSelector(selectAuth);

  // State management
  const [deliveryInfo, setDeliveryInfo] = useState({
    address: user?.buyerAddress || '',
    phone: user?.phone || '',
    notes: '',
    preferredDeliveryTime: 'asap',
    customDeliveryTime: '',
  });
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [step, setStep] = useState(1); // 1: Cart Review, 2: Delivery, 3: Payment, 4: Confirmation

  // API mutation
  const [createOrder, { isLoading: isCreatingOrder }] =
    useCreateOrderMutation();

  // Fetch budget data for validation
  const { data: budgetData, isLoading: budgetLoading } = useGetBuyerBudgetQuery(
    { period: 'month' },
    { skip: !user }
  );

  // Calculations
  const subtotal = total;
  const deliveryFee = subtotal >= 1000 ? 0 : 50; // Free delivery for orders above 1000
  const tax = subtotal * 0.05; // 5% tax
  const finalTotal = subtotal + deliveryFee + tax;

  // Budget validation
  const budget = budgetData?.data || {};
  const currentSpending = budget.used || 0;
  const budgetLimit = budget.total || 0;
  const afterOrderSpending = currentSpending + finalTotal;
  const budgetPercentageAfterOrder = budgetLimit > 0
    ? (afterOrderSpending / budgetLimit) * 100
    : 0;
  const exceedsBudget = afterOrderSpending > budgetLimit && budgetLimit > 0;
  const nearBudgetLimit = budgetPercentageAfterOrder >= 90 && budgetPercentageAfterOrder < 100;

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
        items: cartItems.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price,
          vendorId: item.vendorId,
        })),
        deliveryAddress: deliveryInfo.address,
        phone: deliveryInfo.phone,
        notes: deliveryInfo.notes,
        preferredDeliveryTime:
          deliveryInfo.preferredDeliveryTime === 'custom'
            ? deliveryInfo.customDeliveryTime
            : deliveryInfo.preferredDeliveryTime,
        paymentMethod,
        subtotal,
        deliveryFee,
        tax,
        totalAmount: finalTotal,
      };

      const response = await createOrder(orderData).unwrap();

      // Clear cart and redirect
      dispatch(clearCart());
      navigate(`/buyer/orders/${response.orderId}`, {
        state: { orderPlaced: true },
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
        <div className="glass-layer-2 dark:glass-2-dark rounded-3xl p-12 shadow-organic dark:shadow-dark-glass animate-fade-in">
          <ShoppingCart className="w-16 h-16 text-text-muted/60 dark:text-dark-text-muted/60 mx-auto mb-6 animate-float" />
          <h2 className="text-2xl font-light text-text-dark dark:text-dark-text-primary mb-4 tracking-wide">
            Your cart is empty
          </h2>
          <p className="text-text-muted dark:text-dark-text-muted mb-8 font-light">
            Add some fresh products to get started
          </p>
          <button
            onClick={() => navigate('/buyer/browse')}
            className="bg-gradient-to-r from-muted-olive to-sage-green text-white px-8 py-3 rounded-2xl font-medium hover:shadow-glow-green hover:scale-105 transition-all duration-300 touch-target animate-float"
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
        <h1 className="text-3xl font-light text-text-dark dark:text-dark-text-primary tracking-wide">
          Place Order
        </h1>
        <p className="text-text-muted dark:text-dark-text-muted mt-2 font-light">
          Review and confirm your order
        </p>
      </div>

      {/* Step Progress */}
      <div className="glass-layer-1 dark:glass-1-dark rounded-2xl p-4 mb-8 shadow-organic dark:shadow-dark-glass animate-fade-in">
        <div className="flex items-center justify-between">
          {[
            { step: 1, title: 'Cart Review', icon: ShoppingCart },
            { step: 2, title: 'Delivery Details', icon: MapPin },
            { step: 3, title: 'Payment', icon: CreditCard },
            { step: 4, title: 'Confirmation', icon: CheckCircle },
          ].map(({ step: stepNum, title, icon: Icon }) => (
            <div key={stepNum} className="flex items-center">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 shadow-soft ${
                  step >= stepNum
                    ? 'bg-gradient-to-r from-muted-olive to-sage-green text-white shadow-glow-green'
                    : 'bg-gray-100 text-text-muted'
                }`}
              >
                {step > stepNum ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <Icon className="w-5 h-5" />
                )}
              </div>
              <span
                className={`ml-3 font-medium hidden sm:inline transition-colors duration-200 ${
                  step >= stepNum
                    ? 'text-text-dark dark:text-dark-text-primary'
                    : 'text-text-muted dark:text-dark-text-muted'
                }`}
              >
                {title}
              </span>
              {stepNum < 4 && (
                <div
                  className={`hidden sm:block w-16 h-0.5 ml-4 transition-colors duration-300 ${
                    step > stepNum ? 'bg-gradient-to-r from-muted-olive to-sage-green' : 'bg-gray-200'
                  }`}
                />
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
            <div className="glass-layer-2 dark:glass-2-dark rounded-3xl p-6 shadow-organic dark:shadow-dark-glass animate-slide-up">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-medium text-text-dark dark:text-dark-text-primary">
                  Cart Review
                </h2>
                <span className="text-text-muted dark:text-dark-text-muted">
                  {cartItems.length} items
                </span>
              </div>

              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="glass-layer-1 dark:glass-1-dark border-0 rounded-2xl p-4 shadow-soft dark:shadow-dark-glass hover:glass-layer-2 dark:hover:glass-2-dark transition-all duration-200 animate-fade-in"
                  >
                    <div className="flex items-center gap-4">
                      {/* Product Image */}
                      <div className="w-16 h-16 bg-gradient-to-br from-earthy-beige/20 to-sage-green/10 rounded-xl overflow-hidden flex-shrink-0">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ShoppingCart className="w-6 h-6 text-gray-400 dark:text-gray-500" />
                          </div>
                        )}
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-text-dark dark:text-dark-text-primary truncate">
                          {item.name}
                        </h3>
                        <p className="text-sm text-text-muted dark:text-dark-text-muted">
                          {item.vendorName}
                        </p>
                        <p className="text-sm font-medium text-text-dark dark:text-dark-text-primary">
                          {formatCurrency(item.price)} per {item.unit}
                        </p>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() =>
                            handleQuantityChange(item.id, item.quantity - 1)
                          }
                          className="w-8 h-8 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl flex items-center justify-center transition-colors touch-target"
                        >
                          <Minus className="w-4 h-4 text-gray-700 dark:text-gray-200" />
                        </button>
                        <span className="font-semibold text-text-dark dark:text-dark-text-primary min-w-8 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            handleQuantityChange(item.id, item.quantity + 1)
                          }
                          className="w-8 h-8 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl flex items-center justify-center transition-colors touch-target"
                        >
                          <Plus className="w-4 h-4 text-gray-700 dark:text-gray-200" />
                        </button>
                      </div>

                      {/* Total Price */}
                      <div className="text-right">
                        <p className="font-semibold text-text-dark dark:text-dark-text-primary">
                          {formatCurrency(item.price * item.quantity)}
                        </p>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-gray-400 dark:text-gray-500 hover:text-tomato-red dark:hover:text-tomato-red transition-colors p-1 touch-target"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center mt-6 pt-4 border-t border-muted-olive/10 dark:border-dark-sage-accent/20">
                <button
                  onClick={() => navigate('/buyer/browse')}
                  className="text-muted-olive dark:text-dark-sage-accent hover:text-sage-green dark:hover:text-dark-sage-accent/80 font-medium transition-colors duration-200"
                >
                  Continue Shopping
                </button>
                <button
                  onClick={() => setStep(2)}
                  className="bg-gradient-to-r from-muted-olive to-sage-green text-white px-6 py-3 rounded-2xl font-medium hover:shadow-glow-green hover:scale-105 transition-all duration-300 touch-target"
                >
                  Continue to Delivery
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Delivery Details */}
          {step === 2 && (
            <div className="glass-layer-2 dark:glass-2-dark rounded-3xl p-6 shadow-organic dark:shadow-dark-glass animate-slide-up">
              <h2 className="text-xl font-medium text-text-dark dark:text-dark-text-primary mb-6">
                Delivery Details
              </h2>

              <div className="space-y-6">
                {/* Delivery Address */}
                <div>
                  <label className="block text-sm font-medium text-text-dark mb-2">
                    Delivery Address
                  </label>
                  <textarea
                    value={deliveryInfo.address}
                    onChange={(e) =>
                      setDeliveryInfo((prev) => ({
                        ...prev,
                        address: e.target.value,
                      }))
                    }
                    placeholder="Enter your complete delivery address"
                    rows={3}
                    className="w-full px-4 py-3 glass-layer-1 dark:glass-1-dark border-0 rounded-2xl focus:outline-none focus:glass-layer-2 dark:focus:glass-2-dark focus:shadow-glow-green/20 dark:focus:shadow-dark-sage-accent/20 transition-all duration-300 placeholder:text-text-muted/60 dark:placeholder:text-dark-text-muted/60 text-text-dark dark:text-dark-text-primary"
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
                    onChange={(e) =>
                      setDeliveryInfo((prev) => ({
                        ...prev,
                        phone: e.target.value,
                      }))
                    }
                    placeholder="+880 1712-345-678"
                    className="w-full px-4 py-3 glass-layer-1 dark:glass-1-dark border-0 rounded-2xl focus:outline-none focus:glass-layer-2 dark:focus:glass-2-dark focus:shadow-glow-green/20 dark:focus:shadow-dark-sage-accent/20 transition-all duration-300 placeholder:text-text-muted/60 dark:placeholder:text-dark-text-muted/60 text-text-dark dark:text-dark-text-primary"
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
                        onChange={(e) =>
                          setDeliveryInfo((prev) => ({
                            ...prev,
                            preferredDeliveryTime: e.target.value,
                          }))
                        }
                        className="text-muted-olive focus:ring-muted-olive/20"
                      />
                      <span className="text-text-dark dark:text-dark-text-primary">
                        As soon as possible
                      </span>
                    </label>
                    <label className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="deliveryTime"
                        value="custom"
                        checked={
                          deliveryInfo.preferredDeliveryTime === 'custom'
                        }
                        onChange={(e) =>
                          setDeliveryInfo((prev) => ({
                            ...prev,
                            preferredDeliveryTime: e.target.value,
                          }))
                        }
                        className="text-muted-olive focus:ring-muted-olive/20"
                      />
                      <span className="text-text-dark dark:text-dark-text-primary">
                        Schedule for later
                      </span>
                    </label>
                    {deliveryInfo.preferredDeliveryTime === 'custom' && (
                      <input
                        type="datetime-local"
                        value={deliveryInfo.customDeliveryTime}
                        onChange={(e) =>
                          setDeliveryInfo((prev) => ({
                            ...prev,
                            customDeliveryTime: e.target.value,
                          }))
                        }
                        min={new Date().toISOString().slice(0, 16)}
                        className="ml-6 px-4 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-muted-olive/20 focus:border-muted-olive"
                      />
                    )}
                  </div>
                </div>

                {/* Special Instructions */}
                <div>
                  <label className="block text-sm font-medium text-text-dark dark:text-dark-text-primary mb-2">
                    Special Instructions (Optional)
                  </label>
                  <textarea
                    value={deliveryInfo.notes}
                    onChange={(e) =>
                      setDeliveryInfo((prev) => ({
                        ...prev,
                        notes: e.target.value,
                      }))
                    }
                    placeholder="Any special delivery instructions..."
                    rows={2}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-muted-olive/20 focus:border-muted-olive transition-all duration-200"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
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
            <div className="glass-layer-2 dark:glass-2-dark rounded-3xl p-6 shadow-organic dark:shadow-dark-glass">
              <h2 className="text-xl font-semibold text-text-dark dark:text-dark-text-primary mb-6">
                Payment Method
              </h2>

              <div className="space-y-4">
                <label className="flex items-center p-4 bg-white/50 border border-gray-200 rounded-2xl cursor-pointer hover:border-muted-olive/30 transition-all duration-200">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cash"
                    checked={paymentMethod === 'cash'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="text-muted-olive focus:ring-muted-olive/20 mr-4"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                        <CreditCard className="w-4 h-4 text-green-600" />
                      </div>
                      <span className="font-medium text-text-dark dark:text-dark-text-primary">
                        Cash on Delivery
                      </span>
                    </div>
                    <p className="text-sm text-text-muted dark:text-dark-text-muted mt-1">
                      Pay when your order arrives
                    </p>
                  </div>
                </label>

                <label className="flex items-center p-4 bg-white/50 border border-gray-200 rounded-2xl cursor-pointer hover:border-muted-olive/30 transition-all duration-200 opacity-50">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="card"
                    disabled
                    className="text-muted-olive focus:ring-muted-olive/20 mr-4"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <CreditCard className="w-4 h-4 text-blue-600" />
                      </div>
                      <span className="font-medium text-text-dark dark:text-dark-text-primary">
                        Credit/Debit Card
                      </span>
                      <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-lg">
                        Coming Soon
                      </span>
                    </div>
                    <p className="text-sm text-text-muted dark:text-dark-text-muted mt-1">
                      Secure online payment
                    </p>
                  </div>
                </label>

                <label className="flex items-center p-4 bg-white/50 border border-gray-200 rounded-2xl cursor-pointer hover:border-muted-olive/30 transition-all duration-200 opacity-50">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="mobile"
                    disabled
                    className="text-muted-olive focus:ring-muted-olive/20 mr-4"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                        <CreditCard className="w-4 h-4 text-purple-600" />
                      </div>
                      <span className="font-medium text-text-dark dark:text-dark-text-primary">
                        Mobile Banking
                      </span>
                      <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-lg">
                        Coming Soon
                      </span>
                    </div>
                    <p className="text-sm text-text-muted dark:text-dark-text-muted mt-1">
                      bKash, Rocket, Nagad
                    </p>
                  </div>
                </label>
              </div>

              <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
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
            <div className="glass-layer-2 dark:glass-2-dark rounded-3xl p-6 shadow-organic dark:shadow-dark-glass">
              <h2 className="text-xl font-semibold text-text-dark dark:text-dark-text-primary mb-6">
                Order Confirmation
              </h2>

              <div className="space-y-6">
                {/* Delivery Details Summary */}
                <div className="bg-white/50 border border-gray-100 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-text-dark dark:text-dark-text-primary">
                      Delivery Details
                    </h3>
                    <button
                      onClick={() => setStep(2)}
                      className="text-muted-olive dark:text-dark-sage-accent hover:text-muted-olive/80 dark:hover:text-dark-sage-accent/80 text-sm font-medium"
                    >
                      <Edit className="w-4 h-4 inline mr-1" />
                      Edit
                    </button>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <span className="text-text-muted dark:text-dark-text-muted">
                        {deliveryInfo.address}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-text-muted dark:text-dark-text-muted">
                        {deliveryInfo.preferredDeliveryTime === 'asap'
                          ? 'As soon as possible'
                          : `Scheduled for ${new Date(deliveryInfo.customDeliveryTime).toLocaleDateString()} at ${new Date(deliveryInfo.customDeliveryTime).toLocaleTimeString()}`}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-4 h-4 text-center text-gray-400">
                        📞
                      </span>
                      <span className="text-text-muted dark:text-dark-text-muted">
                        {formatPhoneForDisplay(deliveryInfo.phone)}
                      </span>
                    </div>
                    {deliveryInfo.notes && (
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-gray-400 mt-0.5" />
                        <span className="text-text-muted dark:text-dark-text-muted">
                          {deliveryInfo.notes}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Payment Method Summary */}
                <div className="bg-white/50 border border-gray-100 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-text-dark dark:text-dark-text-primary">
                      Payment Method
                    </h3>
                    <button
                      onClick={() => setStep(3)}
                      className="text-muted-olive dark:text-dark-sage-accent hover:text-muted-olive/80 dark:hover:text-dark-sage-accent/80 text-sm font-medium"
                    >
                      <Edit className="w-4 h-4 inline mr-1" />
                      Change
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-5 h-5 text-gray-400" />
                    <span className="text-text-muted dark:text-dark-text-muted">
                      Cash on Delivery
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
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
            <h3 className="text-lg font-semibold text-text-dark dark:text-dark-text-primary mb-4">
              Order Summary
            </h3>

            <div className="space-y-3 pb-4 border-b border-gray-100">
              <div className="flex justify-between">
                <span className="text-text-muted dark:text-dark-text-muted">
                  Subtotal ({cartItems.length} items)
                </span>
                <span className="font-medium text-text-dark dark:text-dark-text-primary">
                  {formatCurrency(subtotal)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted dark:text-dark-text-muted">
                  Delivery Fee
                </span>
                <span className="font-medium text-text-dark dark:text-dark-text-primary">
                  {deliveryFee === 0 ? (
                    <span className="text-sage-green dark:text-dark-sage-accent">
                      Free
                    </span>
                  ) : (
                    formatCurrency(deliveryFee)
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted dark:text-dark-text-muted">Tax</span>
                <span className="font-medium text-text-dark dark:text-dark-text-primary">
                  {formatCurrency(tax)}
                </span>
              </div>
            </div>

            <div className="flex justify-between pt-4 mb-6">
              <span className="text-lg font-semibold text-text-dark dark:text-dark-text-primary">
                Total
              </span>
              <span className="text-lg font-bold text-text-dark dark:text-dark-text-primary">
                {formatCurrency(finalTotal)}
              </span>
            </div>

            {/* Budget Warnings */}
            {!budgetLoading && budgetLimit > 0 && (
              <>
                {exceedsBudget && (
                  <div className="bg-red-50/80 border border-red-200/50 text-red-800 p-3 rounded-2xl text-sm mb-4 animate-fade-in">
                    <AlertCircle className="w-4 h-4 inline mr-2" />
                    <div className="inline-block">
                      <p className="font-medium">Budget Limit Exceeded!</p>
                      <p className="text-xs mt-1">
                        This order will exceed your budget by {formatCurrency(afterOrderSpending - budgetLimit)}
                      </p>
                      <p className="text-xs text-red-600 mt-1">
                        Current: {formatCurrency(currentSpending)} | After: {formatCurrency(afterOrderSpending)} | Limit: {formatCurrency(budgetLimit)}
                      </p>
                    </div>
                  </div>
                )}
                {nearBudgetLimit && !exceedsBudget && (
                  <div className="bg-amber-50/80 border border-amber-200/50 text-amber-800 p-3 rounded-2xl text-sm mb-4 animate-fade-in">
                    <AlertCircle className="w-4 h-4 inline mr-2" />
                    <div className="inline-block">
                      <p className="font-medium">Approaching Budget Limit</p>
                      <p className="text-xs mt-1">
                        This order will use {budgetPercentageAfterOrder.toFixed(1)}% of your monthly budget
                      </p>
                    </div>
                  </div>
                )}
                {!exceedsBudget && !nearBudgetLimit && (
                  <div className="bg-sage-green/10 border border-sage-green/20 text-sage-green p-3 rounded-2xl text-sm mb-4">
                    <CheckCircle className="w-4 h-4 inline mr-2" />
                    <span className="text-xs">
                      Within budget • {budgetPercentageAfterOrder.toFixed(1)}% of limit
                    </span>
                  </div>
                )}
              </>
            )}

            {deliveryFee > 0 && (
              <div className="bg-amber-50/80 border border-amber-200/50 text-amber-800 p-3 rounded-2xl text-sm mb-4">
                <Truck className="w-4 h-4 inline mr-2" />
                Add {formatCurrency(1000 - subtotal)} more for free delivery
              </div>
            )}

            <div className="text-xs text-text-muted dark:text-dark-text-muted space-y-1">
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
