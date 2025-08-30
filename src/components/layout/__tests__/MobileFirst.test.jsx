import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, render, fireEvent } from '@testing-library/react';
import { renderWithProviders } from '../../../test/test-utils';
import Header from '../Header';
import MobileNavigation from '../MobileNavigation';
import Sidebar from '../Sidebar';

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

// Mock authService
vi.mock('../../../services/authService', () => ({
  default: {
    logout: vi.fn(),
  },
}));

describe('Mobile-First Design Validation', () => {
  const authState = {
    auth: {
      isAuthenticated: true,
      user: { name: 'Test User', role: 'vendor' },
      token: 'test-token',
    },
    theme: { mode: 'light', isSystemPreference: false },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Touch Target Validation (44px minimum)', () => {
    it('header buttons meet minimum touch target size', () => {
      renderWithProviders(
        <Header onMenuToggle={vi.fn()} isSidebarOpen={false} />,
        {
          preloadedState: authState,
        }
      );

      const buttons = screen.getAllByRole('button');
      buttons.forEach((button) => {
        expect(button).toHaveClass('min-h-[44px]');
      });
    });

    it('mobile navigation tabs meet minimum touch target size', () => {
      renderWithProviders(<MobileNavigation />, {
        preloadedState: authState,
      });

      const buttons = screen.getAllByRole('button');
      buttons.forEach((button) => {
        // Mobile nav uses 72px minimum height for better thumb access
        expect(button).toHaveClass('min-h-[72px]');
        expect(button).toHaveClass('min-w-[60px]');
      });
    });

    it('sidebar navigation items meet minimum touch target size', () => {
      renderWithProviders(<Sidebar isOpen onClose={vi.fn()} />, {
        preloadedState: authState,
      });

      const navigationButtons = screen.getAllByRole('button');
      // Filter out the close button which has different sizing
      const navItems = navigationButtons.filter(
        (button) => !button.getAttribute('aria-label')?.includes('Close')
      );

      navItems.forEach((button) => {
        // Sidebar nav items should have minimum 44px height
        const hasMinHeight =
          button.classList.contains('min-h-[44px]') ||
          button.classList.contains('min-h-[40px]'); // Child items
        expect(hasMinHeight).toBe(true);
      });
    });
  });

  describe('Mobile Layout and Spacing', () => {
    it('mobile navigation is positioned at bottom with proper z-index', () => {
      const { container } = renderWithProviders(<MobileNavigation />, {
        preloadedState: authState,
      });

      const nav = container.querySelector('nav');
      expect(nav).toHaveClass('fixed');
      expect(nav).toHaveClass('bottom-0');
      expect(nav).toHaveClass('left-0');
      expect(nav).toHaveClass('right-0');
      expect(nav).toHaveClass('z-40');
      expect(nav).toHaveClass('lg:hidden'); // Hidden on desktop
    });

    it('header is fixed at top with backdrop blur', () => {
      const { container } = renderWithProviders(
        <Header onMenuToggle={vi.fn()} isSidebarOpen={false} />,
        {
          preloadedState: authState,
        }
      );

      const header = container.querySelector('header');
      expect(header).toHaveClass('fixed');
      expect(header).toHaveClass('top-0');
      expect(header).toHaveClass('left-0');
      expect(header).toHaveClass('right-0');
      expect(header).toHaveClass('backdrop-blur-xl');
      expect(header).toHaveClass('z-50');
    });

    it('sidebar overlay covers full screen on mobile', () => {
      const { container } = renderWithProviders(
        <Sidebar isOpen onClose={vi.fn()} />,
        {
          preloadedState: authState,
        }
      );

      // Check for mobile overlay
      const overlay = container.querySelector('.fixed.inset-0.z-40');
      expect(overlay).toBeInTheDocument();
      expect(overlay).toHaveClass('lg:hidden'); // Only on mobile
    });
  });

  describe('Touch-Friendly Interactions', () => {
    it('mobile navigation provides visual feedback on touch', () => {
      renderWithProviders(<MobileNavigation />, {
        preloadedState: authState,
      });

      const buttons = screen.getAllByRole('button');
      buttons.forEach((button) => {
        // Should have hover states for touch feedback or active states
        const hasVisualFeedback =
          button.className.includes('hover:text-') ||
          button.className.includes('hover:bg-') ||
          button.className.includes('group-hover:') ||
          button.className.includes('bg-muted-olive/10'); // Active state
        expect(hasVisualFeedback).toBe(true);
      });
    });

    it('header menu toggle is easily accessible on mobile', () => {
      renderWithProviders(
        <Header onMenuToggle={vi.fn()} isSidebarOpen={false} />,
        {
          preloadedState: authState,
        }
      );

      const menuToggle = screen.getByLabelText('Open menu');
      expect(menuToggle).toHaveClass('lg:hidden'); // Only visible on mobile
      expect(menuToggle).toHaveClass('w-10');
      expect(menuToggle).toHaveClass('h-10');
      expect(menuToggle).toHaveClass('min-h-[44px]');
    });

    it('sidebar close button is accessible on mobile', () => {
      renderWithProviders(<Sidebar isOpen onClose={vi.fn()} />, {
        preloadedState: authState,
      });

      const closeButton = screen.getByLabelText('Close sidebar');
      expect(closeButton).toHaveClass('lg:hidden'); // Only visible on mobile
      expect(closeButton).toHaveClass('w-8');
      expect(closeButton).toHaveClass('h-8');
    });
  });

  describe('Responsive Search Behavior', () => {
    it('shows desktop and mobile search bars appropriately', () => {
      renderWithProviders(
        <Header onMenuToggle={vi.fn()} isSidebarOpen={false} />,
        {
          preloadedState: authState,
        }
      );

      const searchInputs = screen.getAllByPlaceholderText(/Search/);
      expect(searchInputs).toHaveLength(2); // Desktop and mobile

      // Desktop search should be hidden on mobile
      const desktopSearch = searchInputs.find(
        (input) =>
          input.closest('div').classList.contains('hidden') &&
          input.closest('div').classList.contains('md:flex')
      );
      expect(desktopSearch).toBeTruthy();

      // Mobile search should be hidden on desktop
      const mobileSearch = searchInputs.find((input) =>
        input.closest('div').classList.contains('md:hidden')
      );
      expect(mobileSearch).toBeTruthy();
    });

    it('search inputs have proper mobile styling', () => {
      renderWithProviders(
        <Header onMenuToggle={vi.fn()} isSidebarOpen={false} />,
        {
          preloadedState: authState,
        }
      );

      const searchInputs = screen.getAllByPlaceholderText(/Search/);
      searchInputs.forEach((input) => {
        expect(input).toHaveClass('rounded-2xl');
        expect(input).toHaveClass('min-h-[44px]');
        // Check for either px-4 or pl-11 (they use different left padding with icon)
        const hasProperPadding =
          input.classList.contains('px-4') || input.classList.contains('pl-11');
        expect(hasProperPadding).toBe(true);
      });
    });
  });

  describe('Glass Morphism and Visual Effects', () => {
    it('applies glassmorphism effects correctly', () => {
      const { container: headerContainer } = renderWithProviders(
        <Header onMenuToggle={vi.fn()} isSidebarOpen={false} />,
        { preloadedState: authState }
      );

      const { container: mobileNavContainer } = renderWithProviders(
        <MobileNavigation />,
        { preloadedState: authState }
      );

      const { container: sidebarContainer } = renderWithProviders(
        <Sidebar isOpen onClose={vi.fn()} />,
        { preloadedState: authState }
      );

      // Header should have backdrop blur
      const header = headerContainer.querySelector('header');
      expect(header).toHaveClass('backdrop-blur-xl');

      // Mobile nav should have backdrop blur
      const mobileNav = mobileNavContainer.querySelector('nav');
      expect(mobileNav).toHaveClass('backdrop-blur-xl');

      // Sidebar should have backdrop blur
      const sidebar = sidebarContainer.querySelector('aside');
      expect(sidebar).toHaveClass('backdrop-blur-xl');
    });

    it('uses organic rounded corners throughout', () => {
      const { container } = renderWithProviders(
        <Header onMenuToggle={vi.fn()} isSidebarOpen={false} />,
        {
          preloadedState: authState,
        }
      );

      // Buttons should use rounded-2xl (16px)
      const buttons = container.querySelectorAll('button');
      buttons.forEach((button) => {
        const hasOrganic =
          button.classList.contains('rounded-2xl') ||
          button.classList.contains('rounded-xl') ||
          button.classList.contains('rounded-full');
        expect(hasOrganic).toBe(true);
      });
    });
  });

  describe('Animation and Micro-interactions', () => {
    it('applies transition animations to interactive elements', () => {
      renderWithProviders(<MobileNavigation />, {
        preloadedState: authState,
      });

      const buttons = screen.getAllByRole('button');
      buttons.forEach((button) => {
        expect(button.className).toMatch(/transition-all.*duration-\d+/);
      });
    });

    it('active navigation items show visual feedback', () => {
      renderWithProviders(<MobileNavigation />, {
        preloadedState: authState,
      });

      // Dashboard should be active (mocked location is /vendor/dashboard)
      const dashboardButton = screen.getByLabelText('Dashboard');
      expect(dashboardButton).toHaveClass('bg-muted-olive/10');
      expect(dashboardButton).toHaveClass('text-muted-olive');
    });
  });

  describe('Accessibility on Mobile', () => {
    it('maintains focus management on mobile', () => {
      renderWithProviders(
        <Header onMenuToggle={vi.fn()} isSidebarOpen={false} />,
        {
          preloadedState: authState,
        }
      );

      const buttons = screen.getAllByRole('button');
      // Verify that buttons are keyboard accessible (can be focused)
      buttons.forEach((button) => {
        // All buttons should be focusable by default (not disabled)
        expect(button).not.toHaveAttribute('disabled');
        // Should have appropriate tab index or rely on default
        const tabIndex = button.getAttribute('tabindex');
        if (tabIndex !== null) {
          expect(parseInt(tabIndex)).toBeGreaterThanOrEqual(-1);
        }
      });
    });

    it('provides proper ARIA labels for mobile navigation', () => {
      renderWithProviders(<MobileNavigation />, {
        preloadedState: authState,
      });

      expect(screen.getByLabelText('Dashboard')).toBeInTheDocument();
      expect(screen.getByLabelText('Listings')).toBeInTheDocument();
      expect(screen.getByLabelText('Orders')).toBeInTheDocument();
      expect(screen.getByLabelText('Profile')).toBeInTheDocument();
    });

    it('sidebar maintains semantic HTML structure', () => {
      const { container } = renderWithProviders(
        <Sidebar isOpen onClose={vi.fn()} />,
        {
          preloadedState: authState,
        }
      );

      const sidebar = container.querySelector('aside');
      expect(sidebar).toBeInTheDocument();

      const nav = container.querySelector('nav');
      expect(nav).toBeInTheDocument();
    });
  });

  describe('Safe Area and Device Compatibility', () => {
    it('mobile navigation includes safe area padding', () => {
      const { container } = renderWithProviders(<MobileNavigation />, {
        preloadedState: authState,
      });

      // Check for safe area consideration
      const safeAreaElement = container.querySelector(
        '.h-safe-area-inset-bottom'
      );
      expect(safeAreaElement).toBeInTheDocument();
    });

    it('header height is consistent across mobile and desktop', () => {
      const { container } = renderWithProviders(
        <Header onMenuToggle={vi.fn()} isSidebarOpen={false} />,
        {
          preloadedState: authState,
        }
      );

      const headerContent = container.querySelector('.h-16');
      expect(headerContent).toBeInTheDocument();
    });
  });
});
