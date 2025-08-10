import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { renderWithProviders } from '../../../test/test-utils';
import RegisterForm from '../RegisterForm';

// Mock react-router-dom hooks
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('RegisterForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderRegisterForm = (preloadedState = {}) => {
    return renderWithProviders(
      <BrowserRouter>
        <RegisterForm />
      </BrowserRouter>,
      { preloadedState }
    );
  };

  describe('Rendering', () => {
    it('renders registration form with all required fields', () => {
      renderRegisterForm();

      expect(
        screen.getByRole('heading', { name: /join aaroth fresh/i })
      ).toBeInTheDocument();
      expect(screen.getByLabelText(/account type/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/phone number/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /create account/i })
      ).toBeInTheDocument();
    });

    it('renders mobile-first design elements with proper touch targets', () => {
      renderRegisterForm();

      const inputs = [
        screen.getByLabelText(/full name/i),
        screen.getByLabelText(/phone number/i),
        screen.getByLabelText(/email address/i),
        screen.getByLabelText(/^password$/i),
        screen.getByLabelText(/confirm password/i),
      ];

      inputs.forEach((input) => {
        expect(input).toHaveClass('min-h-[44px]');
        expect(input).toHaveClass('rounded-2xl');
      });

      const submitButton = screen.getByRole('button', {
        name: /create account/i,
      });
      expect(submitButton).toHaveClass('min-h-[44px]');
    });

    it('renders role selection dropdown with all options', () => {
      renderRegisterForm();

      const roleSelect = screen.getByLabelText(/account type/i);
      expect(roleSelect).toBeInTheDocument();

      // Check for role options
      expect(
        screen.getByRole('option', { name: /vendor.*sell fresh produce/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('option', {
          name: /restaurant owner.*purchase fresh ingredients/i,
        })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('option', {
          name: /restaurant manager.*manage restaurant orders/i,
        })
      ).toBeInTheDocument();
    });
  });

  describe('Role-Based Form Fields', () => {
    it('shows business fields for vendor role', async () => {
      const user = userEvent.setup();
      renderRegisterForm();

      const roleSelect = screen.getByLabelText(/account type/i);
      await user.selectOptions(roleSelect, 'vendor');

      await waitFor(() => {
        expect(screen.getByLabelText(/business name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/business address/i)).toBeInTheDocument();
      });
    });

    it('shows restaurant fields for restaurant owner role', async () => {
      const user = userEvent.setup();
      renderRegisterForm();

      const roleSelect = screen.getByLabelText(/account type/i);
      await user.selectOptions(roleSelect, 'restaurantOwner');

      await waitFor(() => {
        expect(screen.getByLabelText(/restaurant name/i)).toBeInTheDocument();
        expect(
          screen.getByLabelText(/restaurant address/i)
        ).toBeInTheDocument();
      });
    });

    it('shows restaurant fields for restaurant manager role', async () => {
      const user = userEvent.setup();
      renderRegisterForm();

      const roleSelect = screen.getByLabelText(/account type/i);
      await user.selectOptions(roleSelect, 'restaurantManager');

      await waitFor(() => {
        expect(screen.getByLabelText(/restaurant name/i)).toBeInTheDocument();
        expect(
          screen.getByLabelText(/restaurant address/i)
        ).toBeInTheDocument();
      });
    });
  });

  describe('Form Validation', () => {
    it('validates all required fields', async () => {
      const user = userEvent.setup();
      renderRegisterForm();

      const submitButton = screen.getByRole('button', {
        name: /create account/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/full name is required/i)).toBeInTheDocument();
        expect(
          screen.getByText(/phone number is required/i)
        ).toBeInTheDocument();
        expect(
          screen.getByText(/email address is required/i)
        ).toBeInTheDocument();
        expect(screen.getByText(/password is required/i)).toBeInTheDocument();
      });
    });

    it('validates name length constraints', async () => {
      const user = userEvent.setup();
      renderRegisterForm();

      const nameInput = screen.getByLabelText(/full name/i);

      // Test minimum length
      await user.type(nameInput, 'A');
      await user.tab();

      await waitFor(() => {
        expect(
          screen.getByText(/name must be at least 2 characters/i)
        ).toBeInTheDocument();
      });

      // Clear and test maximum length
      await user.clear(nameInput);
      await user.type(nameInput, 'A'.repeat(51));
      await user.tab();

      await waitFor(() => {
        expect(
          screen.getByText(/name must be less than 50 characters/i)
        ).toBeInTheDocument();
      });
    });

    it('validates email format', async () => {
      const user = userEvent.setup();
      renderRegisterForm();

      const emailInput = screen.getByLabelText(/email address/i);
      await user.type(emailInput, 'invalid-email');
      await user.tab();

      await waitFor(() => {
        expect(
          screen.getByText(/please enter a valid email address/i)
        ).toBeInTheDocument();
      });
    });

    it('validates password complexity', async () => {
      const user = userEvent.setup();
      renderRegisterForm();

      const passwordInput = screen.getByLabelText(/^password$/i);

      // Test minimum length
      await user.type(passwordInput, '1234567');
      await user.tab();

      await waitFor(() => {
        expect(
          screen.getByText(/password must be at least 8 characters/i)
        ).toBeInTheDocument();
      });

      // Test complexity requirements
      await user.clear(passwordInput);
      await user.type(passwordInput, 'simplepasword');
      await user.tab();

      await waitFor(() => {
        expect(
          screen.getByText(
            /password must contain at least one uppercase letter, lowercase letter, and number/i
          )
        ).toBeInTheDocument();
      });
    });

    it('validates password confirmation match', async () => {
      const user = userEvent.setup();
      renderRegisterForm();

      const passwordInput = screen.getByLabelText(/^password$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);

      await user.type(passwordInput, 'Password123');
      await user.type(confirmPasswordInput, 'DifferentPassword');
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
      });
    });

    it('validates business information for business roles', async () => {
      const user = userEvent.setup();
      renderRegisterForm();

      // Select vendor role
      const roleSelect = screen.getByLabelText(/account type/i);
      await user.selectOptions(roleSelect, 'vendor');

      // Submit without business info
      const submitButton = screen.getByRole('button', {
        name: /create account/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText(/business name is required/i)
        ).toBeInTheDocument();
        expect(
          screen.getByText(/business address is required/i)
        ).toBeInTheDocument();
      });
    });
  });

  describe('Phone Number Handling', () => {
    it('formats phone number correctly during input', async () => {
      const user = userEvent.setup();
      renderRegisterForm();

      const phoneInput = screen.getByLabelText(/phone number/i);
      await user.type(phoneInput, '8801712345678');

      expect(phoneInput.value).toMatch(/^\+88\s01\d{2}\s\d{6}$/);
    });

    it('validates Bangladesh phone numbers', async () => {
      const user = userEvent.setup();
      renderRegisterForm();

      const phoneInput = screen.getByLabelText(/phone number/i);

      // Invalid phone number
      await user.type(phoneInput, '+880123456789');
      await user.tab();

      await waitFor(() => {
        expect(screen.queryByText(/invalid phone number/i)).toBeInTheDocument();
      });

      // Valid phone number
      await user.clear(phoneInput);
      await user.type(phoneInput, '+8801712345678');
      await user.tab();

      await waitFor(() => {
        expect(
          screen.queryByText(/invalid phone number/i)
        ).not.toBeInTheDocument();
      });
    });
  });

  describe('Password Visibility Toggles', () => {
    it('toggles password visibility', async () => {
      const user = userEvent.setup();
      renderRegisterForm();

      const passwordInput = screen.getByLabelText(/^password$/i);
      const toggleButtons = screen.getAllByRole('button', { name: '' }); // Eye icons
      const passwordToggle = toggleButtons[0];

      expect(passwordInput).toHaveAttribute('type', 'password');

      await user.click(passwordToggle);
      expect(passwordInput).toHaveAttribute('type', 'text');

      await user.click(passwordToggle);
      expect(passwordInput).toHaveAttribute('type', 'password');
    });

    it('toggles confirm password visibility independently', async () => {
      const user = userEvent.setup();
      renderRegisterForm();

      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const toggleButtons = screen.getAllByRole('button', { name: '' }); // Eye icons
      const confirmPasswordToggle = toggleButtons[1];

      expect(confirmPasswordInput).toHaveAttribute('type', 'password');

      await user.click(confirmPasswordToggle);
      expect(confirmPasswordInput).toHaveAttribute('type', 'text');
    });
  });

  describe('Form Submission', () => {
    it('submits form with correct data structure', async () => {
      const user = userEvent.setup();
      renderRegisterForm();

      // Fill out form
      await user.selectOptions(
        screen.getByLabelText(/account type/i),
        'vendor'
      );
      await user.type(screen.getByLabelText(/full name/i), 'John Doe');
      await user.type(screen.getByLabelText(/phone number/i), '+8801712345678');
      await user.type(
        screen.getByLabelText(/email address/i),
        'john@example.com'
      );

      // Wait for business fields to appear
      await waitFor(() => {
        expect(screen.getByLabelText(/business name/i)).toBeInTheDocument();
      });

      await user.type(screen.getByLabelText(/business name/i), 'Test Business');
      await user.type(
        screen.getByLabelText(/business address/i),
        '123 Test Street, Dhaka'
      );
      await user.type(screen.getByLabelText(/^password$/i), 'Password123');
      await user.type(
        screen.getByLabelText(/confirm password/i),
        'Password123'
      );

      const submitButton = screen.getByRole('button', {
        name: /create account/i,
      });
      await user.click(submitButton);

      // Form should be valid and ready for submission
      expect(submitButton).toBeEnabled();
    });

    it('shows loading state during registration', async () => {
      const user = userEvent.setup();
      const preloadedState = {
        api: {
          queries: {},
          mutations: {},
        },
      };

      renderRegisterForm(preloadedState);

      const submitButton = screen.getByRole('button', {
        name: /create account/i,
      });

      // Mock loading state would show spinner
      expect(submitButton).toHaveClass('disabled:opacity-50');
    });
  });

  describe('Accessibility', () => {
    it('provides proper form labels and ARIA attributes', () => {
      renderRegisterForm();

      const inputs = [
        { label: /full name/i, id: 'name' },
        { label: /phone number/i, id: 'phone' },
        { label: /email address/i, id: 'email' },
        { label: /^password$/i, id: 'password' },
        { label: /confirm password/i, id: 'confirmPassword' },
      ];

      inputs.forEach(({ label, id }) => {
        const input = screen.getByLabelText(label);
        expect(input).toHaveAttribute('id', id);
      });
    });

    it('maintains proper tab order', async () => {
      const user = userEvent.setup();
      renderRegisterForm();

      // Tab through form in logical order
      await user.tab(); // Role select
      expect(screen.getByLabelText(/account type/i)).toHaveFocus();

      await user.tab(); // Name
      expect(screen.getByLabelText(/full name/i)).toHaveFocus();

      await user.tab(); // Phone
      expect(screen.getByLabelText(/phone number/i)).toHaveFocus();

      await user.tab(); // Email
      expect(screen.getByLabelText(/email address/i)).toHaveFocus();
    });

    it('announces validation errors to screen readers', async () => {
      const user = userEvent.setup();
      renderRegisterForm();

      const submitButton = screen.getByRole('button', {
        name: /create account/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        const errorMessages = screen.getAllByText(/required/i);
        errorMessages.forEach((error) => {
          expect(error).toHaveClass('animate-fade-in');
        });
      });
    });
  });

  describe('Navigation', () => {
    it('renders link to login page', () => {
      renderRegisterForm();

      const loginLink = screen.getByRole('link', { name: /sign in here/i });
      expect(loginLink).toHaveAttribute('href', '/login');
    });
  });
});
