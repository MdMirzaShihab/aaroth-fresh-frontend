# Admin Panel Complete Overhaul - Sequential Prompts

## ⚠️  CRITICAL IMPLEMENTATION CONSTRAINTS

**BACKEND-ONLY FUNCTIONALITY**: All admin interface features must correspond directly to backend API endpoints documented in ADMIN_INTERFACE_PLAN.md. Do NOT implement:
- Mock data or placeholder functionality
- Features without backend API support
- Decorative UI elements that don't serve API-backed functionality
- Client-side-only data processing or calculations
- Synthetic metrics or made-up statistics

**LEVERAGE EXISTING INFRASTRUCTURE**:
- ✅ **Use existing UI components** from `src/components/ui/`
- ✅ **Use existing theme system** from `src/hooks/useTheme.js`
- ✅ **Utilize available libraries** from package.json (chart.js, framer-motion, react-hook-form, etc.)
- ✅ **Follow existing code patterns** and architectural conventions

**FOCUS ON INTEGRATION, NOT RECREATION**: Build admin-specific business logic that integrates with existing infrastructure rather than rebuilding foundational components.

---

## PROMPT 1: Foundation & Architecture Setup

**Objective**: Establish the core infrastructure for the new admin panel with proper architecture, component library foundation, theme system, and comprehensive API integration setup.

### Context & References
You are implementing a complete overhaul of the Aaroth Fresh admin panel based on these key documents:
- **ADMIN_INTERFACE_PLAN.md**: Contains complete API inventory (44 endpoints), interface architecture, and implementation specifications
- **ui-patterns-reference.md**: Provides Organic Futurism design patterns, component examples, and styling guidelines  
- **CLAUDE.md**: Contains project instructions, design system guidelines, and Tailwind configuration
- **Current admin files**: Located in `src/pages/admin/` and `src/components/admin/` for reference
- **Existing UI Components**: Located in `src/components/ui/` - already redesigned with Organic Futurism design system
- **Existing Theme System**: `src/hooks/useTheme.js` - complete dark/light mode functionality already implemented

### Current State Analysis
The existing admin system has basic functionality but lacks:
- Sophisticated architecture and proper API coverage (only covers ~30% of available endpoints)
- Integration with existing Organic Futurism UI components in `src/components/ui/`
- Mobile-first responsive design for admin workflows
- Professional UX for B2B workflows
- Proper component organization and reusability

**IMPORTANT**: The core UI component library and theme system are already implemented:
- ✅ **UI Components**: `src/components/ui/` contains Button, Card, Modal, Table, Input, Charts, etc.
- ✅ **Theme System**: `src/hooks/useTheme.js` provides complete dark/light mode functionality
- ✅ **Design System**: All existing components follow Organic Futurism principles

### Implementation Tasks

#### 1.1 Directory Structure & Architecture Setup
Create the new admin architecture following the interface plan:

```
src/
├── pages/admin-v2/
│   ├── dashboard/
│   │   ├── DashboardPage.jsx
│   │   └── components/
│   ├── users/
│   │   ├── UsersManagementPage.jsx
│   │   ├── CreateRestaurantOwner.jsx
│   │   ├── CreateRestaurantManager.jsx
│   │   └── components/
│   ├── vendors/
│   │   ├── VendorsManagementPage.jsx
│   │   ├── VerificationQueue.jsx
│   │   └── components/
│   ├── restaurants/
│   │   ├── RestaurantsManagementPage.jsx
│   │   └── components/
│   ├── catalog/
│   │   ├── products/
│   │   ├── categories/
│   │   ├── listings/
│   │   └── components/
│   ├── analytics/
│   │   ├── BusinessAnalytics.jsx
│   │   ├── PerformanceMonitoring.jsx
│   │   └── components/
│   ├── settings/
│   │   ├── SystemSettings.jsx
│   │   └── components/
│   └── index.js
├── components/admin-v2/
│   ├── ui/
│   │   ├── Button/
│   │   ├── Card/
│   │   ├── Modal/
│   │   ├── Form/
│   │   ├── DataTable/
│   │   ├── StatusBadge/
│   │   ├── LoadingStates/
│   │   └── index.js
│   ├── layout/
│   │   ├── AdminLayout/
│   │   ├── Sidebar/
│   │   ├── Header/
│   │   ├── Navigation/
│   │   └── index.js
│   ├── business/
│   │   ├── ApprovalWorkflow/
│   │   ├── VerificationBadge/
│   │   ├── BusinessCard/
│   │   └── index.js
│   └── charts/
│       ├── MetricsChart/
│       ├── AnalyticsChart/
│       └── index.js
└── services/admin-v2/
    ├── dashboardService.js
    ├── usersService.js
    ├── vendorsService.js
    ├── restaurantsService.js
    ├── catalogService.js
    ├── analyticsService.js
    ├── performanceService.js
    ├── settingsService.js
    └── index.js
```

#### 1.2 Theme System Integration
**IMPORTANT**: Use existing theme system - DO NOT recreate it!

**Existing Theme System**: `src/hooks/useTheme.js`
- Already implemented with Redux-based state management
- Complete dark/light mode toggle functionality
- System preference detection
- Full Tailwind CSS dark mode integration

**Integration Instructions**:
```javascript
// Import and use existing theme system
import { useTheme } from '../../../hooks/useTheme';

const AdminComponent = () => {
  const { theme, isDarkMode, toggleTheme } = useTheme();
  
  return (
    <div className={`admin-component ${isDarkMode ? 'dark-theme-styles' : 'light-theme-styles'}`}>
      {/* Use existing theme context */}
    </div>
  );
};
```

#### 1.3 Existing UI Component Integration + Available Libraries
**IMPORTANT**: Use existing UI components and leverage available libraries - DO NOT recreate them!

**Existing UI Component Library**: `src/components/ui/`
Already implemented with Organic Futurism design:
- ✅ **Button.jsx**: Primary, secondary, and custom button variants
- ✅ **Card.jsx**: Professional card layouts with glassmorphism
- ✅ **Modal.jsx**: Advanced modal system with backdrop blur
- ✅ **Input.jsx & FormField.jsx**: Form components with validation
- ✅ **Table.jsx**: Professional data tables
- ✅ **LoadingSpinner.jsx**: Themed loading states
- ✅ **Charts/**: SimpleBarChart, SimpleLineChart, SimplePieChart
- ✅ **Toast.jsx**: Notification system
- ✅ **FileUpload.jsx**: Drag-drop file upload
- ✅ **And many more...**

**Available Libraries for Enhancement**:
- `framer-motion`: Smooth transitions and animations
- `react-hot-toast`: User feedback (already installed)
- `react-csv`: Data export functionality
- `react-hook-form`: Complex form management
- `date-fns`: Date formatting and manipulation
- `chart.js` + `react-chartjs-2`: Advanced analytics charts
- `html2canvas`, `html2pdf.js`, `jspdf`: Report generation

**Integration Pattern**:
```javascript
// Import existing components and available libraries
import { 
  Button, 
  Card, 
  Modal, 
  Input, 
  Table, 
  LoadingSpinner 
} from '../../../components/ui';
import { SimpleBarChart } from '../../../components/ui/charts';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { CSVLink } from 'react-csv';
import { format } from 'date-fns';

// Create only admin-specific business logic components
const AdminSpecificComponent = () => {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Card className="admin-card">
        <Button variant="primary">Existing Button Component</Button>
      </Card>
    </motion.div>
  );
};
```

**Focus Areas for New Components**:
- Admin-specific business logic components (ApprovalWorkflow, VerificationQueue)
- Business entity cards (VendorCard, RestaurantCard) 
- Admin dashboard widgets with chart.js integration
- Workflow-specific interfaces
- Export functionality using react-csv
- Form components using react-hook-form
- Animated transitions using framer-motion

**CRITICAL CONSTRAINT**: Only implement features that correspond to actual backend API endpoints from ADMIN_INTERFACE_PLAN.md. No decorative or mock functionality.

#### 1.4 API Integration Setup (Backend-Only Constraint)
Set up comprehensive RTK Query integration for all 44 admin endpoints from ADMIN_INTERFACE_PLAN.md.

**IMPORTANT CONSTRAINT**: Only implement API calls and UI elements that have corresponding backend endpoints. Do not add:
- Mock data or placeholder functionality
- Features not supported by the backend API
- Decorative UI elements without backend purpose
- Data displays that don't map to actual API responses

**Create**: `src/store/slices/admin-v2/adminApiSlice.js`
```javascript
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const adminApiSlice = createApi({
  reducerPath: 'adminApiV2',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/v1/admin',
    prepareHeaders: (headers, { getState }) => {
      // JWT token handling
    },
  }),
  tagTypes: [
    'Dashboard', 'Users', 'Vendors', 'Restaurants', 
    'Products', 'Categories', 'Listings', 'Analytics',
    'Performance', 'Settings'
  ],
  endpoints: (builder) => ({
    // Dashboard & Analytics (7 APIs)
    getDashboardOverview: builder.query({
      query: () => 'dashboard/overview',
      providesTags: ['Dashboard'],
    }),
    getAnalyticsOverview: builder.query({
      query: (params) => ({
        url: 'analytics/overview',
        params,
      }),
      providesTags: ['Analytics'],
    }),
    // ... implement all 44 endpoints from ADMIN_INTERFACE_PLAN.md
  }),
});
```

**Service Layer Architecture**:
Create dedicated service files for each major area:

- `dashboardService.js`: Dashboard and overview APIs
- `usersService.js`: User management and role creation
- `vendorsService.js`: Vendor management and verification
- `restaurantsService.js`: Restaurant management
- `catalogService.js`: Products, categories, and listings
- `analyticsService.js`: Business analytics and reporting
- `performanceService.js`: Admin performance monitoring
- `settingsService.js`: System configuration

#### 1.5 Error Handling & Loading States
Implement comprehensive error handling following CLAUDE.md guidelines:

**Use Existing Components**: `src/components/ui/`
- ✅ **LoadingSpinner.jsx**: Already implemented with olive-themed styling
- ✅ **skeletons.jsx**: Skeleton components with organic shapes
- ✅ **EmptyState.jsx**: Thoughtful empty state design
- ✅ **Toast.jsx**: Complete notification system
- ✅ **accessibility.jsx**: Accessibility utilities

**Create Only Admin-Specific Components**:
- **StatusBadge**: B2B-specific status indicators for admin workflows
- **ApprovalBadge**: Verification status badges
- **AdminProgressBar**: Workflow progress indicators

### Implementation Guidelines

#### Design System Compliance
- Follow Organic Futurism principles throughout
- Use the olive-centered color palette from Tailwind config
- Implement 5-layer glassmorphism system
- Ensure mobile-first responsive design
- Maintain 44px minimum touch targets

#### Code Quality Standards
- Use TypeScript-style JSDoc comments
- Follow existing ESLint configuration
- Implement proper error boundaries
- Add prop validation where needed
- Write clean, readable component code

#### API Integration Standards
- Use RTK Query for all server state
- Implement proper error handling with retry logic
- Add loading states for all async operations
- Use optimistic updates where appropriate
- Implement proper cache invalidation

### Validation Criteria

After completing this prompt:
1. ✅ New directory structure is established
2. ✅ Existing theme system is properly integrated (using `src/hooks/useTheme.js`)
3. ✅ Existing UI components are properly imported and used
4. ✅ All 44 API endpoints are defined in RTK Query
5. ✅ Service layer architecture is established
6. ✅ Admin-specific components work with existing UI library
7. ✅ Components follow mobile-first responsive design
8. ✅ Integration with existing glassmorphism effects works in both themes
9. ✅ No duplication of existing functionality
10. ✅ Proper import statements for existing components

### Next Prompt Preparation
Document the following for continuity:
- List of implemented components and their locations
- API endpoints integration status
- Theme system capabilities
- Any deviations from the original plan
- Component inventory for future reference

---

## PROMPT 2: Layout System & Navigation

**Objective**: Create the complete admin layout system with glassmorphic navigation, responsive design, professional header, and mobile-first B2B interface.

### Context & References
Building on Prompt 1's foundation, implement the layout system using:
- **ADMIN_INTERFACE_PLAN.md**: Navigation structure and interface architecture
- **ui-patterns-reference.md**: Navigation patterns, glassmorphism, and mobile-first design
- **Current AdminLayout.jsx**: Reference for existing navigation structure
- **Existing UI Components**: Use components from `src/components/ui/` for consistent styling
- **Existing Theme System**: Integrate with `src/hooks/useTheme.js`

### Current Implementation Status
From Prompt 1, you should have:
- Directory structure in place
- Integration with existing theme system (`src/hooks/useTheme.js`)
- Integration with existing UI component library (`src/components/ui/`)
- API integration framework
- Admin-specific components built on existing foundation

### Implementation Tasks

#### 2.1 New AdminLayout Implementation
**Create**: `src/components/admin-v2/layout/AdminLayout/AdminLayout.jsx`

Implement the complete admin layout following the navigation structure from ADMIN_INTERFACE_PLAN.md:

```javascript
// Navigation structure from ADMIN_INTERFACE_PLAN.md:
// 📊 DASHBOARD (Landing Page)
// 🏢 BUSINESS ENTITIES
//   ├── 👥 Users Management
//   ├── 🏪 Vendors Management  
//   └── 🍴 Restaurants Management
// 📦 CATALOG MANAGEMENT
//   ├── 📱 Products
//   ├── 📂 Categories
//   └── 📋 Listings
// 📊 ANALYTICS & INSIGHTS
//   ├── 📈 Business Analytics
//   ├── 🎯 Performance Monitoring
//   └── 📋 Activity Monitoring
// ⚙️ SYSTEM MANAGEMENT
//   ├── 🔧 Settings Management
//   └── 📊 System Monitoring
```

**Key Features**:
- Olive-themed glassmorphic sidebar with backdrop blur
- Professional navigation with proper iconography
- Badge system for pending verifications
- Responsive mobile drawer navigation
- Dark/light theme support
- Real-time notification indicators

#### 2.2 Responsive Sidebar Navigation
**Create**: `src/components/admin-v2/layout/Sidebar/Sidebar.jsx`

Implement the OliveSidebar pattern from ui-patterns-reference.md:
- Fixed sidebar for desktop (≥1024px)
- Slide-out drawer for mobile/tablet
- Olive accent borders and sage highlights
- Smooth animations and hover effects
- Hierarchical menu structure with expandable sections

**Navigation Items Configuration**:
```javascript
const navigationStructure = [
  {
    section: 'Overview',
    items: [
      { path: '/admin-v2/dashboard', label: 'Dashboard', icon: LayoutDashboard }
    ]
  },
  {
    section: 'Business Entities',
    items: [
      { path: '/admin-v2/users', label: 'Users Management', icon: Users },
      { path: '/admin-v2/vendors', label: 'Vendors Management', icon: Truck, badge: 'pendingVendors' },
      { path: '/admin-v2/restaurants', label: 'Restaurants Management', icon: Store, badge: 'pendingRestaurants' }
    ]
  },
  // ... complete structure from ADMIN_INTERFACE_PLAN.md
];
```

#### 2.3 Professional Header System
**Create**: `src/components/admin-v2/layout/Header/Header.jsx`

Implement the floating glass header from ui-patterns-reference.md:
- Fixed positioning with backdrop blur
- Professional branding with Aaroth Fresh logo
- User profile dropdown with admin information
- Global search functionality
- Notification center with real-time updates
- Theme toggle with enhanced 3D effects

**Header Components** (use existing UI components + available libraries):
- `GlobalSearch.jsx`: Search using existing `SearchBar` component + `framer-motion` animations
- `NotificationCenter.jsx`: Notifications using `react-hot-toast` (already installed) 
- `UserProfile.jsx`: Profile using existing `Button` and `Modal` components
- `QuickActions.jsx`: Shortcuts using existing `Button` components + export features

**Available Libraries for Enhancement**:
- `framer-motion`: Smooth header animations and transitions
- `react-hot-toast`: Professional notification system
- `react-csv`: Export functionality in quick actions

#### 2.4 Mobile-First Navigation
**Create**: `src/components/admin-v2/layout/MobileNavigation/MobileNavigation.jsx`

Implement mobile-specific navigation patterns:
- Hamburger menu with smooth animations
- Touch-optimized controls (44px minimum)
- Swipe gestures for drawer interaction
- Bottom navigation for primary actions
- Mobile-specific layout adjustments

**Mobile Components** (leverage existing UI + libraries):
- `MobileDrawer.jsx`: Drawer using existing `Modal` + `framer-motion` slide animations
- `MobileHeader.jsx`: Header using existing `Button` components + `react-hot-toast` feedback
- `TouchNavigationBar.jsx`: Navigation using existing `Button` + smooth transitions
- `MobileSearch.jsx`: Search using existing components + enhanced UX patterns

#### 2.5 Breadcrumb Navigation System
**Create**: `src/components/admin-v2/layout/Breadcrumb/Breadcrumb.jsx`

Implement contextual breadcrumb navigation:
- Dynamic breadcrumb generation based on route
- Clickable navigation history
- Current page highlighting
- Mobile-responsive breadcrumb display
- Integration with routing system

#### 2.6 Layout Context & State Management
**Create**: `src/hooks/admin-v2/useAdminLayout.js`

Provide layout state management:
```javascript
export const useAdminLayout = () => {
  // Sidebar open/close state
  // Mobile drawer state
  // Current navigation context
  // Breadcrumb state
  // Theme integration
  // Notification state
};
```

### Advanced Features Implementation

#### 2.7 Real-time Notifications
Integrate WebSocket connections for live updates:
- Pending verification notifications
- System alerts and status updates
- User activity monitoring
- Performance threshold alerts
- Real-time badge updates in navigation

#### 2.8 Navigation Performance Optimization
- Lazy load navigation sections
- Optimize re-renders with React.memo
- Implement virtual scrolling for large menus
- Cache navigation state in localStorage
- Preload critical admin pages

#### 2.9 Accessibility & Keyboard Navigation
- Full keyboard navigation support
- ARIA labels for screen readers
- Focus management and trap
- High contrast mode support
- Screen reader announcements for state changes

### Styling Implementation

#### 2.10 Glassmorphism Integration
Use the 5-layer glass system from ui-patterns-reference.md:
- `glass-1` through `glass-5` for navigation depth
- Dark mode variants (`glass-1-dark` through `glass-5-dark`)
- Olive-themed glass effects (`glass-card-olive`)
- Professional shadow system (`shadow-depth-1` through `shadow-depth-5`)

#### 2.11 Responsive Design Implementation
Follow mobile-first breakpoints:
- Mobile (320px+): Drawer navigation, touch controls
- Tablet (768px+): Enhanced layout, hybrid interaction
- Desktop (1024px+): Full sidebar, advanced features
- Large screens (1440px+): Extended layouts, multi-panel views

### Integration with Existing Systems

#### 2.12 Route Configuration
Update routing to use the new admin layout:
```javascript
// Update App.jsx or routing configuration
const adminV2Routes = [
  {
    path: '/admin-v2',
    element: <AdminLayoutV2 />,
    children: [
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'users', element: <UsersManagementPage /> },
      // ... all admin routes
    ]
  }
];
```

#### 2.13 API Integration for Navigation
Connect navigation to real-time data:
- Badge counts from verification endpoints
- User permissions for menu visibility
- System health status for navigation indicators
- Performance metrics for admin analytics

### Validation Criteria

After completing this prompt:
1. ✅ AdminLayout renders with glassmorphic sidebar
2. ✅ Navigation structure matches ADMIN_INTERFACE_PLAN.md
3. ✅ Mobile drawer works with touch gestures
4. ✅ Header includes search, notifications, and user profile
5. ✅ Breadcrumb navigation works dynamically
6. ✅ Theme toggle works across all layout components
7. ✅ Real-time badge updates function properly
8. ✅ Keyboard navigation is fully accessible
9. ✅ Responsive design works across all breakpoints
10. ✅ Integration with routing system is complete

### Next Prompt Preparation
Document for continuity:
- Layout system capabilities and components
- Navigation structure implementation status
- Mobile-first design patterns established
- Real-time integration status
- Component library additions from this phase

---

## PROMPT 3: Dashboard Implementation

**Objective**: Create the comprehensive admin dashboard with real-time metrics, interactive charts, business insights, and WebSocket integration following the dashboard specifications.

**CRITICAL CONSTRAINT**: Only implement dashboard features that map directly to backend API endpoints from ADMIN_INTERFACE_PLAN.md. No mock data or non-API-backed functionality.

**Available Libraries for Dashboard Enhancement**:
- `chart.js` + `react-chartjs-2`: Professional analytics charts and data visualization
- `react-csv`: Export dashboard data and reports
- `framer-motion`: Smooth chart animations and transitions
- `react-hot-toast`: Success/error feedback for dashboard actions
- `date-fns`: Date formatting for analytics data
- `html2canvas` + `html2pdf.js` + `jspdf`: Dashboard report generation

### Context & References
Building on the foundation and layout from Prompts 1-2:
- **ADMIN_INTERFACE_PLAN.md**: Dashboard specifications (Section "📊 DASHBOARD (Landing Page)")
- **ui-patterns-reference.md**: Card patterns, metrics display, and chart components
- **Current AdminDashboard.jsx**: Reference for existing API integrations
- **Layout System**: Built in Prompt 2 for consistent navigation
- **Component Library**: UI components from Prompt 1

### Current Implementation Status
From previous prompts, you should have:
- Complete directory structure and theme system
- AdminLayout with glassmorphic navigation
- Core UI component library with cards and forms
- API integration framework with RTK Query
- Mobile-first responsive foundation

### Implementation Tasks

#### 3.1 Dashboard Page Structure
**Create**: `src/pages/admin-v2/dashboard/DashboardPage.jsx`

Implement the dashboard layout from ADMIN_INTERFACE_PLAN.md:

**Components Structure**:
- **🏆 Hero KPI Cards**: Total vendors, restaurants, products, active listings
- **📊 Business Metrics Chart**: Revenue trends, order volume analytics  
- **🔔 Recent Activity Feed**: Latest registrations, verifications, system alerts
- **⚡ Quick Action Panel**: Emergency controls, bulk operations, cache management
- **🚨 System Health Alerts**: API response times, database performance, SLA compliance

#### 3.2 Hero KPI Cards Implementation
**Create**: `src/pages/admin-v2/dashboard/components/HeroKPICards.jsx`

Implement the MetricsCard pattern from ui-patterns-reference.md:

```javascript
const HeroKPICards = () => {
  // API Integration from ADMIN_INTERFACE_PLAN.md:
  // GET /api/v1/admin/dashboard/overview
  // GET /api/v1/admin/analytics/overview?period=monthly
  
  const kpiMetrics = [
    {
      title: 'Total Users',
      value: dashboardData.totalUsers,
      trend: '+12%',
      icon: Users,
      color: 'blue',
      description: 'Registered users on platform'
    },
    {
      title: 'Total Vendors', 
      value: dashboardData.totalVendors,
      trend: '+8%',
      icon: Truck,
      color: 'green',
      description: 'Active vendor businesses',
      urgent: pendingVerifications > 10
    },
    // ... implement all KPI cards with real data
  ];
};
```

**Features**:
- Real-time data updates via RTK Query
- Trend indicators with color coding
- Click-through navigation to detailed views  
- Urgent verification alerts
- Growth percentage calculations
- Mobile-responsive card grid

#### 3.3 Business Metrics Charts
**Create**: `src/pages/admin-v2/dashboard/components/BusinessMetricsChart.jsx`

Implement interactive charts using a charting library (Chart.js or Recharts):

**Chart Types**:
- Revenue trends (daily/weekly/monthly)
- Order volume analytics with time series
- User registration patterns
- Business verification completion rates
- Geographic distribution of vendors/restaurants

**Features**:
- Interactive time range selector (7D, 30D, 90D, 1Y)
- Drill-down capabilities from summary to detail
- Export functionality (PNG, SVG, PDF)
- Real-time data updates
- Mobile-responsive charts

#### 3.4 Recent Activity Feed
**Create**: `src/pages/admin-v2/dashboard/components/RecentActivityFeed.jsx`

Implement real-time activity monitoring:

**Activity Types**:
- New vendor/restaurant registrations
- Recent verifications and status changes
- System alerts and notifications
- Order processing milestones
- Admin actions and audit trails

**Features**:
- WebSocket integration for live updates
- Infinite scroll for activity history
- Filtering by activity type
- Click-through to relevant admin sections
- Time-based grouping (today, yesterday, this week)

#### 3.5 Quick Action Panel
**Create**: `src/pages/admin-v2/dashboard/components/QuickActionPanel.jsx`

Implement the emergency controls and shortcuts:

**Quick Actions**:
- Review Pending Verifications (with count badge)
- System Maintenance Mode Toggle
- Clear Analytics Cache
- Bulk Vendor Operations
- Generate System Reports
- Emergency User Disabling

**Features**:
- Permission-based action visibility
- Confirmation modals for destructive actions
- Progress tracking for bulk operations
- Real-time status updates

#### 3.6 System Health Monitoring
**Create**: `src/pages/admin-v2/dashboard/components/SystemHealthWidget.jsx`

Implement comprehensive system monitoring:

**Health Metrics**:
- API response times and availability
- Database performance indicators
- SLA compliance tracking
- Error rates and alerts
- Active user sessions
- System resource utilization

**Features**:
- Real-time health status indicators
- Historical performance trends
- Alert thresholds and notifications
- Integration with performance monitoring APIs

#### 3.7 Business Verification Pipeline
**Create**: `src/pages/admin-v2/dashboard/components/VerificationPipeline.jsx`

Implement the verification workflow display:

**Pipeline Features**:
- Pending vendor verifications queue
- Pending restaurant verifications queue
- Urgency indicators (7+ days waiting)
- Quick approve/reject actions
- Batch processing capabilities
- Performance metrics (avg processing time)

**Integration**:
- Connect to verification APIs from ADMIN_INTERFACE_PLAN.md
- Real-time updates for verification status
- Navigation to detailed verification workflows

### Advanced Dashboard Features

#### 3.8 WebSocket Integration
**Create**: `src/hooks/admin-v2/useRealtimeDashboard.js`

Implement real-time data streaming:
```javascript
export const useRealtimeDashboard = () => {
  // WebSocket connection for dashboard updates
  // Real-time KPI updates
  // Live activity feed
  // System health monitoring
  // Notification streaming
};
```

#### 3.9 Dashboard Personalization
**Create**: `src/pages/admin-v2/dashboard/components/DashboardSettings.jsx`

Allow admin customization:
- Widget visibility and ordering
- Time range preferences
- Alert thresholds configuration
- Favorite quick actions
- Dashboard layout preferences

#### 3.10 Advanced Analytics Integration
Connect to analytics APIs from ADMIN_INTERFACE_PLAN.md:

**Analytics Endpoints**:
- `/api/v1/admin/analytics/sales`: Sales performance data
- `/api/v1/admin/analytics/users`: User analytics and segmentation
- `/api/v1/admin/analytics/products`: Product performance metrics
- `/api/v1/admin/performance/dashboard`: Admin performance overview

#### 3.11 Export and Reporting
**Create**: `src/pages/admin-v2/dashboard/components/DashboardExport.jsx`

Implement dashboard data export:
- PDF dashboard snapshots
- CSV data exports for metrics
- Scheduled report generation
- Email report delivery
- Custom report builder

### API Integration Implementation

#### 3.12 Dashboard API Service
**Update**: `src/services/admin-v2/dashboardService.js`

```javascript
export const dashboardApiSlice = adminApiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardOverview: builder.query({
      query: () => 'dashboard/overview',
      providesTags: ['Dashboard'],
    }),
    getAnalyticsOverview: builder.query({
      query: (params) => ({
        url: 'analytics/overview',
        params,
      }),
      providesTags: ['Analytics'],
    }),
    clearAnalyticsCache: builder.mutation({
      query: () => ({
        url: 'analytics/cache',
        method: 'DELETE',
      }),
      invalidatesTags: ['Analytics', 'Dashboard'],
    }),
    // ... implement all dashboard-related endpoints
  }),
});
```

#### 3.13 Performance Monitoring Integration
Connect to performance APIs:
- SLA violation monitoring
- Response time tracking
- Admin efficiency metrics
- System resource monitoring

### Mobile-First Dashboard Design

#### 3.14 Responsive Dashboard Layout
Implement mobile-optimized dashboard:
- Stacked card layout for mobile
- Swipeable chart containers
- Touch-optimized controls
- Progressive disclosure of information
- Mobile-specific navigation patterns

#### 3.15 Touch Interactions
- Pull-to-refresh for dashboard data
- Swipe gestures for chart navigation
- Long-press for quick actions
- Touch-friendly metric cards

### Performance Optimization

#### 3.16 Dashboard Performance
- Lazy loading of dashboard widgets
- Virtual scrolling for activity feeds
- Memoized chart components
- Optimized API polling intervals
- Efficient re-rendering strategies

#### 3.17 Caching Strategy
- Client-side caching of dashboard data
- Background data refreshing
- Stale-while-revalidate patterns
- Offline dashboard capabilities

### Validation Criteria

After completing this prompt:
1. ✅ Dashboard renders with all KPI cards and real data
2. ✅ Business metrics charts display interactive data
3. ✅ Recent activity feed shows live updates
4. ✅ Quick action panel provides functional shortcuts
5. ✅ System health monitoring displays real metrics
6. ✅ Verification pipeline shows pending items
7. ✅ WebSocket integration works for real-time updates
8. ✅ Mobile-responsive design functions across breakpoints
9. ✅ Export functionality generates reports
10. ✅ Performance optimization strategies are implemented
11. ✅ All dashboard APIs are properly integrated
12. ✅ Error handling and loading states work correctly

### Next Prompt Preparation
Document for continuity:
- Dashboard components and their capabilities
- API integration status for dashboard endpoints
- Real-time features implementation status
- Chart and analytics integration details
- Performance optimization implementations

---

## PROMPT 4: User Management System

**Objective**: Build a comprehensive user management system with advanced filtering, role creation, bulk operations, and professional B2B workflows following the user management specifications.

**CRITICAL CONSTRAINT**: Only implement user management features supported by backend APIs. No decorative functionality.

**Available Libraries for User Management**:
- `react-hook-form`: Advanced user forms and validation
- `react-csv`: Export user data functionality
- `framer-motion`: Smooth table interactions and transitions
- `react-hot-toast`: User action feedback
- `date-fns`: User registration/activity date formatting

### Context & References
Building on the dashboard implementation from Prompt 3:
- **ADMIN_INTERFACE_PLAN.md**: Users Management section with API specifications
- **ui-patterns-reference.md**: DataTable patterns, form systems, and modal components
- **Current UserManagement.jsx**: Reference for existing user management patterns
- **Component Library**: UI components built in previous prompts

### Current Implementation Status
From previous prompts, you should have:
- Dashboard with KPI metrics and real-time updates
- AdminLayout with professional navigation
- Complete UI component library with forms and tables
- API integration framework with user endpoints
- Theme system with mobile-first design

### Implementation Tasks

#### 4.1 Users Management Page Structure
**Create**: `src/pages/admin-v2/users/UsersManagementPage.jsx`

Implement the user management interface from ADMIN_INTERFACE_PLAN.md:

**Page Components**:
- **📋 User Directory Table**: Advanced filtering, server-side pagination, bulk selection
- **👤 User Profile Modal**: Complete user info with role-based edit capabilities  
- **🏪 Role Management Panel**: Create restaurant owner/manager forms
- **📊 User Analytics Widget**: Registration trends, geographic distribution

#### 4.2 Advanced User Directory Table
**Create**: `src/pages/admin-v2/users/components/UserDirectoryTable.jsx`

Implement the professional DataTable from ui-patterns-reference.md:

**Table Features**:
- Server-side pagination with configurable page sizes (20, 50, 100)
- Multi-column sorting with visual indicators
- Global search across all user fields (name, email, phone, role, location)
- Advanced filtering (role, status, registration date, verification status)
- Bulk selection with progress tracking
- Export capabilities (CSV, PDF, Excel)
- Real-time data updates

**Column Configuration**:
```javascript
const userTableColumns = [
  { 
    key: 'name', 
    label: 'Name', 
    sortable: true,
    render: (value, user) => (
      <div className="flex items-center gap-3">
        <UserAvatar user={user} size="sm" />
        <div>
          <p className="font-medium text-text-dark">{value}</p>
          <p className="text-xs text-text-muted">{user.email}</p>
        </div>
      </div>
    )
  },
  { 
    key: 'role', 
    label: 'Role', 
    sortable: true,
    render: (value) => <RoleBadge role={value} />
  },
  { 
    key: 'status', 
    label: 'Status', 
    sortable: true,
    render: (value) => <StatusBadge status={value} variant="glass" />
  },
  // ... complete column configuration
];
```

#### 4.3 User Profile Management
**Create**: `src/pages/admin-v2/users/components/UserProfileModal.jsx`

Implement comprehensive user profile management:

**Profile Sections**:
- **Basic Information**: Name, email, phone, location
- **Account Status**: Active, inactive, suspended, verification status
- **Role Information**: Current role, permissions, role history
- **Activity Timeline**: Recent actions, login history, audit trail
- **Business Associations**: Connected restaurants/vendor businesses
- **Verification Documents**: ID verification, business documents

**Edit Capabilities**:
- Role-based editing permissions
- Status management (activate, deactivate, suspend)
- Role assignment and modification
- Contact information updates
- Verification status changes

#### 4.4 Restaurant Owner Creation
**Create**: `src/pages/admin-v2/users/CreateRestaurantOwner.jsx`

Implement the restaurant owner creation form:

**Form Sections**:
- **Owner Information**: Personal details, contact information
- **Business Details**: Restaurant information, business type, locations
- **Verification Documents**: Business license, ID verification
- **Initial Settings**: Default permissions, account preferences
- **Restaurant Assignment**: Connect to existing or create new restaurant

**API Integration**:
```javascript
// From ADMIN_INTERFACE_PLAN.md:
// POST /api/v1/admin/restaurant-owners
// Body: Owner details + restaurant assignment
```

**Features**:
- Step-by-step wizard interface
- Form validation with real-time feedback
- Document upload with drag-drop
- Preview before submission
- Auto-save functionality to prevent data loss

#### 4.5 Restaurant Manager Creation
**Create**: `src/pages/admin-v2/users/CreateRestaurantManager.jsx`

Implement restaurant manager creation with owner assignment:

**Form Features**:
- **Manager Information**: Personal and contact details
- **Owner Assignment**: Select existing restaurant owner
- **Restaurant Selection**: Choose from owner's restaurants
- **Permission Levels**: Define manager capabilities
- **Access Controls**: Set system permissions and restrictions

**API Integration**:
```javascript
// POST /api/v1/admin/restaurant-managers
// Body: Manager details + restaurant + owner assignment
```

#### 4.6 Advanced Filtering System
**Create**: `src/pages/admin-v2/users/components/UserFilters.jsx`

Implement the FilterBar pattern from ui-patterns-reference.md:

**Filter Categories**:
- **Role Filter**: Admin, vendor, restaurant owner, restaurant manager
- **Status Filter**: Active, inactive, pending verification, suspended
- **Date Range**: Registration date, last login, last activity
- **Location Filter**: Geographic filtering with autocomplete
- **Verification Status**: Verified, pending, rejected
- **Business Association**: Users with/without business connections

**Advanced Features**:
- Saved filter sets with custom names
- Quick filter chips for common searches
- Filter history and recent searches
- Export filtered results
- Real-time filter result counts

#### 4.7 Bulk Operations System
**Create**: `src/pages/admin-v2/users/components/BulkOperations.jsx`

Implement the BulkOperationsBar from ui-patterns-reference.md:

**Bulk Actions**:
- **Status Management**: Bulk activate, deactivate, suspend
- **Role Assignment**: Mass role updates with validation
- **Verification**: Bulk approve/reject user verifications
- **Communication**: Send bulk notifications or emails
- **Export**: Export selected user data
- **Delete**: Safe bulk deletion with impact analysis

**Features**:
- Progress tracking with cancellation support
- Batch validation before execution
- Rollback capabilities for reversible actions
- Confirmation dialogs with impact warnings
- Success/failure reporting per item

#### 4.8 User Analytics Dashboard
**Create**: `src/pages/admin-v2/users/components/UserAnalytics.jsx`

Implement user analytics and insights:

**Analytics Metrics**:
- **Registration Trends**: Daily, weekly, monthly growth
- **Role Distribution**: Pie charts of user roles
- **Geographic Distribution**: Map visualization of user locations
- **Activity Patterns**: Login frequency, engagement metrics
- **Verification Metrics**: Approval rates, processing times
- **Retention Analysis**: User retention cohort analysis

**API Integration**:
```javascript
// GET /api/v1/admin/analytics/users?segment=vendors&period=quarterly
// Returns: User registration, activity, retention, geographic data
```

### Advanced User Management Features

#### 4.9 User Communication System
**Create**: `src/pages/admin-v2/users/components/UserCommunication.jsx`

Implement admin-to-user communication:
- Individual user messaging
- Bulk notification system
- Email template management
- SMS notification capabilities
- Communication history tracking

#### 4.10 User Verification Workflow
**Create**: `src/pages/admin-v2/users/components/VerificationWorkflow.jsx`

Implement verification management:
- Document review interface
- Verification status tracking
- Bulk verification processing
- Verification history and audit
- Automated verification rules

#### 4.11 User Import/Export System
**Create**: `src/pages/admin-v2/users/components/UserImportExport.jsx`

Implement data management tools:
- CSV user import with template
- Bulk user creation from spreadsheet
- User data export with filtering
- Template generation for imports
- Validation and error reporting

### API Integration Implementation

#### 4.12 User Management API Service
**Update**: `src/services/admin-v2/usersService.js`

```javascript
export const usersApiSlice = adminApiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query({
      query: (params) => ({
        url: 'users',
        params, // role, status, page, limit, search filters
      }),
      providesTags: ['Users'],
    }),
    getUserDetails: builder.query({
      query: (id) => `users/${id}`,
      providesTags: (result, error, id) => [{ type: 'Users', id }],
    }),
    updateUser: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `users/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Users', id }],
    }),
    createRestaurantOwner: builder.mutation({
      query: (data) => ({
        url: 'restaurant-owners',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Users'],
    }),
    createRestaurantManager: builder.mutation({
      query: (data) => ({
        url: 'restaurant-managers', 
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Users'],
    }),
    // ... implement all user management endpoints
  }),
});
```

#### 4.13 User Analytics Integration
Connect to user analytics endpoints:
- User growth and registration trends
- Activity pattern analysis
- Geographic distribution data
- Role-based user segmentation

### Mobile-First User Management

#### 4.14 Responsive User Interface
Implement mobile-optimized user management:
- Card-based layout for mobile user lists
- Touch-friendly user profile editing
- Mobile-specific bulk operation interface
- Swipeable user cards with quick actions

#### 4.15 Mobile User Creation
Optimize role creation forms for mobile:
- Progressive form disclosure
- Touch-optimized form controls
- Mobile camera integration for document upload
- Step-by-step mobile wizard interface

### Performance Optimization

#### 4.16 User Management Performance
- Virtual scrolling for large user lists
- Debounced search and filtering
- Optimistic updates for user status changes
- Efficient re-rendering with React.memo
- Background data prefetching

#### 4.17 Data Management Strategy
- Client-side pagination with server sync
- Intelligent caching of user data
- Background synchronization
- Offline user management capabilities

### Validation Criteria

After completing this prompt:
1. ✅ User directory table displays with advanced filtering
2. ✅ User profile modals show complete user information
3. ✅ Restaurant owner creation form works with validation
4. ✅ Restaurant manager creation connects to owners
5. ✅ Advanced filtering system functions correctly
6. ✅ Bulk operations process multiple users safely
7. ✅ User analytics display meaningful insights
8. ✅ Mobile-responsive design works across devices
9. ✅ API integration covers all user management endpoints
10. ✅ Performance optimizations handle large user sets
11. ✅ Import/export functionality works properly
12. ✅ User communication system functions correctly

### Next Prompt Preparation
Document for continuity:
- User management system capabilities and components
- API integration status for user endpoints
- Bulk operations and filtering implementation
- Mobile-first design patterns established
- Performance optimization strategies implemented

---

## PROMPT 5: Vendor Management System

**Objective**: Build a comprehensive vendor management system with verification workflows, business profile management, status controls, and performance monitoring following the vendor management specifications.

**CRITICAL CONSTRAINT**: Only implement vendor management features supported by backend APIs. No mock verification data.

**Available Libraries for Vendor Management**:
- `react-hook-form`: Vendor profile forms and business verification forms
- `react-csv`: Export vendor data and reports
- `framer-motion`: Verification workflow animations
- `react-hot-toast`: Verification status feedback
- `date-fns`: Business registration and activity date formatting

### Context & References
Building on the user management system from Prompt 4:
- **ADMIN_INTERFACE_PLAN.md**: Vendors Management section with verification workflows
- **ui-patterns-reference.md**: ApprovalWorkflow patterns, business cards, and verification components
- **Current VendorManagement.jsx**: Reference for existing vendor management
- **User Management**: Built in Prompt 4 for consistent patterns

### Current Implementation Status
From previous prompts, you should have:
- User management system with advanced filtering and bulk operations
- Dashboard with real-time metrics and verification pipeline
- Professional layout with glassmorphic navigation
- Complete component library with forms, tables, and modals
- API integration framework and theme system

### Implementation Tasks

#### 5.1 Vendor Management Page Structure
**Create**: `src/pages/admin-v2/vendors/VendorsManagementPage.jsx`

Implement the vendor management interface from ADMIN_INTERFACE_PLAN.md:

**Page Components**:
- **📋 Vendor Directory**: Business information cards with verification status
- **✅ Verification Queue**: Pending verification requests with document review
- **👤 Vendor Profile Management**: Complete business profile editor
- **🔄 Status Management**: Activation controls with safe deletion
- **📊 Vendor Performance**: Business metrics and analytics

#### 5.2 Vendor Directory with Business Cards
**Create**: `src/pages/admin-v2/vendors/components/VendorDirectory.jsx`

Implement the business card layout for vendor display:

**Vendor Card Features**:
```javascript
const VendorBusinessCard = ({ vendor, onAction }) => {
  return (
    <div className="glass-card-olive rounded-3xl p-6 border sage-highlight 
                    hover:shadow-glow-sage transition-all duration-300 hover:-translate-y-1">
      {/* Business Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="olive-accent pl-4">
          <h3 className="font-semibold text-text-dark">{vendor.businessName}</h3>
          <p className="text-text-muted text-sm">{vendor.businessType}</p>
        </div>
        <VerificationStatusBadge status={vendor.verificationStatus} />
      </div>
      
      {/* Business Details */}
      <div className="cedar-warmth rounded-2xl p-4 mb-6">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-text-muted">Location:</span>
            <p className="text-text-dark font-medium">{vendor.location}</p>
          </div>
          <div>
            <span className="text-text-muted">Products:</span>
            <p className="text-muted-olive font-medium">{vendor.productCount}</p>
          </div>
        </div>
      </div>
      
      {/* Performance Metrics */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <MetricItem label="Orders" value={vendor.totalOrders} />
        <MetricItem label="Rating" value={`${vendor.rating}/5`} />
        <MetricItem label="Revenue" value={`$${vendor.revenue}`} />
      </div>
      
      {/* Action Buttons */}
      <VendorActionButtons vendor={vendor} onAction={onAction} />
    </div>
  );
};
```

**Directory Features**:
- Grid/list view toggle
- Geographic location mapping with MapBox/Google Maps
- Performance metrics display (orders, revenue, ratings)
- Advanced filtering by location, business type, verification status
- Search across business names, products, locations

#### 5.3 Verification Queue System
**Create**: `src/pages/admin-v2/vendors/components/VerificationQueue.jsx`

Implement the comprehensive verification workflow:

**Verification Interface**:
- **Document Review Panel**: Business license, ID verification, product certificates
- **Verification Checklist**: Automated and manual verification steps
- **Approval Workflow**: Multi-step approval with reason logging
- **Batch Processing**: Bulk approval/rejection capabilities
- **Priority Queue**: Urgent verifications (7+ days waiting)

**Verification Components**:
```javascript
const VerificationQueueItem = ({ vendor, onVerify }) => {
  const daysWaiting = calculateDaysWaiting(vendor.submittedAt);
  const isUrgent = daysWaiting > 7;
  
  return (
    <div className={`glass-2 rounded-2xl p-6 border transition-all duration-300 ${
      isUrgent ? 'border-tomato-red/30 bg-tomato-red/5' : 'border-white/20'
    }`}>
      {/* Vendor Info Header */}
      <VendorInfoHeader vendor={vendor} isUrgent={isUrgent} daysWaiting={daysWaiting} />
      
      {/* Document Review Section */}
      <DocumentReviewPanel documents={vendor.documents} />
      
      {/* Verification Actions */}
      <VerificationActions vendor={vendor} onVerify={onVerify} />
    </div>
  );
};
```

#### 5.4 Document Review System
**Create**: `src/pages/admin-v2/vendors/components/DocumentReview.jsx`

Implement document verification interface:

**Document Types**:
- Business registration/license
- Tax identification documents
- Product certifications
- Insurance certificates
- Bank account verification
- Identity verification

**Review Features**:
- Document viewer with zoom and annotation
- Verification checklist for each document type
- Rejection reasons with predefined categories
- Document history and resubmission tracking
- Automated document validation (OCR, format checks)

#### 5.5 Vendor Profile Management
**Create**: `src/pages/admin-v2/vendors/components/VendorProfileModal.jsx`

Implement comprehensive vendor profile editing:

**Profile Sections**:
- **Business Information**: Name, type, description, established date
- **Contact Details**: Phone, email, address, emergency contacts  
- **Business Operations**: Operating hours, delivery areas, capacity
- **Product Categories**: Specializations, certifications, capabilities
- **Financial Information**: Banking details, tax information
- **Performance Metrics**: Order history, ratings, revenue tracking

**Edit Capabilities**:
- Real-time validation with form state management
- Image upload for business photos and certificates
- Location selector with map integration  
- Operating hours scheduler with time zone support
- Product category multi-select with autocomplete

#### 5.6 Status Management System
**Create**: `src/pages/admin-v2/vendors/components/VendorStatusManager.jsx`

Implement vendor status controls with impact analysis:

**Status Operations**:
- **Activation/Deactivation**: Enable/disable vendor account with reason logging
- **Verification Toggle**: Approve/revoke verification status
- **Safe Deletion**: Impact analysis before deletion (orders, relationships)
- **Suspension**: Temporary account restriction with duration
- **Account Recovery**: Restore suspended or deactivated accounts

**Safety Features**:
```javascript
const SafeDeleteModal = ({ vendor, onConfirm, onCancel }) => {
  const impactAnalysis = useSafeDeleteAnalysis(vendor.id);
  
  return (
    <Modal title="Safe Delete Vendor" size="large">
      {/* Impact Analysis Display */}
      <ImpactAnalysisSection analysis={impactAnalysis} />
      
      {/* Dependency Resolution */}
      <DependencyResolution dependencies={impactAnalysis.dependencies} />
      
      {/* Confirmation with Reason */}
      <DeletionConfirmation onConfirm={onConfirm} onCancel={onCancel} />
    </Modal>
  );
};
```

#### 5.7 Vendor Performance Analytics
**Create**: `src/pages/admin-v2/vendors/components/VendorPerformance.jsx`

Implement vendor performance monitoring:

**Performance Metrics**:
- **Order Performance**: Total orders, order frequency, seasonal patterns
- **Revenue Analytics**: Monthly revenue, growth trends, average order value
- **Customer Satisfaction**: Ratings, reviews, complaint resolution
- **Operational Efficiency**: Response times, fulfillment rates, delivery performance
- **Product Performance**: Top-selling products, category performance

**Analytics Features**:
- Interactive charts with drill-down capabilities
- Comparative analysis against industry benchmarks
- Performance ranking among vendors
- Trend analysis with forecasting
- Export capabilities for performance reports

### Advanced Vendor Management Features

#### 5.8 Bulk Vendor Operations
**Create**: `src/pages/admin-v2/vendors/components/BulkVendorOperations.jsx`

Implement bulk operations for vendor management:

**Bulk Actions**:
- **Verification Processing**: Bulk approve/reject with batch validation
- **Status Updates**: Mass activation/deactivation with impact analysis
- **Communication**: Bulk notifications and announcements
- **Data Updates**: Bulk profile updates with CSV import
- **Performance Actions**: Bulk performance reviews and ratings

#### 5.9 Vendor Communication Hub
**Create**: `src/pages/admin-v2/vendors/components/VendorCommunication.jsx`

Implement vendor communication system:
- Individual vendor messaging
- Broadcast announcements to all vendors
- Performance feedback and coaching
- Verification status updates
- System maintenance notifications

#### 5.10 Vendor Onboarding Workflow
**Create**: `src/pages/admin-v2/vendors/components/VendorOnboarding.jsx`

Implement new vendor onboarding management:
- Onboarding progress tracking
- Document collection workflow
- Training module assignments
- Performance goal setting
- Initial setup assistance

### API Integration Implementation

#### 5.11 Vendor Management API Service
**Update**: `src/services/admin-v2/vendorsService.js`

```javascript
export const vendorsApiSlice = adminApiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getVendors: builder.query({
      query: (params) => ({
        url: 'vendors',
        params, // status, verification, location, business type filters
      }),
      providesTags: ['Vendors'],
    }),
    getVendorDetails: builder.query({
      query: (id) => `vendors/${id}`,
      providesTags: (result, error, id) => [{ type: 'Vendors', id }],
    }),
    updateVendorVerification: builder.mutation({
      query: ({ id, status, reason }) => ({
        url: `vendors/${id}/verification`,
        method: 'PUT',
        body: { status, reason },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Vendors', id },
        'Dashboard'
      ],
    }),
    deactivateVendor: builder.mutation({
      query: ({ id, reason }) => ({
        url: `vendors/${id}/deactivate`,
        method: 'PUT', 
        body: { reason },
      }),
      invalidatesTags: ['Vendors'],
    }),
    safeDeleteVendor: builder.mutation({
      query: ({ id, reason }) => ({
        url: `vendors/${id}/safe-delete`,
        method: 'DELETE',
        body: { reason },
      }),
      invalidatesTags: ['Vendors'],
    }),
    // ... implement all vendor management endpoints from ADMIN_INTERFACE_PLAN.md
  }),
});
```

#### 5.12 Verification Workflow APIs
Connect to verification endpoints:
- Document upload and validation
- Verification status tracking
- Bulk verification processing
- Verification history and audit trails

### Mobile-First Vendor Management

#### 5.13 Responsive Vendor Interface
Implement mobile-optimized vendor management:
- Stacked vendor cards for mobile display
- Touch-friendly verification controls
- Mobile document viewer with gestures
- Swipeable vendor status management

#### 5.14 Mobile Verification Workflow
Optimize verification for mobile admin use:
- Mobile document camera integration
- Touch-optimized approval interface
- Quick action buttons for rapid processing
- Mobile-specific bulk operations

### Performance Optimization

#### 5.15 Vendor Management Performance
- Virtual scrolling for large vendor lists
- Image lazy loading and optimization
- Efficient vendor search with debouncing
- Background data synchronization
- Optimistic updates for status changes

#### 5.16 Document Management Optimization
- Progressive image loading
- Document caching strategies
- Thumbnail generation and storage
- Batch document processing

### Integration with Other Systems

#### 5.17 Cross-System Integration
- User management integration for vendor accounts
- Product catalog integration for vendor products
- Order system integration for vendor performance
- Analytics system integration for vendor insights

### Validation Criteria

After completing this prompt:
1. ✅ Vendor directory displays business cards with verification status
2. ✅ Verification queue processes documents with approval workflow
3. ✅ Vendor profile management allows comprehensive editing
4. ✅ Status management includes safe deletion with impact analysis
5. ✅ Performance analytics show meaningful vendor insights
6. ✅ Bulk operations handle multiple vendors safely
7. ✅ Document review system validates vendor documents
8. ✅ Mobile-responsive design works across all devices
9. ✅ API integration covers all vendor management endpoints
10. ✅ Performance optimizations handle large vendor datasets
11. ✅ Communication system enables vendor messaging
12. ✅ Integration with user and product systems functions properly

### Next Prompt Preparation
Document for continuity:
- Vendor management system capabilities and components
- Verification workflow implementation status
- API integration coverage for vendor endpoints  
- Business card and approval workflow patterns established
- Performance optimization strategies for large datasets

---

## PROMPT 6: Restaurant Management & Catalog Systems

**Objective**: Build comprehensive restaurant management with location features and complete catalog systems (products, categories, listings) with content moderation and bulk operations.

**CRITICAL CONSTRAINT**: Only implement restaurant and catalog features supported by backend APIs. No mock location or inventory data.

**Available Libraries for Restaurant & Catalog Management**:
- `react-hook-form`: Restaurant profile and product management forms
- `react-csv`: Export restaurant/product/category data
- `framer-motion`: Catalog management interface animations
- `react-hot-toast`: CRUD operation feedback
- `date-fns`: Restaurant registration and product update date formatting

### Context & References
Building on the vendor management system from Prompt 5:
- **ADMIN_INTERFACE_PLAN.md**: Restaurant Management and Catalog Management sections
- **ui-patterns-reference.md**: Tree view patterns, file upload, and data visualization
- **Current files**: RestaurantManagement.jsx, ProductList.jsx, CategoryManagement.jsx for reference
- **Vendor Management**: Built in Prompt 5 for consistent business entity patterns

### Current Implementation Status
From previous prompts, you should have:
- Vendor management with verification workflows and business cards
- User management with role creation and bulk operations
- Dashboard with real-time metrics and comprehensive analytics
- Professional layout with glassmorphic navigation and theme system
- Complete API integration framework and component library

### Implementation Tasks

#### 6.1 Restaurant Management System
**Create**: `src/pages/admin-v2/restaurants/RestaurantsManagementPage.jsx`

Implement restaurant management following ADMIN_INTERFACE_PLAN.md:

**Restaurant Management Components**:
- **📋 Restaurant Directory**: Location-based visualization with chain grouping
- **✅ Verification Workflow**: Business license and food safety compliance
- **👥 Owner/Manager Relations**: Hierarchical relationship management
- **🏢 Business Profile Management**: Operating hours, service areas, delivery settings

#### 6.2 Restaurant Directory with Location Features
**Create**: `src/pages/admin-v2/restaurants/components/RestaurantDirectory.jsx`

Implement location-focused restaurant display:

**Restaurant Card Features**:
```javascript
const RestaurantBusinessCard = ({ restaurant, onAction }) => {
  return (
    <div className="glass-card-olive rounded-3xl p-6 border sage-highlight">
      {/* Restaurant Header with Chain Info */}
      <RestaurantHeader restaurant={restaurant} />
      
      {/* Location Visualization */}
      <LocationDisplay 
        address={restaurant.address}
        serviceArea={restaurant.serviceArea}
        coordinates={restaurant.coordinates}
      />
      
      {/* Business Operations */}
      <OperationsInfo 
        operatingHours={restaurant.operatingHours}
        cuisineTypes={restaurant.cuisineTypes}
        capacity={restaurant.capacity}
      />
      
      {/* Owner/Manager Relations */}
      <ManagementHierarchy 
        owner={restaurant.owner}
        managers={restaurant.managers}
      />
      
      {/* Action Controls */}
      <RestaurantActions restaurant={restaurant} onAction={onAction} />
    </div>
  );
};
```

**Directory Features**:
- Interactive map integration showing restaurant locations
- Chain restaurant grouping with hierarchy visualization
- Service area mapping with delivery radius
- Multi-location management for restaurant chains
- Geographic filtering and search

#### 6.3 Restaurant Verification System
**Create**: `src/pages/admin-v2/restaurants/components/RestaurantVerification.jsx`

Implement restaurant-specific verification:

**Verification Categories**:
- **Business License**: Restaurant operation permits
- **Food Safety Compliance**: Health department certifications
- **Location Verification**: Physical address confirmation with photos
- **Owner Verification**: Identity and business ownership validation
- **Insurance Coverage**: Liability and food safety insurance

**Verification Features**:
- Photo-based location verification
- Compliance checklist with regulatory requirements
- Automated verification for known restaurant chains
- Integration with health department databases
- Renewal tracking for time-sensitive certifications

#### 6.4 Owner/Manager Relationship Management
**Create**: `src/pages/admin-v2/restaurants/components/OwnerManagerRelations.jsx`

Implement hierarchical relationship management:

**Relationship Features**:
- **Hierarchical Tree View**: Visual representation of ownership structure
- **Manager Assignment**: Assign managers to specific restaurant locations
- **Permission Management**: Define manager access levels and capabilities
- **Multi-Restaurant Ownership**: Handle owners with multiple locations
- **Team Structure Visualization**: Organization chart for restaurant teams

**Management Interface**:
```javascript
const RelationshipManager = ({ restaurant }) => {
  return (
    <div className="space-y-6">
      {/* Ownership Hierarchy */}
      <OwnershipTree restaurant={restaurant} />
      
      {/* Manager Assignment */}
      <ManagerAssignment 
        availableManagers={availableManagers}
        currentManagers={restaurant.managers}
        onAssign={handleManagerAssign}
      />
      
      {/* Permission Matrix */}
      <PermissionMatrix 
        roles={restaurant.roles}
        permissions={systemPermissions}
        onChange={handlePermissionChange}
      />
    </div>
  );
};
```

#### 6.5 Products Management System
**Create**: `src/pages/admin-v2/catalog/products/ProductsManagementPage.jsx`

Implement comprehensive product catalog management:

**Product Management Features**:
- **🔲 Product Grid/List Toggle**: Visual grid with images or detailed list view
- **📝 Product Detail Management**: Multi-image gallery, rich text descriptions
- **➕ Create Product Form**: Step-by-step product creation wizard
- **📤 Bulk Operations**: CSV import/export, bulk price updates, mass category assignment

**Product Components**:
```javascript
const ProductManagementInterface = () => {
  return (
    <div className="space-y-6">
      {/* View Toggle and Filters */}
      <ProductFilters 
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        filters={filters}
        onFiltersChange={setFilters}
      />
      
      {/* Product Display */}
      {viewMode === 'grid' ? (
        <ProductGrid products={products} onAction={handleProductAction} />
      ) : (
        <ProductTable products={products} onAction={handleProductAction} />
      )}
      
      {/* Bulk Operations Panel */}
      <BulkProductOperations 
        selectedProducts={selectedProducts}
        onBulkAction={handleBulkAction}
      />
    </div>
  );
};
```

#### 6.6 Category Tree Management
**Create**: `src/pages/admin-v2/catalog/categories/CategoryManagement.jsx`

Implement hierarchical category management:

**Category Tree Features**:
- **🌳 Category Tree View**: Expandable/collapsible hierarchy with drag-drop reordering
- **📊 Category Analytics**: Products per category, usage trends, performance metrics
- **🔄 Availability Management**: Seasonal availability, bulk enable/disable
- **📝 Category Editor**: Name, description, images, SEO metadata

**Tree Interface**:
```javascript
const CategoryTree = ({ categories, onCategoryAction }) => {
  const [expandedNodes, setExpandedNodes] = useState(new Set());
  
  return (
    <div className="glass-2 rounded-3xl p-6 border">
      <TreeView
        data={categories}
        expandedNodes={expandedNodes}
        onToggle={handleNodeToggle}
        renderNode={(category) => (
          <CategoryNode 
            category={category}
            onAction={onCategoryAction}
            onDrop={handleCategoryReorder}
          />
        )}
        onDragDrop={handleTreeReorder}
      />
    </div>
  );
};
```

#### 6.7 Listings Management System
**Create**: `src/pages/admin-v2/catalog/listings/ListingsManagementPage.jsx`

Implement comprehensive listings management:

**Listings Features**:
- **📊 Listings Dashboard**: All listings with status indicators and performance metrics
- **⭐ Featured Listings Management**: Feature/unfeature with scheduling system
- **🚩 Content Moderation**: Flagged content review with automated rules
- **🔄 Status Management**: Active/inactive status with bulk operations

**Content Moderation System**:
```javascript
const ContentModerationQueue = ({ flaggedListings, onModerate }) => {
  return (
    <div className="space-y-4">
      {flaggedListings.map(listing => (
        <ModerationCard 
          key={listing.id}
          listing={listing}
          flagReason={listing.flagReason}
          reportedBy={listing.reportedBy}
          onApprove={() => onModerate(listing.id, 'approve')}
          onReject={() => onModerate(listing.id, 'reject')}
          onFlag={() => onModerate(listing.id, 'flag')}
        />
      ))}
    </div>
  );
};
```

### Advanced Catalog Features

#### 6.8 Product Image Management
**Create**: `src/pages/admin-v2/catalog/components/ProductImageManager.jsx`

Implement comprehensive image management:
- Multi-image upload with drag-drop interface
- Image compression and optimization
- Image gallery with zoom and crop functionality
- Bulk image operations and batch processing
- Alt text management for accessibility

#### 6.9 Category Performance Analytics
**Create**: `src/pages/admin-v2/catalog/components/CategoryAnalytics.jsx`

Implement category performance tracking:
- Products per category with growth trends
- Category popularity and usage statistics
- Seasonal performance patterns
- Category conversion rates
- Hierarchical performance comparison

#### 6.10 Listing Content Automation
**Create**: `src/pages/admin-v2/catalog/components/ListingAutomation.jsx`

Implement automated content management:
- Automated flagging rules based on content analysis
- Bulk content updates and corrections
- Template-based listing creation
- SEO optimization suggestions
- Content quality scoring

### API Integration Implementation

#### 6.11 Restaurant Management APIs
**Update**: `src/services/admin-v2/restaurantsService.js`

```javascript
export const restaurantsApiSlice = adminApiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getRestaurants: builder.query({
      query: (params) => ({
        url: 'restaurants',
        params, // location, chain, cuisine, verification status
      }),
      providesTags: ['Restaurants'],
    }),
    getRestaurantDetails: builder.query({
      query: (id) => `restaurants/${id}`,
      providesTags: (result, error, id) => [{ type: 'Restaurants', id }],
    }),
    updateRestaurantVerification: builder.mutation({
      query: ({ id, status, reason }) => ({
        url: `restaurants/${id}/verification`,
        method: 'PUT',
        body: { status, reason },
      }),
      invalidatesTags: ['Restaurants', 'Dashboard'],
    }),
    // ... implement all restaurant management endpoints
  }),
});
```

#### 6.12 Catalog Management APIs  
**Create**: `src/services/admin-v2/catalogService.js`

```javascript
export const catalogApiSlice = adminApiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Products Management
    getProducts: builder.query({
      query: (params) => ({
        url: 'products',
        params,
      }),
      providesTags: ['Products'],
    }),
    createProduct: builder.mutation({
      query: (data) => ({
        url: 'products',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Products'],
    }),
    
    // Categories Management  
    getCategories: builder.query({
      query: () => 'categories',
      providesTags: ['Categories'],
    }),
    getCategoryUsage: builder.query({
      query: (id) => `categories/${id}/usage`,
      providesTags: (result, error, id) => [{ type: 'Categories', id }],
    }),
    
    // Listings Management
    getListings: builder.query({
      query: (params) => ({
        url: 'listings',
        params,
      }),
      providesTags: ['Listings'],
    }),
    getFeaturedListings: builder.query({
      query: () => 'listings/featured',
      providesTags: ['Listings'],
    }),
    getFlaggedListings: builder.query({
      query: () => 'listings/flagged',
      providesTags: ['Listings'],
    }),
    // ... implement all catalog endpoints from ADMIN_INTERFACE_PLAN.md
  }),
});
```

### Mobile-First Catalog Design

#### 6.13 Mobile Restaurant Management
Implement mobile-optimized restaurant interface:
- Touch-friendly restaurant cards with swipe gestures
- Mobile map integration for location management
- Touch-optimized relationship management
- Mobile-specific verification workflow

#### 6.14 Mobile Catalog Management
Optimize catalog systems for mobile:
- Responsive product grid with infinite scroll
- Mobile-friendly category tree with touch navigation
- Touch-optimized image management
- Mobile bulk operations interface

### Performance Optimization

#### 6.15 Catalog Performance
- Virtual scrolling for large product catalogs
- Image lazy loading with intersection observer
- Efficient category tree rendering
- Background data synchronization
- Optimistic updates for catalog operations

#### 6.16 Restaurant Data Optimization
- Location-based data caching
- Map tile optimization and caching
- Relationship data efficient loading
- Background location verification

### Integration Features

#### 6.17 Cross-System Integration
- Restaurant-user relationship synchronization
- Product-vendor association management
- Category-listing relationship tracking
- Performance metrics integration across systems

### Validation Criteria

After completing this prompt:
1. ✅ Restaurant directory displays with location mapping and chain grouping
2. ✅ Restaurant verification workflow processes compliance requirements
3. ✅ Owner/manager relationship management functions properly
4. ✅ Product management system handles catalog operations
5. ✅ Category tree management allows hierarchical organization
6. ✅ Listings management includes content moderation features
7. ✅ Featured listings system works with scheduling capabilities
8. ✅ Bulk operations handle multiple catalog items safely
9. ✅ Mobile-responsive design functions across all catalog systems
10. ✅ API integration covers restaurant and catalog endpoints
11. ✅ Performance optimizations handle large datasets effectively
12. ✅ Cross-system integration maintains data consistency

### Next Prompt Preparation
Document for continuity:
- Restaurant and catalog management system capabilities
- Location-based features implementation status
- Category tree and product management patterns
- Content moderation and bulk operations functionality
- API integration coverage for restaurant and catalog endpoints

---

## PROMPT 7: Analytics & Performance Monitoring

**Objective**: Build comprehensive business analytics and performance monitoring systems with interactive dashboards, reporting capabilities, and admin performance tracking following the analytics specifications.

**CRITICAL CONSTRAINT**: Only implement analytics features supported by backend APIs. No synthetic metrics or mock data.

**Available Libraries for Analytics**:
- `chart.js` + `react-chartjs-2`: Professional analytics charts and visualizations
- `react-csv`: Export analytics reports and data
- `html2canvas` + `html2pdf.js` + `jspdf`: Generate PDF analytics reports
- `framer-motion`: Chart animations and transitions
- `react-hot-toast`: Report generation feedback
- `date-fns`: Analytics date range formatting and manipulation

### Context & References
Building on the catalog systems from Prompt 6:
- **ADMIN_INTERFACE_PLAN.md**: Analytics & Insights and Performance Monitoring sections
- **ui-patterns-reference.md**: Chart patterns, data visualization, and export functionality
- **Current AnalyticsDashboard.jsx**: Reference for existing analytics implementation
- **Dashboard**: Built in Prompt 3 for consistent metrics patterns

### Current Implementation Status
From previous prompts, you should have:
- Complete catalog management with products, categories, and listings
- Restaurant management with location features and relationship tracking
- Vendor management with verification workflows
- User management with role creation and bulk operations
- Dashboard with basic KPI metrics and real-time updates

### Implementation Tasks

#### 7.1 Business Analytics Dashboard
**Create**: `src/pages/admin-v2/analytics/BusinessAnalytics.jsx`

Implement comprehensive business analytics following ADMIN_INTERFACE_PLAN.md:

**Analytics Components**:
- **💰 Sales Performance Dashboard**: Revenue trends with time series charts
- **👥 User Analytics**: Registration patterns, role-based segmentation, retention analysis
- **📦 Product Analytics**: Best-selling products, category performance, inventory insights
- **📄 Export & Reporting**: PDF generation, CSV exports, scheduled reports

#### 7.2 Sales Performance Analytics
**Create**: `src/pages/admin-v2/analytics/components/SalesPerformance.jsx`

Implement interactive sales analytics:

**Sales Metrics**:
```javascript
const SalesPerformanceDashboard = () => {
  return (
    <div className="space-y-8">
      {/* Revenue Overview Cards */}
      <SalesKPICards 
        totalRevenue={analytics.totalRevenue}
        monthlyGrowth={analytics.monthlyGrowth}
        averageOrderValue={analytics.averageOrderValue}
        orderCount={analytics.orderCount}
      />
      
      {/* Interactive Revenue Chart */}
      <RevenueChart 
        data={analytics.revenueData}
        timeRange={timeRange}
        onTimeRangeChange={setTimeRange}
      />
      
      {/* Regional Performance */}
      <RegionalPerformanceMap 
        data={analytics.regionalData}
        onRegionSelect={handleRegionSelect}
      />
      
      {/* Seasonal Trends */}
      <SeasonalTrendsChart 
        data={analytics.seasonalData}
        categories={analytics.categories}
      />
    </div>
  );
};
```

**Chart Features**:
- Interactive time series with zoom and pan
- Drill-down from monthly to daily views
- Comparative analysis year-over-year
- Regional performance heat maps
- Export capabilities for all charts

#### 7.3 User Analytics System
**Create**: `src/pages/admin-v2/analytics/components/UserAnalytics.jsx`

Implement comprehensive user analytics:

**User Metrics**:
- **Registration Patterns**: Daily/weekly/monthly growth trends
- **Role Segmentation**: Distribution of users by role with growth analysis
- **Activity Heat Maps**: User activity patterns by time and location
- **Retention Analysis**: Cohort analysis and churn prediction
- **Geographic Distribution**: Global user map with density visualization

**Analytics Interface**:
```javascript
const UserAnalyticsDashboard = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* User Growth Trends */}
      <AnalyticsCard title="User Growth Trends">
        <UserGrowthChart 
          data={userAnalytics.growthData}
          segmentBy={segmentBy}
          onSegmentChange={setSegmentBy}
        />
      </AnalyticsCard>
      
      {/* Role Distribution */}
      <AnalyticsCard title="Role Distribution">
        <RoleDistributionPie 
          data={userAnalytics.roleData}
          onSliceClick={handleRoleClick}
        />
      </AnalyticsCard>
      
      {/* Activity Heatmap */}
      <AnalyticsCard title="Activity Patterns" className="lg:col-span-2">
        <ActivityHeatmap 
          data={userAnalytics.activityData}
          timeZone={timeZone}
        />
      </AnalyticsCard>
    </div>
  );
};
```

#### 7.4 Product Performance Analytics
**Create**: `src/pages/admin-v2/analytics/components/ProductAnalytics.jsx`

Implement product and inventory analytics:

**Product Metrics**:
- **Best-Selling Products**: Top products by volume and revenue
- **Category Performance**: Revenue and order volume by category
- **Inventory Turnover**: Product lifecycle and demand forecasting
- **Price Optimization**: Price elasticity and optimization insights
- **Vendor Performance**: Product performance by vendor

**Product Analytics Features**:
- Product ranking with filters and sorting
- Category performance comparison
- Inventory level monitoring with alerts
- Seasonal demand prediction
- Vendor contribution analysis

#### 7.5 Performance Monitoring System
**Create**: `src/pages/admin-v2/analytics/PerformanceMonitoring.jsx`

Implement admin performance monitoring:

**Performance Components**:
- **📊 Performance Overview**: Admin efficiency metrics, response times, task completion
- **👥 Team Performance**: Individual admin comparison, rankings, workload distribution
- **⚠️ SLA Monitoring**: Violation alerts, compliance tracking, escalation procedures
- **📋 Reporting System**: Performance reports, trend analysis, custom metrics

#### 7.6 Admin Performance Dashboard
**Create**: `src/pages/admin-v2/analytics/components/AdminPerformance.jsx`

Implement comprehensive admin performance tracking:

**Performance Metrics**:
```javascript
const AdminPerformanceDashboard = () => {
  return (
    <div className="space-y-8">
      {/* Performance Overview */}
      <PerformanceKPIGrid 
        metrics={performanceData.overview}
        period={selectedPeriod}
      />
      
      {/* Individual Performance */}
      <AdminPerformanceTable 
        admins={performanceData.adminMetrics}
        onAdminSelect={handleAdminSelect}
      />
      
      {/* SLA Compliance */}
      <SLAComplianceChart 
        data={performanceData.slaData}
        thresholds={slaThresholds}
      />
      
      {/* Performance Trends */}
      <PerformanceTrendsChart 
        data={performanceData.trends}
        selectedAdmin={selectedAdmin}
      />
    </div>
  );
};
```

#### 7.7 SLA Monitoring System
**Create**: `src/pages/admin-v2/analytics/components/SLAMonitoring.jsx`

Implement SLA violation tracking and alerting:

**SLA Features**:
- **Violation Alerts**: Real-time notifications for SLA breaches
- **Compliance Dashboard**: Overall SLA compliance rates and trends
- **Escalation Management**: Automated escalation procedures
- **Performance Targets**: Configurable SLA targets and thresholds
- **Impact Analysis**: Business impact of SLA violations

**SLA Interface**:
```javascript
const SLAMonitoringDashboard = () => {
  return (
    <div className="space-y-6">
      {/* SLA Overview Cards */}
      <SLAOverviewCards 
        compliance={slaData.overallCompliance}
        violations={slaData.recentViolations}
        trends={slaData.trends}
      />
      
      {/* Violation Alerts */}
      <ViolationAlertsPanel 
        violations={slaData.activeViolations}
        onAcknowledge={handleViolationAcknowledge}
      />
      
      {/* SLA Configuration */}
      <SLAConfiguration 
        currentTargets={slaTargets}
        onTargetUpdate={handleTargetUpdate}
      />
    </div>
  );
};
```

### Advanced Analytics Features

#### 7.8 Report Generation System
**Create**: `src/pages/admin-v2/analytics/components/ReportGenerator.jsx`

Implement comprehensive reporting capabilities:

**Report Types**:
- **Business Performance Reports**: Revenue, growth, key metrics
- **User Activity Reports**: Registration, engagement, retention
- **Vendor Performance Reports**: Sales, compliance, satisfaction
- **System Performance Reports**: Admin efficiency, SLA compliance
- **Custom Reports**: User-defined metrics and visualizations

**Report Features**:
```javascript
const ReportGenerator = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Report Builder */}
      <ReportBuilder 
        availableMetrics={reportMetrics}
        onReportCreate={handleReportCreate}
      />
      
      {/* Scheduled Reports */}
      <ScheduledReportsManager 
        reports={scheduledReports}
        onSchedule={handleReportSchedule}
      />
      
      {/* Report History */}
      <ReportHistory 
        history={reportHistory}
        onDownload={handleReportDownload}
      />
    </div>
  );
};
```

#### 7.9 Data Export System
**Create**: `src/pages/admin-v2/analytics/components/DataExport.jsx`

Implement comprehensive data export capabilities:
- CSV export with custom column selection
- PDF report generation with charts and tables
- Excel export with multiple sheets and formatting
- API endpoint generation for external integrations
- Scheduled export with email delivery

#### 7.10 Real-time Analytics
**Create**: `src/hooks/admin-v2/useRealtimeAnalytics.js`

Implement real-time analytics updates:
```javascript
export const useRealtimeAnalytics = (dashboardType) => {
  // WebSocket connection for live analytics
  // Real-time metric updates
  // Live chart data streaming
  // Performance alert notifications
  // Auto-refresh strategies
};
```

### API Integration Implementation

#### 7.11 Analytics API Service
**Update**: `src/services/admin-v2/analyticsService.js`

```javascript
export const analyticsApiSlice = adminApiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAnalyticsOverview: builder.query({
      query: (params) => ({
        url: 'analytics/overview',
        params, // period, startDate, endDate
      }),
      providesTags: ['Analytics'],
    }),
    getSalesAnalytics: builder.query({
      query: (params) => ({
        url: 'analytics/sales',
        params, // startDate, endDate, groupBy
      }),
      providesTags: ['Analytics'],
    }),
    getUserAnalytics: builder.query({
      query: (params) => ({
        url: 'analytics/users',
        params, // segment, period
      }),
      providesTags: ['Analytics'],
    }),
    getProductAnalytics: builder.query({
      query: (params) => ({
        url: 'analytics/products',
        params, // category, vendor
      }),
      providesTags: ['Analytics'],
    }),
    clearAnalyticsCache: builder.mutation({
      query: () => ({
        url: 'analytics/cache',
        method: 'DELETE',
      }),
      invalidatesTags: ['Analytics'],
    }),
    // ... implement all analytics endpoints from ADMIN_INTERFACE_PLAN.md
  }),
});
```

#### 7.12 Performance Monitoring APIs
**Create**: `src/services/admin-v2/performanceService.js`

```javascript
export const performanceApiSlice = adminApiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPerformanceDashboard: builder.query({
      query: (params) => ({
        url: 'performance/dashboard',
        params, // period, adminId
      }),
      providesTags: ['Performance'],
    }),
    getPerformanceMetrics: builder.query({
      query: (params) => ({
        url: 'performance/metrics',
        params, // adminId, startDate
      }),
      providesTags: ['Performance'],
    }),
    getSLAViolations: builder.query({
      query: (params) => ({
        url: 'performance/sla-violations',
        params, // severity, limit
      }),
      providesTags: ['Performance'],
    }),
    generatePerformanceReport: builder.mutation({
      query: (data) => ({
        url: 'performance/generate-report',
        method: 'POST',
        body: data, // reportType, period, adminIds
      }),
      invalidatesTags: ['Performance'],
    }),
    // ... implement all performance endpoints
  }),
});
```

### Chart and Visualization Implementation

#### 7.13 Chart Component Library
**Create**: `src/components/admin-v2/charts/`

Implement comprehensive chart components:
- **LineChart**: Time series data with multiple datasets
- **BarChart**: Categorical data comparison
- **PieChart**: Distribution and percentage data
- **HeatMap**: Activity patterns and geographic data
- **GaugeChart**: Performance metrics and KPIs
- **FunnelChart**: Conversion and process flows

#### 7.14 Interactive Features
Add advanced chart interactivity:
- Click-through drill-down capabilities
- Zoom and pan for time series data
- Tooltip rich information display
- Legend filtering and selection
- Cross-chart filtering and highlighting

### Mobile-First Analytics

#### 7.15 Responsive Analytics Interface
Implement mobile-optimized analytics:
- Stacked chart layout for mobile screens
- Touch-friendly chart interactions
- Mobile-specific data tables
- Swipeable analytics cards
- Progressive data disclosure

#### 7.16 Mobile Report Generation
Optimize reporting for mobile:
- Mobile-friendly report builder
- Touch-optimized export options
- Mobile PDF generation
- Responsive report viewing

### Performance Optimization

#### 7.17 Analytics Performance
- Chart data virtualization for large datasets
- Lazy loading of analytics components
- Efficient data aggregation strategies
- Background data processing
- Optimized re-rendering with React.memo

#### 7.18 Data Processing Optimization
- Client-side data caching strategies
- Background data synchronization
- Incremental data updates
- Efficient chart rendering algorithms

### Integration Features

#### 7.19 Cross-System Analytics
- User behavior analytics across all admin sections
- Performance correlation with business metrics
- Integrated reporting across all system components
- Unified analytics dashboard with drill-down capabilities

### Validation Criteria

After completing this prompt:
1. ✅ Business analytics dashboard displays comprehensive sales and user metrics
2. ✅ Interactive charts provide drill-down and export capabilities
3. ✅ Admin performance monitoring tracks efficiency and SLA compliance
4. ✅ Report generation system creates PDF and CSV exports
5. ✅ Real-time analytics update with WebSocket integration
6. ✅ SLA monitoring system tracks violations and compliance
7. ✅ User analytics provide segmentation and retention insights
8. ✅ Product analytics show performance and inventory trends
9. ✅ Mobile-responsive design functions across all analytics components
10. ✅ API integration covers all analytics and performance endpoints
11. ✅ Performance optimizations handle large analytical datasets
12. ✅ Cross-system analytics integration provides unified insights

### Next Prompt Preparation
Document for continuity:
- Analytics and performance monitoring system capabilities
- Chart library and visualization components implemented
- Report generation and export functionality status
- Real-time analytics integration with WebSocket
- API coverage for analytics and performance endpoints

---

## PROMPT 8: System Settings & Final Polish

**Objective**: Complete the admin overhaul with comprehensive system settings management, mobile optimization, accessibility improvements, performance optimizations, and legacy component cleanup.

**CRITICAL CONSTRAINT**: Only implement system settings supported by backend APIs. No client-side-only configuration.

**Available Libraries for System Settings & Polish**:
- `react-hook-form`: System configuration forms
- `framer-motion`: Final polish animations and transitions
- `react-hot-toast`: Settings update feedback
- `react-csv`: System data export capabilities
- All chart libraries: Final dashboard polish and optimization

### Context & References
Building on the analytics system from Prompt 7 to complete the admin overhaul:
- **ADMIN_INTERFACE_PLAN.md**: System Management section with settings specifications
- **ui-patterns-reference.md**: Form patterns, accessibility guidelines, and mobile optimization
- **Current AdminSystemSettings.jsx**: Reference for existing settings implementation
- **Complete Admin System**: All components built in Prompts 1-7 for integration and optimization

### Current Implementation Status
From previous prompts, you should have:
- Complete analytics and performance monitoring systems
- Business entity management (users, vendors, restaurants)
- Comprehensive catalog systems (products, categories, listings)
- Dashboard with real-time metrics and KPI tracking
- Professional layout with responsive navigation
- API integration framework covering all 44 endpoints

### Implementation Tasks

#### 8.1 System Settings Management
**Create**: `src/pages/admin-v2/settings/SystemSettings.jsx`

Implement comprehensive settings management following ADMIN_INTERFACE_PLAN.md:

**Settings Categories**:
- **🌐 General Configuration**: App name, descriptions, file limits, branding
- **🏢 Business Rules**: Commission rates, order limits, processing fees, business logic
- **🔔 Notification Settings**: Email, SMS, push notification configurations
- **🔒 Security Policies**: Session timeout, password policies, access controls
- **💳 Payment Configuration**: Payment methods, processing timeouts, gateway settings

#### 8.2 Category-Based Settings Interface
**Create**: `src/pages/admin-v2/settings/components/SettingsCategories.jsx`

Implement tabbed settings interface:

**Settings Interface Structure**:
```javascript
const SystemSettingsInterface = () => {
  const [activeCategory, setActiveCategory] = useState('general');
  
  const settingsCategories = [
    { key: 'general', label: 'General', icon: Settings, component: GeneralSettings },
    { key: 'business', label: 'Business Rules', icon: DollarSign, component: BusinessSettings },
    { key: 'notifications', label: 'Notifications', icon: Bell, component: NotificationSettings },
    { key: 'security', label: 'Security', icon: Shield, component: SecuritySettings },
    { key: 'payment', label: 'Payment', icon: CreditCard, component: PaymentSettings }
  ];
  
  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Category Navigation */}
      <SettingsCategoryNav 
        categories={settingsCategories}
        activeCategory={activeCategory}
        onCategorySelect={setActiveCategory}
      />
      
      {/* Settings Content */}
      <SettingsContent 
        category={activeCategory}
        component={settingsCategories.find(cat => cat.key === activeCategory)?.component}
      />
    </div>
  );
};
```

#### 8.3 Advanced Setting Editor
**Create**: `src/pages/admin-v2/settings/components/SettingEditor.jsx`

Implement type-aware setting controls:

**Setting Types and Controls**:
```javascript
const SettingEditor = ({ setting, value, onChange }) => {
  const renderControl = () => {
    switch (setting.dataType) {
      case 'string':
        return <TextInput value={value} onChange={onChange} validation={setting.validation} />;
      case 'number':
        return <NumberInput value={value} onChange={onChange} min={setting.min} max={setting.max} />;
      case 'boolean':
        return <ToggleSwitch checked={value} onChange={onChange} />;
      case 'select':
        return <SelectInput options={setting.options} value={value} onChange={onChange} />;
      case 'multiselect':
        return <MultiSelectInput options={setting.options} value={value} onChange={onChange} />;
      case 'json':
        return <JSONEditor value={value} onChange={onChange} schema={setting.schema} />;
      case 'color':
        return <ColorPicker value={value} onChange={onChange} />;
      default:
        return <TextInput value={value} onChange={onChange} />;
    }
  };
  
  return (
    <div className="space-y-3">
      <SettingLabel setting={setting} />
      {renderControl()}
      <SettingDescription setting={setting} />
      <SettingValidation setting={setting} value={value} />
    </div>
  );
};
```

**Editor Features**:
- Type-aware input controls with validation
- Real-time preview of setting changes
- Constraint checking and validation
- Default value restoration
- Change impact analysis

#### 8.4 Settings History & Audit System
**Create**: `src/pages/admin-v2/settings/components/SettingsHistory.jsx`

Implement comprehensive settings audit:

**History Features**:
- **Change Timeline**: Complete history of setting modifications
- **Admin Action Tracking**: Who changed what and when
- **Rollback Capabilities**: Restore previous setting values
- **Impact Analysis**: Effects of setting changes on system behavior
- **Change Notifications**: Alert relevant admins of critical setting changes

**History Interface**:
```javascript
const SettingsHistoryPanel = ({ settingKey }) => {
  const { data: history } = useGetSettingHistoryQuery(settingKey);
  
  return (
    <div className="space-y-4">
      {history?.map(change => (
        <HistoryEntry 
          key={change.id}
          change={change}
          onRollback={handleRollback}
          onViewDiff={handleViewDiff}
        />
      ))}
    </div>
  );
};
```

#### 8.5 Bulk Settings Management
**Create**: `src/pages/admin-v2/settings/components/BulkSettings.jsx`

Implement category-wide and bulk settings operations:

**Bulk Operations**:
- **Category Updates**: Update all settings in a category simultaneously
- **Environment Sync**: Copy settings between environments (dev/staging/production)
- **Bulk Import/Export**: JSON-based settings backup and restore
- **Template Management**: Predefined setting configurations
- **Reset Operations**: Reset categories or individual settings to defaults

#### 8.6 Mobile Optimization Enhancements
**Update**: All admin-v2 components for mobile optimization

Implement comprehensive mobile improvements:

**Mobile Enhancements**:
- **Touch Target Optimization**: Ensure all interactive elements meet 44px minimum
- **Gesture Integration**: Swipe for navigation, pull-to-refresh, long-press menus
- **Keyboard Optimization**: Virtual keyboard handling, input focus management
- **Viewport Optimization**: Dynamic viewport scaling, safe area handling
- **Performance**: Reduce bundle size, optimize mobile rendering

**Mobile-Specific Components**:
```javascript
// Mobile-optimized data table
const MobileDataTable = ({ data, columns, actions }) => (
  <div className="space-y-3">
    {data.map(item => (
      <MobileDataCard 
        key={item.id}
        item={item}
        columns={columns}
        actions={actions}
        onSwipe={handleSwipeAction}
      />
    ))}
  </div>
);

// Touch-friendly form controls
const TouchFormControl = ({ type, ...props }) => (
  <div className="touch-target">
    {/* Optimized form control with proper touch sizing */}
  </div>
);
```

#### 8.7 Accessibility Compliance Implementation
**Update**: All admin-v2 components for WCAG 2.1 AA compliance

Implement comprehensive accessibility:

**Accessibility Features**:
- **Screen Reader Support**: ARIA labels, live regions, semantic HTML
- **Keyboard Navigation**: Full keyboard access, focus management, skip links
- **Color Contrast**: Ensure 4.5:1 minimum contrast ratios
- **Focus Management**: Logical tab order, visible focus indicators
- **Alternative Text**: Comprehensive alt text for images and charts
- **Form Accessibility**: Proper labeling, error announcements, validation

**Accessibility Components**:
```javascript
// Screen reader announcements
const LiveRegion = ({ message, politeness = 'polite' }) => (
  <div 
    className="sr-only" 
    aria-live={politeness}
    aria-atomic="true"
  >
    {message}
  </div>
);

// Focus management hook
const useFocusManagement = () => {
  // Focus trap implementation
  // Focus restoration
  // Skip link functionality
};
```

#### 8.8 Performance Optimization Implementation
**Update**: All admin-v2 components with performance optimizations

Implement comprehensive performance improvements:

**Performance Strategies**:
- **Code Splitting**: Route-based and component-based splitting
- **Lazy Loading**: Component and image lazy loading with Intersection Observer
- **Virtual Scrolling**: For large data tables and lists
- **Memoization**: Strategic use of React.memo, useMemo, useCallback
- **Bundle Optimization**: Tree shaking, dead code elimination
- **Caching**: Intelligent client-side caching strategies

**Performance Components**:
```javascript
// Virtual scrolling for large lists
const VirtualizedTable = ({ items, rowHeight = 60, containerHeight = 400 }) => {
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 10 });
  
  return (
    <div className="virtual-scroll-container" style={{ height: containerHeight }}>
      {items.slice(visibleRange.start, visibleRange.end).map(item => (
        <VirtualTableRow key={item.id} item={item} height={rowHeight} />
      ))}
    </div>
  );
};

// Lazy loading component wrapper
const LazyComponent = ({ importFn, fallback = <LoadingSpinner /> }) => {
  const Component = lazy(importFn);
  return (
    <Suspense fallback={fallback}>
      <Component />
    </Suspense>
  );
};
```

#### 8.9 Legacy Component Cleanup
**Task**: Systematic removal of unused admin components

Create cleanup strategy:

**Cleanup Process**:
1. **Component Inventory**: Complete audit of legacy admin components
2. **Usage Analysis**: Identify components still in use vs. replaceable
3. **Migration Plan**: Systematic migration from legacy to new components
4. **Safe Removal**: Remove legacy components with proper testing
5. **Documentation**: Update import paths and component references

**Cleanup Tracking**:
```javascript
// Create cleanup tracking document
const legacyCleanupStatus = {
  toRemove: [
    'src/pages/admin/AdminDashboard.jsx', // Replaced by admin-v2/dashboard
    'src/pages/admin/UserManagement.jsx', // Replaced by admin-v2/users
    'src/components/admin/ApprovalCard.jsx', // Replaced by admin-v2/ui/ApprovalWorkflow
    // ... complete legacy component inventory
  ],
  inProgress: [
    // Components being migrated
  ],
  dependencies: {
    // Components with external dependencies requiring careful removal
  }
};
```

#### 8.10 Integration Testing & Validation
**Create**: Comprehensive integration tests for the complete admin system

Implement testing strategy:

**Test Categories**:
- **Component Integration**: Test component interactions and data flow
- **API Integration**: Validate all API endpoints and error handling
- **User Workflow**: End-to-end admin workflow testing
- **Performance Testing**: Load testing with large datasets
- **Accessibility Testing**: Automated and manual accessibility validation
- **Mobile Testing**: Cross-device and responsive design validation

#### 8.11 Documentation & Training Materials
**Create**: Complete documentation for the new admin system

Documentation deliverables:
- **Component Library Documentation**: Storybook or similar documentation
- **API Integration Guide**: Complete endpoint documentation and examples
- **Admin User Guide**: Step-by-step guides for admin workflows
- **Developer Documentation**: Architecture overview and contribution guidelines
- **Migration Guide**: Transitioning from legacy admin to new system

### API Integration Completion

#### 8.12 Settings Management APIs
**Update**: `src/services/admin-v2/settingsService.js`

```javascript
export const settingsApiSlice = adminApiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllSettings: builder.query({
      query: (params) => ({
        url: 'settings',
        params, // category, page, limit
      }),
      providesTags: ['Settings'],
    }),
    getCategorySettings: builder.query({
      query: (category) => `settings/${category}`,
      providesTags: (result, error, category) => [{ type: 'Settings', id: category }],
    }),
    getSettingByKey: builder.query({
      query: (key) => `settings/key/${key}`,
      providesTags: (result, error, key) => [{ type: 'Settings', id: key }],
    }),
    getSettingHistory: builder.query({
      query: ({ key, ...params }) => ({
        url: `settings/key/${key}/history`,
        params, // page, limit
      }),
      providesTags: (result, error, { key }) => [{ type: 'Settings', id: `${key}-history` }],
    }),
    updateSetting: builder.mutation({
      query: ({ key, value, changeReason }) => ({
        url: `settings/key/${key}`,
        method: 'PUT',
        body: { value, changeReason },
      }),
      invalidatesTags: (result, error, { key }) => [
        { type: 'Settings', id: key },
        'Settings'
      ],
    }),
    bulkUpdateSettings: builder.mutation({
      query: ({ settings, changeReason }) => ({
        url: 'settings/bulk',
        method: 'PUT',
        body: { settings, changeReason },
      }),
      invalidatesTags: ['Settings'],
    }),
    resetSettings: builder.mutation({
      query: ({ category, keys, reason }) => ({
        url: 'settings/reset',
        method: 'POST',
        body: { category, keys, reason },
      }),
      invalidatesTags: ['Settings'],
    }),
    // ... complete settings API implementation
  }),
});
```

### Final System Integration

#### 8.13 Routing Configuration
**Update**: Complete routing setup for the new admin system

```javascript
// Update main routing configuration
const adminRoutes = [
  {
    path: '/admin-v2',
    element: <AdminLayoutV2 />,
    children: [
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'users', element: <UsersManagementPage /> },
      { path: 'users/create-owner', element: <CreateRestaurantOwner /> },
      { path: 'users/create-manager', element: <CreateRestaurantManager /> },
      { path: 'vendors', element: <VendorsManagementPage /> },
      { path: 'restaurants', element: <RestaurantsManagementPage /> },
      { path: 'catalog/products', element: <ProductsManagementPage /> },
      { path: 'catalog/categories', element: <CategoryManagement /> },
      { path: 'catalog/listings', element: <ListingsManagementPage /> },
      { path: 'analytics/business', element: <BusinessAnalytics /> },
      { path: 'analytics/performance', element: <PerformanceMonitoring /> },
      { path: 'settings', element: <SystemSettings /> },
    ]
  }
];
```

#### 8.14 Environment Configuration
**Create**: Environment-specific configurations

Setup production-ready configurations:
- API endpoint configurations
- Feature flag management
- Performance monitoring integration
- Error tracking setup (Sentry or similar)
- Analytics integration (if required)

### Validation Criteria

After completing this prompt:
1. ✅ System settings management provides category-based interface
2. ✅ Setting editor supports all data types with validation
3. ✅ Settings history and audit system tracks all changes
4. ✅ Bulk settings operations function correctly
5. ✅ Mobile optimization ensures 44px touch targets and gestures
6. ✅ Accessibility compliance meets WCAG 2.1 AA standards
7. ✅ Performance optimizations handle large datasets efficiently
8. ✅ Legacy component cleanup removes unused code safely
9. ✅ Integration testing validates complete system functionality
10. ✅ Documentation provides comprehensive system coverage
11. ✅ All 44 API endpoints are properly integrated
12. ✅ Production-ready configuration is established

### Final System Status

**Complete Admin System Deliverables**:
- ✅ **Foundation**: Directory structure, theme system, component library, API integration
- ✅ **Layout**: AdminLayout, responsive navigation, professional header system
- ✅ **Dashboard**: Real-time metrics, business insights, verification pipeline
- ✅ **User Management**: Advanced filtering, role creation, bulk operations
- ✅ **Vendor Management**: Verification workflows, business profiles, performance tracking
- ✅ **Restaurant & Catalog**: Location features, product management, content moderation
- ✅ **Analytics**: Business analytics, performance monitoring, comprehensive reporting
- ✅ **Settings & Polish**: System configuration, mobile optimization, accessibility compliance

**API Coverage**: 44/44 admin endpoints integrated and tested
**Component Library**: Complete Organic Futurism design system implemented
**Mobile-First**: Professional B2B interface optimized for all devices
**Performance**: Optimized for 500+ concurrent admin users
**Accessibility**: WCAG 2.1 AA compliant throughout
**Documentation**: Complete system documentation and migration guides

The admin panel overhaul is now complete and ready for production deployment.