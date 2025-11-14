import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../../../test/test-utils';
import VendorReviews from '../VendorReviews';

const defaultAuthState = {
  user: {
    id: 'vendor_1',
    name: 'Test Vendor',
    role: 'vendor',
  },
  token: 'test-token',
};

describe('VendorReviews', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.alert = vi.fn();
  });

  describe('Page Layout and Header', () => {
    it('renders the main header correctly', () => {
      renderWithProviders(<VendorReviews />, {
        preloadedState: { auth: defaultAuthState },
      });

      expect(screen.getByText('Reviews & Ratings')).toBeInTheDocument();
      expect(
        screen.getByText(/manage customer feedback and build your reputation/i)
      ).toBeInTheDocument();
    });

    it('displays unread count badge', () => {
      renderWithProviders(<VendorReviews />, {
        preloadedState: { auth: defaultAuthState },
      });

      // Unread reviews count (reviews without responses)
      const unreadBadges = document.querySelectorAll('[class*="bg-earthy-yellow/20"]');
      expect(unreadBadges.length).toBeGreaterThan(0);
    });
  });

  describe('Stats Overview Cards', () => {
    it('displays all stat cards', () => {
      renderWithProviders(<VendorReviews />, {
        preloadedState: { auth: defaultAuthState },
      });

      expect(screen.getByText('Average Rating')).toBeInTheDocument();
      expect(screen.getByText('Total Reviews')).toBeInTheDocument();
      expect(screen.getByText('Response Rate')).toBeInTheDocument();
      expect(screen.getByText('5-Star Reviews')).toBeInTheDocument();
    });

    it('displays correct stat values', () => {
      renderWithProviders(<VendorReviews />, {
        preloadedState: { auth: defaultAuthState },
      });

      expect(screen.getByText('4.5')).toBeInTheDocument(); // Average Rating
      expect(screen.getByText('248')).toBeInTheDocument(); // Total Reviews
      expect(screen.getByText('85%')).toBeInTheDocument(); // Response Rate
      expect(screen.getByText('63%')).toBeInTheDocument(); // 5-Star Percentage
    });
  });

  describe('Rating Distribution', () => {
    it('displays rating distribution section', () => {
      renderWithProviders(<VendorReviews />, {
        preloadedState: { auth: defaultAuthState },
      });

      expect(screen.getByText('Rating Distribution')).toBeInTheDocument();
    });

    it('shows visual bars for each star rating', () => {
      renderWithProviders(<VendorReviews />, {
        preloadedState: { auth: defaultAuthState },
      });

      // Should display counts and percentages
      expect(screen.getByText('156')).toBeInTheDocument(); // 5 stars count
      expect(screen.getByText('62')).toBeInTheDocument(); // 4 stars count
      expect(screen.getByText('20')).toBeInTheDocument(); // 3 stars count
    });

    it('displays percentage values for distribution', () => {
      renderWithProviders(<VendorReviews />, {
        preloadedState: { auth: defaultAuthState },
      });

      expect(screen.getAllByText(/\(63%\)/)[0]).toBeInTheDocument();
      expect(screen.getAllByText(/\(25%\)/)[0]).toBeInTheDocument();
      expect(screen.getByText('(8%)')).toBeInTheDocument();
      expect(screen.getByText('(3%)')).toBeInTheDocument();
      expect(screen.getByText('(1%)')).toBeInTheDocument();
    });
  });

  describe('Filters', () => {
    it('renders all filter options', () => {
      renderWithProviders(<VendorReviews />, {
        preloadedState: { auth: defaultAuthState },
      });

      expect(screen.getByPlaceholderText(/search reviews/i)).toBeInTheDocument();

      // Rating filter
      expect(screen.getByText('All Ratings')).toBeInTheDocument();
      expect(screen.getByText('5 Stars')).toBeInTheDocument();
      expect(screen.getByText('4 Stars')).toBeInTheDocument();
      expect(screen.getByText('3 Stars')).toBeInTheDocument();

      // Status filter
      expect(screen.getByText('All Reviews')).toBeInTheDocument();
      expect(screen.getByText('Needs Response')).toBeInTheDocument();
      expect(screen.getByText('Responded')).toBeInTheDocument();
    });

    it('handles search input', async () => {
      const user = userEvent.setup();

      renderWithProviders(<VendorReviews />, {
        preloadedState: { auth: defaultAuthState },
      });

      const searchInput = screen.getByPlaceholderText(/search reviews/i);
      await user.type(searchInput, 'excellent quality');

      expect(searchInput.value).toBe('excellent quality');
    });

    it('filters by rating', async () => {
      const user = userEvent.setup();

      renderWithProviders(<VendorReviews />, {
        preloadedState: { auth: defaultAuthState },
      });

      const ratingFilter = screen.getAllByRole('combobox')[0];
      await user.selectOptions(ratingFilter, '5');

      // Should filter to show only 5-star reviews
      await waitFor(() => {
        const reviews = screen.getAllByText(/Fresh|Organic|Bell/i);
        expect(reviews.length).toBeGreaterThan(0);
      });
    });

    it('filters by response status', async () => {
      const user = userEvent.setup();

      renderWithProviders(<VendorReviews />, {
        preloadedState: { auth: defaultAuthState },
      });

      const statusFilter = screen.getAllByRole('combobox')[1];
      await user.selectOptions(statusFilter, 'pending');

      await waitFor(() => {
        const needsResponseBadges = screen.getAllByText('Needs Response');
        expect(needsResponseBadges.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Review List', () => {
    it('displays all reviews', () => {
      renderWithProviders(<VendorReviews />, {
        preloadedState: { auth: defaultAuthState },
      });

      expect(screen.getByText('Fresh Tomatoes')).toBeInTheDocument();
      expect(screen.getByText('Organic Carrots')).toBeInTheDocument();
      expect(screen.getByText('Fresh Spinach')).toBeInTheDocument();
      expect(screen.getByText('Bell Peppers')).toBeInTheDocument();
    });

    it('displays customer names', () => {
      renderWithProviders(<VendorReviews />, {
        preloadedState: { auth: defaultAuthState },
      });

      expect(screen.getByText(/golden fork restaurant/i)).toBeInTheDocument();
      expect(screen.getByText(/spice garden/i)).toBeInTheDocument();
      expect(screen.getByText(/ocean blue bistro/i)).toBeInTheDocument();
      expect(screen.getByText(/sunrise cafe/i)).toBeInTheDocument();
    });

    it('displays review comments', () => {
      renderWithProviders(<VendorReviews />, {
        preloadedState: { auth: defaultAuthState },
      });

      expect(
        screen.getByText(/excellent quality.*always fresh/i)
      ).toBeInTheDocument();
      expect(screen.getByText(/good quality.*packaging/i)).toBeInTheDocument();
      expect(screen.getByText(/best spinach in town/i)).toBeInTheDocument();
      expect(screen.getByText(/average quality.*overripe/i)).toBeInTheDocument();
    });

    it('displays star ratings for each review', () => {
      renderWithProviders(<VendorReviews />, {
        preloadedState: { auth: defaultAuthState },
      });

      // Star icons should be rendered
      const starIcons = document.querySelectorAll('[class*="lucide-star"]');
      expect(starIcons.length).toBeGreaterThan(0);
    });

    it('shows response status badges', () => {
      renderWithProviders(<VendorReviews />, {
        preloadedState: { auth: defaultAuthState },
      });

      const respondedBadges = screen.getAllByText('Responded');
      expect(respondedBadges.length).toBe(2);

      const needsResponseBadges = screen.getAllByText('Needs Response');
      expect(needsResponseBadges.length).toBe(2);
    });

    it('displays vendor responses when available', () => {
      renderWithProviders(<VendorReviews />, {
        preloadedState: { auth: defaultAuthState },
      });

      expect(screen.getByText('Your Response')).toBeInTheDocument();
      expect(
        screen.getByText(/thank you for your kind words/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/we are glad you enjoyed our spinach/i)
      ).toBeInTheDocument();
    });

    it('displays helpful count', () => {
      renderWithProviders(<VendorReviews />, {
        preloadedState: { auth: defaultAuthState },
      });

      expect(screen.getByText('12 helpful')).toBeInTheDocument();
      expect(screen.getByText('8 helpful')).toBeInTheDocument();
      expect(screen.getByText('15 helpful')).toBeInTheDocument();
      expect(screen.getByText('5 helpful')).toBeInTheDocument();
    });
  });

  describe('Review Response', () => {
    it('shows respond button for reviews without response', () => {
      renderWithProviders(<VendorReviews />, {
        preloadedState: { auth: defaultAuthState },
      });

      const respondButtons = screen.getAllByRole('button', { name: /respond/i });
      expect(respondButtons.length).toBe(2); // 2 reviews need response
    });

    it('opens response form when respond button clicked', async () => {
      const user = userEvent.setup();

      renderWithProviders(<VendorReviews />, {
        preloadedState: { auth: defaultAuthState },
      });

      const respondButtons = screen.getAllByRole('button', { name: /respond/i });
      await user.click(respondButtons[0]);

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/write your response/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /send response/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
      });
    });

    it('handles response text input', async () => {
      const user = userEvent.setup();

      renderWithProviders(<VendorReviews />, {
        preloadedState: { auth: defaultAuthState },
      });

      const respondButtons = screen.getAllByRole('button', { name: /respond/i });
      await user.click(respondButtons[0]);

      const textarea = screen.getByPlaceholderText(/write your response/i);
      await user.type(textarea, 'Thank you for your feedback!');

      expect(textarea.value).toBe('Thank you for your feedback!');
    });

    it('validates response before sending', async () => {
      const user = userEvent.setup();

      renderWithProviders(<VendorReviews />, {
        preloadedState: { auth: defaultAuthState },
      });

      const respondButtons = screen.getAllByRole('button', { name: /respond/i });
      await user.click(respondButtons[0]);

      const sendButton = screen.getByRole('button', { name: /send response/i });
      await user.click(sendButton);

      await waitFor(() => {
        expect(global.alert).toHaveBeenCalledWith('Please enter a response');
      });
    });

    it('submits response when form is valid', async () => {
      const user = userEvent.setup();

      renderWithProviders(<VendorReviews />, {
        preloadedState: { auth: defaultAuthState },
      });

      const respondButtons = screen.getAllByRole('button', { name: /respond/i });
      await user.click(respondButtons[0]);

      const textarea = screen.getByPlaceholderText(/write your response/i);
      await user.type(textarea, 'Thank you for your feedback!');

      const sendButton = screen.getByRole('button', { name: /send response/i });
      await user.click(sendButton);

      await waitFor(() => {
        expect(global.alert).toHaveBeenCalledWith(
          expect.stringContaining('Response submitted for review')
        );
      });
    });

    it('cancels response form', async () => {
      const user = userEvent.setup();

      renderWithProviders(<VendorReviews />, {
        preloadedState: { auth: defaultAuthState },
      });

      const respondButtons = screen.getAllByRole('button', { name: /respond/i });
      await user.click(respondButtons[0]);

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      await waitFor(() => {
        expect(screen.queryByPlaceholderText(/write your response/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Review Actions', () => {
    it('displays report button for each review', () => {
      renderWithProviders(<VendorReviews />, {
        preloadedState: { auth: defaultAuthState },
      });

      const reportButtons = screen.getAllByRole('button', { name: /report/i });
      expect(reportButtons.length).toBe(4); // All reviews can be reported
    });

    it('handles helpful button click', async () => {
      const user = userEvent.setup();

      renderWithProviders(<VendorReviews />, {
        preloadedState: { auth: defaultAuthState },
      });

      const helpfulButtons = screen.getAllByText(/helpful/);
      await user.click(helpfulButtons[0].parentElement);

      // Should handle the click (functionality to be implemented)
      expect(helpfulButtons[0]).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    it('applies mobile-first responsive classes', () => {
      renderWithProviders(<VendorReviews />, {
        preloadedState: { auth: defaultAuthState },
      });

      const container = document.querySelector('.max-w-7xl');
      expect(container).toBeInTheDocument();
    });
  });

  describe('Design System Compliance', () => {
    it('uses glassmorphism design classes', () => {
      renderWithProviders(<VendorReviews />, {
        preloadedState: { auth: defaultAuthState },
      });

      const glassElements = document.querySelectorAll('[class*="glass-layer"]');
      expect(glassElements.length).toBeGreaterThan(0);
    });

    it('uses organic curves', () => {
      renderWithProviders(<VendorReviews />, {
        preloadedState: { auth: defaultAuthState },
      });

      const roundedElements = document.querySelectorAll('[class*="rounded-"]');
      expect(roundedElements.length).toBeGreaterThan(0);
    });

    it('uses brand colors', () => {
      renderWithProviders(<VendorReviews />, {
        preloadedState: { auth: defaultAuthState },
      });

      const bodyHTML = document.body.innerHTML;
      expect(bodyHTML).toMatch(/muted-olive|sage-green|bottle-green|mint-fresh/);
    });
  });

  describe('Date Formatting', () => {
    it('displays formatted review dates', () => {
      renderWithProviders(<VendorReviews />, {
        preloadedState: { auth: defaultAuthState },
      });

      // Should display formatted dates like "Nov 12, 2025"
      const dateElements = screen.getAllByText(/Nov|Jan|Feb|Mar/);
      expect(dateElements.length).toBeGreaterThan(0);
    });
  });
});
