# Aaroth Fresh Frontend Development Guide - Step by Step

This guide provides exact prompts and workflow to build the Aaroth Fresh MVP frontend using Claude Code efficiently, focusing on core features that match the current backend implementation.

## Prerequisites

1. **Copy context files** to your new frontend project directory:
   - `CLAUDE.md`
   - `api-integration-guide.md and api-endpoints.md` 
   - `guide.md` (this file)

2. **Backend running** at `http://localhost:5000`

3. **Claude Code** installed and ready

## Phase 1: Project Setup & Foundation (Days 1-2)

### Step 1.1: Initial Project Setup

**Prompt to use with Claude Code:**
```
Create a new Aaroth Fresh B2B marketplace frontend project. The innitial Vite-react-tailwind setup has been done, use this with the following requirements:


1. Install core dependencies: React Router v6, @reduxjs/toolkit, React Hook Form, Axios, Framer Motion, React Testing Library, Vitest, @testing-library/jest-dom, @testing-library/user-event, jsdom
2. Configure Tailwind CSS with mobile-first approach
3. Set up ESLint + Prettier with Airbnb config
4. Create the complete folder structure following the architecture plan and folder-structure.md
5. Configure Vite with development settings and environment variables
6. Set up testing environment with Vitest, configure vite.config.js for testing, and create test setup file
7. TESTING: Create basic test setup and run initial tests
8. MOBILE-FIRST: Test responsive design on mobile devices immediately

Use Redux Toolkit + RTK Query for state management (NOT TypeScript, NOT Zustand). Follow CLAUDE.md and api-integration-guide.md and api-endpoints.md files for exact specifications. Use TodoWrite to track all setup tasks.
```

**Expected Outcome:** Complete project setup with all dependencies and configuration files.

### Step 1.2: Core Infrastructure Setup

**Prompt to use with Claude Code:**
```
Set up the core infrastructure for Aaroth Fresh frontend based on CLAUDE.md specifications:

1. Configure Redux Toolkit store with RTK Query API slice for the backend at http://localhost:5000/api/v1
2. Set up RTK Query with automatic caching and background updates
3. Create JavaScript object structures matching the backend models (User, Product, Listing, Order) from api-integration-guide.md and api-endpoints.md
4. Initialize Redux slices: authSlice, cartSlice, notificationSlice, themeSlice
5. Create utility functions for token management and phone number validation
6. Set up error handling patterns and toast notifications
7. Configure environment variables for development and production
8. TESTING: Write unit tests for Redux slices and utility functions
9. MOBILE-FIRST: Test API integration on mobile devices, ensure touch-friendly error states

This is phone-based authentication (not email). Use Redux Toolkit + RTK Query (JavaScript). Use TodoWrite to track progress.
```

**Expected Outcome:** Complete API integration layer and state management setup.

## Phase 2: Authentication & Layout (Days 3-4)

### Step 2.1: Authentication System

**Prompt to use with Claude Code:**
```
Implement the complete authentication system for Aaroth Fresh following the phone-based authentication from api-integration-guide.md and api-endpoints.md:

1. Create Redux auth slice with RTK Query mutations (login, register, logout)
2. Build LoginForm and RegisterForm components using React Hook Form with custom validation
3. Implement phone number validation (must include country code like +8801234567890)
4. Create role-based registration flow for: admin, vendor, restaurantOwner, restaurantManager
5. Set up protected route wrapper with role-based access control using Redux selectors
6. Implement simple logout on 401 token expiration with Redux middleware
7. Create authentication layouts (AuthLayout for login/register pages)
8. TESTING: Write component tests for forms, integration tests for auth flow, test error scenarios
9. MOBILE-FIRST: Test touch targets (44px min), mobile keyboard behavior, test on real devices

CRITICAL: Use phone numbers, NOT emails. Use Redux Toolkit + RTK Query (JavaScript). Follow the exact API endpoints from api-integration-guide.md and api-endpoints.md. Use TodoWrite for task tracking.
```

**Expected Outcome:** Complete working authentication system with phone-based login.

### Step 2.2: Core Layout Components

**Prompt to use with Claude Code:**
```
Build the core layout system for Aaroth Fresh following mobile-first design from CLAUDE.md:

1. Create AppLayout with role-based sidebar navigation using Redux auth selectors
2. Build responsive Header with user menu, notifications, and logout using Redux state
3. Implement MobileNavigation with bottom tabs for mobile users
4. Create Sidebar component with collapsible menu and role-based filtering
5. Build responsive navigation system with proper breakpoints
6. Add theme toggle functionality (dark/light mode) using Redux themeSlice
7. Implement breadcrumb navigation for better UX
8. TESTING: Test layout components, navigation flows, role-based rendering, responsive behavior
9. MOBILE-FIRST: Validate 44px touch targets, test swipe gestures, test on real mobile devices

Use Redux Toolkit for state management. Focus on mobile-first approach with touch-friendly interactions. Use TodoWrite to track component creation.
```

**Expected Outcome:** Complete responsive layout system working on all device sizes.

## Phase 3: UI Component Library (Day 5)

### Step 3.1: Base UI Components

**Prompt to use with Claude Code:**
```
Create a comprehensive UI component library for Aaroth Fresh using Tailwind CSS:

1. Build base components: Button (primary, secondary, outline, ghost variants), Input (with validation states), Modal, Card, LoadingSpinner
2. Create form components: FormField wrapper, ErrorMessage, FileUpload with drag-and-drop support
3. Implement data display components: Table, Pagination, EmptyState, SearchBar
4. Build feedback components: Toast notifications, ConfirmDialog, AlertBanner
5. Create navigation components: Tabs, Dropdown, Breadcrumb
6. Add loading and skeleton states for all components
7. Implement accessibility features (ARIA labels, keyboard navigation)
8. TESTING: Write component tests for each UI component, test accessibility, test error states
9. MOBILE-FIRST: Ensure 44px minimum touch targets, test on mobile devices, validate responsive behavior

All components should be mobile-responsive and follow the design system. Use TodoWrite for tracking.
```

**Expected Outcome:** Complete reusable UI component library ready for feature development.

## Phase 4: Admin Features (Days 6-7)

### Step 4.1: Admin Dashboard

**Prompt to use with Claude Code:**
```
Build the admin dashboard and user management features for Aaroth Fresh:

1. Create AdminDashboard with metrics cards using RTK Query for data fetching
2. Build UserManagement page with user list, search, filtering, and pagination using Redux state
3. Implement vendor approval workflow with approve/reject actions using RTK Query mutations
4. Create ProductManagement for CRUD operations using RTK Query
5. Build analytics dashboard with charts and KPIs
6. Add bulk operations for user management with optimistic updates
7. Implement admin-specific navigation and permissions using Redux selectors
8. TESTING: Test admin workflows, data fetching, mutations, role-based access, error handling
9. MOBILE-FIRST: Ensure admin interface works on tablets/mobile, test touch interactions, responsive tables

Use Redux Toolkit + RTK Query for data management. Follow the admin API endpoints from api-integration-guide.md and api-endpoints.md. Use TodoWrite for task tracking.
```

**Expected Outcome:** Complete admin panel with user management and analytics.

### Step 4.2: Product & Category Management

**Prompt to use with Claude Code:**
```
Implement product and category management features for admins:

1. Create ProductList with search, filtering, and sorting using RTK Query
2. Build CreateProduct and EditProduct forms with image upload using Redux state
3. Implement CategoryManagement with CRUD operations using RTK Query mutations
4. Add bulk product operations (enable/disable, bulk edit) with optimistic updates
5. Create product approval workflow if needed using Redux actions
6. Implement image management with Cloudinary integration
7. Add product analytics and performance metrics
8. TESTING: Test CRUD operations, form validation, image upload, bulk operations, error scenarios
9. MOBILE-FIRST: Ensure forms work on mobile, test image upload on devices, responsive data tables

Use Redux Toolkit + RTK Query. Focus on efficient data management and user experience. Use TodoWrite to track progress.
```

**Expected Outcome:** Complete product and category management system.

## Phase 5: Vendor Features (Days 8-9)

### Step 5.1: Vendor Dashboard & Listings

**Prompt to use with Claude Code:**
```
Build the vendor dashboard and listing management system:

1. Create VendorDashboard with performance metrics using RTK Query, recent orders with Redux state
2. Build ListingManagement page with CRUD operations using RTK Query mutations
3. Implement CreateListing and EditListing forms with Redux form state management
4. Add listing status management using optimistic updates with RTK Query
5. Create bulk listing operations and inventory management with Redux actions
6. Build vendor analytics dashboard with periodic data refreshing
7. Implement notification system using Redux notifications slice
8. TESTING: Test listing CRUD, form validation, bulk operations, periodic updates, analytics
9. MOBILE-FIRST: Test vendor interface on mobile devices, ensure touch-friendly listing management

Use Redux Toolkit + RTK Query. Use the listings API endpoints from api-integration-guide.md and api-endpoints.md. Ensure mobile optimization. Use TodoWrite for tracking.
```

**Expected Outcome:** Complete vendor dashboard with listing management capabilities.

### Step 5.2: Vendor Order Management

**Prompt to use with Claude Code:**
```
Implement order processing features for vendors:

1. Create OrderManagement page using RTK Query for orders data and Redux for state management
2. Build order detail view with periodic updates using RTK Query polling
3. Implement order status updates using RTK Query mutations with optimistic updates
4. Add order filtering and search using Redux state and RTK Query
5. Create order analytics and reporting with Redux state management
6. Implement simple order notification polling using RTK Query + Redux actions
7. Build order fulfillment workflow with status tracking using Redux state machine pattern
8. TESTING: Test order workflows, status updates, notification polling, analytics, error handling
9. MOBILE-FIRST: Ensure order management works on mobile, test notifications, responsive order details

Use Redux Toolkit + RTK Query. Follow the orders API from api-integration-guide.md and api-endpoints.md. Focus on efficient order processing UX. Use TodoWrite for progress tracking.
```

**Expected Outcome:** Complete vendor order management system.

## Phase 6: Restaurant Features (Days 10-11)

### Step 6.1: Product Browsing & Shopping

**Prompt to use with Claude Code:**
```
git
```

**Expected Outcome:** Complete product browsing and shopping cart system.

### Step 6.2: Order Placement & Management

**Prompt to use with Claude Code:**
```
Implement order placement and management for restaurants:

1. Create checkout flow using Redux cart state and RTK Query mutations for order creation
2. Build OrderHistory page with RTK Query for data fetching and periodic updates
3. Implement order approval workflow using Redux state management and RTK Query
4. Add reorder functionality using Redux cart actions and RTK Query
5. Create order analytics and spending reports with Redux state and RTK Query
6. Build delivery tracking using periodic updates with RTK Query + Redux
7. Implement bulk reordering and scheduled ordering using Redux actions
8. TESTING: Test checkout flow, order placement, tracking, reorder functionality, analytics, error scenarios
9. MOBILE-FIRST: Test order placement on mobile, validate checkout UX, ensure responsive order tracking

Use Redux Toolkit + RTK Query. Follow the orders API from api-integration-guide.md and api-endpoints.md. Focus on restaurant business needs. Use TodoWrite for progress.
```

**Expected Outcome:** Complete restaurant ordering system with order management.

## Phase 7: UI Polish & Notifications (Days 12-13)

### Step 7.1: Notification System

**Prompt to use with Claude Code:**
```
Implement basic notification system:

1. Build in-app notification center using Redux notificationSlice
2. Create simple toast notifications for user actions
3. Add notification preferences in user settings
4. Implement order status change notifications
5. Create notification history and management
6. Add email notification preferences integration
7. Implement notification dismissal and read status
8. TESTING: Test notification display, user interactions, persistence
9. MOBILE-FIRST: Ensure notifications are touch-friendly and accessible on mobile

Use Redux Toolkit for state management. Focus on simple, effective user communication. Use TodoWrite to track implementation.
```

**Expected Outcome:** Basic notification system for user communication.

### Step 7.2: UI Polish & Performance

**Prompt to use with Claude Code:**
```
Polish the user interface and optimize performance:

1. Implement loading states and skeleton screens for all major components
2. Add smooth transitions and micro-interactions using Tailwind CSS
3. Optimize images and implement lazy loading
4. Add error boundaries and graceful error handling
5. Implement responsive design refinements
6. Add keyboard navigation and accessibility improvements
7. Optimize Redux state structure and API calls
8. TESTING: Test loading states, error scenarios, accessibility, performance
9. MOBILE-FIRST: Ensure smooth mobile experience and touch interactions

Use Tailwind CSS animations and Redux Toolkit optimizations. Focus on premium user experience. Use TodoWrite for tracking.
```

**Expected Outcome:** Polished, performance-optimized user interface.

## Phase 8: Testing & Quality Assurance (Days 14-15)

### Step 8.1: Performance Optimization

**Prompt to use with Claude Code:**
```
Optimize the application for maximum performance:

1. Implement code splitting and lazy loading for routes and components with React.lazy
2. Optimize images with lazy loading, WebP format, and responsive sizes
3. Add virtual scrolling for long lists and tables with Redux state management
4. Implement bundle analysis and tree shaking optimization with Vite
5. Add performance monitoring and metrics using Redux state tracking
6. Optimize RTK Query cache policies and implement request batching
7. Implement skeleton loading states and smooth animations with Redux loading states
8. TESTING: Test performance optimizations, measure load times, test on slow networks
9. MOBILE-FIRST: Test performance on mobile devices, validate mobile-specific optimizations, test on slow mobile networks

Use Redux Toolkit + RTK Query with Vite build tools and React performance best practices. Use TodoWrite for optimization tasks.
```

**Expected Outcome:** Highly optimized application with fast loading times.

### Step 8.2: Testing & Quality Assurance

**Prompt to use with Claude Code:**
```
Implement comprehensive testing strategy:

1. Configure Vitest in vite.config.js with jsdom environment and setup files
2. Set up React Testing Library, @testing-library/jest-dom, and Redux Testing Library
3. Write unit tests for Redux slices, RTK Query endpoints, and utility functions
4. Create component tests for UI components with Redux mock store
5. Implement integration tests for complete user flows with Redux state
6. Add API integration tests using Vitest mocks and RTK Query mock handlers  
7. Set up Vitest coverage reporting with c8 and quality gates for mobile testing
8. TESTING: Achieve 90%+ test coverage, test all Redux actions and selectors
9. MOBILE-FIRST: Include mobile-specific tests, touch interaction tests, responsive design tests

Use Redux Testing Library + Vitest. Focus on testing Redux state management and critical functionality. Use TodoWrite for test implementation.
```

**Expected Outcome:** Comprehensive test suite with good coverage.

## Phase 9: Final Polish & Deployment (Day 16)

### Step 9.1: Final Polish & Bug Fixes

**Prompt to use with Claude Code:**
```
Perform final quality assurance and polish:

1. Conduct thorough cross-browser testing with Redux state persistence
2. Test responsive design on all device sizes with Redux responsive state
3. Verify accessibility compliance (WCAG 2.1 AA) with Redux accessibility features
4. Fix any remaining bugs and UI inconsistencies in Redux state management
5. Optimize for different network conditions using RTK Query retry policies
6. Add proper error boundaries with Redux error state management
7. Implement analytics and monitoring setup with Redux state tracking
8. TESTING: Complete final test suite, test all user scenarios, validate Redux state integrity
9. MOBILE-FIRST: Final mobile device testing, validate touch interactions, test on various mobile browsers

Use Redux Toolkit + RTK Query for all state management. Use TodoWrite to track final QA tasks and bug fixes.
```

**Expected Outcome:** Production-ready application with all issues resolved.

### Step 9.2: Deployment Preparation

**Prompt to use with Claude Code:**
```
Prepare the application for production deployment:

1. Configure production environment variables for Redux and RTK Query
2. Set up build optimization and minification with Redux DevTools disabled
3. Configure proper HTTPS and security headers for Redux state security
4. Set up monitoring and error tracking (Sentry) with Redux error reporting
5. Create deployment scripts and CI/CD pipeline with testing automation
6. Configure domain and SSL certificates
7. Perform final security audit and performance testing on mobile devices
8. TESTING: Final production build testing, validate Redux state in production, test mobile performance
9. MOBILE-FIRST: Validate mobile production performance, test PWA installation, verify mobile-specific features

Use Redux Toolkit production best practices. Follow deployment best practices for React applications. Use TodoWrite for deployment tasks.
```

**Expected Outcome:** Application ready for production deployment.

## Redux Toolkit Specific Setup Instructions

### Essential Redux Toolkit Setup Steps

1. **Store Configuration**:
   ```javascript
   // src/store/index.js
   import { configureStore } from '@reduxjs/toolkit';
   import { setupListeners } from '@reduxjs/toolkit/query';
   import authReducer from './slices/authSlice';
   import cartReducer from './slices/cartSlice';
   import { apiSlice } from './api/apiSlice';

   export const store = configureStore({
     reducer: {
       auth: authReducer,
       cart: cartReducer,
       api: apiSlice.reducer,
     },
     middleware: (getDefaultMiddleware) =>
       getDefaultMiddleware().concat(apiSlice.middleware),
     devTools: process.env.NODE_ENV !== 'production',
   });

   setupListeners(store.dispatch);
   ```

2. **RTK Query API Slice**:
   ```javascript
   // src/store/api/apiSlice.js
   import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

   export const apiSlice = createApi({
     reducerPath: 'api',
     baseQuery: fetchBaseQuery({
       baseUrl: '/api/v1',
       prepareHeaders: (headers, { getState }) => {
         const token = getState().auth.token;
         if (token) {
           headers.set('authorization', `Bearer ${token}`);
         }
         return headers;
       },
     }),
     tagTypes: ['User', 'Product', 'Order', 'Listing'],
     endpoints: (builder) => ({}),
   });
   ```

3. **Redux Slice Pattern**:
   ```javascript
   // src/store/slices/authSlice.js
   import { createSlice } from '@reduxjs/toolkit';

   const authSlice = createSlice({
     name: 'auth',
     initialState: {
       user: null,
       token: localStorage.getItem('token'),
       isAuthenticated: !!localStorage.getItem('token'),
     },
     reducers: {
       loginSuccess: (state, action) => {
         state.user = action.payload.user;
         state.token = action.payload.token;
         state.isAuthenticated = true;
       },
       logout: (state) => {
         state.user = null;
         state.token = null;
         state.isAuthenticated = false;
       },
     },
   });
   ```

### Redux Testing Setup

```javascript
// src/utils/test-utils.js
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { render } from '@testing-library/react';

const createTestStore = (preloadedState) => {
  return configureStore({
    reducer: {
      auth: authReducer,
      // ... other reducers
    },
    preloadedState,
  });
};

export const renderWithProviders = (ui, options = {}) => {
  const { preloadedState = {}, ...renderOptions } = options;
  const store = createTestStore(preloadedState);
  const Wrapper = ({ children }) => (
    <Provider store={store}>{children}</Provider>
  );
  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
};
```

## Development Best Practices

### Using Claude Code Efficiently

1. **Always use TodoWrite** for multi-step tasks
2. **Reference context files** in every prompt (CLAUDE.md, api-integration-guide.md and api-endpoints.md)
3. **Be specific** about phone-based authentication and Redux Toolkit + RTK Query usage
4. **Emphasize mobile-first** approach and real device testing in all prompts
5. **Include testing requirements** in every feature request
6. **Break complex features** into smaller, manageable tasks
7. **Test incrementally** as you build each feature, especially on mobile devices
8. **Always specify Redux Toolkit + RTK Query** instead of other state management solutions

### Session Management Strategy

#### Long Development Sessions
```
I'm building the Aaroth Fresh frontend following the guide.md step-by-step. Currently working on [Phase X: Feature Name]. The project uses React + JavaScript + Vite + Redux Toolkit + RTK Query with phone-based authentication and role-based access for admin, vendor, restaurantOwner, and restaurantManager. Continue with the next steps in the development plan using TodoWrite for task tracking. IMPORTANT: Test on mobile devices and include comprehensive testing.
```

#### Feature-Specific Sessions
```
Implement [specific feature] for Aaroth Fresh B2B marketplace. This is a React JavaScript project with Redux Toolkit + RTK Query, connecting to Express.js backend. Follow the specifications in CLAUDE.md and api-integration-guide.md and api-endpoints.md. Focus on mobile-first responsive design and phone-based authentication. Include comprehensive testing and mobile device validation. Use TodoWrite to track implementation steps.
```

### Quality Checkpoints

After each phase, verify:
- [ ] Mobile responsiveness works perfectly on real devices
- [ ] Authentication flows work with phone numbers using Redux state
- [ ] Role-based access control functions correctly with Redux selectors
- [ ] API integration matches backend exactly using RTK Query
- [ ] Performance is optimized for mobile devices
- [ ] Error handling is comprehensive with Redux error states
- [ ] Redux state management is properly implemented
- [ ] Tests cover critical functionality including mobile scenarios
- [ ] Touch targets are minimum 44px on mobile devices
- [ ] Real device testing completed for each feature

## Troubleshooting Common Issues

### If Authentication Fails
1. Verify phone number format includes country code
2. Check API endpoints match api-integration-guide.md and api-endpoints.md exactly
3. Ensure JWT token handling is correct
4. Verify CORS configuration on backend

### If Performance Issues Occur
1. Check bundle size and implement code splitting with React.lazy
2. Optimize images and implement lazy loading
3. Review RTK Query cache configuration and invalidation strategies
4. Implement virtual scrolling for large lists with Redux state management
5. Test performance specifically on mobile devices and slow networks

### If Mobile Experience is Poor
1. Review touch targets (minimum 44px)
2. Test on real devices, not just browser dev tools
3. Optimize for slow network connections
4. Implement proper loading states

## Success Metrics

By following this guide, you should achieve:
- **Performance**: < 3s initial load time, < 1s page transitions
- **Mobile UX**: Touch-friendly, responsive on all devices
- **Functionality**: Core MVP features working for all user roles
- **Quality**: 90%+ test coverage including Redux tests, accessibility compliant, mobile tested
- **Security**: Secure authentication and data handling
- **Scalability**: Architecture ready for growth and new features

## Final Notes

This guide provides a systematic approach to building the Aaroth Fresh MVP frontend. Each prompt is designed to work optimally with Claude Code's capabilities while ensuring high-quality, production-ready code focused on core features.

Remember to:
- Copy all context files to your frontend project
- Follow the exact prompt structure provided
- Use TodoWrite consistently for task tracking
- Test each phase before moving to the next
- Focus on mobile-first development throughout

The total estimated time is 16 development days for a solid MVP, focusing on core features that match the backend implementation. This provides a strong foundation for future enhancements.