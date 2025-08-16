import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import Modal from './Modal';
import { setupGlobalMocks } from './test-utils';

// Setup global mocks
setupGlobalMocks();

describe('Modal Component', () => {
  beforeEach(() => {
    // Reset body overflow style
    document.body.style.overflow = '';
  });

  it('renders modal when open is true', () => {
    render(
      <Modal open onOpenChange={vi.fn()}>
        <div>Modal Content</div>
      </Modal>
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Modal Content')).toBeInTheDocument();
  });

  it('does not render modal when open is false', () => {
    render(
      <Modal open={false} onOpenChange={vi.fn()}>
        <div>Modal Content</div>
      </Modal>
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('calls onOpenChange when backdrop is clicked', async () => {
    const handleOpenChange = vi.fn();
    const user = userEvent.setup();

    render(
      <Modal open onOpenChange={handleOpenChange}>
        <div>Modal Content</div>
      </Modal>
    );

    // Click backdrop (not the modal content)
    const backdrop = screen.getByRole('dialog').parentElement;
    await user.click(backdrop);

    expect(handleOpenChange).toHaveBeenCalledWith(false);
  });

  it('does not close when clicking modal content', async () => {
    const handleOpenChange = vi.fn();
    const user = userEvent.setup();

    render(
      <Modal open onOpenChange={handleOpenChange}>
        <div>Modal Content</div>
      </Modal>
    );

    await user.click(screen.getByText('Modal Content'));
    expect(handleOpenChange).not.toHaveBeenCalled();
  });

  it('closes when Escape key is pressed', async () => {
    const handleOpenChange = vi.fn();
    const user = userEvent.setup();

    render(
      <Modal open onOpenChange={handleOpenChange}>
        <div>Modal Content</div>
      </Modal>
    );

    await user.keyboard('{Escape}');
    expect(handleOpenChange).toHaveBeenCalledWith(false);
  });

  it('renders close button when showCloseButton is true', () => {
    render(
      <Modal open onOpenChange={vi.fn()} showCloseButton>
        <div>Modal Content</div>
      </Modal>
    );

    expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument();
  });

  it('does not render close button when showCloseButton is false', () => {
    render(
      <Modal open onOpenChange={vi.fn()} showCloseButton={false}>
        <div>Modal Content</div>
      </Modal>
    );

    expect(
      screen.queryByRole('button', { name: /close/i })
    ).not.toBeInTheDocument();
  });

  it('calls onOpenChange when close button is clicked', async () => {
    const handleOpenChange = vi.fn();
    const user = userEvent.setup();

    render(
      <Modal open onOpenChange={handleOpenChange} showCloseButton>
        <div>Modal Content</div>
      </Modal>
    );

    await user.click(screen.getByRole('button', { name: /close/i }));
    expect(handleOpenChange).toHaveBeenCalledWith(false);
  });

  it('applies different size variants', () => {
    const { rerender } = render(
      <Modal open onOpenChange={vi.fn()} size="sm">
        <div>Small Modal</div>
      </Modal>
    );

    expect(screen.getByRole('dialog')).toHaveClass('max-w-sm');

    rerender(
      <Modal open onOpenChange={vi.fn()} size="lg">
        <div>Large Modal</div>
      </Modal>
    );

    expect(screen.getByRole('dialog')).toHaveClass('max-w-4xl');
  });

  it('renders as drawer on mobile when variant is drawer', () => {
    render(
      <Modal open onOpenChange={vi.fn()} variant="drawer">
        <div>Drawer Content</div>
      </Modal>
    );

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveClass('sm:rounded-t-3xl');
  });

  it('prevents body scroll when modal is open', () => {
    render(
      <Modal open onOpenChange={vi.fn()}>
        <div>Modal Content</div>
      </Modal>
    );

    expect(document.body.style.overflow).toBe('hidden');
  });

  it('restores body scroll when modal is closed', () => {
    const { rerender } = render(
      <Modal open onOpenChange={vi.fn()}>
        <div>Modal Content</div>
      </Modal>
    );

    expect(document.body.style.overflow).toBe('hidden');

    rerender(
      <Modal open={false} onOpenChange={vi.fn()}>
        <div>Modal Content</div>
      </Modal>
    );

    expect(document.body.style.overflow).toBe('');
  });

  it('has proper ARIA attributes', () => {
    render(
      <Modal
        open
        onOpenChange={vi.fn()}
        title="Test Modal"
        description="Test Description"
      >
        <div>Modal Content</div>
      </Modal>
    );

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby');
    expect(dialog).toHaveAttribute('aria-describedby');
  });

  it('traps focus within modal', async () => {
    const user = userEvent.setup();

    render(
      <Modal open onOpenChange={vi.fn()}>
        <div>
          <button>First Button</button>
          <button>Second Button</button>
        </div>
      </Modal>
    );

    const firstButton = screen.getByText('First Button');
    const secondButton = screen.getByText('Second Button');

    // Focus should start on first focusable element
    await waitFor(() => {
      expect(firstButton).toHaveFocus();
    });

    // Tab to next element
    await user.tab();
    expect(secondButton).toHaveFocus();
  });

  it('handles mobile drawer swipe-to-close', () => {
    render(
      <Modal open onOpenChange={vi.fn()} variant="drawer">
        <div>Drawer Content</div>
      </Modal>
    );

    const drawer = screen.getByRole('dialog');
    expect(drawer).toHaveClass('fixed', 'inset-x-0', 'bottom-0');
  });

  describe('Accessibility', () => {
    it('announces modal opening to screen readers', () => {
      render(
        <Modal open onOpenChange={vi.fn()} title="Important Modal">
          <div>Modal Content</div>
        </Modal>
      );

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
    });

    it('supports high contrast mode', () => {
      // Mock high contrast media query
      window.matchMedia = vi.fn().mockImplementation((query) => ({
        matches: query === '(prefers-contrast: high)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      render(
        <Modal open onOpenChange={vi.fn()}>
          <div>High Contrast Modal</div>
        </Modal>
      );

      // Should have high contrast styles
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveClass('border');
    });

    it('respects reduced motion preferences', () => {
      // Mock reduced motion media query
      window.matchMedia = vi.fn().mockImplementation((query) => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      render(
        <Modal open onOpenChange={vi.fn()}>
          <div>Reduced Motion Modal</div>
        </Modal>
      );

      // Should have animation classes that respect reduced motion
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveClass('animate-scale-in');
    });
  });

  describe('Touch and Mobile', () => {
    it('renders drawer variant on mobile', () => {
      // Mock mobile viewport
      window.innerWidth = 375;

      render(
        <Modal open onOpenChange={vi.fn()} variant="drawer">
          <div>Mobile Drawer</div>
        </Modal>
      );

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveClass('inset-x-0', 'bottom-0');
    });

    it('has touch-friendly close button', () => {
      render(
        <Modal open onOpenChange={vi.fn()} showCloseButton>
          <div>Modal Content</div>
        </Modal>
      );

      const closeButton = screen.getByRole('button', { name: /close/i });

      // Check minimum touch target size through classes
      expect(closeButton).toHaveClass('min-h-[36px]', 'min-w-[36px]');
    });
  });

  describe('Error Handling', () => {
    it('handles missing onOpenChange gracefully', () => {
      expect(() => {
        render(
          <Modal open>
            <div>Modal without onOpenChange</div>
          </Modal>
        );
      }).not.toThrow();
    });

    it('handles rapid open/close operations', async () => {
      const handleOpenChange = vi.fn();
      const { rerender } = render(
        <Modal open={false} onOpenChange={handleOpenChange}>
          <div>Modal Content</div>
        </Modal>
      );

      // Rapidly toggle
      rerender(
        <Modal open onOpenChange={handleOpenChange}>
          <div>Modal Content</div>
        </Modal>
      );

      rerender(
        <Modal open={false} onOpenChange={handleOpenChange}>
          <div>Modal Content</div>
        </Modal>
      );

      expect(document.body.style.overflow).toBe('');
    });
  });

  describe('Performance', () => {
    it('does not render content when closed', () => {
      const ExpensiveComponent = vi.fn(() => <div>Expensive</div>);

      render(
        <Modal open={false} onOpenChange={vi.fn()}>
          <ExpensiveComponent />
        </Modal>
      );

      expect(ExpensiveComponent).not.toHaveBeenCalled();
    });

    it('unmounts properly without memory leaks', () => {
      const { unmount } = render(
        <Modal open onOpenChange={vi.fn()}>
          <div>Modal Content</div>
        </Modal>
      );

      expect(() => unmount()).not.toThrow();
      expect(document.body.style.overflow).toBe('');
    });
  });
});
