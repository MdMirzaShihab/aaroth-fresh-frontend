import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from './test/test-utils';
import App from './App';

// Mock the API slice query
vi.mock('./store/slices/apiSlice', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useGetCurrentUserQuery: vi.fn(() => ({
      isLoading: false,
      error: null,
      data: null,
    })),
  };
});

describe('App', () => {
  it('renders the homepage with welcome message', () => {
    renderWithProviders(<App />);

    expect(screen.getByText(/Welcome to/)).toBeInTheDocument();
    expect(screen.getAllByText(/Aaroth Fresh/)[0]).toBeInTheDocument();
    expect(screen.getByText(/premier B2B marketplace/)).toBeInTheDocument();
  });

  it('renders main navigation buttons', () => {
    renderWithProviders(<App />);

    expect(
      screen.getByRole('button', { name: /browse products/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /join as vendor/i })
    ).toBeInTheDocument();
  });

  it('renders feature cards', () => {
    renderWithProviders(<App />);

    expect(screen.getByText('Fresh Produce')).toBeInTheDocument();
    expect(screen.getByText('Best Prices')).toBeInTheDocument();
    expect(screen.getByText('Fast Delivery')).toBeInTheDocument();
  });

  it('applies the correct CSS classes for futuristic design', () => {
    renderWithProviders(<App />);

    // Find the main homepage container with the gradient background
    const homepage = screen.getByText(/Welcome to/).parentElement.parentElement;
    expect(homepage).toHaveClass('bg-gradient-to-br', 'from-earthy-beige');
  });
});
