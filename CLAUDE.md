### Error Handling UI (Gentle Guidance)

#### Error Messages (Compassionate Communication)
```typescript
// Inline Form Error - Subtle warning
className="text-tomato-red/80 text-sm mt-2 flex items-center gap-2 animate-fade-in"
// Icon: "w-4 h-4 text-tomato-red/60"

// Page Error State - Calm reassurance
className="flex flex-col items-center justify-center min-h-[50vh] text-center px-6"
// Title: "text-2xl font-medium text-text-dark/80 mb-4"
// Message: "text-text-muted mb-8 max-w-md leading-relaxed"
// Action: "bg-gradient-secondary text-white px-8 py-3 rounded-2xl font-medium"

// Network Error - Offline elegance
className="bg-amber-50/80 backdrop-blur-sm border border-amber-200/50 text-amber-800 p-4 rounded-2xl flex items-center gap-3"

// Validation Error - Focused feedback
className="border-2 border-tomato-red/30 bg-tomato-red/5 focus:border-tomato-red/50 focus:ring-2 focus:ring-tomato-red/10"
```

#### Toast Notifications (Floating Messages)
```typescript
// Success Toast - Gentle celebration
className="bg-mint-fresh/10 backdrop-blur-sm border border-mint-fresh/20 text-bottle-green p-4 rounded-2xl shadow-lg animate-slide-up"

// Error Toast - Soft alert
className="bg-tomato-red/5 backdrop-blur-sm border border-tomato-red/20 text-tomato-red/90 p-4 rounded-2xl shadow-lg animate-slide-up"

// Warning Toast - Cautious notice
className="bg-amber-50/80 backdrop-blur-sm border border-amber-200/50 text-amber-800 p-4 rounded-2xl shadow-lg animate-slide-up"

// Info Toast - Subtle information
className="bg-blue-50/80 backdrop-blur-sm border border-blue-200/50 text-blue-800 p-4 rounded-2xl shadow-lg animate-slide-up"

// Toast Container - Floating above reality
className="fixed top-4 right-4 z-[9999] space-y-3 max-w-sm"
```

#### Error Recovery (Resilient Experience)
```typescript
// Retry Button - Hopeful action
className="bg-earthy-yellow/20 hover:bg-earthy-yellow/30 text-earthy-brown px-6 py-2 rounded-xl font-medium transition-all duration-200 flex items-center gap-2"

// Error Boundary - Graceful fallback
className="min-h-[50vh] flex flex-col items-center justify-center text-center p-8 bg-gradient-to-br from-earthy-beige/20 to-white"

// Network Status - Subtle indicator
className="fixed top-2 left-1/2 transform -translate-x-1/2 bg-amber-100/90 backdrop-blur-sm text-amber-800 px-4 py-2 rounded-full text-sm font-medium shadow-sm animate-fade-in"
```# Aaroth Fresh Frontend - Claude Code Instructions

This file provides guidance to Claude Code when working with the Aaroth Fresh B2B marketplace frontend.

## Project Overview

React JavaScript frontend for Aaroth Fresh B2B marketplace - connecting local vegetable vendors with restaurants. Built with modern stack focusing on mobile-first design and MVP performance for 500 concurrent users.

## Technology Stack

- **Core**: React 18 + JavaScript + Vite
- **Styling**: Tailwind CSS (mobile-first approach)
- **State Management**: Redux Toolkit (global state) + RTK Query (server state)
- **Routing**: React Router v6 with role-based protection
- **Forms**: React Hook Form + basic validation
- **HTTP Client**: Axios with interceptors
- **Build Tool**: Vite with optimization
- **UI Icons**: Lucide React

## Development Commands

- **Start development server**: `npm run dev` (Vite dev server with HMR)
- **Build for production**: `npm run build` (Vite build with optimization)
- **Preview production build**: `npm run preview`
- **Lint code**: `npm run lint` (ESLint for JavaScript)
- **Format code**: `npm run format` (Prettier)

## Backend Integration

### API Configuration
- **Backend Base URL**: `http://localhost:5000/api/v1` (development)
- **Production URL**: To be configured in environment variables
- **Authentication**: JWT tokens with phone-based login (NOT email-based)
- **Content Type**: JSON for all API requests
- **CORS**: Configured in backend for frontend domains

### Authentication Flow
- **Login Method**: Phone number + password (not email)
- **Phone Format**: Must include country code (e.g., `+8801234567890`)
- **Token Storage**: localStorage for persistence, memory for active session
- **Token Handling**: Simple JWT storage and validation
- **Role-based Access**: Routes and features based on user role

### User Roles & Permissions
- **admin**: Full system access, manage users/products/categories
- **vendor**: Create/manage listings, process orders, view analytics
- **restaurantOwner**: Browse products, place orders, manage restaurant
- **restaurantManager**: Same as restaurantOwner but with limited admin rights

## Key Backend API Endpoints

### Authentication (`/api/v1/auth`)
- `POST /login` - Phone-based login
- `POST /register` - Multi-role registration
- `POST /logout` - Logout and token invalidation
- `GET /me` - Get current user profile

### Admin Routes (`/api/v1/admin`)
- `GET /users` - List all users with pagination
- `PUT /users/:id/approve` - Approve vendor accounts
- `GET /analytics` - System analytics and metrics
- Product and category management endpoints

### Listings (`/api/v1/listings`)
- `GET /` - Browse listings with search/filter
- `POST /` - Create new listing (vendor only)
- `PUT /:id` - Update listing (vendor only)
- `DELETE /:id` - Delete listing (vendor only)

### Orders (`/api/v1/orders`)
- `GET /` - List orders (role-based filtering)
- `POST /` - Create new order (restaurant only)
- `PUT /:id/status` - Update order status
- `GET /:id` - Get order details

### Public Routes (`/api/v1/public`)
- `GET /categories` - Product categories
- `GET /featured-listings` - Featured listings for homepage

## Project Architecture

### Folder Structure
```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Base UI components (Button, Input, Modal)
│   ├── forms/          # Form-specific components
│   ├── layout/         # Layout components (Header, Sidebar, Navigation)
│   └── common/         # Common components (LoadingSpinner, ErrorBoundary)
├── pages/              # Route-based page components
│   ├── auth/           # Login, Register, ForgotPassword
│   ├── admin/          # Admin dashboard and features
│   ├── vendor/         # Vendor dashboard and features
│   ├── restaurant/     # Restaurant dashboard and features
│   └── public/         # Public pages (Home, About)
├── hooks/              # Custom React hooks
├── store/              # Redux Toolkit store
│   ├── index.js        # Store configuration
│   ├── slices/         # Redux slices
│   │   ├── authSlice.js    # Authentication state
│   │   ├── cartSlice.js    # Shopping cart state
│   │   ├── notificationSlice.js # Notifications
│   │   └── productsSlice.js # Products state
├── services/           # API service functions
│   ├── api.js          # Axios configuration
│   ├── authService.js  # Authentication API calls
│   ├── listingsService.js # Listings API calls
│   └── ordersService.js # Orders API calls
├── utils/              # Utility functions
├── constants/          # App constants and configuration
└── styles/             # Global styles and Tailwind config
```

### State Management Strategy
- **Redux Toolkit**: For global app state (auth, cart, notifications, products)
- **RTK Query**: For server state management and caching
- **Local State**: React useState for component-specific state
- **Form State**: React Hook Form for form management

## UI Design System & Brand Guidelines

### Design Philosophy: Minimalistic Futurism with Organic Touch

The Aaroth Fresh interface embodies **"Organic Futurism"** - a design language that merges the natural essence of fresh produce with cutting-edge, minimalistic digital experiences. Think Apple's design precision meets sustainable agriculture aesthetics.

#### Core Design Principles
- **Radical Simplicity**: Every element serves a purpose; remove everything that doesn't
- **Futuristic Minimalism**: Clean lines, generous white space, and purposeful micro-interactions
- **Organic Tech**: Natural curves and gradients that feel both high-tech and earth-connected
- **Invisible Interfaces**: Interactions should feel magical and effortless
- **Breathing Room**: Embrace negative space as a design element
- **Subtle Sophistication**: Understated elegance over flashy elements

### Design System Implementation

**Complete color palette, animations, and Tailwind configuration available in:**
- `tailwind.config.js` - Custom colors, gradients, animations, and keyframes
- `src/styles/design-tokens.js` - JavaScript constants for programmatic access
- `src/styles/utilities.css` - Custom utility classes and accessibility support

**Key Design System Elements:**
- **Organic Futurism Color Palette**: Earth-tech fusion colors (`earthy-brown`, `bottle-green`, etc.)
- **Glassmorphism Effects**: `glass`, `glow-green`, `shadow-soft` utilities
- **Micro-Animations**: `animate-fade-in`, `animate-slide-up`, `animate-scale-in`, `animate-glow`, `animate-float`
- **Touch-First Design**: 44px minimum touch targets, mobile-optimized interactions

### Typography System (Futuristic Minimalism)

**Typography configuration available in:** `src/styles/design-tokens.js`

**Key Principles:**
- **System Fonts**: Apple/Google optimized font stack for performance
- **Generous Line Heights**: 1.6-1.8 for readability and breathing room  
- **Selective Bold Usage**: Prefer font-medium (500) over font-bold (700)
- **Hierarchy Through Scale & Color**: Use Tailwind's text sizes with strategic color contrast

### Component Design Patterns (Futuristic Minimalism)

**Complete component patterns and class combinations available in:** `src/styles/design-tokens.js` - `components` object

**Pattern Categories:**
- **Buttons**: Primary CTA with glow effects, glass morphism, ghost buttons, floating action buttons
- **Cards & Containers**: Floating glass effects, organic curves, modal dialogs, responsive containers  
- **Form Elements**: Borderless focus inputs, floating labels, organic toggles, accessibility-compliant focus rings
- **Navigation**: Floating glass bars, hidden drawer navigation, subtle hover states

**Key Pattern Principles:**
- **44px Minimum Touch Targets**: All interactive elements meet accessibility requirements
- **Glassmorphism Effects**: Backdrop-blur with subtle transparency layers
- **Organic Curves**: 16px-32px border radius preference for natural feel
- **Invisible Interactions**: Subtle hover states and micro-feedback

### Mobile-First Design Principles

**Complete responsive system and touch patterns available in:** `src/styles/design-tokens.js` - `spacing` and `breakpoints` objects

**Key Mobile-First Standards:**
- **Touch Targets**: 44px minimum, 48px optimal for primary actions (utilities: `.touch-target`, `.touch-target-large`)
- **Responsive Breakpoints**: sm (640px), md (768px), lg (1024px), xl (1280px), 2xl (1536px)
- **Gesture Patterns**: Swipeable cards, pull-to-refresh, floating action menus, sticky positioning
- **Organic Grid Systems**: Adaptive grids, masonry layouts, asymmetric beauty with natural flow

### Animation & Transitions (Invisible Magic)

**Complete animation system available in:** `tailwind.config.js` (animations & keyframes) and `src/styles/design-tokens.js` (durations & easing)

**Micro-Interactions Philosophy:**
- **Purposeful Motion**: Every animation communicates state or guides attention
- **Organic Easing**: `ease-out` for entrances, `ease-in` for exits, 60fps performance
- **Duration Standards**: 100ms (instant), 200ms (fast), 300ms (normal), 500ms (slow), 800ms (cinematic)

**Animation Categories:**
- **Entrance Animations**: `animate-fade-in`, `animate-slide-up`, `animate-scale-in`
- **Living Interface**: Hover states with subtle transforms and glow effects
- **Loading States**: `animate-pulse`, `animate-float` for zen-like patience
- **Accessibility**: `prefers-reduced-motion` support in `src/styles/utilities.css`

### Additional Design System Elements

**Comprehensive specifications available in project files:**

- **Iconography**: Lucide React library, size standards (16px-32px), semantic color usage
- **Loading & Empty States**: Skeleton screens, spinners, progress bars, thoughtful empty states  
- **Accessibility Standards**: WCAG 2.1 AA compliance, focus management, ARIA labels
- **Spacing System**: Tailwind's scale (4px base unit), touch-friendly spacing
- **Dark Mode**: Future consideration with color palette adjustments

**Key Accessibility Features:**
- **Color Contrast**: 4.5:1 minimum ratio, 7:1 preferred for premium accessibility
- **Focus Management**: Modern focus rings, keyboard navigation support, screen reader optimization
- **Motion Accessibility**: `prefers-reduced-motion` support in `src/styles/utilities.css`


## Development Guidelines

### Code Style & Standards
- **JavaScript**: Modern ES6+ syntax with ESLint configuration
- **ESLint**: Airbnb configuration with React hooks
- **Prettier**: Consistent code formatting
- **File Naming**: kebab-case for files, PascalCase for components
- **Import Order**: External packages → internal modules → relative imports
- **PropTypes**: Runtime type checking for component props

### Component Development
- **Mobile-First**: Always design for mobile, then scale up
- **Accessibility**: WCAG 2.1 AA compliance
- **Performance**: Lazy loading, code splitting, image optimization
- **Reusability**: Create composable, reusable components
- **Testing**: Unit tests for utilities, integration tests for components

### API Integration Best Practices
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **Loading States**: Show loading indicators for all async operations
- **Caching**: Use RTK Query for smart caching and background updates
- **Optimistic Updates**: For better user experience with Redux Toolkit
- **Retry Logic**: Automatic retry for failed requests

## Mobile-First Design Principles

### Responsive Breakpoints (Tailwind CSS)
- **sm**: 640px (small tablets)
- **md**: 768px (tablets)
- **lg**: 1024px (laptops)
- **xl**: 1280px (desktops)
- **2xl**: 1536px (large desktops)

### Touch-Friendly Design
- **Minimum touch targets**: 44px × 44px
- **Swipe gestures**: For navigation and actions
- **Pull-to-refresh**: On list views
- **Bottom navigation**: For mobile users

## Performance Optimization

### Bundle Optimization
- **Code Splitting**: Route-based and component-based
- **Tree Shaking**: Remove unused code
- **Dynamic Imports**: Lazy load heavy components
- **Bundle Analysis**: Regular analysis of bundle size

### Runtime Performance
- **React.memo**: For expensive components
- **useMemo/useCallback**: For expensive calculations
- **Virtual Scrolling**: For long lists
- **Image Optimization**: WebP format, lazy loading, responsive images

## Security Considerations

### Authentication Security
- **JWT Storage**: Secure storage with httpOnly cookies (if possible)
- **Token Expiration**: Standard JWT expiration handling
- **Route Protection**: Client-side and server-side validation
- **Role Validation**: Verify user permissions on each protected action

### Data Security
- **Input Validation**: Client-side and server-side validation
- **XSS Prevention**: Sanitize user inputs
- **API Security**: Validate all API responses
- **Environment Variables**: Secure handling of sensitive configuration

## Testing Strategy

### Testing Stack
- **Test Runner**: Vitest (optimized for Vite projects)
- **Testing Library**: React Testing Library + @testing-library/jest-dom
- **Environment**: jsdom for browser simulation
- **Coverage**: Built-in c8 coverage reporting
- **Redux Testing**: Redux Testing Library for state management tests

**Testing Configuration and Utilities:**
- `vite.config.js` - Vitest configuration with jsdom and coverage
- `src/test/setup.js` - Global test setup and mocks
- `src/test/test-utils.jsx` - Redux testing utilities and providers
- Comprehensive test suites in `src/**/__tests__/` directories

### Unit Tests
- **Components**: Test component behavior and props with React Testing Library
- **Hooks**: Test custom hooks in isolation using @testing-library/react-hooks
- **Utilities**: Test utility functions thoroughly with Vitest
- **Redux Slices**: Test Redux Toolkit slice reducers and actions

### Integration Tests
- **User Flows**: Test complete user workflows with Redux Testing Library
- **API Integration**: Test API service functions with Vitest mocks
- **Form Validation**: Test form submission and validation
- **Error Handling**: Test error scenarios and recovery

## Deployment & Build

### Build Configuration
- **Environment Variables**: Different configs for dev/staging/production
- **Asset Optimization**: Minification, compression, caching headers
- **Bundle Analysis**: Monitor bundle size and dependencies

### Production Checklist
- [ ] Environment variables configured
- [ ] API endpoints pointing to production
- [ ] Error tracking configured (Sentry, etc.)
- [ ] Analytics configured (if required)
- [ ] Performance monitoring enabled
- [ ] Security headers configured
- [ ] HTTPS enabled
- [ ] Domain and CORS configured

## Common Development Patterns

### Implementation Examples

**Complete implementation patterns available in:**
- `src/store/index.js` - Redux Toolkit store configuration with RTK Query
- `src/store/slices/authSlice.js` - Authentication state management with localStorage  
- `src/store/slices/apiSlice.js` - RTK Query API endpoints with 401 handling
- `src/components/auth/ProtectedRoute.jsx` - Role-based route protection
- Component integration examples throughout `src/components/` and `src/pages/`

## Error Handling Standards

### Global Error Handling
- **Error Boundary**: Catch and handle React errors
- **API Error Interceptor**: Handle HTTP errors globally
- **Toast Notifications**: User-friendly error messages
- **Error Logging**: Log errors for debugging (development/staging)

### User Experience
- **Graceful Degradation**: App remains functional during errors
- **Clear Error Messages**: Actionable error messages for users
- **Retry Mechanisms**: Allow users to retry failed operations

**Authentication and Application Setup:**
- `src/services/authService.js` - Authentication utility service with role checking
- `src/App.jsx` - Application bootstrap with authentication validation
- `src/hooks/useListingActions.js` - Custom hooks for listing management
- `src/hooks/useProfileActions.js` - Profile and manager management hooks

## Important Notes for Claude Code

### Authentication Context
- **CRITICAL**: This app uses PHONE-based authentication, not email
- **Phone Format**: Always include country code validation
- **Backend Compatibility**: Ensure frontend auth matches backend exactly
- **Role System**: Four distinct roles with different permissions

### Mobile Priority
- **Mobile-First**: Always prioritize mobile user experience
- **Touch Optimization**: All interactions must be touch-friendly
- **Performance**: Mobile users have slower connections and less powerful devices

### Development Workflow
- **Use TodoWrite**: For complex multi-step tasks
- **Follow Architecture**: Adhere to the folder structure and patterns
- **Test Early**: Write tests alongside feature development
- **Performance First**: Consider performance implications of every decision

### Backend Integration
- **API Consistency**: Match backend data structures exactly
- **Error Handling**: Handle backend errors gracefully
- **Loading States**: Provide feedback for all async operations
- **Caching Strategy**: Use TanStack Query for efficient data management

### UI Consistency (Brand DNA)
- **Minimalistic Philosophy**: Every pixel serves a purpose - if it doesn't add value, remove it
- **Futuristic Touches**: Embrace glassmorphism, subtle glows, and organic curves
- **Invisible Interactions**: The best interface is the one users don't notice
- **Breathing Room**: White space is not empty space - it's a design element
- **Brand Colors**: Use the earth-tech palette consistently but sparingly
- **Touch Excellence**: All interactions must feel responsive and delightful
- **Accessibility**: Beautiful design that works for everyone
- **Performance**: Smooth 60fps animations, optimized for mobile
- **Organic Tech**: Blend natural forms with digital precision
- **Spatial Awareness**: Use depth and layering to create visual hierarchy

### Critical Implementation Notes

#### Futuristic Minimalism Guidelines
1. **Less is Exponentially More**: Start with nothing, add only what's essential
2. **Invisible Design**: Users should accomplish tasks without thinking about the interface
3. **Organic Curves**: Prefer rounded corners (16px-32px) over sharp edges
4. **Depth Through Layers**: Use backdrop-blur, shadows, and transparency for depth
5. **Micro-Interactions**: Every touch should provide subtle, meaningful feedback
6. **Breathing Typography**: Generous line-height (1.6-1.8) and letter-spacing
7. **Color Restraint**: Use brand colors as accents, not dominants
8. **Motion Purpose**: Animate to guide attention or communicate state changes
9. **Glass Aesthetics**: Incorporate glassmorphism for modern depth
10. **Touch-First**: Design for fingers, adapt for mouse

#### Component Philosophy
- **Invisible Until Needed**: Elements appear only when relevant (contextual menus, progressive disclosure)
- **Gesture-Driven**: Embrace swipes, pulls, and natural mobile interactions
- **Anticipatory Design**: Interface adapts to user behavior and context
- **Zero Learning Curve**: Intuitive interactions that feel natural
- **Emotional Connection**: Subtle animations that make users smile
- **Progressive Enhancement**: Start minimal, reveal complexity when needed