import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../../../test/test-utils';
import VendorProfile from '../VendorProfile';
import {
  useUpdateVendorProfile,
  useUploadVendorLogo,
  useUpdateBusinessHours,
  useUpdateBankingDetails,
  useUploadVendorDocument,
  useGetVendorDocuments,
} from '../../../store/slices/vendor/vendorExtensionsApi';

// Mock the API hooks
vi.mock('../../../store/slices/vendor/vendorExtensionsApi', () => ({
  useUpdateVendorProfile: vi.fn(),
  useUploadVendorLogo: vi.fn(),
  useUpdateBusinessHours: vi.fn(),
  useUpdateBankingDetails: vi.fn(),
  useUploadVendorDocument: vi.fn(),
  useGetVendorDocuments: vi.fn(),
}));

const mockVendorData = {
  vendor: {
    businessName: 'Fresh Produce Co.',
    businessType: 'Wholesaler',
    businessRegistrationNumber: 'REG123456',
    gstNumber: 'GST789012',
    contactPerson: 'John Doe',
    verificationStatus: 'approved',
    operatingHours: {
      monday: { open: '06:00', close: '20:00', closed: false },
      tuesday: { open: '06:00', close: '20:00', closed: false },
      wednesday: { open: '06:00', close: '20:00', closed: false },
      thursday: { open: '06:00', close: '20:00', closed: false },
      friday: { open: '06:00', close: '20:00', closed: false },
      saturday: { open: '06:00', close: '18:00', closed: false },
      sunday: { open: '00:00', close: '00:00', closed: true },
    },
  },
};

const mockDocumentsData = {
  data: {
    documents: [
      {
        id: 'doc_1',
        type: 'business_license',
        fileName: 'license.pdf',
        uploadedAt: '2025-01-15T10:00:00.000Z',
        verified: true,
      },
      {
        id: 'doc_2',
        type: 'gst_certificate',
        fileName: 'gst.pdf',
        uploadedAt: '2025-01-16T10:00:00.000Z',
        verified: false,
      },
    ],
  },
};

const defaultAuthState = {
  user: {
    id: 'vendor_1',
    name: 'Test Vendor',
    role: 'vendor',
    email: 'vendor@test.com',
    phone: '+1234567890',
    ...mockVendorData,
  },
  token: 'test-token',
};

describe('VendorProfile', () => {
  const mockUpdateProfile = vi.fn();
  const mockUploadLogo = vi.fn();
  const mockUpdateBusinessHours = vi.fn();
  const mockUpdateBanking = vi.fn();
  const mockUploadDocument = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    useUpdateVendorProfile.mockReturnValue([mockUpdateProfile, { isLoading: false }]);
    useUploadVendorLogo.mockReturnValue([mockUploadLogo, { isLoading: false }]);
    useUpdateBusinessHours.mockReturnValue([mockUpdateBusinessHours, { isLoading: false }]);
    useUpdateBankingDetails.mockReturnValue([mockUpdateBanking, { isLoading: false }]);
    useUploadVendorDocument.mockReturnValue([mockUploadDocument, { isLoading: false }]);
    useGetVendorDocuments.mockReturnValue({
      data: mockDocumentsData,
      isLoading: false,
      error: null,
    });

    mockUpdateProfile.mockResolvedValue({ unwrap: () => Promise.resolve({}) });
    mockUploadLogo.mockResolvedValue({ unwrap: () => Promise.resolve({}) });
    mockUpdateBusinessHours.mockResolvedValue({ unwrap: () => Promise.resolve({}) });
    mockUpdateBanking.mockResolvedValue({ unwrap: () => Promise.resolve({}) });
    mockUploadDocument.mockResolvedValue({ unwrap: () => Promise.resolve({}) });
  });

  describe('Page Layout and Tabs', () => {
    it('renders the main header correctly', () => {
      renderWithProviders(<VendorProfile />, {
        preloadedState: { auth: defaultAuthState },
      });

      expect(screen.getByText('Vendor Profile')).toBeInTheDocument();
      expect(
        screen.getByText('Manage your business information and verification')
      ).toBeInTheDocument();
    });

    it('displays verification badge for approved vendors', () => {
      renderWithProviders(<VendorProfile />, {
        preloadedState: { auth: defaultAuthState },
      });

      expect(screen.getByText('Verified Business')).toBeInTheDocument();
    });

    it('displays pending verification badge correctly', () => {
      const pendingState = {
        auth: {
          ...defaultAuthState,
          user: {
            ...defaultAuthState.user,
            vendor: {
              ...defaultAuthState.user.vendor,
              verificationStatus: 'pending',
            },
          },
        },
      };

      renderWithProviders(<VendorProfile />, {
        preloadedState: pendingState,
      });

      expect(screen.getByText('Verification Pending')).toBeInTheDocument();
    });

    it('renders all profile tabs', () => {
      renderWithProviders(<VendorProfile />, {
        preloadedState: { auth: defaultAuthState },
      });

      expect(screen.getByText('Business Info')).toBeInTheDocument();
      expect(screen.getByText('Contact & Hours')).toBeInTheDocument();
      expect(screen.getByText('Documents')).toBeInTheDocument();
      expect(screen.getByText('Banking Details')).toBeInTheDocument();
    });

    it('switches between tabs correctly', async () => {
      const user = userEvent.setup();

      renderWithProviders(<VendorProfile />, {
        preloadedState: { auth: defaultAuthState },
      });

      // Initially on Business Info tab
      expect(screen.getByLabelText('Business Name')).toBeInTheDocument();

      // Switch to Contact & Hours
      await user.click(screen.getByText('Contact & Hours'));
      await waitFor(() => {
        expect(screen.getByLabelText('Contact Person')).toBeInTheDocument();
      });

      // Switch to Documents
      await user.click(screen.getByText('Documents'));
      await waitFor(() => {
        expect(screen.getByText('Business License')).toBeInTheDocument();
      });

      // Switch to Banking Details
      await user.click(screen.getByText('Banking Details'));
      await waitFor(() => {
        expect(screen.getByLabelText('Account Holder Name')).toBeInTheDocument();
      });
    });
  });

  describe('Business Info Tab', () => {
    it('displays business information correctly', () => {
      renderWithProviders(<VendorProfile />, {
        preloadedState: { auth: defaultAuthState },
      });

      const businessNameInput = screen.getByLabelText('Business Name');
      expect(businessNameInput.value).toBe('Fresh Produce Co.');

      const businessTypeSelect = screen.getByLabelText('Business Type');
      expect(businessTypeSelect.value).toBe('Wholesaler');

      const registrationInput = screen.getByLabelText('Business Registration Number');
      expect(registrationInput.value).toBe('REG123456');

      const gstInput = screen.getByLabelText('GST/Tax Number');
      expect(gstInput.value).toBe('GST789012');
    });

    it('allows editing business information', async () => {
      const user = userEvent.setup();

      renderWithProviders(<VendorProfile />, {
        preloadedState: { auth: defaultAuthState },
      });

      const businessNameInput = screen.getByLabelText('Business Name');
      await user.clear(businessNameInput);
      await user.type(businessNameInput, 'Updated Business Name');

      expect(businessNameInput.value).toBe('Updated Business Name');
    });

    it('handles logo upload', async () => {
      const user = userEvent.setup();
      const file = new File(['logo'], 'logo.png', { type: 'image/png' });

      renderWithProviders(<VendorProfile />, {
        preloadedState: { auth: defaultAuthState },
      });

      const uploadInput = screen.getByLabelText(/upload.*logo/i);
      await user.upload(uploadInput, file);

      await waitFor(() => {
        expect(mockUploadLogo).toHaveBeenCalled();
      });
    });

    it('validates required fields before saving', async () => {
      const user = userEvent.setup();

      renderWithProviders(<VendorProfile />, {
        preloadedState: { auth: defaultAuthState },
      });

      const businessNameInput = screen.getByLabelText('Business Name');
      await user.clear(businessNameInput);

      const saveButton = screen.getByRole('button', { name: /save changes/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText(/business name is required/i)).toBeInTheDocument();
      });
    });
  });

  describe('Contact & Hours Tab', () => {
    it('displays operating hours for all days', async () => {
      const user = userEvent.setup();

      renderWithProviders(<VendorProfile />, {
        preloadedState: { auth: defaultAuthState },
      });

      await user.click(screen.getByText('Contact & Hours'));

      await waitFor(() => {
        expect(screen.getByText('Monday')).toBeInTheDocument();
        expect(screen.getByText('Tuesday')).toBeInTheDocument();
        expect(screen.getByText('Wednesday')).toBeInTheDocument();
        expect(screen.getByText('Thursday')).toBeInTheDocument();
        expect(screen.getByText('Friday')).toBeInTheDocument();
        expect(screen.getByText('Saturday')).toBeInTheDocument();
        expect(screen.getByText('Sunday')).toBeInTheDocument();
      });
    });

    it('allows toggling closed status for a day', async () => {
      const user = userEvent.setup();

      renderWithProviders(<VendorProfile />, {
        preloadedState: { auth: defaultAuthState },
      });

      await user.click(screen.getByText('Contact & Hours'));

      await waitFor(() => {
        const mondayClosedToggle = screen.getAllByRole('checkbox')[0];
        user.click(mondayClosedToggle);
      });

      await waitFor(() => {
        expect(screen.getAllByRole('checkbox')[0]).toBeChecked();
      });
    });

    it('updates business hours when saved', async () => {
      const user = userEvent.setup();

      renderWithProviders(<VendorProfile />, {
        preloadedState: { auth: defaultAuthState },
      });

      await user.click(screen.getByText('Contact & Hours'));

      const saveButton = screen.getByRole('button', { name: /save.*hours/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(mockUpdateBusinessHours).toHaveBeenCalled();
      });
    });
  });

  describe('Documents Tab', () => {
    it('displays uploaded documents list', async () => {
      const user = userEvent.setup();

      renderWithProviders(<VendorProfile />, {
        preloadedState: { auth: defaultAuthState },
      });

      await user.click(screen.getByText('Documents'));

      await waitFor(() => {
        expect(screen.getByText('license.pdf')).toBeInTheDocument();
        expect(screen.getByText('gst.pdf')).toBeInTheDocument();
        expect(screen.getByText('Verified')).toBeInTheDocument();
        expect(screen.getByText('Pending Verification')).toBeInTheDocument();
      });
    });

    it('allows uploading new documents', async () => {
      const user = userEvent.setup();
      const file = new File(['document'], 'license.pdf', { type: 'application/pdf' });

      renderWithProviders(<VendorProfile />, {
        preloadedState: { auth: defaultAuthState },
      });

      await user.click(screen.getByText('Documents'));

      await waitFor(() => {
        const uploadInput = screen.getAllByLabelText(/upload/i)[0];
        user.upload(uploadInput, file);
      });

      await waitFor(() => {
        expect(mockUploadDocument).toHaveBeenCalled();
      });
    });

    it('shows document type labels correctly', async () => {
      const user = userEvent.setup();

      renderWithProviders(<VendorProfile />, {
        preloadedState: { auth: defaultAuthState },
      });

      await user.click(screen.getByText('Documents'));

      await waitFor(() => {
        expect(screen.getByText('Business License')).toBeInTheDocument();
        expect(screen.getByText('GST Certificate')).toBeInTheDocument();
        expect(screen.getByText('PAN Card')).toBeInTheDocument();
      });
    });
  });

  describe('Banking Details Tab', () => {
    it('displays banking form fields', async () => {
      const user = userEvent.setup();

      renderWithProviders(<VendorProfile />, {
        preloadedState: { auth: defaultAuthState },
      });

      await user.click(screen.getByText('Banking Details'));

      await waitFor(() => {
        expect(screen.getByLabelText('Account Holder Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Account Number')).toBeInTheDocument();
        expect(screen.getByLabelText('Bank Name')).toBeInTheDocument();
        expect(screen.getByLabelText('IFSC Code')).toBeInTheDocument();
        expect(screen.getByLabelText('Branch')).toBeInTheDocument();
      });
    });

    it('validates banking details before saving', async () => {
      const user = userEvent.setup();

      renderWithProviders(<VendorProfile />, {
        preloadedState: { auth: defaultAuthState },
      });

      await user.click(screen.getByText('Banking Details'));

      const saveButton = screen.getByRole('button', { name: /save.*banking/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText(/account.*required/i)).toBeInTheDocument();
      });
    });

    it('saves banking details when valid', async () => {
      const user = userEvent.setup();

      renderWithProviders(<VendorProfile />, {
        preloadedState: { auth: defaultAuthState },
      });

      await user.click(screen.getByText('Banking Details'));

      await waitFor(async () => {
        await user.type(screen.getByLabelText('Account Holder Name'), 'John Doe');
        await user.type(screen.getByLabelText('Account Number'), '1234567890');
        await user.type(screen.getByLabelText('Bank Name'), 'Test Bank');
        await user.type(screen.getByLabelText('IFSC Code'), 'TEST0001234');
        await user.type(screen.getByLabelText('Branch'), 'Main Branch');
      });

      const saveButton = screen.getByRole('button', { name: /save.*banking/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(mockUpdateBanking).toHaveBeenCalledWith(
          expect.objectContaining({
            accountHolderName: 'John Doe',
            accountNumber: '1234567890',
          })
        );
      });
    });
  });

  describe('Form Submission', () => {
    it('shows loading state during save', async () => {
      const user = userEvent.setup();
      useUpdateVendorProfile.mockReturnValue([mockUpdateProfile, { isLoading: true }]);

      renderWithProviders(<VendorProfile />, {
        preloadedState: { auth: defaultAuthState },
      });

      expect(screen.getByRole('button', { name: /saving/i })).toBeDisabled();
    });

    it('handles save errors gracefully', async () => {
      const user = userEvent.setup();
      mockUpdateProfile.mockRejectedValue({
        data: { message: 'Update failed' },
      });

      renderWithProviders(<VendorProfile />, {
        preloadedState: { auth: defaultAuthState },
      });

      const saveButton = screen.getByRole('button', { name: /save changes/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText(/failed.*update/i)).toBeInTheDocument();
      });
    });

    it('shows success message after successful save', async () => {
      const user = userEvent.setup();

      renderWithProviders(<VendorProfile />, {
        preloadedState: { auth: defaultAuthState },
      });

      const businessNameInput = screen.getByLabelText('Business Name');
      await user.type(businessNameInput, ' Updated');

      const saveButton = screen.getByRole('button', { name: /save changes/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText(/successfully.*updated/i)).toBeInTheDocument();
      });
    });
  });

  describe('Responsive Design', () => {
    it('applies mobile-first responsive classes', () => {
      renderWithProviders(<VendorProfile />, {
        preloadedState: { auth: defaultAuthState },
      });

      const container = document.querySelector('.max-w-7xl');
      expect(container).toBeInTheDocument();
    });
  });

  describe('Design System Compliance', () => {
    it('uses glassmorphism design classes', () => {
      renderWithProviders(<VendorProfile />, {
        preloadedState: { auth: defaultAuthState },
      });

      const glassElements = document.querySelectorAll('[class*="glass-layer"]');
      expect(glassElements.length).toBeGreaterThan(0);
    });

    it('uses organic curves (rounded corners)', () => {
      renderWithProviders(<VendorProfile />, {
        preloadedState: { auth: defaultAuthState },
      });

      const roundedElements = document.querySelectorAll('[class*="rounded-"]');
      expect(roundedElements.length).toBeGreaterThan(0);
    });

    it('uses brand color palette', () => {
      renderWithProviders(<VendorProfile />, {
        preloadedState: { auth: defaultAuthState },
      });

      const bodyHTML = document.body.innerHTML;
      expect(bodyHTML).toMatch(/muted-olive|sage-green|bottle-green|mint-fresh/);
    });
  });
});
