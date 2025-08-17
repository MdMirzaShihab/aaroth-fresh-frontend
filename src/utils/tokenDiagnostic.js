/**
 * Frontend Token Diagnostic Utility
 *
 * Use this utility to diagnose restaurant owner authentication issues
 * Run these functions in browser console or add temporary logging
 */

import { store } from '../store/index.js';
import { selectAuth } from '../store/slices/authSlice';
import api from '../services/api';
import axios from 'axios';

// JWT Token Decoder (without verification)
const decodeJWT = (token) => {
  if (!token) return null;

  try {
    const parts = token.split('.');
    if (parts.length !== 3) return { error: 'Invalid JWT format' };

    const payload = JSON.parse(atob(parts[1]));
    const header = JSON.parse(atob(parts[0]));

    return {
      header,
      payload,
      isExpired: payload.exp * 1000 < Date.now(),
      expiresAt: new Date(payload.exp * 1000),
      issuedAt: new Date(payload.iat * 1000),
      timeUntilExpiry: payload.exp * 1000 - Date.now(),
    };
  } catch (error) {
    return { error: 'Failed to decode JWT', details: error.message };
  }
};

// 1. Token Storage Check
export const checkTokenStorage = () => {
  console.log('\n🔍 === TOKEN STORAGE DIAGNOSTIC ===');

  const localStorageToken = localStorage.getItem('token');
  const sessionStorageToken = sessionStorage.getItem('token');

  console.log(
    '📦 LocalStorage token:',
    localStorageToken ? 'EXISTS' : 'NOT FOUND'
  );
  console.log(
    '📦 SessionStorage token:',
    sessionStorageToken ? 'EXISTS' : 'NOT FOUND'
  );

  if (localStorageToken) {
    console.log(
      '🔑 LocalStorage token preview:',
      localStorageToken.substring(0, 50) + '...'
    );
    const decoded = decodeJWT(localStorageToken);
    console.log('📋 LocalStorage token decoded:', decoded);
  }

  if (sessionStorageToken) {
    console.log(
      '🔑 SessionStorage token preview:',
      sessionStorageToken.substring(0, 50) + '...'
    );
    const decoded = decodeJWT(sessionStorageToken);
    console.log('📋 SessionStorage token decoded:', decoded);
  }

  return {
    localStorage: localStorageToken,
    sessionStorage: sessionStorageToken,
    localStorageDecoded: localStorageToken
      ? decodeJWT(localStorageToken)
      : null,
    sessionStorageDecoded: sessionStorageToken
      ? decodeJWT(sessionStorageToken)
      : null,
  };
};

// 2. Redux Store Auth State Check
export const checkReduxAuthState = () => {
  console.log('\n🏪 === REDUX AUTH STATE DIAGNOSTIC ===');

  const state = store.getState();
  const authState = selectAuth(state);

  console.log('🔐 Full auth state:', authState);
  console.log('👤 User:', authState.user);
  console.log('🎫 Token in store:', authState.token ? 'EXISTS' : 'NOT FOUND');
  console.log('✅ Is authenticated:', authState.isAuthenticated);
  console.log('⏳ Loading:', authState.loading);
  console.log('❌ Error:', authState.error);

  if (authState.token) {
    console.log(
      '🔑 Store token preview:',
      authState.token.substring(0, 50) + '...'
    );
    const decoded = decodeJWT(authState.token);
    console.log('📋 Store token decoded:', decoded);
  }

  if (authState.user) {
    console.log('👥 User role:', authState.user.role);
    console.log('🏢 Restaurant ID:', authState.user.restaurantId);
    console.log('📋 User status:', authState.user.status);
    console.log('✅ Is approved:', authState.user.isApproved);
  }

  return authState;
};

// 3. Enhanced API Request Headers Check
export const checkAPIHeaders = () => {
  console.log('\n📡 === API HEADERS DIAGNOSTIC ===');

  const state = store.getState();
  const token = state.auth.token;
  const localStorageToken = localStorage.getItem('token');

  console.log('🔍 Token Sources:');
  console.log(
    '   Redux Store Token:',
    token ? token.substring(0, 30) + '...' : 'NULL'
  );
  console.log(
    '   LocalStorage Token:',
    localStorageToken ? localStorageToken.substring(0, 30) + '...' : 'NULL'
  );

  if (token || localStorageToken) {
    const activeToken = token || localStorageToken;
    console.log('📤 Authorization header that would be sent:');
    console.log(`   Bearer ${activeToken.substring(0, 50)}...`);

    // Check if token format is correct
    const isValidFormat =
      activeToken.startsWith('eyJ') && activeToken.split('.').length === 3;
    console.log('✅ Token format valid:', isValidFormat);

    if (!isValidFormat) {
      console.log('❌ Token format issue detected!');
      console.log('   Expected: JWT format (3 parts separated by dots)');
      console.log('   Actual:', activeToken.substring(0, 100));
    }

    // Check axios default headers
    console.log('🔧 Axios Configuration:');
    console.log('   Default base URL:', axios.defaults.baseURL);
    console.log('   Default headers:', axios.defaults.headers.common);
    console.log('   Custom API instance base URL:', api.defaults.baseURL);
    console.log('   Custom API default headers:', api.defaults.headers);
  } else {
    console.log('❌ No token available for API requests');
  }

  return {
    hasToken: !!(token || localStorageToken),
    reduxToken: token,
    localStorageToken: localStorageToken,
    tokenPreview:
      token || localStorageToken
        ? (token || localStorageToken).substring(0, 50) + '...'
        : null,
    isValidFormat:
      token || localStorageToken
        ? (token || localStorageToken).startsWith('eyJ') &&
          (token || localStorageToken).split('.').length === 3
        : false,
    axiosDefaults: axios.defaults.headers.common,
    apiDefaults: api.defaults.headers,
  };
};

// 4. Token-Storage Sync Check
export const checkTokenSync = () => {
  console.log('\n🔄 === TOKEN SYNC DIAGNOSTIC ===');

  const localStorageToken = localStorage.getItem('token');
  const storeToken = store.getState().auth.token;

  console.log('🔍 Comparing tokens:');
  console.log(
    '   LocalStorage:',
    localStorageToken ? localStorageToken.substring(0, 30) + '...' : 'NULL'
  );
  console.log(
    '   Redux Store: ',
    storeToken ? storeToken.substring(0, 30) + '...' : 'NULL'
  );

  const isSync = localStorageToken === storeToken;
  console.log('✅ Tokens in sync:', isSync);

  if (!isSync) {
    console.log('⚠️  TOKEN SYNC ISSUE DETECTED!');
    console.log('   This could cause authentication problems');
    console.log('   LocalStorage and Redux store have different tokens');
  }

  return {
    isSync,
    localStorageToken,
    storeToken,
    recommendation: !isSync
      ? 'Clear localStorage and re-login'
      : 'Tokens are synchronized',
  };
};

// 5. Request Interceptor Check
export const checkRequestInterceptors = () => {
  console.log('\n🔧 === REQUEST INTERCEPTOR DIAGNOSTIC ===');

  let interceptorTestResults = {
    axiosInterceptorCalled: false,
    headersAdded: false,
    tokenFromInterceptor: null,
  };

  // Add temporary request interceptor to check if it's working
  const testInterceptorId = api.interceptors.request.use(
    (request) => {
      console.log('🔍 Request interceptor triggered!');
      console.log('   URL:', request.url);
      console.log('   Method:', request.method?.toUpperCase());
      console.log('   Base URL:', request.baseURL);
      console.log('   Headers:', request.headers);
      console.log('   Authorization header:', request.headers.Authorization);

      interceptorTestResults.axiosInterceptorCalled = true;
      interceptorTestResults.headersAdded = !!request.headers.Authorization;
      interceptorTestResults.tokenFromInterceptor =
        request.headers.Authorization;

      // Remove the test interceptor
      api.interceptors.request.eject(testInterceptorId);

      return request;
    },
    (error) => {
      console.log('❌ Request interceptor error:', error);
      return Promise.reject(error);
    }
  );

  console.log('✅ Added temporary request interceptor for testing');
  console.log('   Interceptor ID:', testInterceptorId);

  return {
    interceptorAdded: true,
    interceptorId: testInterceptorId,
    testResults: interceptorTestResults,
  };
};

// 6. Login Response Check
export const simulateLoginResponseCheck = () => {
  console.log('\n🔐 === LOGIN RESPONSE DIAGNOSTIC ===');

  console.log('💡 To check login response manually, run this after login:');
  console.log(`
    // After restaurant owner login, check the response
    const loginResponse = await authService.login(credentials);
    console.log('Login response:', loginResponse);
    console.log('Token from response:', loginResponse.token);
    console.log('User from response:', loginResponse.user);
    console.log('Success flag:', loginResponse.success);
  `);

  // Check current auth state that should be set after login
  const authState = store.getState().auth;
  console.log('🔍 Current auth state (post-login):');
  console.log('   User:', authState.user);
  console.log(
    '   Token:',
    authState.token ? authState.token.substring(0, 30) + '...' : 'NULL'
  );
  console.log('   Is Authenticated:', authState.isAuthenticated);
  console.log('   Loading:', authState.loading);
  console.log('   Error:', authState.error);

  if (authState.user) {
    console.log('👤 User Details:');
    console.log('   ID:', authState.user._id || authState.user.id);
    console.log('   Name:', authState.user.name);
    console.log('   Phone:', authState.user.phone);
    console.log('   Role:', authState.user.role);
    console.log('   Status:', authState.user.status);
    console.log('   Is Approved:', authState.user.isApproved);
    console.log('   Restaurant ID:', authState.user.restaurantId);

    if (authState.user.restaurantId) {
      console.log('🏢 Restaurant Details:');
      console.log('   Restaurant Object:', authState.user.restaurantId);
    }
  }

  return {
    currentAuthState: authState,
    hasUser: !!authState.user,
    hasToken: !!authState.token,
    isAuthenticated: authState.isAuthenticated,
    userRole: authState.user?.role,
    restaurantData: authState.user?.restaurantId,
  };
};

// 7. Network Request Diagnostic
export const checkNetworkRequests = () => {
  console.log('\n🌐 === NETWORK REQUEST DIAGNOSTIC ===');

  // Check if XMLHttpRequest or fetch are intercepted
  console.log('📡 Checking network interception...');

  // Create a test request to see headers
  const testApiCall = async () => {
    try {
      const state = store.getState();
      const token = state.auth.token;

      console.log('🧪 Making test API call to /auth/me...');

      const response = await fetch('http://localhost:5000/api/v1/auth/me', {
        method: 'GET',
        headers: {
          Authorization: token ? `Bearer ${token}` : 'No token',
          'Content-Type': 'application/json',
        },
      });

      console.log('📥 Response status:', response.status);
      console.log(
        '📥 Response headers:',
        Object.fromEntries(response.headers.entries())
      );

      if (!response.ok) {
        const errorData = await response.text();
        console.log('❌ Error response:', errorData);
      } else {
        const data = await response.json();
        console.log('✅ Success response:', data);
      }

      return {
        status: response.status,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries()),
      };
    } catch (error) {
      console.log('❌ Network error:', error.message);
      return { error: error.message };
    }
  };

  return testApiCall();
};

// 8. Complete Diagnostic Report
export const runCompleteTokenDiagnostic = async () => {
  console.log('\n🏥 === COMPLETE TOKEN DIAGNOSTIC REPORT ===');
  console.log('📊 Running comprehensive authentication diagnostic...\n');

  const storageCheck = checkTokenStorage();
  const reduxCheck = checkReduxAuthState();
  const headersCheck = checkAPIHeaders();
  const syncCheck = checkTokenSync();
  const interceptorCheck = checkRequestInterceptors();
  const loginCheck = simulateLoginResponseCheck();

  console.log('\n📊 === DIAGNOSTIC SUMMARY ===');

  // Summary and recommendations
  const issues = [];
  const recommendations = [];

  if (!storageCheck.localStorage && !storageCheck.sessionStorage) {
    issues.push('No tokens found in browser storage');
    recommendations.push('User needs to log in again');
  }

  if (storageCheck.localStorageDecoded?.isExpired) {
    issues.push('Token is expired');
    recommendations.push('User needs to log in again');
  }

  if (!reduxCheck.isAuthenticated) {
    issues.push('Redux store shows user as not authenticated');
    recommendations.push('Check authentication flow');
  }

  if (!syncCheck.isSync) {
    issues.push('Token synchronization issue between storage and Redux');
    recommendations.push('Clear storage and re-login');
  }

  if (!headersCheck.hasToken) {
    issues.push('No token available for API requests');
    recommendations.push('Ensure login process sets token correctly');
  }

  console.log('🔍 Issues found:', issues.length === 0 ? 'None' : issues);
  console.log(
    '💡 Recommendations:',
    recommendations.length === 0 ? 'All good!' : recommendations
  );

  // Test network request
  console.log('\n🌐 Testing network request...');
  const networkTest = await checkNetworkRequests();

  console.log('\n✅ Diagnostic complete!');

  return {
    storage: storageCheck,
    redux: reduxCheck,
    headers: headersCheck,
    sync: syncCheck,
    interceptors: interceptorCheck,
    loginState: loginCheck,
    network: networkTest,
    issues,
    recommendations,
  };
};

// 7. Quick Fix Functions
export const fixTokenIssues = {
  // Clear all tokens and force re-login
  clearAllTokens: () => {
    console.log('🧹 Clearing all tokens...');
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    store.dispatch({ type: 'auth/logout' });
    console.log('✅ All tokens cleared. User should log in again.');
  },

  // Sync localStorage token to Redux store
  syncTokenToStore: () => {
    const token = localStorage.getItem('token');
    if (token) {
      console.log('🔄 Syncing localStorage token to Redux store...');
      store.dispatch({
        type: 'auth/setToken',
        payload: { token, isAuthenticated: true },
      });
      console.log('✅ Token synced to store');
    } else {
      console.log('❌ No token in localStorage to sync');
    }
  },

  // Refresh user data
  refreshUserData: async () => {
    console.log('🔄 Refreshing user data...');
    try {
      // This would trigger the getCurrentUser query
      store.dispatch({ type: 'api/queries/getCurrentUser' });
      console.log('✅ User data refresh triggered');
    } catch (error) {
      console.log('❌ Failed to refresh user data:', error.message);
    }
  },
};

// Export everything for browser console use
if (typeof window !== 'undefined') {
  window.tokenDiagnostic = {
    checkTokenStorage,
    checkReduxAuthState,
    checkAPIHeaders,
    checkTokenSync,
    checkRequestInterceptors,
    simulateLoginResponseCheck,
    checkNetworkRequests,
    runCompleteTokenDiagnostic,
    fixTokenIssues,
    decodeJWT,
  };

  console.log(
    '🔧 Token diagnostic tools loaded! Use window.tokenDiagnostic in console'
  );
}
