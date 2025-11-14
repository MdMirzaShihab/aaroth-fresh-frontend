import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../../../test/test-utils';
import VendorFinancialReports from '../VendorFinancialReports';
import {
  useGetFinancialSummaryQuery,
  useGetSalesReportsQuery,
  useGetRevenueAnalyticsQuery,
} from '../../../store/slices/vendor/vendorDashboardApi';
import {
  useExportFinancialReportPDFMutation,
  useExportFinancialReportCSVMutation,
  useExportFinancialReportExcelMutation,
} from '../../../store/slices/vendor/vendorExtensionsApi';

// Mock the API hooks
vi.mock('../../../store/slices/vendor/vendorDashboardApi', () => ({
  useGetFinancialSummaryQuery: vi.fn(),
  useGetSalesReportsQuery: vi.fn(),
  useGetRevenueAnalyticsQuery: vi.fn(),
}));

vi.mock('../../../store/slices/vendor/vendorExtensionsApi', () => ({
  useExportFinancialReportPDFMutation: vi.fn(),
  useExportFinancialReportCSVMutation: vi.fn(),
  useExportFinancialReportExcelMutation: vi.fn(),
}));

const mockFinancialData = {
  data: {
    totalRevenue: 125000,
    totalCosts: 87500,
    grossProfit: 37500,
    profitMargin: 30,
    operatingExpenses: 12000,
    netProfit: 25500,
    taxesPaid: 5100,
    pendingPayouts: 15000,
    revenueChange: '+18%',
    profitChange: '+22%',
  },
};

const mockSalesData = {
  data: {
    topProducts: [
      { name: 'Fresh Tomatoes', revenue: 35000, units: 1400 },
      { name: 'Organic Carrots', revenue: 28000, units: 1120 },
      { name: 'Fresh Spinach', revenue: 22000, units: 880 },
    ],
    productProfitability: [
      { name: 'Fresh Tomatoes', revenue: 35000, cost: 24500, margin: 30 },
      { name: 'Organic Carrots', revenue: 28000, cost: 19600, margin: 30 },
      { name: 'Fresh Spinach', revenue: 22000, cost: 15400, margin: 30 },
    ],
  },
};

const mockRevenueData = {
  data: {
    chartData: [
      { month: 'Jan', revenue: 25000, profit: 7500 },
      { month: 'Feb', revenue: 28000, profit: 8400 },
      { month: 'Mar', revenue: 32000, profit: 9600 },
    ],
    payoutHistory: [
      {
        id: 'payout_1',
        amount: 12500,
        status: 'completed',
        date: '2025-01-15',
        method: 'bank_transfer',
      },
      {
        id: 'payout_2',
        amount: 15000,
        status: 'pending',
        date: '2025-01-22',
        method: 'bank_transfer',
      },
    ],
  },
};

const defaultAuthState = {
  user: {
    id: 'vendor_1',
    name: 'Test Vendor',
    role: 'vendor',
  },
  token: 'test-token',
};

describe('VendorFinancialReports', () => {
  const mockExportPDF = vi.fn();
  const mockExportCSV = vi.fn();
  const mockExportExcel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    useGetFinancialSummaryQuery.mockReturnValue({
      data: mockFinancialData,
      isLoading: false,
      error: null,
    });

    useGetSalesReportsQuery.mockReturnValue({
      data: mockSalesData,
      isLoading: false,
      error: null,
    });

    useGetRevenueAnalyticsQuery.mockReturnValue({
      data: mockRevenueData,
      isLoading: false,
      error: null,
    });

    useExportFinancialReportPDFMutation.mockReturnValue([mockExportPDF, { isLoading: false }]);
    useExportFinancialReportCSVMutation.mockReturnValue([mockExportCSV, { isLoading: false }]);
    useExportFinancialReportExcelMutation.mockReturnValue([mockExportExcel, { isLoading: false }]);

    mockExportPDF.mockResolvedValue({ unwrap: () => Promise.resolve(new Blob()) });
    mockExportCSV.mockResolvedValue({ unwrap: () => Promise.resolve(new Blob()) });
    mockExportExcel.mockResolvedValue({ unwrap: () => Promise.resolve(new Blob()) });
  });

  describe('Loading and Error States', () => {
    it('shows loading spinner when data is loading', () => {
      useGetFinancialSummaryQuery.mockReturnValue({
        data: null,
        isLoading: true,
        error: null,
      });

      renderWithProviders(<VendorFinancialReports />, {
        preloadedState: { auth: defaultAuthState },
      });

      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('shows error state when data fails to load', () => {
      useGetFinancialSummaryQuery.mockReturnValue({
        data: null,
        isLoading: false,
        error: { message: 'Failed to load financial data' },
      });

      renderWithProviders(<VendorFinancialReports />, {
        preloadedState: { auth: defaultAuthState },
      });

      expect(screen.getByText(/failed to load/i)).toBeInTheDocument();
    });
  });

  describe('Page Layout and Header', () => {
    it('renders the main header correctly', () => {
      renderWithProviders(<VendorFinancialReports />, {
        preloadedState: { auth: defaultAuthState },
      });

      expect(screen.getByText('Financial Reports')).toBeInTheDocument();
      expect(
        screen.getByText(/comprehensive financial overview/i)
      ).toBeInTheDocument();
    });

    it('displays time range selector', () => {
      renderWithProviders(<VendorFinancialReports />, {
        preloadedState: { auth: defaultAuthState },
      });

      const timeRangeSelect = screen.getByRole('combobox', { name: /time.*range/i });
      expect(timeRangeSelect).toBeInTheDocument();
      expect(screen.getByText('This Month')).toBeInTheDocument();
      expect(screen.getByText('This Quarter')).toBeInTheDocument();
      expect(screen.getByText('This Year')).toBeInTheDocument();
    });

    it('displays export buttons', () => {
      renderWithProviders(<VendorFinancialReports />, {
        preloadedState: { auth: defaultAuthState },
      });

      expect(screen.getByRole('button', { name: /export.*pdf/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /export.*csv/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /export.*excel/i })).toBeInTheDocument();
    });
  });

  describe('Report Type Tabs', () => {
    it('renders all report tabs', () => {
      renderWithProviders(<VendorFinancialReports />, {
        preloadedState: { auth: defaultAuthState },
      });

      expect(screen.getByText('Overview')).toBeInTheDocument();
      expect(screen.getByText('P&L Statement')).toBeInTheDocument();
      expect(screen.getByText('Product Profitability')).toBeInTheDocument();
      expect(screen.getByText('Payouts')).toBeInTheDocument();
    });

    it('switches between tabs correctly', async () => {
      const user = userEvent.setup();

      renderWithProviders(<VendorFinancialReports />, {
        preloadedState: { auth: defaultAuthState },
      });

      // Initially on Overview tab
      expect(screen.getByText('Total Revenue')).toBeInTheDocument();

      // Switch to P&L Statement
      await user.click(screen.getByText('P&L Statement'));
      await waitFor(() => {
        expect(screen.getByText('Total Sales Revenue')).toBeInTheDocument();
        expect(screen.getByText('Cost of Goods Sold (COGS)')).toBeInTheDocument();
      });

      // Switch to Product Profitability
      await user.click(screen.getByText('Product Profitability'));
      await waitFor(() => {
        expect(screen.getByText('Product Name')).toBeInTheDocument();
        expect(screen.getByText('Margin %')).toBeInTheDocument();
      });

      // Switch to Payouts
      await user.click(screen.getByText('Payouts'));
      await waitFor(() => {
        expect(screen.getByText('Payout History')).toBeInTheDocument();
      });
    });
  });

  describe('Overview Tab', () => {
    it('displays financial KPI cards', () => {
      renderWithProviders(<VendorFinancialReports />, {
        preloadedState: { auth: defaultAuthState },
      });

      expect(screen.getByText('Total Revenue')).toBeInTheDocument();
      expect(screen.getByText('BDT 125,000')).toBeInTheDocument();

      expect(screen.getByText('Gross Profit')).toBeInTheDocument();
      expect(screen.getByText('BDT 37,500')).toBeInTheDocument();

      expect(screen.getByText('Profit Margin')).toBeInTheDocument();
      expect(screen.getByText('30%')).toBeInTheDocument();

      expect(screen.getByText('Pending Payouts')).toBeInTheDocument();
      expect(screen.getByText('BDT 15,000')).toBeInTheDocument();
    });

    it('displays percentage change indicators', () => {
      renderWithProviders(<VendorFinancialReports />, {
        preloadedState: { auth: defaultAuthState },
      });

      expect(screen.getByText('+18%')).toBeInTheDocument();
      expect(screen.getByText('+22%')).toBeInTheDocument();
    });

    it('renders revenue trend chart', () => {
      renderWithProviders(<VendorFinancialReports />, {
        preloadedState: { auth: defaultAuthState },
      });

      expect(screen.getByText('Revenue Trend')).toBeInTheDocument();
      // Chart component should be rendered
      const chartContainer = document.querySelector('[class*="recharts"]');
      expect(chartContainer).toBeInTheDocument();
    });
  });

  describe('P&L Statement Tab', () => {
    it('displays complete P&L table', async () => {
      const user = userEvent.setup();

      renderWithProviders(<VendorFinancialReports />, {
        preloadedState: { auth: defaultAuthState },
      });

      await user.click(screen.getByText('P&L Statement'));

      await waitFor(() => {
        expect(screen.getByText('Total Sales Revenue')).toBeInTheDocument();
        expect(screen.getByText('Cost of Goods Sold (COGS)')).toBeInTheDocument();
        expect(screen.getByText('Gross Profit')).toBeInTheDocument();
        expect(screen.getByText('Operating Expenses')).toBeInTheDocument();
        expect(screen.getByText('Net Profit Before Tax')).toBeInTheDocument();
        expect(screen.getByText('Taxes Paid')).toBeInTheDocument();
        expect(screen.getByText('Net Profit')).toBeInTheDocument();
      });
    });

    it('calculates profit margins correctly', async () => {
      const user = userEvent.setup();

      renderWithProviders(<VendorFinancialReports />, {
        preloadedState: { auth: defaultAuthState },
      });

      await user.click(screen.getByText('P&L Statement'));

      await waitFor(() => {
        // Gross margin: (37500 / 125000) * 100 = 30%
        expect(screen.getByText('30%')).toBeInTheDocument();
      });
    });
  });

  describe('Product Profitability Tab', () => {
    it('displays product profitability table', async () => {
      const user = userEvent.setup();

      renderWithProviders(<VendorFinancialReports />, {
        preloadedState: { auth: defaultAuthState },
      });

      await user.click(screen.getByText('Product Profitability'));

      await waitFor(() => {
        expect(screen.getByText('Fresh Tomatoes')).toBeInTheDocument();
        expect(screen.getByText('Organic Carrots')).toBeInTheDocument();
        expect(screen.getByText('Fresh Spinach')).toBeInTheDocument();

        // Check revenue values
        expect(screen.getByText('BDT 35,000')).toBeInTheDocument();
        expect(screen.getByText('BDT 28,000')).toBeInTheDocument();
        expect(screen.getByText('BDT 22,000')).toBeInTheDocument();
      });
    });

    it('displays margin percentages for each product', async () => {
      const user = userEvent.setup();

      renderWithProviders(<VendorFinancialReports />, {
        preloadedState: { auth: defaultAuthState },
      });

      await user.click(screen.getByText('Product Profitability'));

      await waitFor(() => {
        const marginCells = screen.getAllByText('30%');
        expect(marginCells.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Payouts Tab', () => {
    it('displays payout history', async () => {
      const user = userEvent.setup();

      renderWithProviders(<VendorFinancialReports />, {
        preloadedState: { auth: defaultAuthState },
      });

      await user.click(screen.getByText('Payouts'));

      await waitFor(() => {
        expect(screen.getByText('Payout History')).toBeInTheDocument();
        expect(screen.getByText('BDT 12,500')).toBeInTheDocument();
        expect(screen.getByText('BDT 15,000')).toBeInTheDocument();
      });
    });

    it('displays payout status badges', async () => {
      const user = userEvent.setup();

      renderWithProviders(<VendorFinancialReports />, {
        preloadedState: { auth: defaultAuthState },
      });

      await user.click(screen.getByText('Payouts'));

      await waitFor(() => {
        expect(screen.getByText('Completed')).toBeInTheDocument();
        expect(screen.getByText('Pending')).toBeInTheDocument();
      });
    });

    it('formats payout dates correctly', async () => {
      const user = userEvent.setup();

      renderWithProviders(<VendorFinancialReports />, {
        preloadedState: { auth: defaultAuthState },
      });

      await user.click(screen.getByText('Payouts'));

      await waitFor(() => {
        // Should display formatted dates
        expect(screen.getByText(/Jan.*15/i)).toBeInTheDocument();
        expect(screen.getByText(/Jan.*22/i)).toBeInTheDocument();
      });
    });
  });

  describe('Export Functionality', () => {
    it('exports to PDF when PDF button clicked', async () => {
      const user = userEvent.setup();

      renderWithProviders(<VendorFinancialReports />, {
        preloadedState: { auth: defaultAuthState },
      });

      const pdfButton = screen.getByRole('button', { name: /export.*pdf/i });
      await user.click(pdfButton);

      await waitFor(() => {
        expect(mockExportPDF).toHaveBeenCalled();
      });
    });

    it('exports to CSV when CSV button clicked', async () => {
      const user = userEvent.setup();

      renderWithProviders(<VendorFinancialReports />, {
        preloadedState: { auth: defaultAuthState },
      });

      const csvButton = screen.getByRole('button', { name: /export.*csv/i });
      await user.click(csvButton);

      await waitFor(() => {
        expect(mockExportCSV).toHaveBeenCalled();
      });
    });

    it('exports to Excel when Excel button clicked', async () => {
      const user = userEvent.setup();

      renderWithProviders(<VendorFinancialReports />, {
        preloadedState: { auth: defaultAuthState },
      });

      const excelButton = screen.getByRole('button', { name: /export.*excel/i });
      await user.click(excelButton);

      await waitFor(() => {
        expect(mockExportExcel).toHaveBeenCalled();
      });
    });

    it('handles export errors gracefully', async () => {
      const user = userEvent.setup();
      mockExportPDF.mockRejectedValue({
        data: { message: 'Export failed' },
      });

      renderWithProviders(<VendorFinancialReports />, {
        preloadedState: { auth: defaultAuthState },
      });

      const pdfButton = screen.getByRole('button', { name: /export.*pdf/i });
      await user.click(pdfButton);

      await waitFor(() => {
        expect(screen.getByText(/export.*failed/i)).toBeInTheDocument();
      });
    });
  });

  describe('Time Range Filtering', () => {
    it('updates data when time range changes', async () => {
      const user = userEvent.setup();

      renderWithProviders(<VendorFinancialReports />, {
        preloadedState: { auth: defaultAuthState },
      });

      const timeRangeSelect = screen.getByRole('combobox', { name: /time.*range/i });
      await user.selectOptions(timeRangeSelect, 'quarter');

      await waitFor(() => {
        expect(useGetFinancialSummaryQuery).toHaveBeenCalledWith(
          expect.objectContaining({ period: 'quarter' })
        );
      });
    });
  });

  describe('Responsive Design', () => {
    it('applies mobile-first responsive classes', () => {
      renderWithProviders(<VendorFinancialReports />, {
        preloadedState: { auth: defaultAuthState },
      });

      const container = document.querySelector('.max-w-7xl');
      expect(container).toBeInTheDocument();
    });

    it('uses responsive grid for KPI cards', () => {
      renderWithProviders(<VendorFinancialReports />, {
        preloadedState: { auth: defaultAuthState },
      });

      const grid = document.querySelector('.grid');
      expect(grid).toHaveClass('grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-4');
    });
  });

  describe('Design System Compliance', () => {
    it('uses glassmorphism design classes', () => {
      renderWithProviders(<VendorFinancialReports />, {
        preloadedState: { auth: defaultAuthState },
      });

      const glassElements = document.querySelectorAll('[class*="glass-layer"]');
      expect(glassElements.length).toBeGreaterThan(0);
    });

    it('uses organic curves', () => {
      renderWithProviders(<VendorFinancialReports />, {
        preloadedState: { auth: defaultAuthState },
      });

      const roundedElements = document.querySelectorAll('[class*="rounded-"]');
      expect(roundedElements.length).toBeGreaterThan(0);
    });

    it('uses brand colors', () => {
      renderWithProviders(<VendorFinancialReports />, {
        preloadedState: { auth: defaultAuthState },
      });

      const bodyHTML = document.body.innerHTML;
      expect(bodyHTML).toMatch(/muted-olive|sage-green|bottle-green|mint-fresh/);
    });
  });

  describe('Empty States', () => {
    it('shows empty state when no financial data', () => {
      useGetFinancialSummaryQuery.mockReturnValue({
        data: { data: null },
        isLoading: false,
        error: null,
      });

      renderWithProviders(<VendorFinancialReports />, {
        preloadedState: { auth: defaultAuthState },
      });

      expect(screen.getByText(/no.*data.*available/i)).toBeInTheDocument();
    });
  });

  describe('API Integration', () => {
    it('calls all required API endpoints', () => {
      renderWithProviders(<VendorFinancialReports />, {
        preloadedState: { auth: defaultAuthState },
      });

      expect(useGetFinancialSummaryQuery).toHaveBeenCalled();
      expect(useGetSalesReportsQuery).toHaveBeenCalled();
      expect(useGetRevenueAnalyticsQuery).toHaveBeenCalled();
    });

    it('passes correct period parameter', () => {
      renderWithProviders(<VendorFinancialReports />, {
        preloadedState: { auth: defaultAuthState },
      });

      expect(useGetFinancialSummaryQuery).toHaveBeenCalledWith(
        expect.objectContaining({ period: expect.any(String) })
      );
    });
  });
});
