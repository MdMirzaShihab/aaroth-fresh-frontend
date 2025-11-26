import { addToCart, addBulkToCart, selectCartLastError } from '../slices/cartSlice';
import { addNotification } from '../slices/notificationSlice';

/**
 * Cart Validation Middleware
 *
 * Intercepts cart actions and shows toast notifications for market mismatches.
 * This middleware enforces the strict market constraint policy:
 * - All items in a cart must be from the same market
 * - Users cannot add items from different markets
 * - Clear error messaging guides users to checkout or clear cart
 */
export const cartValidationMiddleware = (store) => (next) => (action) => {
  // Let the action proceed to the reducer first
  const result = next(action);

  // Check if this was an addToCart or addBulkToCart action
  if (action.type === addToCart.type || action.type === addBulkToCart.type) {
    // Get the current state after the action was processed
    const state = store.getState();
    const lastError = selectCartLastError(state);

    // If there's a market mismatch error, show notification
    if (lastError && lastError.type === 'MARKET_MISMATCH') {
      store.dispatch(
        addNotification({
          type: 'error',
          title: 'Different Market',
          message: lastError.message,
          duration: 6000, // 6 seconds for important errors
        })
      );
    }
  }

  return result;
};

export default cartValidationMiddleware;
