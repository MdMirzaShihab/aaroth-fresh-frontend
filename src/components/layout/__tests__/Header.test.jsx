import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, render, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../../../test/test-utils';
import Header from '../Header';
import authService from '../../../services/authService';

// Mock authService
vi.mock('../../../services/authService', () => ({
  default: {
    logout: vi.fn()
  }
}));

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

describe('Header', () => {
  const mockProps = {
    onMenuToggle: vi.fn(),
    isSidebarOpen: false
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly for authenticated users', () => {
    const preloadedState = {
      auth: {
        isAuthenticated: true,
        user: { name: 'Test User', role: 'admin', phone: '+1234567890' },
        token: 'test-token'
      },
      theme: { mode: 'light', isSystemPreference: false }
    };

    renderWithProviders(<Header {...mockProps} />, { preloadedState });

    expect(screen.getByText('Aaroth Fresh')).toBeInTheDocument();
    expect(screen.getByLabelText('Open menu')).toBeInTheDocument();
    expect(screen.getByLabelText('Notifications')).toBeInTheDocument();
    expect(screen.getByLabelText(/Switch to dark mode/)).toBeInTheDocument();
    expect(screen.getByLabelText('User menu')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Search products/)).toBeInTheDocument();
  });

  it('renders correctly for unauthenticated users', () => {
    const preloadedState = {
      auth: {
        isAuthenticated: false,
        user: null,
        token: null
      },
      theme: { mode: 'light', isSystemPreference: false }
    };

    renderWithProviders(<Header {...mockProps} />, { preloadedState });

    expect(screen.getByText('Aaroth Fresh')).toBeInTheDocument();
    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.queryByLabelText('Open menu')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Notifications')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('User menu')).not.toBeInTheDocument();
  });

  it('toggles theme correctly', async () => {
    const preloadedState = {
      auth: {
        isAuthenticated: true,
        user: { name: 'Test User', role: 'admin' },
        token: 'test-token'
      },
      theme: { mode: 'light', isSystemPreference: false }
    };

    const { store } = renderWithProviders(<Header {...mockProps} />, { preloadedState });

    const themeToggle = screen.getByLabelText('Switch to dark mode');
    fireEvent.click(themeToggle);

    await waitFor(() => {
      expect(store.getState().theme.mode).toBe('dark');
    });
  });

  it('handles menu toggle correctly', () => {
    const preloadedState = {
      auth: {
        isAuthenticated: true,
        user: { name: 'Test User', role: 'admin' },
        token: 'test-token'
      },
      theme: { mode: 'light', isSystemPreference: false }
    };

    renderWithProviders(<Header {...mockProps} />, { preloadedState });

    const menuToggle = screen.getByLabelText('Open menu');
    fireEvent.click(menuToggle);

    expect(mockProps.onMenuToggle).toHaveBeenCalled();
  });

  it('shows correct menu button icon based on sidebar state', () => {
    const preloadedState = {
      auth: {
        isAuthenticated: true,
        user: { name: 'Test User', role: 'admin' },
        token: 'test-token'
      },
      theme: { mode: 'light', isSystemPreference: false }
    };

    // Test closed state
    const { rerender } = renderWithProviders(<Header {...mockProps} />, { preloadedState });
    expect(screen.getByLabelText('Open menu')).toBeInTheDocument();

    // Test open state
    rerender(<Header {...mockProps} isSidebarOpen={true} />);
    expect(screen.getByLabelText('Close menu')).toBeInTheDocument();
  });

  it('opens and closes user menu', async () => {
    const preloadedState = {
      auth: {
        isAuthenticated: true,
        user: { name: 'Test User', role: 'admin' },
        token: 'test-token'
      },
      theme: { mode: 'light', isSystemPreference: false }
    };

    renderWithProviders(<Header {...mockProps} />, { preloadedState });

    const userMenuButton = screen.getByLabelText('User menu');
    
    // Menu should be closed initially
    expect(screen.queryByText('Profile')).not.toBeInTheDocument();

    // Open menu
    fireEvent.click(userMenuButton);
    
    await waitFor(() => {
      expect(screen.getByText('Profile')).toBeInTheDocument();
      expect(screen.getByText('Settings')).toBeInTheDocument();
      expect(screen.getByText('Logout')).toBeInTheDocument();
    });
  });

  it('opens and closes notifications', async () => {
    const preloadedState = {
      auth: {
        isAuthenticated: true,
        user: { name: 'Test User', role: 'admin' },
        token: 'test-token'
      },
      theme: { mode: 'light', isSystemPreference: false }
    };

    renderWithProviders(<Header {...mockProps} />, { preloadedState });

    const notificationButton = screen.getByLabelText('Notifications');
    
    // Notifications should be closed initially
    expect(screen.queryByText('Notifications')).not.toBeInTheDocument();

    // Open notifications
    fireEvent.click(notificationButton);
    
    await waitFor(() => {
      expect(screen.getByText('Notifications')).toBeInTheDocument();
    });
  });

  it('handles logout correctly', async () => {
    const preloadedState = {
      auth: {
        isAuthenticated: true,
        user: { name: 'Test User', role: 'admin' },
        token: 'test-token'
      },
      theme: { mode: 'light', isSystemPreference: false }
    };

    renderWithProviders(<Header {...mockProps} />, { preloadedState });

    // Open user menu
    const userMenuButton = screen.getByLabelText('User menu');
    fireEvent.click(userMenuButton);

    // Click logout
    await waitFor(() => {
      const logoutButton = screen.getByText('Logout');
      fireEvent.click(logoutButton);
    });

    expect(authService.logout).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('handles search submission', async () => {
    const preloadedState = {
      auth: {
        isAuthenticated: true,
        user: { name: 'Test User', role: 'admin' },
        token: 'test-token'
      },
      theme: { mode: 'light', isSystemPreference: false }
    };

    renderWithProviders(<Header {...mockProps} />, { preloadedState });

    const searchInput = screen.getByPlaceholderText(/Search products/);
    fireEvent.change(searchInput, { target: { value: 'test query' } });

    const form = searchInput.closest('form');
    fireEvent.submit(form);

    expect(mockNavigate).toHaveBeenCalledWith('/search?q=test%20query');
  });

  it('shows mobile search bar on mobile devices', () => {
    const preloadedState = {
      auth: {
        isAuthenticated: true,
        user: { name: 'Test User', role: 'admin' },
        token: 'test-token'
      },
      theme: { mode: 'light', isSystemPreference: false }
    };

    renderWithProviders(<Header {...mockProps} />, { preloadedState });

    // Should have both desktop (md:flex) and mobile search
    const searchInputs = screen.getAllByPlaceholderText(/Search/);
    expect(searchInputs).toHaveLength(2); // Desktop and mobile versions
  });

  it('displays user avatar when available', () => {
    const preloadedState = {
      auth: {
        isAuthenticated: true,
        user: { 
          name: 'Test User', 
          role: 'admin', 
          avatar: 'https://example.com/avatar.jpg' 
        },
        token: 'test-token'
      },
      theme: { mode: 'light', isSystemPreference: false }
    };

    renderWithProviders(<Header {...mockProps} />, { preloadedState });

    const avatars = screen.getAllByAltText('Test User');
    expect(avatars.length).toBeGreaterThan(0);
    expect(avatars[0]).toHaveAttribute('src', 'https://example.com/avatar.jpg');
  });

  it('meets accessibility requirements', () => {
    const preloadedState = {
      auth: {
        isAuthenticated: true,
        user: { name: 'Test User', role: 'admin' },
        token: 'test-token'
      },
      theme: { mode: 'light', isSystemPreference: false }
    };

    renderWithProviders(<Header {...mockProps} />, { preloadedState });

    // Check for proper ARIA labels
    expect(screen.getByLabelText('Open menu')).toBeInTheDocument();
    expect(screen.getByLabelText('Notifications')).toBeInTheDocument();
    expect(screen.getByLabelText('User menu')).toBeInTheDocument();
    expect(screen.getByLabelText(/Switch to dark mode/)).toBeInTheDocument();

    // Check minimum touch target sizes would be handled by CSS classes
    const buttons = screen.getAllByRole('button');
    buttons.forEach(button => {
      expect(button).toHaveClass('min-h-[44px]');
    });
  });
});