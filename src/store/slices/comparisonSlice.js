import { createSlice } from '@reduxjs/toolkit';

// Load comparison from localStorage
const loadComparisonFromStorage = () => {
  try {
    const savedComparison = localStorage.getItem('aaroth_comparison');
    return savedComparison ? JSON.parse(savedComparison) : [];
  } catch (error) {
    console.error('Error loading comparison from localStorage:', error);
    return [];
  }
};

// Save comparison to localStorage
const saveComparisonToStorage = (comparison) => {
  try {
    localStorage.setItem('aaroth_comparison', JSON.stringify(comparison));
  } catch (error) {
    console.error('Error saving comparison to localStorage:', error);
  }
};

const initialState = {
  items: loadComparisonFromStorage(),
  maxItems: 4, // Maximum 4 products for comparison
  loading: false,
  error: null,
};

const comparisonSlice = createSlice({
  name: 'comparison',
  initialState,
  reducers: {
    addToComparison: (state, action) => {
      const product = action.payload;
      const existingIndex = state.items.findIndex(
        (item) => item.id === (product.id || product._id)
      );

      // Don't add if already exists
      if (existingIndex !== -1) {
        return;
      }

      // Don't add if we've reached the maximum
      if (state.items.length >= state.maxItems) {
        state.error = `Maximum ${state.maxItems} products can be compared at once`;
        return;
      }

      const comparisonItem = {
        id: product.id || product._id,
        name: product.name,
        price: product.price,
        image: product.images?.[0] || product.image,
        vendorId: product.vendorId,
        vendorName: product.vendorName,
        unit: product.unit,
        availability: product.availability,
        rating: product.rating,
        category: product.category,
        description: product.description,
        qualityGrade: product.qualityGrade,
        isInSeason: product.isInSeason,
        addedAt: new Date().toISOString(),
      };

      state.items.push(comparisonItem);
      state.error = null;
      saveComparisonToStorage(state.items);
    },

    removeFromComparison: (state, action) => {
      const productId = action.payload;
      state.items = state.items.filter((item) => item.id !== productId);
      state.error = null;
      saveComparisonToStorage(state.items);
    },

    toggleComparison: (state, action) => {
      const product = action.payload;
      const existingIndex = state.items.findIndex(
        (item) => item.id === (product.id || product._id)
      );

      if (existingIndex === -1) {
        // Add to comparison
        if (state.items.length >= state.maxItems) {
          state.error = `Maximum ${state.maxItems} products can be compared at once`;
          return;
        }

        const comparisonItem = {
          id: product.id || product._id,
          name: product.name,
          price: product.price,
          image: product.images?.[0] || product.image,
          vendorId: product.vendorId,
          vendorName: product.vendorName,
          unit: product.unit,
          availability: product.availability,
          rating: product.rating,
          category: product.category,
          description: product.description,
          qualityGrade: product.qualityGrade,
          isInSeason: product.isInSeason,
          addedAt: new Date().toISOString(),
        };

        state.items.push(comparisonItem);
        state.error = null;
      } else {
        // Remove from comparison
        state.items.splice(existingIndex, 1);
        state.error = null;
      }

      saveComparisonToStorage(state.items);
    },

    clearComparison: (state) => {
      state.items = [];
      state.error = null;
      saveComparisonToStorage([]);
    },

    reorderComparison: (state, action) => {
      const { fromIndex, toIndex } = action.payload;

      if (
        fromIndex >= 0 &&
        fromIndex < state.items.length &&
        toIndex >= 0 &&
        toIndex < state.items.length
      ) {
        const [movedItem] = state.items.splice(fromIndex, 1);
        state.items.splice(toIndex, 0, movedItem);
        saveComparisonToStorage(state.items);
      }
    },

    replaceInComparison: (state, action) => {
      const { replaceIndex, product } = action.payload;

      if (replaceIndex >= 0 && replaceIndex < state.items.length) {
        const comparisonItem = {
          id: product.id || product._id,
          name: product.name,
          price: product.price,
          image: product.images?.[0] || product.image,
          vendorId: product.vendorId,
          vendorName: product.vendorName,
          unit: product.unit,
          availability: product.availability,
          rating: product.rating,
          category: product.category,
          description: product.description,
          qualityGrade: product.qualityGrade,
          isInSeason: product.isInSeason,
          addedAt: new Date().toISOString(),
        };

        state.items[replaceIndex] = comparisonItem;
        state.error = null;
        saveComparisonToStorage(state.items);
      }
    },

    setComparisonLoading: (state, action) => {
      state.loading = action.payload;
    },

    setComparisonError: (state, action) => {
      state.error = action.payload;
    },

    clearComparisonError: (state) => {
      state.error = null;
    },
  },
});

export const {
  addToComparison,
  removeFromComparison,
  toggleComparison,
  clearComparison,
  reorderComparison,
  replaceInComparison,
  setComparisonLoading,
  setComparisonError,
  clearComparisonError,
} = comparisonSlice.actions;

// Selectors
export const selectComparison = (state) => state.comparison;
export const selectComparisonItems = (state) => state.comparison.items;
export const selectComparisonCount = (state) => state.comparison.items.length;
export const selectComparisonLoading = (state) => state.comparison.loading;
export const selectComparisonError = (state) => state.comparison.error;
export const selectMaxComparisonItems = (state) => state.comparison.maxItems;

// Helper selector to check if a product is in comparison
export const selectIsProductInComparison = (state, productId) => {
  return state.comparison.items.some((item) => item.id === productId);
};

// Selector to check if comparison is full
export const selectIsComparisonFull = (state) => {
  return state.comparison.items.length >= state.comparison.maxItems;
};

// Selector to get comparison by category
export const selectComparisonByCategory = (state) => {
  const items = state.comparison.items;
  const grouped = {};

  items.forEach((item) => {
    const category = item.category || 'Uncategorized';
    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push(item);
  });

  return grouped;
};

// Selector to get comparison statistics
export const selectComparisonStats = (state) => {
  const items = state.comparison.items;

  if (items.length === 0) {
    return {
      averagePrice: 0,
      priceRange: { min: 0, max: 0 },
      averageRating: 0,
      vendorCount: 0,
      categoryCount: 0,
    };
  }

  const prices = items.map((item) => item.price).filter((price) => price > 0);
  const ratings = items
    .map((item) => item.rating)
    .filter((rating) => rating > 0);
  const vendors = new Set(items.map((item) => item.vendorId).filter(Boolean));
  const categories = new Set(
    items.map((item) => item.category).filter(Boolean)
  );

  return {
    averagePrice:
      prices.length > 0
        ? prices.reduce((sum, price) => sum + price, 0) / prices.length
        : 0,
    priceRange: {
      min: prices.length > 0 ? Math.min(...prices) : 0,
      max: prices.length > 0 ? Math.max(...prices) : 0,
    },
    averageRating:
      ratings.length > 0
        ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
        : 0,
    vendorCount: vendors.size,
    categoryCount: categories.size,
  };
};

// Selector for comparison table data (structured for easier rendering)
export const selectComparisonTableData = (state) => {
  const items = state.comparison.items;

  if (items.length === 0) {
    return { headers: [], rows: [] };
  }

  const headers = ['Feature', ...items.map((item) => item.name)];

  const rows = [
    {
      feature: 'Image',
      values: ['', ...items.map((item) => item.image)],
      type: 'image',
    },
    {
      feature: 'Price',
      values: ['', ...items.map((item) => item.price)],
      type: 'currency',
    },
    {
      feature: 'Unit',
      values: ['', ...items.map((item) => item.unit || 'unit')],
      type: 'text',
    },
    {
      feature: 'Vendor',
      values: ['', ...items.map((item) => item.vendorName)],
      type: 'text',
    },
    {
      feature: 'Rating',
      values: ['', ...items.map((item) => item.rating || 0)],
      type: 'rating',
    },
    {
      feature: 'Availability',
      values: ['', ...items.map((item) => item.availability)],
      type: 'availability',
    },
    {
      feature: 'Category',
      values: ['', ...items.map((item) => item.category)],
      type: 'text',
    },
    {
      feature: 'Quality Grade',
      values: ['', ...items.map((item) => item.qualityGrade || 'N/A')],
      type: 'text',
    },
    {
      feature: 'In Season',
      values: ['', ...items.map((item) => (item.isInSeason ? 'Yes' : 'No'))],
      type: 'boolean',
    },
    {
      feature: 'Description',
      values: [
        '',
        ...items.map((item) => item.description || 'No description available'),
      ],
      type: 'text',
    },
  ];

  return { headers, rows };
};

export default comparisonSlice.reducer;
