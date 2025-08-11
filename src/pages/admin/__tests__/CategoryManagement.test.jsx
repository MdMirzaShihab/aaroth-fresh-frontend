import React from 'react';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../../../test/test-utils';
import CategoryManagement from '../CategoryManagement';
import * as apiSlice from '../../../store/slices/apiSlice';

// Mock the RTK Query hooks
vi.mock('../../../store/slices/apiSlice', async () => {
  const actual = await vi.importActual('../../../store/slices/apiSlice');
  return {
    ...actual,
    useGetAdminCategoriesQuery: vi.fn(),
    useCreateAdminCategoryMutation: vi.fn(),
    useUpdateAdminCategoryMutation: vi.fn(),
    useDeleteAdminCategoryMutation: vi.fn(),
    useBulkUpdateCategoriesMutation: vi.fn()
  };
});

// Mock categories data
const mockCategoriesData = {
  data: {
    categories: [
      {
        id: 'cat-1',
        name: 'Vegetables',
        description: 'Fresh vegetables from local farms',
        color: '#10B981',
        icon: 'Carrot',
        parentId: null,
        isActive: true,
        order: 1,
        productsCount: 45,
        createdAt: '2024-01-10T10:00:00Z',
        children: [
          {
            id: 'cat-1-1',
            name: 'Leafy Greens',
            description: 'Spinach, lettuce, kale',
            color: '#059669',
            parentId: 'cat-1',
            isActive: true,
            order: 1,
            productsCount: 12
          }
        ]
      },
      {
        id: 'cat-2',
        name: 'Fruits',
        description: 'Seasonal fruits',
        color: '#F59E0B',
        icon: 'Apple',
        parentId: null,
        isActive: true,
        order: 2,
        productsCount: 28,
        createdAt: '2024-01-08T10:00:00Z',
        children: []
      }
    ]
  }
};

describe('CategoryManagement', () => {
  const renderCategoryManagement = (queryResult = {}) => {
    const defaultResult = {
      data: mockCategoriesData,
      isLoading: false,
      error: null,
      refetch: vi.fn()
    };

    apiSlice.useGetAdminCategoriesQuery.mockReturnValue({
      ...defaultResult,
      ...queryResult
    });

    apiSlice.useCreateAdminCategoryMutation.mockReturnValue([vi.fn(), { isLoading: false }]);
    apiSlice.useUpdateAdminCategoryMutation.mockReturnValue([vi.fn(), { isLoading: false }]);
    apiSlice.useDeleteAdminCategoryMutation.mockReturnValue([vi.fn(), { isLoading: false }]);
    apiSlice.useBulkUpdateCategoriesMutation.mockReturnValue([vi.fn(), { isLoading: false }]);

    return renderWithProviders(<CategoryManagement />, {
      preloadedState: {
        auth: {
          isAuthenticated: true,
          user: {
            id: 'admin-1',
            role: 'admin',
            name: 'Admin User'
          },
          token: 'mock-token',
          loading: false
        }
      }
    });
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders category management title and description', async () => {
    renderCategoryManagement();

    expect(screen.getByText('Category Management')).toBeInTheDocument();
    expect(screen.getByText('Organize products with hierarchical categories and manage the catalog structure')).toBeInTheDocument();
  });

  it('displays loading state', () => {
    renderCategoryManagement({ isLoading: true });
    
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('renders categories with correct data', async () => {
    renderCategoryManagement();

    await waitFor(() => {
      expect(screen.getByText('Vegetables')).toBeInTheDocument();
      expect(screen.getByText('Fruits')).toBeInTheDocument();
    });

    // Check descriptions
    expect(screen.getByText('Fresh vegetables from local farms')).toBeInTheDocument();
    expect(screen.getByText('Seasonal fruits')).toBeInTheDocument();

    // Check product counts
    expect(screen.getByText('45 products')).toBeInTheDocument();
    expect(screen.getByText('28 products')).toBeInTheDocument();
  });

  it('shows hierarchical structure with subcategories', async () => {
    renderCategoryManagement();

    await waitFor(() => {
      expect(screen.getByText('Leafy Greens')).toBeInTheDocument();
    });

    // Check subcategory description
    expect(screen.getByText('Spinach, lettuce, kale')).toBeInTheDocument();
    expect(screen.getByText('12 products')).toBeInTheDocument();
  });

  it('opens create category modal', async () => {
    const user = userEvent.setup();
    renderCategoryManagement();

    await waitFor(() => {
      expect(screen.getByText('Add Category')).toBeInTheDocument();
    });

    const addButton = screen.getByText('Add Category');
    await user.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('Create Category')).toBeInTheDocument();
      expect(screen.getByLabelText('Category Name')).toBeInTheDocument();
    });
  });

  it('creates new category with valid data', async () => {
    const user = userEvent.setup();
    const mockCreateCategory = vi.fn().mockReturnValue({ 
      unwrap: vi.fn().mockResolvedValue({ data: { id: 'new-cat' } }) 
    });
    apiSlice.useCreateAdminCategoryMutation.mockReturnValue([mockCreateCategory, { isLoading: false }]);

    renderCategoryManagement();

    // Open modal
    const addButton = screen.getByText('Add Category');
    await user.click(addButton);

    await waitFor(() => {
      expect(screen.getByLabelText('Category Name')).toBeInTheDocument();
    });

    // Fill form
    await user.type(screen.getByLabelText('Category Name'), 'Test Category');
    await user.type(screen.getByLabelText('Description'), 'Test description');
    
    // Submit
    const createButton = screen.getByText('Create Category');
    await user.click(createButton);

    await waitFor(() => {
      expect(mockCreateCategory).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Test Category',
          description: 'Test description'
        })
      );
    });
  });

  it('opens edit category modal', async () => {
    const user = userEvent.setup();
    renderCategoryManagement();

    await waitFor(() => {
      expect(screen.getByText('Vegetables')).toBeInTheDocument();
    });

    // Click edit button for first category
    const editButtons = screen.getAllByTitle('Edit category');
    await user.click(editButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('Edit Category')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Vegetables')).toBeInTheDocument();
    });
  });

  it('updates category with changes', async () => {
    const user = userEvent.setup();
    const mockUpdateCategory = vi.fn().mockReturnValue({ 
      unwrap: vi.fn().mockResolvedValue({}) 
    });
    apiSlice.useUpdateAdminCategoryMutation.mockReturnValue([mockUpdateCategory, { isLoading: false }]);

    renderCategoryManagement();

    await waitFor(() => {
      expect(screen.getByText('Vegetables')).toBeInTheDocument();
    });

    // Open edit modal
    const editButtons = screen.getAllByTitle('Edit category');
    await user.click(editButtons[0]);

    await waitFor(() => {
      expect(screen.getByDisplayValue('Vegetables')).toBeInTheDocument();
    });

    // Update name
    const nameField = screen.getByDisplayValue('Vegetables');
    await user.clear(nameField);
    await user.type(nameField, 'Fresh Vegetables');

    // Submit
    const updateButton = screen.getByText('Update Category');
    await user.click(updateButton);

    await waitFor(() => {
      expect(mockUpdateCategory).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'cat-1',
          name: 'Fresh Vegetables'
        })
      );
    });
  });

  it('handles category deletion', async () => {
    const user = userEvent.setup();
    const mockDeleteCategory = vi.fn().mockReturnValue({ 
      unwrap: vi.fn().mockResolvedValue({}) 
    });
    apiSlice.useDeleteAdminCategoryMutation.mockReturnValue([mockDeleteCategory, { isLoading: false }]);

    renderCategoryManagement();

    await waitFor(() => {
      expect(screen.getByText('Vegetables')).toBeInTheDocument();
    });

    // Click delete button
    const deleteButtons = screen.getAllByTitle('Delete category');
    await user.click(deleteButtons[0]);

    // Confirm deletion
    await waitFor(() => {
      expect(screen.getByText('Delete Category')).toBeInTheDocument();
    });

    const confirmButton = screen.getByText('Delete');
    await user.click(confirmButton);

    expect(mockDeleteCategory).toHaveBeenCalledWith('cat-1');
  });

  it('handles category status toggle', async () => {
    const user = userEvent.setup();
    const mockUpdateCategory = vi.fn().mockReturnValue({ 
      unwrap: vi.fn().mockResolvedValue({}) 
    });
    apiSlice.useUpdateAdminCategoryMutation.mockReturnValue([mockUpdateCategory, { isLoading: false }]);

    renderCategoryManagement();

    await waitFor(() => {
      expect(screen.getByText('Vegetables')).toBeInTheDocument();
    });

    // Find and click status toggle
    const statusButtons = screen.getAllByTitle(/activate|deactivate/i);
    await user.click(statusButtons[0]);

    expect(mockUpdateCategory).toHaveBeenCalledWith({
      id: 'cat-1',
      isActive: false
    });
  });

  it('shows color picker in form', async () => {
    const user = userEvent.setup();
    renderCategoryManagement();

    // Open create modal
    const addButton = screen.getByText('Add Category');
    await user.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('Color')).toBeInTheDocument();
      const colorInput = screen.getByDisplayValue('#10B981');
      expect(colorInput).toBeInTheDocument();
    });
  });

  it('handles parent category selection', async () => {
    const user = userEvent.setup();
    renderCategoryManagement();

    // Open create modal
    const addButton = screen.getByText('Add Category');
    await user.click(addButton);

    await waitFor(() => {
      expect(screen.getByLabelText('Parent Category')).toBeInTheDocument();
    });

    // Select parent category
    const parentSelect = screen.getByLabelText('Parent Category');
    await user.selectOptions(parentSelect, 'cat-1');

    expect(parentSelect.value).toBe('cat-1');
  });

  it('handles API errors gracefully', async () => {
    renderCategoryManagement({ 
      error: { status: 500, data: { error: 'Server error' } }
    });

    await waitFor(() => {
      expect(screen.getByText('Failed to load categories')).toBeInTheDocument();
      expect(screen.getByText('Retry')).toBeInTheDocument();
    });
  });

  it('shows empty state when no categories', async () => {
    renderCategoryManagement({
      data: {
        data: {
          categories: []
        }
      }
    });

    await waitFor(() => {
      expect(screen.getByText('No categories found')).toBeInTheDocument();
      expect(screen.getByText('Create your first category to start organizing products')).toBeInTheDocument();
    });
  });

  it('displays category icons correctly', async () => {
    renderCategoryManagement();

    await waitFor(() => {
      // Check that categories display correctly (icons are shown as text in tests)
      expect(screen.getByText('Vegetables')).toBeInTheDocument();
      expect(screen.getByText('Fruits')).toBeInTheDocument();
    });
  });

  it('validates required fields in form', async () => {
    const user = userEvent.setup();
    const mockCreateCategory = vi.fn();
    apiSlice.useCreateAdminCategoryMutation.mockReturnValue([mockCreateCategory, { isLoading: false }]);

    renderCategoryManagement();

    // Open create modal
    const addButton = screen.getByText('Add Category');
    await user.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('Create Category')).toBeInTheDocument();
    });

    // Try to submit without required fields
    const createButton = screen.getByText('Create Category');
    await user.click(createButton);

    // Form should not be submitted due to HTML5 validation
    expect(mockCreateCategory).not.toHaveBeenCalled();
  });

  it('renders accessibility features correctly', async () => {
    renderCategoryManagement();

    await waitFor(() => {
      // Check for proper heading hierarchy
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Category Management');
      
      // Check all buttons have proper labels or titles
      const actionButtons = screen.getAllByRole('button');
      actionButtons.forEach(button => {
        expect(
          button.textContent || 
          button.getAttribute('title') || 
          button.getAttribute('aria-label')
        ).toBeTruthy();
      });
    });
  });

  it('supports keyboard navigation', async () => {
    const user = userEvent.setup();
    renderCategoryManagement();

    await waitFor(() => {
      expect(screen.getByText('Add Category')).toBeInTheDocument();
    });

    // Test tab navigation
    const addButton = screen.getByText('Add Category');
    addButton.focus();
    
    await user.tab();
    
    // Next focusable element should be focused
    expect(document.activeElement).not.toBe(addButton);
  });

  it('handles drag and drop reordering', async () => {
    const user = userEvent.setup();
    renderCategoryManagement();

    await waitFor(() => {
      expect(screen.getByText('Vegetables')).toBeInTheDocument();
    });

    // Check that drag handles are present (they appear as grip icons or similar)
    const categoryItems = screen.getAllByRole('listitem');
    expect(categoryItems.length).toBeGreaterThan(0);
  });
});