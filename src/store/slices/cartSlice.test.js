import { describe, it, expect, beforeEach } from 'vitest';
import cartReducer, {
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  toggleCart,
  openCart,
  closeCart,
  calculateTotals,
  selectCart,
  selectCartItems,
  selectCartTotal,
  selectCartItemCount,
  selectCartIsOpen,
} from './cartSlice';

describe('cartSlice', () => {
  const initialState = {
    items: [],
    total: 0,
    itemCount: 0,
    isOpen: false,
  };

  const mockProduct = {
    id: '1',
    name: 'Fresh Tomatoes',
    price: 25.5,
    unit: 'kg',
    vendor: { id: 'vendor1', name: 'Vendor Name' },
  };

  describe('reducers', () => {
    it('should return the initial state', () => {
      expect(cartReducer(undefined, { type: undefined })).toEqual(initialState);
    });

    it('should add item to cart', () => {
      const action = addToCart(mockProduct);
      const state = cartReducer(initialState, action);

      expect(state.items).toHaveLength(1);
      expect(state.items[0]).toEqual({
        ...mockProduct,
        quantity: 1,
      });
      expect(state.total).toBe(25.5);
      expect(state.itemCount).toBe(1);
    });

    it('should increase quantity if item already exists', () => {
      const stateWithItem = {
        ...initialState,
        items: [{ ...mockProduct, quantity: 1 }],
        total: 25.5,
        itemCount: 1,
      };

      const action = addToCart(mockProduct);
      const state = cartReducer(stateWithItem, action);

      expect(state.items).toHaveLength(1);
      expect(state.items[0].quantity).toBe(2);
      expect(state.total).toBe(51);
      expect(state.itemCount).toBe(2);
    });

    it('should add item with custom quantity', () => {
      const action = addToCart({ ...mockProduct, quantity: 3 });
      const state = cartReducer(initialState, action);

      expect(state.items[0].quantity).toBe(3);
      expect(state.total).toBe(76.5);
      expect(state.itemCount).toBe(3);
    });

    it('should remove item from cart', () => {
      const stateWithItems = {
        ...initialState,
        items: [
          { ...mockProduct, quantity: 2 },
          { id: '2', name: 'Carrots', price: 15, quantity: 1 },
        ],
        total: 66,
        itemCount: 3,
      };

      const action = removeFromCart('1');
      const state = cartReducer(stateWithItems, action);

      expect(state.items).toHaveLength(1);
      expect(state.items[0].id).toBe('2');
      expect(state.total).toBe(15);
      expect(state.itemCount).toBe(1);
    });

    it('should update item quantity', () => {
      const stateWithItem = {
        ...initialState,
        items: [{ ...mockProduct, quantity: 1 }],
        total: 25.5,
        itemCount: 1,
      };

      const action = updateQuantity({ id: '1', quantity: 5 });
      const state = cartReducer(stateWithItem, action);

      expect(state.items[0].quantity).toBe(5);
      expect(state.total).toBe(127.5);
      expect(state.itemCount).toBe(5);
    });

    it('should remove item when quantity is 0 or negative', () => {
      const stateWithItem = {
        ...initialState,
        items: [{ ...mockProduct, quantity: 1 }],
        total: 25.5,
        itemCount: 1,
      };

      const action = updateQuantity({ id: '1', quantity: 0 });
      const state = cartReducer(stateWithItem, action);

      expect(state.items).toHaveLength(0);
      expect(state.total).toBe(0);
      expect(state.itemCount).toBe(0);
    });

    it('should clear all items from cart', () => {
      const stateWithItems = {
        ...initialState,
        items: [{ ...mockProduct, quantity: 2 }],
        total: 51,
        itemCount: 2,
      };

      const action = clearCart();
      const state = cartReducer(stateWithItems, action);

      expect(state.items).toHaveLength(0);
      expect(state.total).toBe(0);
      expect(state.itemCount).toBe(0);
    });

    it('should toggle cart visibility', () => {
      const action = toggleCart();
      const state = cartReducer(initialState, action);

      expect(state.isOpen).toBe(true);

      const state2 = cartReducer(state, action);
      expect(state2.isOpen).toBe(false);
    });

    it('should open cart', () => {
      const action = openCart();
      const state = cartReducer(initialState, action);

      expect(state.isOpen).toBe(true);
    });

    it('should close cart', () => {
      const stateOpen = { ...initialState, isOpen: true };
      const action = closeCart();
      const state = cartReducer(stateOpen, action);

      expect(state.isOpen).toBe(false);
    });

    it('should calculate totals correctly', () => {
      const stateWithItems = {
        ...initialState,
        items: [
          { id: '1', price: 25.5, quantity: 2 },
          { id: '2', price: 15.75, quantity: 3 },
        ],
      };

      const action = calculateTotals();
      const state = cartReducer(stateWithItems, action);

      expect(state.total).toBe(98.25); // (25.5 * 2) + (15.75 * 3)
      expect(state.itemCount).toBe(5);
    });

    it('should round total to 2 decimal places', () => {
      const stateWithItems = {
        ...initialState,
        items: [
          { id: '1', price: 10.333, quantity: 1 },
          { id: '2', price: 5.666, quantity: 1 },
        ],
      };

      const action = calculateTotals();
      const state = cartReducer(stateWithItems, action);

      expect(state.total).toBe(16); // Should be rounded
    });
  });

  describe('selectors', () => {
    const mockState = {
      cart: {
        items: [{ ...mockProduct, quantity: 2 }],
        total: 51,
        itemCount: 2,
        isOpen: true,
      },
    };

    it('should select cart state', () => {
      expect(selectCart(mockState)).toEqual(mockState.cart);
    });

    it('should select cart items', () => {
      expect(selectCartItems(mockState)).toEqual(mockState.cart.items);
    });

    it('should select cart total', () => {
      expect(selectCartTotal(mockState)).toBe(51);
    });

    it('should select cart item count', () => {
      expect(selectCartItemCount(mockState)).toBe(2);
    });

    it('should select cart visibility', () => {
      expect(selectCartIsOpen(mockState)).toBe(true);
    });
  });
});
