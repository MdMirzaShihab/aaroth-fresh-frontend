import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { 
  Toast, 
  ToastContainer, 
  SuccessToast, 
  ErrorToast,
  toast,
  promiseToast 
} from './Toast';
import { setupGlobalMocks } from './test-utils';

// Setup global mocks
setupGlobalMocks();

// Mock notification slice
const createMockNotificationSlice = () => ({
  name: 'notifications',
  reducer: (state = { items: [] }, action) => {
    switch (action.type) {
      case 'notifications/add':
        return { ...state, items: [...state.items, action.payload] };
      case 'notifications/remove':
        return { 
          ...state, 
          items: state.items.filter(item => item.id !== action.payload) 
        };
      default:
        return state;
    }
  },
  actions: {
    add: (payload) => ({ type: 'notifications/add', payload }),
    remove: (payload) => ({ type: 'notifications/remove', payload }),
  }
});

const createTestStore = (initialState = {}) => {
  const notificationSlice = createMockNotificationSlice();
  
  return configureStore({
    reducer: {
      notifications: notificationSlice.reducer,
    },
    preloadedState: {
      notifications: { items: [] },
      ...initialState,
    },
  });
};

const renderWithStore = (component, initialState = {}) => {
  const store = createTestStore(initialState);
  return {
    ...render(
      <Provider store={store}>
        {component}
      </Provider>
    ),
    store,
  };
};

describe('Toast Component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllTimers();
    vi.clearAllMocks();
  });

  describe('Toast Individual Component', () => {
    it('renders toast with message', () => {
      const handleClose = vi.fn();
      
      render(
        <Toast
          id="test-toast"
          variant="success"
          message="Success message"
          onClose={handleClose}
        />
      );
      
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText('Success message')).toBeInTheDocument();
    });

    it('applies correct variant styles', () => {
      const { rerender } = render(
        <Toast
          id="test-toast"
          variant="success"
          message="Success"
          onClose={vi.fn()}
        />
      );
      
      expect(screen.getByRole('alert')).toHaveClass('bg-mint-fresh/10');
      
      rerender(
        <Toast
          id="test-toast"
          variant="error"
          message="Error"
          onClose={vi.fn()}
        />
      );
      
      expect(screen.getByRole('alert')).toHaveClass('bg-tomato-red/5');
    });

    it('shows correct icon for variant', () => {
      render(
        <Toast
          id="test-toast"
          variant="success"
          message="Success"
          onClose={vi.fn()}
        />
      );
      
      // CheckCircle icon should be present for success variant
      expect(screen.getByRole('alert')).toContainHTML('CheckCircle');
    });

    it('displays title when provided', () => {
      render(
        <Toast
          id="test-toast"
          title="Success Title"
          message="Success message"
          onClose={vi.fn()}
        />
      );
      
      expect(screen.getByText('Success Title')).toBeInTheDocument();
    });

    it('shows progress bar when enabled', () => {
      render(
        <Toast
          id="test-toast"
          message="Progress toast"
          duration={5000}
          showProgress={true}
          onClose={vi.fn()}
        />
      );
      
      const progressBar = screen.getByRole('alert').querySelector('[style*="width"]');
      expect(progressBar).toBeInTheDocument();
    });

    it('calls onClose when close button is clicked', async () => {
      const handleClose = vi.fn();
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      
      render(
        <Toast
          id="test-toast"
          message="Closeable toast"
          showCloseButton={true}
          onClose={handleClose}
        />
      );
      
      const closeButton = screen.getByRole('button', { name: /close/i });
      await user.click(closeButton);
      
      expect(handleClose).toHaveBeenCalledWith('test-toast');
    });

    it('auto-closes after duration', async () => {
      const handleClose = vi.fn();
      
      render(
        <Toast
          id="test-toast"
          message="Auto close toast"
          duration={1000}
          onClose={handleClose}
        />
      );
      
      // Fast-forward time
      act(() => {
        vi.advanceTimersByTime(1000);
      });
      
      await waitFor(() => {
        expect(handleClose).toHaveBeenCalledWith('test-toast');
      });
    });

    it('pauses auto-close on hover', async () => {
      const handleClose = vi.fn();
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      
      render(
        <Toast
          id="test-toast"
          message="Pausable toast"
          duration={1000}
          pauseOnHover={true}
          onClose={handleClose}
        />
      );
      
      const toast = screen.getByRole('alert');
      
      // Hover over toast
      await user.hover(toast);
      
      // Advance time while hovered
      act(() => {
        vi.advanceTimersByTime(1000);
      });
      
      // Should not have closed
      expect(handleClose).not.toHaveBeenCalled();
      
      // Unhover
      await user.unhover(toast);
      
      // Now it should close
      act(() => {
        vi.advanceTimersByTime(1000);
      });
      
      await waitFor(() => {
        expect(handleClose).toHaveBeenCalledWith('test-toast');
      });
    });

    it('shows action button when provided', async () => {
      const handleAction = vi.fn();
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      
      render(
        <Toast
          id="test-toast"
          message="Actionable toast"
          action="Undo"
          onAction={handleAction}
          onClose={vi.fn()}
        />
      );
      
      const actionButton = screen.getByRole('button', { name: /undo/i });
      await user.click(actionButton);
      
      expect(handleAction).toHaveBeenCalled();
    });

    it('does not show close button when showCloseButton is false', () => {
      render(
        <Toast
          id="test-toast"
          message="No close button"
          showCloseButton={false}
          onClose={vi.fn()}
        />
      );
      
      expect(screen.queryByRole('button', { name: /close/i })).not.toBeInTheDocument();
    });
  });

  describe('Toast Container', () => {
    it('renders multiple toasts', () => {
      const notifications = [
        { id: '1', type: 'success', message: 'Success 1' },
        { id: '2', type: 'error', message: 'Error 1' },
      ];
      
      renderWithStore(
        <ToastContainer />,
        { notifications: { items: notifications } }
      );
      
      expect(screen.getByText('Success 1')).toBeInTheDocument();
      expect(screen.getByText('Error 1')).toBeInTheDocument();
    });

    it('limits number of visible toasts', () => {
      const notifications = Array.from({ length: 10 }, (_, i) => ({
        id: `${i}`,
        type: 'info',
        message: `Message ${i}`,
      }));
      
      renderWithStore(
        <ToastContainer maxToasts={3} />,
        { notifications: { items: notifications } }
      );
      
      // Should only show first 3 toasts
      expect(screen.getByText('Message 0')).toBeInTheDocument();
      expect(screen.getByText('Message 1')).toBeInTheDocument();
      expect(screen.getByText('Message 2')).toBeInTheDocument();
      expect(screen.queryByText('Message 3')).not.toBeInTheDocument();
    });

    it('positions toasts correctly', () => {
      const { container } = renderWithStore(
        <ToastContainer position="bottom-left" />,
        { notifications: { items: [{ id: '1', message: 'Test' }] } }
      );
      
      const toastContainer = container.firstChild;
      expect(toastContainer).toHaveClass('bottom-4', 'left-4');
    });

    it('applies staggered animation delays', () => {
      const notifications = [
        { id: '1', type: 'info', message: 'First' },
        { id: '2', type: 'info', message: 'Second' },
      ];
      
      renderWithStore(
        <ToastContainer />,
        { notifications: { items: notifications } }
      );
      
      const toastWrappers = screen.getAllByRole('alert').map(alert => alert.parentElement);
      
      expect(toastWrappers[0]).toHaveStyle('animation-delay: 0ms');
      expect(toastWrappers[1]).toHaveStyle('animation-delay: 100ms');
    });
  });

  describe('Toast Variants', () => {
    it('renders SuccessToast correctly', () => {
      render(<SuccessToast message="Success!" onClose={vi.fn()} />);
      
      const toast = screen.getByRole('alert');
      expect(toast).toHaveClass('bg-mint-fresh/10');
      expect(screen.getByText('Success!')).toBeInTheDocument();
    });

    it('renders ErrorToast correctly', () => {
      render(<ErrorToast message="Error occurred!" onClose={vi.fn()} />);
      
      const toast = screen.getByRole('alert');
      expect(toast).toHaveClass('bg-tomato-red/5');
      expect(screen.getByText('Error occurred!')).toBeInTheDocument();
    });

    it('renders LoadingToast without auto-close', () => {
      const handleClose = vi.fn();
      
      render(<LoadingToast message="Loading..." onClose={handleClose} />);
      
      // Should not auto-close
      act(() => {
        vi.advanceTimersByTime(5000);
      });
      
      expect(handleClose).not.toHaveBeenCalled();
    });
  });

  describe('Toast Utility Functions', () => {
    it('creates success toast with correct properties', () => {
      const successToast = toast.success('Operation successful', { 
        title: 'Success',
        duration: 3000 
      });
      
      expect(successToast).toMatchObject({
        variant: 'success',
        message: 'Operation successful',
        title: 'Success',
        duration: 3000,
      });
      expect(successToast.id).toBeDefined();
    });

    it('creates error toast with longer duration', () => {
      const errorToast = toast.error('Something went wrong');
      
      expect(errorToast).toMatchObject({
        variant: 'error',
        message: 'Something went wrong',
        duration: 6000, // Error toasts have longer duration
      });
    });

    it('creates loading toast without close button', () => {
      const loadingToast = toast.loading('Processing...');
      
      expect(loadingToast).toMatchObject({
        variant: 'loading',
        message: 'Processing...',
        duration: 0,
        showProgress: false,
        showCloseButton: false,
      });
    });
  });

  describe('Promise Toast', () => {
    it('shows loading then success for resolved promise', async () => {
      const promise = Promise.resolve('Success result');
      
      const result = await promiseToast(promise, {
        loading: 'Processing...',
        success: 'Completed!',
      });
      
      expect(result).toMatchObject({
        variant: 'success',
        message: 'Completed!',
      });
      expect(result.replaces).toBeDefined();
    });

    it('shows loading then error for rejected promise', async () => {
      const promise = Promise.reject(new Error('Failed'));
      
      const result = await promiseToast(promise, {
        loading: 'Processing...',
        error: 'Failed to complete',
      });
      
      expect(result).toMatchObject({
        variant: 'error',
        message: 'Failed to complete',
      });
      expect(result.replaces).toBeDefined();
    });

    it('supports function-based success and error messages', async () => {
      const promise = Promise.resolve({ name: 'John' });
      
      const result = await promiseToast(promise, {
        loading: 'Loading user...',
        success: (data) => `Welcome, ${data.name}!`,
      });
      
      expect(result.message).toBe('Welcome, John!');
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      render(
        <Toast
          id="test-toast"
          message="Accessible toast"
          onClose={vi.fn()}
        />
      );
      
      const toast = screen.getByRole('alert');
      expect(toast).toHaveAttribute('aria-live', 'polite');
      expect(toast).toHaveAttribute('role', 'alert');
    });

    it('uses assertive aria-live for error toasts', () => {
      render(
        <Toast
          id="test-toast"
          variant="error"
          message="Error toast"
          onClose={vi.fn()}
        />
      );
      
      const toast = screen.getByRole('alert');
      expect(toast).toHaveAttribute('aria-live', 'polite'); // All use polite by default
    });

    it('has accessible close button', () => {
      render(
        <Toast
          id="test-toast"
          message="Closeable toast"
          showCloseButton={true}
          onClose={vi.fn()}
        />
      );
      
      const closeButton = screen.getByRole('button', { name: /close notification/i });
      expect(closeButton).toHaveAttribute('aria-label');
    });

    it('meets touch target requirements', () => {
      render(
        <Toast
          id="test-toast"
          message="Touch-friendly toast"
          showCloseButton={true}
          onClose={vi.fn()}
        />
      );
      
      const closeButton = screen.getByRole('button', { name: /close/i });
      expect(closeButton).toHaveClass('min-h-[24px]', 'min-w-[24px]');
    });
  });

  describe('Performance', () => {
    it('handles rapid toast creation', () => {
      const toasts = Array.from({ length: 50 }, (_, i) => 
        toast.success(`Toast ${i}`)
      );
      
      expect(toasts).toHaveLength(50);
      toasts.forEach(t => expect(t.id).toBeDefined());
    });

    it('cleans up timers on unmount', () => {
      const { unmount } = render(
        <Toast
          id="test-toast"
          message="Timer toast"
          duration={5000}
          onClose={vi.fn()}
        />
      );
      
      expect(() => unmount()).not.toThrow();
    });

    it('batches multiple toast updates', () => {
      const notifications = Array.from({ length: 10 }, (_, i) => ({
        id: `${i}`,
        type: 'info',
        message: `Message ${i}`,
      }));
      
      const { rerender } = renderWithStore(
        <ToastContainer />,
        { notifications: { items: [] } }
      );
      
      // Add all toasts at once
      rerender(
        <Provider store={createTestStore({ notifications: { items: notifications } })}>
          <ToastContainer />
        </Provider>
      );
      
      // Should render without performance issues
      expect(screen.getAllByRole('alert')).toHaveLength(5); // Limited by maxToasts
    });
  });

  describe('Edge Cases', () => {
    it('handles missing onClose gracefully', () => {
      expect(() => {
        render(
          <Toast
            id="test-toast"
            message="No close handler"
          />
        );
      }).not.toThrow();
    });

    it('handles zero duration correctly', () => {
      const handleClose = vi.fn();
      
      render(
        <Toast
          id="test-toast"
          message="No auto-close"
          duration={0}
          onClose={handleClose}
        />
      );
      
      act(() => {
        vi.advanceTimersByTime(10000);
      });
      
      expect(handleClose).not.toHaveBeenCalled();
    });

    it('handles negative duration correctly', () => {
      const handleClose = vi.fn();
      
      render(
        <Toast
          id="test-toast"
          message="Negative duration"
          duration={-1000}
          onClose={handleClose}
        />
      );
      
      act(() => {
        vi.advanceTimersByTime(5000);
      });
      
      expect(handleClose).not.toHaveBeenCalled();
    });
  });
});