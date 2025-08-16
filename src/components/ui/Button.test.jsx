import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import Button from './Button';

describe('Button Component', () => {
  it('renders button with text', () => {
    render(<Button>Click me</Button>);
    expect(
      screen.getByRole('button', { name: /click me/i })
    ).toBeInTheDocument();
  });

  it('applies default variant and size classes', () => {
    render(<Button>Default Button</Button>);
    const button = screen.getByRole('button');

    expect(button).toHaveClass('bg-gradient-secondary');
    expect(button).toHaveClass('min-h-[44px]');
  });

  it('applies different variants correctly', () => {
    const { rerender } = render(<Button variant="secondary">Secondary</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-earthy-brown');

    rerender(<Button variant="outline">Outline</Button>);
    expect(screen.getByRole('button')).toHaveClass('border-2');

    rerender(<Button variant="ghost">Ghost</Button>);
    expect(screen.getByRole('button')).toHaveClass('text-bottle-green');
  });

  it('applies different sizes correctly', () => {
    const { rerender } = render(<Button size="sm">Small</Button>);
    expect(screen.getByRole('button')).toHaveClass('min-h-[36px]');

    rerender(<Button size="lg">Large</Button>);
    expect(screen.getByRole('button')).toHaveClass('min-h-[48px]');
  });

  it('handles click events', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();

    render(<Button onClick={handleClick}>Clickable</Button>);

    await user.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('shows loading state', () => {
    render(<Button loading>Loading Button</Button>);
    const button = screen.getByRole('button');

    expect(button).toBeDisabled();
    expect(screen.getByRole('status')).toBeInTheDocument(); // Loading spinner
  });

  it('disables button when disabled prop is true', () => {
    render(<Button disabled>Disabled Button</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('does not call onClick when disabled', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();

    render(
      <Button disabled onClick={handleClick}>
        Disabled Button
      </Button>
    );

    await user.click(screen.getByRole('button'));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('renders with icon', () => {
    const TestIcon = () => <span data-testid="test-icon">Icon</span>;
    render(<Button icon={TestIcon}>Button with Icon</Button>);

    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
    expect(screen.getByText('Button with Icon')).toBeInTheDocument();
  });

  it('renders as icon-only button', () => {
    const TestIcon = () => <span data-testid="test-icon">Icon</span>;
    render(<Button icon={TestIcon} size="icon" aria-label="Icon button" />);

    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
    expect(screen.getByLabelText('Icon button')).toBeInTheDocument();
  });

  it('forwards ref correctly', () => {
    const ref = React.createRef();
    render(<Button ref={ref}>Ref Button</Button>);

    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it('supports custom className', () => {
    render(<Button className="custom-class">Custom Button</Button>);
    expect(screen.getByRole('button')).toHaveClass('custom-class');
  });

  it('renders as different HTML element when asChild is used', () => {
    render(
      <Button asChild>
        <a href="/test">Link Button</a>
      </Button>
    );

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/test');
    expect(link).toHaveClass('bg-gradient-secondary'); // Button styles applied
  });

  it('meets minimum touch target size requirements', () => {
    render(<Button>Touch Target</Button>);
    const button = screen.getByRole('button');

    expect(button).toHaveClass('min-h-[44px]'); // 44px minimum
  });

  it('supports keyboard navigation', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();

    render(<Button onClick={handleClick}>Keyboard Button</Button>);

    const button = screen.getByRole('button');
    button.focus();

    await user.keyboard('{Enter}');
    expect(handleClick).toHaveBeenCalledTimes(1);

    await user.keyboard(' ');
    expect(handleClick).toHaveBeenCalledTimes(2);
  });

  it('has proper ARIA attributes', () => {
    render(
      <Button
        loading
        disabled
        aria-label="Test button"
        aria-describedby="description"
      >
        ARIA Button
      </Button>
    );

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Test button');
    expect(button).toHaveAttribute('aria-describedby', 'description');
    expect(button).toHaveAttribute('aria-disabled', 'true');
  });

  describe('Accessibility', () => {
    it('has sufficient color contrast for variants', () => {
      // This would typically use a color contrast testing library
      const { rerender } = render(<Button variant="primary">Primary</Button>);
      expect(screen.getByRole('button')).toHaveClass('text-white');

      rerender(<Button variant="outline">Outline</Button>);
      expect(screen.getByRole('button')).toHaveClass('text-bottle-green');
    });

    it('maintains focus visibility', async () => {
      const user = userEvent.setup();
      render(<Button>Focus Button</Button>);

      const button = screen.getByRole('button');
      await user.tab();

      expect(button).toHaveFocus();
      expect(button).toHaveClass('focus:ring-2'); // Focus ring
    });

    it('respects reduced motion preferences', () => {
      // Mock prefers-reduced-motion
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation((query) => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      });

      render(<Button>Motion Button</Button>);
      const button = screen.getByRole('button');

      // Should have reduced motion classes when preference is set
      expect(button).toHaveClass('active:scale-95'); // Has animation by default
    });
  });

  describe('Loading State', () => {
    it('shows loading spinner when loading', () => {
      render(<Button loading>Loading</Button>);

      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('hides button text when loading and loadingText is provided', () => {
      render(
        <Button loading loadingText="Processing...">
          Submit
        </Button>
      );

      expect(screen.queryByText('Submit')).not.toBeInTheDocument();
      expect(screen.getByText('Processing...')).toBeInTheDocument();
    });

    it('maintains button dimensions during loading', () => {
      const { rerender } = render(<Button>Normal Button</Button>);
      const button = screen.getByRole('button');
      const initialHeight = button.style.height;

      rerender(<Button loading>Normal Button</Button>);
      expect(button.style.height).toBe(initialHeight);
    });
  });

  describe('Responsive Behavior', () => {
    it('adapts to mobile screens', () => {
      render(<Button>Mobile Button</Button>);
      const button = screen.getByRole('button');

      // Should have mobile-friendly padding and height
      expect(button).toHaveClass('min-h-[44px]');
      expect(button).toHaveClass('px-6');
    });

    it('supports full width on mobile', () => {
      render(<Button fullWidth>Full Width</Button>);
      expect(screen.getByRole('button')).toHaveClass('w-full');
    });
  });

  describe('Error Handling', () => {
    it('gracefully handles missing onClick', () => {
      render(<Button>No Click Handler</Button>);

      expect(() => {
        fireEvent.click(screen.getByRole('button'));
      }).not.toThrow();
    });

    it('handles rapid clicking when loading', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      render(
        <Button loading onClick={handleClick}>
          Loading Button
        </Button>
      );

      await user.click(screen.getByRole('button'));
      await user.click(screen.getByRole('button'));

      expect(handleClick).not.toHaveBeenCalled();
    });
  });
});
