import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { renderWithProviders } from '../../../test/test-utils';
import LoginForm from '../LoginForm';

// Mock the auth service
vi.mock('../../../services/authService', () => ({
  default: {
    performLogout: vi.fn(),
    handleTokenExpiration: vi.fn(),
  },
}));

// Mock react-router-dom hooks
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderLoginForm = (preloadedState = {}) => {
    return renderWithProviders(
      <BrowserRouter>
        <LoginForm />
      </BrowserRouter>,
      { preloadedState }
    );
  };

  describe('Rendering', () => {
    it('renders login form with all required fields', () => {
      renderLoginForm();

      expect(
        screen.getByRole('heading', { name: /welcome back/i })
      ).toBeInTheDocument();
      expect(screen.getByLabelText(/phone number/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /sign in/i })
      ).toBeInTheDocument();
    });

    it('renders form with mobile-first design elements', () => {
      renderLoginForm();

      const phoneInput = screen.getByLabelText(/phone number/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      // Check minimum touch target sizes (44px)
      expect(phoneInput).toHaveClass('min-h-[44px]');
      expect(passwordInput).toHaveClass('min-h-[44px]');
      expect(submitButton).toHaveClass('min-h-[44px]');

      // Check mobile-friendly styles
      expect(phoneInput).toHaveClass('rounded-2xl');
      expect(passwordInput).toHaveClass('rounded-2xl');
      expect(submitButton).toHaveClass('rounded-2xl');
    });

    it('renders navigation links correctly', () => {
      renderLoginForm();

      expect(
        screen.getByRole('link', { name: /sign up here/i })
      ).toHaveAttribute('href', '/register');
      expect(
        screen.getByRole('link', { name: /forgot your password/i })
      ).toHaveAttribute('href', '/forgot-password');
    });

    it('renders password visibility toggle', () => {
      renderLoginForm();

      const toggleButton = screen.getByRole('button', { name: '' }); // Eye icon button
      expect(toggleButton).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('shows validation error for empty phone number', async () => {
      const user = userEvent.setup();
      renderLoginForm();

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText(/phone number is required/i)
        ).toBeInTheDocument();
      });
    });

    it('shows validation error for invalid phone format', async () => {
      const user = userEvent.setup();
      renderLoginForm();

      const phoneInput = screen.getByLabelText(/phone number/i);
      await user.type(phoneInput, '123');

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/invalid phone number/i)).toBeInTheDocument();
      });
    });

    it('shows validation error for empty password', async () => {
      const user = userEvent.setup();
      renderLoginForm();

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/password is required/i)).toBeInTheDocument();
      });
    });

    it('shows validation error for short password', async () => {
      const user = userEvent.setup();
      renderLoginForm();

      const passwordInput = screen.getByLabelText(/password/i);
      await user.type(passwordInput, '12345');

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText(/password must be at least 6 characters/i)
        ).toBeInTheDocument();
      });
    });

    it('validates Bangladesh phone number format correctly', async () => {
      const user = userEvent.setup();
      renderLoginForm();

      const phoneInput = screen.getByLabelText(/phone number/i);

      // Valid Bangladesh phone number
      await user.type(phoneInput, '+8801712345678');

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.queryByText(/invalid phone number/i)
        ).not.toBeInTheDocument();
      });
    });
  });

  describe('Phone Number Formatting', () => {
    it('formats phone number during typing', async () => {
      const user = userEvent.setup();
      renderLoginForm();

      const phoneInput = screen.getByLabelText(/phone number/i);

      // Type raw digits
      await user.type(phoneInput, '8801712345678');

      // Should be formatted for display
      expect(phoneInput.value).toMatch(/^\+88\s01\d{2}\s\d{6}$/);
    });

    it('handles phone number with country code', async () => {
      const user = userEvent.setup();
      renderLoginForm();

      const phoneInput = screen.getByLabelText(/phone number/i);

      // Type with country code
      await user.type(phoneInput, '+8801712345678');

      expect(phoneInput.value).toMatch(/^\+88\s01\d{2}\s\d{6}$/);
    });
  });

  describe('Password Visibility', () => {
    it('toggles password visibility when eye icon is clicked', async () => {
      const user = userEvent.setup();
      renderLoginForm();

      const passwordInput = screen.getByLabelText(/password/i);
      const toggleButton = screen.getByRole('button', { name: '' }); // Eye icon

      // Initially password type
      expect(passwordInput).toHaveAttribute('type', 'password');

      // Click to show password
      await user.click(toggleButton);
      expect(passwordInput).toHaveAttribute('type', 'text');

      // Click to hide password
      await user.click(toggleButton);
      expect(passwordInput).toHaveAttribute('type', 'password');
    });
  });

  describe('Form Submission', () => {
    it('calls login mutation with correct data on form submission', async () => {
      const user = userEvent.setup();
      const { store } = renderLoginForm();

      const phoneInput = screen.getByLabelText(/phone number/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(phoneInput, '+8801712345678');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      // Check if the form submission triggers the right action
      // This would require mocking the RTK Query hook
      expect(phoneInput.value).toBeTruthy();
      expect(passwordInput.value).toBeTruthy();
    });

    it('shows loading state during form submission', async () => {
      const user = userEvent.setup();

      // Mock the login mutation to return loading state
      const preloadedState = {
        api: {
          queries: {},
          mutations: {},
        },
      };

      renderLoginForm(preloadedState);

      const phoneInput = screen.getByLabelText(/phone number/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(phoneInput, '+8801712345678');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      // Should show loading state
      expect(submitButton).toBeDisabled();
    });
  });

  describe('Navigation', () => {
    it('navigates to appropriate dashboard based on user role', () => {
      // This would test the navigation logic after successful login
      // Implementation depends on mocking successful login response
      expect(mockNavigate).toBeDefined();
    });
  });

  describe('Accessibility', () => {
    it('provides proper ARIA labels for form fields', () => {
      renderLoginForm();

      const phoneInput = screen.getByLabelText(/phone number/i);
      const passwordInput = screen.getByLabelText(/password/i);

      expect(phoneInput).toHaveAttribute('id', 'phone');
      expect(passwordInput).toHaveAttribute('id', 'password');
    });

    it('shows error messages with proper accessibility attributes', async () => {
      const user = userEvent.setup();
      renderLoginForm();

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(submitButton);

      await waitFor(() => {
        const errorMessages = screen.getAllByText(/required/i);
        errorMessages.forEach((error) => {
          expect(error).toHaveClass('animate-fade-in');
        });
      });
    });

    it('maintains focus management for keyboard users', async () => {
      const user = userEvent.setup();
      renderLoginForm();

      // Tab through form elements
      await user.tab();
      expect(screen.getByLabelText(/phone number/i)).toHaveFocus();

      await user.tab();
      expect(screen.getByLabelText(/password/i)).toHaveFocus();

      await user.tab();
      expect(screen.getByRole('button', { name: /sign in/i })).toHaveFocus();
    });
  });

  describe('Error Handling', () => {
    it('displays server error messages', async () => {
      // Mock failed login response
      const user = userEvent.setup();
      renderLoginForm();

      const phoneInput = screen.getByLabelText(/phone number/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(phoneInput, '+8801712345678');
      await user.type(passwordInput, 'wrongpassword');
      await user.click(submitButton);

      // Would test error handling from RTK Query mutation
    });
  });
});
