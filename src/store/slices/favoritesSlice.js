import { createSlice } from '@reduxjs/toolkit';

// Load favorites from localStorage
const loadFavoritesFromStorage = () => {
  try {
    const savedFavorites = localStorage.getItem('aaroth_favorites');
    return savedFavorites ? JSON.parse(savedFavorites) : [];
  } catch (error) {
    console.error('Error loading favorites from localStorage:', error);
    return [];
  }
};

// Save favorites to localStorage
const saveFavoritesToStorage = (favorites) => {
  try {
    localStorage.setItem('aaroth_favorites', JSON.stringify(favorites));
  } catch (error) {
    console.error('Error saving favorites to localStorage:', error);
  }
};

const initialState = {
  items: loadFavoritesFromStorage(),
  loading: false,
  error: null,
};

const favoritesSlice = createSlice({
  name: 'favorites',
  initialState,
  reducers: {
    addToFavorites: (state, action) => {
      const product = action.payload;
      const existingIndex = state.items.findIndex(item => item.id === product.id);
      
      if (existingIndex === -1) {
        const favoriteItem = {
          id: product.id || product._id,
          name: product.name,
          price: product.price,
          image: product.images?.[0] || product.image,
          vendorId: product.vendorId,
          vendorName: product.vendorName,
          unit: product.unit,
          availability: product.availability,
          rating: product.rating,
          addedAt: new Date().toISOString(),
        };
        
        state.items.unshift(favoriteItem); // Add to beginning for recency
        saveFavoritesToStorage(state.items);
      }
    },
    
    removeFromFavorites: (state, action) => {
      const productId = action.payload;
      state.items = state.items.filter(item => item.id !== productId);
      saveFavoritesToStorage(state.items);
    },
    
    toggleFavorite: (state, action) => {
      const product = action.payload;
      const existingIndex = state.items.findIndex(item => item.id === (product.id || product._id));
      
      if (existingIndex === -1) {
        // Add to favorites
        const favoriteItem = {
          id: product.id || product._id,
          name: product.name,
          price: product.price,
          image: product.images?.[0] || product.image,
          vendorId: product.vendorId,
          vendorName: product.vendorName,
          unit: product.unit,
          availability: product.availability,
          rating: product.rating,
          addedAt: new Date().toISOString(),
        };
        
        state.items.unshift(favoriteItem);
      } else {
        // Remove from favorites
        state.items.splice(existingIndex, 1);
      }
      
      saveFavoritesToStorage(state.items);
    },
    
    clearFavorites: (state) => {
      state.items = [];
      saveFavoritesToStorage([]);
    },
    
    updateFavoriteAvailability: (state, action) => {
      const { productId, availability } = action.payload;
      const item = state.items.find(item => item.id === productId);
      
      if (item) {
        item.availability = availability;
        saveFavoritesToStorage(state.items);
      }
    },
    
    bulkAddToFavorites: (state, action) => {
      const products = action.payload;
      
      if (!Array.isArray(products)) {
        console.error('bulkAddToFavorites expects an array of products');
        return;
      }
      
      products.forEach(product => {
        const existingIndex = state.items.findIndex(item => item.id === (product.id || product._id));
        
        if (existingIndex === -1) {
          const favoriteItem = {
            id: product.id || product._id,
            name: product.name,
            price: product.price,
            image: product.images?.[0] || product.image,
            vendorId: product.vendorId,
            vendorName: product.vendorName,
            unit: product.unit,
            availability: product.availability,
            rating: product.rating,
            addedAt: new Date().toISOString(),
          };
          
          state.items.unshift(favoriteItem);
        }
      });
      
      saveFavoritesToStorage(state.items);
    },
    
    setFavoritesLoading: (state, action) => {
      state.loading = action.payload;
    },
    
    setFavoritesError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const {
  addToFavorites,
  removeFromFavorites,
  toggleFavorite,
  clearFavorites,
  updateFavoriteAvailability,
  bulkAddToFavorites,
  setFavoritesLoading,
  setFavoritesError,
} = favoritesSlice.actions;

// Selectors
export const selectFavorites = (state) => state.favorites;
export const selectFavoriteItems = (state) => state.favorites.items;
export const selectFavoritesCount = (state) => state.favorites.items.length;
export const selectFavoritesLoading = (state) => state.favorites.loading;
export const selectFavoritesError = (state) => state.favorites.error;

// Helper selector to check if a product is favorited
export const selectIsProductFavorited = (state, productId) => {
  return state.favorites.items.some(item => item.id === productId);
};

// Selector to get favorites grouped by vendor
export const selectFavoritesByVendor = (state) => {
  const favorites = state.favorites.items;
  const grouped = {};
  
  favorites.forEach(item => {
    const vendorId = item.vendorId;
    if (!grouped[vendorId]) {
      grouped[vendorId] = {
        vendorName: item.vendorName,
        items: [],
      };
    }
    grouped[vendorId].items.push(item);
  });
  
  return grouped;
};

// Selector to get recently added favorites (last 7 days)
export const selectRecentFavorites = (state) => {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  return state.favorites.items.filter(item => {
    const addedAt = new Date(item.addedAt);
    return addedAt >= sevenDaysAgo;
  });
};

export default favoritesSlice.reducer;