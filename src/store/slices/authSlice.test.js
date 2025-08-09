import { describe, it, expect, beforeEach } from 'vitest';
import authReducer, {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  updateUser,
  clearError,
  selectAuth,
  selectUser,
  selectIsAuthenticated,
} from './authSlice';

describe('authSlice', () => {
  let initialState;

  beforeEach(() => {
    initialState = {
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,
      error: null,
    };

    // Clear localStorage before each test
    localStorage.clear();
  });

  describe('reducers', () => {
    it('should handle loginStart', () => {
      const action = loginStart();
      const state = authReducer(initialState, action);

      expect(state.loading).toBe(true);
      expect(state.error).toBe(null);
    });

    it('should handle loginSuccess', () => {
      const user = { id: '1', name: 'Test User', role: 'vendor' };
      const token = 'test-token';
      const action = loginSuccess({ user, token });
      const state = authReducer(initialState, action);

      expect(state.loading).toBe(false);
      expect(state.user).toEqual(user);
      expect(state.token).toBe(token);
      expect(state.isAuthenticated).toBe(true);
      expect(state.error).toBe(null);
    });

    it('should handle loginFailure', () => {
      const errorMessage = 'Invalid credentials';
      const action = loginFailure(errorMessage);
      const state = authReducer(initialState, action);

      expect(state.loading).toBe(false);
      expect(state.error).toBe(errorMessage);
      expect(state.isAuthenticated).toBe(false);
      expect(state.token).toBe(null);
      expect(state.user).toBe(null);
    });

    it('should handle logout', () => {
      const authenticatedState = {
        user: { id: '1', name: 'Test User' },
        token: 'test-token',
        isAuthenticated: true,
        loading: false,
        error: null,
      };

      const action = logout();
      const state = authReducer(authenticatedState, action);

      expect(state.user).toBe(null);
      expect(state.token).toBe(null);
      expect(state.isAuthenticated).toBe(false);
      expect(state.error).toBe(null);
      expect(state.loading).toBe(false);
    });

    it('should handle updateUser', () => {
      const authenticatedState = {
        user: { id: '1', name: 'Test User', email: 'old@example.com' },
        token: 'test-token',
        isAuthenticated: true,
        loading: false,
        error: null,
      };

      const userUpdate = { email: 'new@example.com', phone: '+8801234567890' };
      const action = updateUser(userUpdate);
      const state = authReducer(authenticatedState, action);

      expect(state.user).toEqual({
        id: '1',
        name: 'Test User',
        email: 'new@example.com',
        phone: '+8801234567890',
      });
    });

    it('should handle clearError', () => {
      const errorState = {
        ...initialState,
        error: 'Some error message',
      };

      const action = clearError();
      const state = authReducer(errorState, action);

      expect(state.error).toBe(null);
    });
  });

  describe('selectors', () => {
    const mockState = {
      auth: {
        user: { id: '1', name: 'Test User' },
        token: 'test-token',
        isAuthenticated: true,
        loading: false,
        error: null,
      },
    };

    it('should select auth state', () => {
      const result = selectAuth(mockState);
      expect(result).toEqual(mockState.auth);
    });

    it('should select user', () => {
      const result = selectUser(mockState);
      expect(result).toEqual(mockState.auth.user);
    });

    it('should select isAuthenticated', () => {
      const result = selectIsAuthenticated(mockState);
      expect(result).toBe(true);
    });
  });
});
