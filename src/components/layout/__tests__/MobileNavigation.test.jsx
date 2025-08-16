import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, render, fireEvent } from '@testing-library/react';
import { renderWithProviders } from '../../../test/test-utils';
import MobileNavigation from '../MobileNavigation';

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ pathname: '/vendor/dashboard' }),
  };
});

describe('MobileNavigation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not render when user is not authenticated', () => {
    const preloadedState = {
      auth: {
        isAuthenticated: false,
        user: null,
        token: null,
      },
    };

    const { container } = renderWithProviders(<MobileNavigation />, {
      preloadedState,
    });
    expect(container.firstChild).toBeNull();
  });

  it('renders admin navigation for admin users', () => {
    const preloadedState = {
      auth: {
        isAuthenticated: true,
        user: { name: 'Admin User', role: 'admin' },
        token: 'test-token',
      },
    };

    renderWithProviders(<MobileNavigation />, { preloadedState });

    expect(screen.getByLabelText('Dashboard')).toBeInTheDocument();
    expect(screen.getByLabelText('Users')).toBeInTheDocument();
    expect(screen.getByLabelText('Analytics')).toBeInTheDocument();
    expect(screen.getByLabelText('Settings')).toBeInTheDocument();
  });

  it('renders vendor navigation for vendor users', () => {
    const preloadedState = {
      auth: {
        isAuthenticated: true,
        user: { name: 'Vendor User', role: 'vendor' },
        token: 'test-token',
      },
    };

    renderWithProviders(<MobileNavigation />, { preloadedState });

    expect(screen.getByLabelText('Dashboard')).toBeInTheDocument();
    expect(screen.getByLabelText('Listings')).toBeInTheDocument();
    expect(screen.getByLabelText('Orders')).toBeInTheDocument();
    expect(screen.getByLabelText('Profile')).toBeInTheDocument();
  });

  it('renders restaurant navigation for restaurant users', () => {
    const preloadedState = {
      auth: {
        isAuthenticated: true,
        user: { name: 'Restaurant User', role: 'restaurantOwner' },
        token: 'test-token',
      },
    };

    renderWithProviders(<MobileNavigation />, { preloadedState });

    expect(screen.getByLabelText('Dashboard')).toBeInTheDocument();
    expect(screen.getByLabelText('Browse')).toBeInTheDocument();
    expect(screen.getByLabelText('Cart')).toBeInTheDocument();
    expect(screen.getByLabelText('Orders')).toBeInTheDocument();
  });

  it('handles navigation correctly', () => {
    const preloadedState = {
      auth: {
        isAuthenticated: true,
        user: { name: 'Vendor User', role: 'vendor' },
        token: 'test-token',
      },
    };

    renderWithProviders(<MobileNavigation />, { preloadedState });

    const dashboardButton = screen.getByLabelText('Dashboard');
    fireEvent.click(dashboardButton);

    expect(mockNavigate).toHaveBeenCalledWith('/vendor/dashboard');
  });

  it('highlights active navigation item correctly', () => {
    const preloadedState = {
      auth: {
        isAuthenticated: true,
        user: { name: 'Vendor User', role: 'vendor' },
        token: 'test-token',
      },
    };

    // Mock current location as vendor dashboard
    vi.doMock('react-router-dom', () => ({
      useNavigate: () => mockNavigate,
      useLocation: () => ({ pathname: '/vendor/dashboard' }),
    }));

    renderWithProviders(<MobileNavigation />, { preloadedState });

    const dashboardButton = screen.getByLabelText('Dashboard');

    // Should have active styling classes
    expect(dashboardButton).toHaveClass('bg-bottle-green/10');
    expect(dashboardButton).toHaveClass('text-bottle-green');
  });

  it('meets mobile-first accessibility requirements', () => {
    const preloadedState = {
      auth: {
        isAuthenticated: true,
        user: { name: 'Vendor User', role: 'vendor' },
        token: 'test-token',
      },
    };

    renderWithProviders(<MobileNavigation />, { preloadedState });

    const buttons = screen.getAllByRole('button');

    // Check minimum touch target sizes
    buttons.forEach((button) => {
      expect(button).toHaveClass('min-h-[72px]');
      expect(button).toHaveClass('min-w-[60px]');
    });

    // Check accessibility labels
    expect(screen.getByLabelText('Dashboard')).toBeInTheDocument();
    expect(screen.getByLabelText('Listings')).toBeInTheDocument();
    expect(screen.getByLabelText('Orders')).toBeInTheDocument();
    expect(screen.getByLabelText('Profile')).toBeInTheDocument();
  });

  it('renders with proper bottom positioning', () => {
    const preloadedState = {
      auth: {
        isAuthenticated: true,
        user: { name: 'Vendor User', role: 'vendor' },
        token: 'test-token',
      },
    };

    const { container } = renderWithProviders(<MobileNavigation />, {
      preloadedState,
    });
    const nav = container.querySelector('nav');

    expect(nav).toHaveClass('fixed');
    expect(nav).toHaveClass('bottom-0');
    expect(nav).toHaveClass('left-0');
    expect(nav).toHaveClass('right-0');
    expect(nav).toHaveClass('lg:hidden'); // Only visible on mobile
  });

  it('shows active indicator dot for current page', () => {
    const preloadedState = {
      auth: {
        isAuthenticated: true,
        user: { name: 'Vendor User', role: 'vendor' },
        token: 'test-token',
      },
    };

    renderWithProviders(<MobileNavigation />, { preloadedState });

    const dashboardButton = screen.getByLabelText('Dashboard');
    const icon = dashboardButton.querySelector('div'); // Icon container

    // Should have active indicator dot
    expect(icon.querySelector('.animate-scale-in')).toBeInTheDocument();
  });

  it('handles restaurant manager role correctly', () => {
    const preloadedState = {
      auth: {
        isAuthenticated: true,
        user: { name: 'Restaurant Manager', role: 'restaurantManager' },
        token: 'test-token',
      },
    };

    renderWithProviders(<MobileNavigation />, { preloadedState });

    // Should show same navigation as restaurant owner
    expect(screen.getByLabelText('Dashboard')).toBeInTheDocument();
    expect(screen.getByLabelText('Browse')).toBeInTheDocument();
    expect(screen.getByLabelText('Cart')).toBeInTheDocument();
    expect(screen.getByLabelText('Orders')).toBeInTheDocument();
  });

  it('renders glassmorphism styling correctly', () => {
    const preloadedState = {
      auth: {
        isAuthenticated: true,
        user: { name: 'Vendor User', role: 'vendor' },
        token: 'test-token',
      },
    };

    const { container } = renderWithProviders(<MobileNavigation />, {
      preloadedState,
    });
    const nav = container.querySelector('nav');

    expect(nav).toHaveClass('bg-white/95');
    expect(nav).toHaveClass('backdrop-blur-xl');
    expect(nav).toHaveClass('border-t');
  });

  it('has proper z-index for mobile overlay', () => {
    const preloadedState = {
      auth: {
        isAuthenticated: true,
        user: { name: 'Vendor User', role: 'vendor' },
        token: 'test-token',
      },
    };

    const { container } = renderWithProviders(<MobileNavigation />, {
      preloadedState,
    });
    const nav = container.querySelector('nav');

    expect(nav).toHaveClass('z-40');
  });
});
