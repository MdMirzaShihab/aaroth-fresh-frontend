import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [],
  total: 0,
  itemCount: 0,
  isOpen: false,
  marketId: null, // Track which market items are from
  marketName: null, // For display in error messages
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const item = action.payload;

      // STRICT MARKET VALIDATION - Prevent cross-market items
      if (item.marketId) {
        // Check if cart already has items from a different market
        if (state.marketId && state.marketId !== item.marketId) {
          // Store error information for middleware to handle
          state.lastError = {
            type: 'MARKET_MISMATCH',
            message: `Cannot add items from different markets. Your cart contains items from ${state.marketName}. Please checkout or clear your cart first.`,
            currentMarket: state.marketName,
            attemptedMarket: item.marketName,
          };
          return; // Block the addition
        }

        // Set market if this is the first item
        if (!state.marketId) {
          state.marketId = item.marketId;
          state.marketName = item.marketName || 'Selected Market';
        }
      }

      // Clear any previous errors
      delete state.lastError;

      const existingItem = state.items.find((i) => i.id === item.id);

      if (existingItem) {
        existingItem.quantity += item.quantity || 1;

        // Update pack information for pack-based items
        if (item.isPackBased && existingItem.isPackBased) {
          existingItem.numberOfPacks = (existingItem.numberOfPacks || 0) + (item.numberOfPacks || 1);
        }
      } else {
        state.items.push({
          ...item,
          quantity: item.quantity || 1,
          // Preserve pack-based information
          numberOfPacks: item.numberOfPacks || (item.isPackBased ? 1 : undefined),
        });
      }

      cartSlice.caseReducers.calculateTotals(state);
    },
    addBulkToCart: (state, action) => {
      const bulkItems = action.payload;

      if (!Array.isArray(bulkItems)) {
        console.error('addBulkToCart expects an array of items');
        return;
      }

      // MARKET VALIDATION for bulk add
      // Check if all items are from the same market
      const firstItemMarket = bulkItems[0]?.marketId;
      const allSameMarket = bulkItems.every((item) => item.marketId === firstItemMarket);

      if (!allSameMarket) {
        state.lastError = {
          type: 'MARKET_MISMATCH',
          message: 'Cannot add items from different markets in bulk operation.',
        };
        return;
      }

      // Check against existing cart market
      if (firstItemMarket && state.marketId && state.marketId !== firstItemMarket) {
        state.lastError = {
          type: 'MARKET_MISMATCH',
          message: `Cannot add items from different markets. Your cart contains items from ${state.marketName}.`,
          currentMarket: state.marketName,
        };
        return;
      }

      // Set market if this is the first addition
      if (firstItemMarket && !state.marketId) {
        state.marketId = firstItemMarket;
        state.marketName = bulkItems[0]?.marketName || 'Selected Market';
      }

      // Clear any previous errors
      delete state.lastError;

      bulkItems.forEach((item) => {
        const existingItem = state.items.find((i) => i.id === item.id);

        if (existingItem) {
          existingItem.quantity += item.quantity || 1;

          // Update pack information for pack-based items
          if (item.isPackBased && existingItem.isPackBased) {
            existingItem.numberOfPacks = (existingItem.numberOfPacks || 0) + (item.numberOfPacks || 1);
          }
        } else {
          state.items.push({
            ...item,
            quantity: item.quantity || 1,
            // Preserve pack-based information
            numberOfPacks: item.numberOfPacks || (item.isPackBased ? 1 : undefined),
          });
        }
      });

      cartSlice.caseReducers.calculateTotals(state);
    },
    bulkUpdateQuantities: (state, action) => {
      const updates = action.payload; // Array of {id, quantity} objects

      if (!Array.isArray(updates)) {
        console.error(
          'bulkUpdateQuantities expects an array of {id, quantity} objects'
        );
        return;
      }

      updates.forEach(({ id, quantity }) => {
        const item = state.items.find((i) => i.id === id);

        if (item) {
          if (quantity <= 0) {
            state.items = state.items.filter((i) => i.id !== id);
          } else {
            item.quantity = quantity;
          }
        }
      });

      cartSlice.caseReducers.calculateTotals(state);
    },
    removeFromCart: (state, action) => {
      const itemId = action.payload;
      state.items = state.items.filter((item) => item.id !== itemId);
      cartSlice.caseReducers.calculateTotals(state);
    },
    removeBulkFromCart: (state, action) => {
      const itemIds = action.payload; // Array of item IDs

      if (!Array.isArray(itemIds)) {
        console.error('removeBulkFromCart expects an array of item IDs');
        return;
      }

      state.items = state.items.filter((item) => !itemIds.includes(item.id));
      cartSlice.caseReducers.calculateTotals(state);
    },
    updateQuantity: (state, action) => {
      const { id, quantity } = action.payload;
      const item = state.items.find((i) => i.id === id);

      if (item) {
        if (quantity <= 0) {
          state.items = state.items.filter((i) => i.id !== id);
        } else {
          item.quantity = quantity;
        }
      }

      cartSlice.caseReducers.calculateTotals(state);
    },
    clearCart: (state) => {
      state.items = [];
      state.total = 0;
      state.itemCount = 0;
      state.marketId = null; // Reset market tracking
      state.marketName = null; // Reset market name
      delete state.lastError; // Clear any errors
    },
    toggleCart: (state) => {
      state.isOpen = !state.isOpen;
    },
    openCart: (state) => {
      state.isOpen = true;
    },
    closeCart: (state) => {
      state.isOpen = false;
    },
    calculateTotals: (state) => {
      let total = 0;
      let itemCount = 0;

      state.items.forEach((item) => {
        // Calculate item total based on pack-based selling or regular pricing
        let itemTotal = 0;

        if (item.isPackBased) {
          // Pack-based: use pricePerPack × numberOfPacks
          const pricePerPack = item.pricePerPack || (item.pricePerBaseUnit * item.packSize);
          const packs = item.numberOfPacks || 1;
          itemTotal = pricePerPack * packs;
        } else {
          // Regular: use pricePerBaseUnit (or legacy price field) × quantity
          const price = item.pricePerBaseUnit || item.price || 0;
          itemTotal = price * item.quantity;
        }

        total += itemTotal;
        itemCount += item.quantity; // Count base units for total item count
      });

      state.total = Math.round(total * 100) / 100; // Round to 2 decimal places
      state.itemCount = itemCount;
    },
  },
});

export const {
  addToCart,
  addBulkToCart,
  bulkUpdateQuantities,
  removeFromCart,
  removeBulkFromCart,
  updateQuantity,
  clearCart,
  toggleCart,
  openCart,
  closeCart,
  calculateTotals,
} = cartSlice.actions;

// Selectors
export const selectCart = (state) => state.cart;
export const selectCartItems = (state) => state.cart.items;
export const selectCartTotal = (state) => state.cart.total;
export const selectCartItemCount = (state) => state.cart.itemCount;
export const selectCartIsOpen = (state) => state.cart.isOpen;
export const selectCartMarket = (state) => ({
  marketId: state.cart.marketId,
  marketName: state.cart.marketName,
});
export const selectCartLastError = (state) => state.cart.lastError;

export default cartSlice.reducer;
