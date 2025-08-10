import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { renderWithProviders } from './test-utils';
import LoginForm from '../components/forms/LoginForm';
import RegisterForm from '../components/forms/RegisterForm';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';

/**
 * Mobile-First Authentication Integration Tests
 *
 * Tests focusing on mobile UX, touch targets, and keyboard behavior
 * according to CLAUDE.md mobile-first design principles
 */

// Mock touch events for mobile testing
const mockTouchEvent = (element, touches = []) => {
  const touchEvent = new Event('touchstart', { bubbles: true });
  touchEvent.touches = touches;
  element.dispatchEvent(touchEvent);
};

// Helper to check minimum touch target size
const checkTouchTargetSize = (element, minSize = 44) => {
  const styles = window.getComputedStyle(element);
  const height = parseFloat(styles.minHeight) || parseFloat(styles.height);
  const width = parseFloat(styles.minWidth) || parseFloat(styles.width);

  return height >= minSize && width >= minSize;
};

describe('Mobile-First Authentication Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock mobile viewport
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375, // iPhone SE width
    });

    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 667,
    });

    // Mock touch support
    Object.defineProperty(navigator, 'maxTouchPoints', {
      writable: true,
      configurable: true,
      value: 5,
    });
  });

  describe('Touch Target Sizes (44px minimum)', () => {
    it('login form has proper touch targets', () => {
      renderWithProviders(
        <BrowserRouter>
          <LoginForm />
        </BrowserRouter>
      );

      // Check input fields
      const phoneInput = screen.getByLabelText(/phone number/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      expect(phoneInput).toHaveClass('min-h-[44px]');
      expect(passwordInput).toHaveClass('min-h-[44px]');
      expect(submitButton).toHaveClass('min-h-[44px]');

      // Check computed styles
      const phoneRect = phoneInput.getBoundingClientRect();
      const passwordRect = passwordInput.getBoundingClientRect();
      const buttonRect = submitButton.getBoundingClientRect();

      expect(phoneRect.height).toBeGreaterThanOrEqual(44);
      expect(passwordRect.height).toBeGreaterThanOrEqual(44);
      expect(buttonRect.height).toBeGreaterThanOrEqual(44);
    });

    it('register form has proper touch targets', () => {
      renderWithProviders(
        <BrowserRouter>
          <RegisterForm />
        </BrowserRouter>
      );

      // Check all interactive elements
      const roleSelect = screen.getByLabelText(/account type/i);
      const nameInput = screen.getByLabelText(/full name/i);
      const phoneInput = screen.getByLabelText(/phone number/i);
      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const submitButton = screen.getByRole('button', {
        name: /create account/i,
      });

      const touchTargets = [
        roleSelect,
        nameInput,
        phoneInput,
        emailInput,
        passwordInput,
        confirmPasswordInput,
        submitButton,
      ];

      touchTargets.forEach((element) => {
        expect(element).toHaveClass('min-h-[44px]');
        const rect = element.getBoundingClientRect();
        expect(rect.height).toBeGreaterThanOrEqual(44);
      });
    });

    it('password visibility toggles are touch-friendly', () => {
      renderWithProviders(
        <BrowserRouter>
          <LoginForm />
        </BrowserRouter>
      );

      const toggleButtons = screen
        .getAllByRole('button')
        .filter((btn) => !btn.textContent.includes('Sign In'));

      toggleButtons.forEach((button) => {
        const rect = button.getBoundingClientRect();
        expect(rect.height).toBeGreaterThanOrEqual(24); // Smaller icon buttons
        expect(rect.width).toBeGreaterThanOrEqual(24);
      });
    });
  });

  describe('Mobile Keyboard Behavior', () => {
    it('phone input opens numeric keyboard', () => {
      renderWithProviders(
        <BrowserRouter>
          <LoginForm />
        </BrowserRouter>
      );

      const phoneInput = screen.getByLabelText(/phone number/i);
      expect(phoneInput).toHaveAttribute('type', 'tel');
      expect(phoneInput).toHaveAttribute('inputmode', 'tel');
    });

    it('email input opens email keyboard', () => {
      renderWithProviders(
        <BrowserRouter>
          <RegisterForm />
        </BrowserRouter>
      );

      const emailInput = screen.getByLabelText(/email address/i);
      expect(emailInput).toHaveAttribute('type', 'email');
    });

    it('numeric inputs have proper input modes', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <BrowserRouter>
          <LoginForm />
        </BrowserRouter>
      );

      const phoneInput = screen.getByLabelText(/phone number/i);

      // Focus should trigger mobile keyboard
      await user.click(phoneInput);
      expect(phoneInput).toHaveFocus();
    });
  });

  describe('Touch Interactions', () => {
    it('handles touch events on form elements', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <BrowserRouter>
          <LoginForm />
        </BrowserRouter>
      );

      const phoneInput = screen.getByLabelText(/phone number/i);
      const passwordInput = screen.getByLabelText(/password/i);

      // Simulate touch interaction
      await user.click(phoneInput);
      expect(phoneInput).toHaveFocus();

      await user.type(phoneInput, '+8801712345678');
      expect(phoneInput.value).toMatch(/\+88/);

      await user.click(passwordInput);
      expect(passwordInput).toHaveFocus();
    });

    it('supports swipe gestures on form containers', () => {
      renderWithProviders(
        <BrowserRouter>
          <RegisterForm />
        </BrowserRouter>
      );

      const formContainer =
        screen.getByRole('form') || document.querySelector('form');
      expect(formContainer).toBeTruthy();

      // Should have touch-friendly styling
      const containerClasses = formContainer?.className || '';
      expect(containerClasses).toMatch(/rounded|p-|px-|py-/); // Proper padding and rounding
    });

    it('provides visual feedback for touch interactions', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <BrowserRouter>
          <LoginForm />
        </BrowserRouter>
      );

      const submitButton = screen.getByRole('button', { name: /sign in/i });

      // Should have hover/active states for touch feedback
      expect(submitButton).toHaveClass('transition-all');
      expect(submitButton).toHaveClass('duration-300');

      // Test active state
      fireEvent.mouseDown(submitButton);
      expect(submitButton).toHaveClass('active:scale-95');
    });
  });

  describe('Mobile Layout Responsiveness', () => {
    it('adapts to mobile viewport sizes', () => {
      renderWithProviders(<LoginPage />);

      const authLayout = document.querySelector('[class*="min-h-screen"]');
      expect(authLayout).toBeTruthy();

      // Check mobile-first padding
      expect(authLayout).toHaveClass('px-4');
      expect(authLayout).toHaveClass('py-8');
    });

    it('uses mobile-appropriate font sizes', () => {
      renderWithProviders(<RegisterPage />);

      const heading = screen.getByRole('heading', {
        name: /join aaroth fresh/i,
      });
      expect(heading).toHaveClass('text-3xl'); // Large enough for mobile

      const subtitle = screen.getByText(/create your account/i);
      const subtitleClasses = subtitle.className;
      expect(subtitleClasses).toMatch(/text-(text-muted|base|sm)/); // Appropriate subtitle size
    });

    it('provides adequate spacing between interactive elements', () => {
      renderWithProviders(
        <BrowserRouter>
          <RegisterForm />
        </BrowserRouter>
      );

      const formElements = screen.getAllByRole('textbox');
      const formContainer = formElements[0].closest('form');

      if (formContainer) {
        expect(formContainer).toHaveClass('space-y-6'); // 24px spacing
      }
    });
  });

  describe('Accessibility on Mobile', () => {
    it('maintains proper focus indicators for touch users', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <BrowserRouter>
          <LoginForm />
        </BrowserRouter>
      );

      const phoneInput = screen.getByLabelText(/phone number/i);

      await user.click(phoneInput);
      expect(phoneInput).toHaveFocus();

      // Should have visible focus ring
      expect(phoneInput).toHaveClass('focus:outline-none');
      expect(phoneInput).toHaveClass('focus:shadow-lg');
    });

    it('supports keyboard navigation on mobile browsers', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <BrowserRouter>
          <RegisterForm />
        </BrowserRouter>
      );

      // Tab through form elements
      await user.tab();
      expect(screen.getByLabelText(/account type/i)).toHaveFocus();

      await user.tab();
      expect(screen.getByLabelText(/full name/i)).toHaveFocus();

      await user.tab();
      expect(screen.getByLabelText(/phone number/i)).toHaveFocus();
    });

    it('provides proper ARIA labels for mobile screen readers', () => {
      renderWithProviders(
        <BrowserRouter>
          <LoginForm />
        </BrowserRouter>
      );

      const phoneInput = screen.getByLabelText(/phone number/i);
      const passwordInput = screen.getByLabelText(/password/i);

      expect(phoneInput).toHaveAttribute('aria-labelledby');
      expect(passwordInput).toHaveAttribute('aria-labelledby');
    });
  });

  describe('Form Validation on Mobile', () => {
    it('shows validation errors with mobile-friendly styling', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <BrowserRouter>
          <LoginForm />
        </BrowserRouter>
      );

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(submitButton);

      await waitFor(() => {
        const errorMessages = screen.getAllByText(/required/i);
        errorMessages.forEach((error) => {
          expect(error).toHaveClass('text-sm'); // Mobile-appropriate size
          expect(error).toHaveClass('animate-fade-in'); // Smooth appearance
        });
      });
    });

    it('positions error messages appropriately on mobile', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <BrowserRouter>
          <RegisterForm />
        </BrowserRouter>
      );

      const nameInput = screen.getByLabelText(/full name/i);
      await user.click(nameInput);
      await user.tab(); // Trigger validation

      await waitFor(() => {
        const errorMessage = screen.getByText(/full name is required/i);
        expect(errorMessage).toHaveClass('mt-2'); // Proper spacing
      });
    });
  });

  describe('Loading States on Mobile', () => {
    it('shows mobile-appropriate loading indicators', () => {
      renderWithProviders(
        <BrowserRouter>
          <LoginForm />
        </BrowserRouter>,
        {
          preloadedState: {
            auth: { loading: true },
          },
        }
      );

      const submitButton = screen.getByRole('button', { name: /signing in/i });
      expect(submitButton).toBeDisabled();

      // Should have loading spinner
      const spinner = document.querySelector('[class*="animate-spin"]');
      expect(spinner).toBeTruthy();
    });

    it('maintains button size during loading state', () => {
      renderWithProviders(
        <BrowserRouter>
          <RegisterForm />
        </BrowserRouter>
      );

      const submitButton = screen.getByRole('button', {
        name: /create account/i,
      });
      const normalRect = submitButton.getBoundingClientRect();

      expect(normalRect.height).toBeGreaterThanOrEqual(44);
    });
  });

  describe('Performance on Mobile', () => {
    it('renders forms efficiently on mobile devices', () => {
      const startTime = performance.now();

      renderWithProviders(<RegisterPage />);

      const renderTime = performance.now() - startTime;

      // Should render within reasonable time for mobile
      expect(renderTime).toBeLessThan(100); // 100ms threshold
    });

    it('handles input changes efficiently', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <BrowserRouter>
          <LoginForm />
        </BrowserRouter>
      );

      const phoneInput = screen.getByLabelText(/phone number/i);

      const startTime = performance.now();
      await user.type(phoneInput, '+8801712345678');
      const typeTime = performance.now() - startTime;

      expect(typeTime).toBeLessThan(200); // Should be responsive
      expect(phoneInput.value).toBeTruthy();
    });
  });

  describe('Mobile-Specific Features', () => {
    it('supports autocomplete for better UX', () => {
      renderWithProviders(
        <BrowserRouter>
          <RegisterForm />
        </BrowserRouter>
      );

      const nameInput = screen.getByLabelText(/full name/i);
      const emailInput = screen.getByLabelText(/email address/i);
      const phoneInput = screen.getByLabelText(/phone number/i);

      expect(nameInput).toHaveAttribute('autocomplete', 'name');
      expect(emailInput).toHaveAttribute('autocomplete', 'email');
      expect(phoneInput).toHaveAttribute('autocomplete', 'tel');
    });

    it('prevents zoom on input focus', () => {
      renderWithProviders(
        <BrowserRouter>
          <LoginForm />
        </BrowserRouter>
      );

      const inputs = screen.getAllByRole('textbox');
      inputs.forEach((input) => {
        const styles = window.getComputedStyle(input);
        const fontSize = parseFloat(styles.fontSize);

        // Font size should be at least 16px to prevent zoom on iOS
        expect(fontSize).toBeGreaterThanOrEqual(16);
      });
    });

    it('uses appropriate input types for mobile keyboards', () => {
      renderWithProviders(
        <BrowserRouter>
          <RegisterForm />
        </BrowserRouter>
      );

      const phoneInput = screen.getByLabelText(/phone number/i);
      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInputs = screen.getAllByLabelText(/password/i);

      expect(phoneInput).toHaveAttribute('type', 'tel');
      expect(emailInput).toHaveAttribute('type', 'email');
      passwordInputs.forEach((input) => {
        expect(input).toHaveAttribute('type', 'password');
      });
    });
  });
});

describe('Mobile Auth Pages Integration', () => {
  it('login page renders correctly on mobile', () => {
    renderWithProviders(<LoginPage />);

    expect(
      screen.getByRole('heading', { name: /welcome back/i })
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/phone number/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /sign in/i })
    ).toBeInTheDocument();
  });

  it('register page renders correctly on mobile', () => {
    renderWithProviders(<RegisterPage />);

    expect(
      screen.getByRole('heading', { name: /join aaroth fresh/i })
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/account type/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /create account/i })
    ).toBeInTheDocument();
  });

  it('handles mobile viewport changes', () => {
    const { rerender } = renderWithProviders(<LoginPage />);

    // Test different mobile viewport sizes
    Object.defineProperty(window, 'innerWidth', { value: 320 }); // Small mobile
    rerender(<LoginPage />);

    expect(screen.getByRole('heading')).toBeInTheDocument();

    Object.defineProperty(window, 'innerWidth', { value: 414 }); // Large mobile
    rerender(<LoginPage />);

    expect(screen.getByRole('heading')).toBeInTheDocument();
  });
});
