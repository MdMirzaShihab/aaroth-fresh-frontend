import { useState, useMemo } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  CheckCircle,
  Store,
  Truck,
  Tag,
  Package,
  List,
  BarChart3,
  Settings,
  Menu,
  X,
  LogOut,
  User,
} from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import {
  useGetAdminVendorsUnifiedQuery,
  useGetAdminRestaurantsUnifiedQuery,
} from '../../store/slices/apiSlice';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  // Get pending business verifications count for badge
  const { data: pendingVendors } = useGetAdminVendorsUnifiedQuery({
    status: 'pending',
    limit: 1,
  });
  const { data: pendingRestaurants } = useGetAdminRestaurantsUnifiedQuery({
    status: 'pending',
    limit: 1,
  });

  // Use statistics from the new API response for more accurate counts
  const pendingVendorsCount = pendingVendors?.stats?.pendingVendors || 0;
  const pendingRestaurantsCount =
    pendingRestaurants?.stats?.pendingRestaurants || 0;
  const pendingVerificationsCount =
    pendingVendorsCount + pendingRestaurantsCount;

  const adminNavItems = useMemo(
    () => [
      {
        path: '/admin/dashboard',
        label: 'Dashboard',
        icon: LayoutDashboard,
        description: 'Platform overview and key metrics',
      },
      {
        path: '/admin/approvals',
        label: 'Business Verification',
        icon: CheckCircle,
        badge: pendingVerificationsCount > 0 ? pendingVerificationsCount : null,
        description: 'Review and verify vendor/restaurant businesses',
      },
      {
        path: '/admin/verification-dashboard',
        label: 'Verification Dashboard',
        icon: BarChart3,
        description: 'Business verification metrics and analytics',
      },
      {
        path: '/admin/restaurant-management',
        label: 'Restaurant Management',
        icon: Store,
        description:
          'CRUD restaurant owners/managers, enable/disable restaurants',
      },
      {
        path: '/admin/vendor-management',
        label: 'Vendor Management',
        icon: Truck,
        description:
          'Manage vendors, view performance, enable/disable accounts',
      },
      {
        path: '/admin/categories',
        label: 'Categories',
        icon: Tag,
        description: 'CRUD product categories',
      },
      {
        path: '/admin/products',
        label: 'Products',
        icon: Package,
        description:
          'CRUD products, manage status (active/inactive/discontinued)',
      },
      {
        path: '/admin/listing-management',
        label: 'Listing Management',
        icon: List,
        description: 'Flag/unflag listings, feature management, status updates',
      },
      {
        path: '/admin/analytics',
        label: 'Analytics',
        icon: BarChart3,
        description: 'Advanced platform analytics with caching',
      },
      {
        path: '/admin/system-settings',
        label: 'System Settings',
        icon: Settings,
        description: 'Platform configuration management',
      },
    ],
    [pendingVerificationsCount]
  );

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const isActivePath = (path) => {
    return (
      location.pathname === path || location.pathname.startsWith(path + '/')
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Fixed Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gradient-to-br from-bottle-green to-mint-fresh rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <span className="ml-3 text-xl font-semibold text-gray-900">
              Aaroth Admin
            </span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-6 px-3">
          {adminNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = isActivePath(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`group flex items-center px-3 py-3 text-sm font-medium rounded-xl mb-1 transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-bottle-green/10 to-mint-fresh/10 text-bottle-green border-l-4 border-bottle-green'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon
                  className={`mr-3 h-5 w-5 flex-shrink-0 ${
                    isActive
                      ? 'text-bottle-green'
                      : 'text-gray-400 group-hover:text-gray-500'
                  }`}
                />
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <span className="bg-tomato-red text-white text-xs font-medium px-2 py-1 rounded-full">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Admin Profile & Logout */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white">
          <div className="flex items-center mb-3 p-2 rounded-lg bg-gray-50">
            <div className="w-8 h-8 bg-gradient-to-br from-bottle-green to-mint-fresh rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="ml-3 flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.name || 'Admin User'}
              </p>
              <p className="text-xs text-gray-500 truncate">Administrator</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors duration-200"
          >
            <LogOut className="mr-3 h-4 w-4" />
            Sign out
          </button>
        </div>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 lg:ml-0">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-gray-500 hover:text-gray-700"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900">Admin Panel</h1>
            <div className="w-6 h-6" /> {/* Spacer */}
          </div>
        </div>

        {/* Page Content */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
