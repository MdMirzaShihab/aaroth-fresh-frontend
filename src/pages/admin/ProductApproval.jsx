import React, { useState } from 'react';
import {
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Eye,
  Package,
  User,
  Calendar,
  Tag,
  Image as ImageIcon,
  FileText,
  Star,
  DollarSign,
} from 'lucide-react';
import {
  useGetAdminProductsQuery,
  useUpdateAdminProductMutation,
  useBulkUpdateProductsMutation,
} from '../../store/slices/apiSlice';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import SearchBar from '../../components/ui/SearchBar';
import { Card } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Pagination from '../../components/ui/Pagination';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import EmptyState from '../../components/ui/EmptyState';

const ProductApproval = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProducts, setSelectedProducts] = useState(new Set());
  const [confirmAction, setConfirmAction] = useState(null);
  const [viewingProduct, setViewingProduct] = useState(null);

  const itemsPerPage = 12;

  // Query for pending products
  const {
    data: productsData,
    isLoading,
    error,
    refetch,
  } = useGetAdminProductsQuery({
    page: currentPage,
    limit: itemsPerPage,
    search: searchTerm || undefined,
    status: 'pending',
  });

  const [updateProduct] = useUpdateAdminProductMutation();
  const [bulkUpdateProducts] = useBulkUpdateProductsMutation();

  const products = productsData?.data?.products || [];
  const pagination = productsData?.data?.pagination || {};

  // Handle product approval/rejection
  const handleApproval = async (productId, status, reviewNotes = '') => {
    try {
      await updateProduct({
        id: productId,
        status,
        reviewNotes,
        reviewedAt: new Date().toISOString(),
      }).unwrap();
      setConfirmAction(null);
      setSelectedProducts((prev) => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    } catch (error) {
      console.error('Failed to update product status:', error);
    }
  };

  // Handle bulk approvals
  const handleBulkApproval = async (status) => {
    try {
      const productIds = Array.from(selectedProducts);
      await bulkUpdateProducts({
        productIds,
        updates: {
          status,
          reviewedAt: new Date().toISOString(),
        },
      }).unwrap();
      setSelectedProducts(new Set());
      setConfirmAction(null);
    } catch (error) {
      console.error('Failed to bulk update products:', error);
    }
  };

  // Handle selection
  const handleSelectAll = () => {
    if (selectedProducts.size === products.length) {
      setSelectedProducts(new Set());
    } else {
      setSelectedProducts(new Set(products.map((product) => product.id)));
    }
  };

  const handleSelectProduct = (productId) => {
    setSelectedProducts((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  };

  // Get time since submission
  const getTimeSince = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

    if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        icon={AlertTriangle}
        title="Failed to load products"
        description="There was an error loading product approval queue. Please try again."
        action={{
          label: 'Retry',
          onClick: refetch,
        }}
      />
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-text-dark dark:text-white">
            Product Approval Queue
          </h1>
          <p className="text-text-muted mt-1">
            Review and approve product submissions from vendors
          </p>
          {products.length > 0 && (
            <div className="flex items-center gap-2 mt-2">
              <Clock className="w-4 h-4 text-earthy-yellow" />
              <span className="text-sm text-earthy-brown font-medium">
                {products.length} pending approvals
              </span>
            </div>
          )}
        </div>

        {/* Bulk Actions */}
        {selectedProducts.size > 0 && (
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm text-text-muted">
              {selectedProducts.size} selected
            </span>
            <Button
              variant="outline"
              onClick={() =>
                setConfirmAction({
                  type: 'bulk-approve',
                  title: 'Bulk Approve Products',
                  message: `Are you sure you want to approve ${selectedProducts.size} products? They will become available to customers.`,
                  confirmText: 'Approve All',
                  onConfirm: () => handleBulkApproval('active'),
                })
              }
              className="flex items-center gap-2 text-bottle-green border-bottle-green hover:bg-bottle-green hover:text-white"
            >
              <CheckCircle className="w-4 h-4" />
              Approve Selected
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                setConfirmAction({
                  type: 'bulk-reject',
                  title: 'Bulk Reject Products',
                  message: `Are you sure you want to reject ${selectedProducts.size} products? Vendors will be notified.`,
                  confirmText: 'Reject All',
                  isDangerous: true,
                  onConfirm: () => handleBulkApproval('rejected'),
                })
              }
              className="flex items-center gap-2 text-tomato-red border-tomato-red hover:bg-tomato-red hover:text-white"
            >
              <XCircle className="w-4 h-4" />
              Reject Selected
            </Button>
          </div>
        )}
      </div>

      {/* Search */}
      <Card className="p-6">
        <div className="flex flex-col lg:flex-row gap-4 items-center">
          <div className="flex-1 lg:max-w-md">
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search products by name, vendor, category..."
              className="w-full"
            />
          </div>

          {products.length > 0 && (
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={
                    selectedProducts.size === products.length &&
                    products.length > 0
                  }
                  onChange={handleSelectAll}
                  className="w-4 h-4 text-bottle-green border-gray-300 rounded focus:ring-bottle-green"
                />
                <span className="text-sm text-text-muted">Select all</span>
              </label>
            </div>
          )}
        </div>
      </Card>

      {/* Products Grid */}
      {products.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No pending approvals"
          description="All product submissions have been reviewed. Check back later for new submissions."
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <Card
                key={product.id}
                className={`hover:shadow-lg transition-all duration-300 ${
                  selectedProducts.has(product.id)
                    ? 'ring-2 ring-bottle-green/30 bg-bottle-green/5'
                    : ''
                }`}
              >
                <div className="p-6">
                  {/* Selection Checkbox */}
                  <div className="flex items-start justify-between mb-4">
                    <input
                      type="checkbox"
                      checked={selectedProducts.has(product.id)}
                      onChange={() => handleSelectProduct(product.id)}
                      className="w-4 h-4 text-bottle-green border-gray-300 rounded focus:ring-bottle-green mt-1"
                    />
                    <div className="flex items-center gap-1 text-xs text-earthy-brown bg-earthy-yellow/20 px-2 py-1 rounded-full">
                      <Clock className="w-3 h-3" />
                      {getTimeSince(product.createdAt)}
                    </div>
                  </div>

                  {/* Product Image */}
                  <div className="mb-4">
                    <div className="aspect-video bg-gray-100 rounded-2xl overflow-hidden">
                      {product.images && product.images.length > 0 ? (
                        <img
                          src={product.images[0].url}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <ImageIcon className="w-12 h-12" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-semibold text-text-dark dark:text-white text-lg mb-1 line-clamp-2">
                        {product.name}
                      </h3>
                      {product.description && (
                        <p className="text-sm text-text-muted line-clamp-2">
                          {product.description}
                        </p>
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="space-y-2">
                      {product.vendor && (
                        <div className="flex items-center gap-2 text-sm">
                          <User className="w-4 h-4 text-text-muted" />
                          <span className="text-text-dark dark:text-white">
                            {product.vendor.name || product.vendor.businessName}
                          </span>
                        </div>
                      )}

                      {product.category && (
                        <div className="flex items-center gap-2 text-sm">
                          <Tag className="w-4 h-4 text-text-muted" />
                          <span className="text-text-muted">
                            {product.categoryName || 'Unknown Category'}
                          </span>
                        </div>
                      )}

                      {product.basePrice && (
                        <div className="flex items-center gap-2 text-sm">
                          <DollarSign className="w-4 h-4 text-text-muted" />
                          <span className="font-medium text-text-dark dark:text-white">
                            ${product.basePrice}/{product.unit}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center gap-2 text-xs text-text-muted">
                        <Calendar className="w-3 h-3" />
                        Submitted{' '}
                        {new Date(product.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-6">
                    <button
                      onClick={() => setViewingProduct(product)}
                      className="flex-1 px-3 py-2 text-sm border border-gray-200 text-text-muted hover:text-bottle-green hover:border-bottle-green rounded-xl transition-colors min-h-[36px] flex items-center justify-center gap-1"
                    >
                      <Eye className="w-4 h-4" />
                      Review
                    </button>

                    <button
                      onClick={() =>
                        setConfirmAction({
                          type: 'approve',
                          product,
                          title: 'Approve Product',
                          message: `Approve "${product.name}"? It will become available to customers.`,
                          confirmText: 'Approve',
                          onConfirm: () => handleApproval(product.id, 'active'),
                        })
                      }
                      className="flex-1 px-3 py-2 text-sm bg-bottle-green text-white hover:bg-bottle-green/90 rounded-xl transition-colors min-h-[36px] flex items-center justify-center gap-1"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Approve
                    </button>

                    <button
                      onClick={() =>
                        setConfirmAction({
                          type: 'reject',
                          product,
                          title: 'Reject Product',
                          message: `Reject "${product.name}"? The vendor will be notified.`,
                          confirmText: 'Reject',
                          isDangerous: true,
                          onConfirm: () =>
                            handleApproval(product.id, 'rejected'),
                        })
                      }
                      className="px-3 py-2 text-sm text-tomato-red hover:bg-tomato-red hover:text-white border border-tomato-red rounded-xl transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <Card className="p-4">
              <Pagination
                currentPage={currentPage}
                totalPages={pagination.totalPages}
                onPageChange={setCurrentPage}
                totalItems={pagination.totalProducts}
                itemsPerPage={itemsPerPage}
              />
            </Card>
          )}
        </>
      )}

      {/* Product Review Modal */}
      {viewingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm"
            onClick={() => setViewingProduct(null)}
          />
          <Card className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-text-dark dark:text-white">
                  Product Review
                </h2>
                <button
                  onClick={() => setViewingProduct(null)}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Images */}
                <div>
                  <h3 className="font-medium text-text-dark dark:text-white mb-3">
                    Product Images
                  </h3>
                  {viewingProduct.images && viewingProduct.images.length > 0 ? (
                    <div className="space-y-3">
                      <div className="aspect-video bg-gray-100 rounded-2xl overflow-hidden">
                        <img
                          src={viewingProduct.images[0].url}
                          alt={viewingProduct.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      {viewingProduct.images.length > 1 && (
                        <div className="flex gap-2">
                          {viewingProduct.images
                            .slice(1)
                            .map((image, index) => (
                              <div
                                key={index}
                                className="w-20 h-20 bg-gray-100 rounded-xl overflow-hidden"
                              >
                                <img
                                  src={image.url}
                                  alt={`${viewingProduct.name} ${index + 2}`}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="aspect-video bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400">
                      <ImageIcon className="w-16 h-16" />
                    </div>
                  )}
                </div>

                {/* Product Details */}
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-text-dark dark:text-white mb-2">
                      Product Information
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm text-text-muted">Name</label>
                        <p className="font-medium text-text-dark dark:text-white">
                          {viewingProduct.name}
                        </p>
                      </div>

                      <div>
                        <label className="text-sm text-text-muted">
                          Description
                        </label>
                        <p className="text-text-dark dark:text-white">
                          {viewingProduct.description ||
                            'No description provided'}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-sm text-text-muted">
                            Price
                          </label>
                          <p className="font-medium text-text-dark dark:text-white">
                            ${viewingProduct.basePrice}/{viewingProduct.unit}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm text-text-muted">
                            Category
                          </label>
                          <p className="text-text-dark dark:text-white">
                            {viewingProduct.categoryName || 'Unknown'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium text-text-dark dark:text-white mb-2">
                      Vendor Information
                    </h3>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                      <p className="font-medium text-text-dark dark:text-white">
                        {viewingProduct.vendor?.name ||
                          viewingProduct.vendor?.businessName ||
                          'Unknown Vendor'}
                      </p>
                      {viewingProduct.vendor?.phone && (
                        <p className="text-sm text-text-muted">
                          {viewingProduct.vendor.phone}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <Button
                  onClick={() => {
                    setConfirmAction({
                      type: 'approve',
                      product: viewingProduct,
                      title: 'Approve Product',
                      message: `Approve "${viewingProduct.name}"? It will become available to customers.`,
                      confirmText: 'Approve',
                      onConfirm: () => {
                        handleApproval(viewingProduct.id, 'active');
                        setViewingProduct(null);
                      },
                    });
                  }}
                  className="flex-1"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve Product
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setConfirmAction({
                      type: 'reject',
                      product: viewingProduct,
                      title: 'Reject Product',
                      message: `Reject "${viewingProduct.name}"? The vendor will be notified.`,
                      confirmText: 'Reject',
                      isDangerous: true,
                      onConfirm: () => {
                        handleApproval(viewingProduct.id, 'rejected');
                        setViewingProduct(null);
                      },
                    });
                  }}
                  className="text-tomato-red border-tomato-red hover:bg-tomato-red hover:text-white"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Confirmation Dialog */}
      {confirmAction && (
        <ConfirmDialog
          isOpen
          onClose={() => setConfirmAction(null)}
          title={confirmAction.title}
          message={confirmAction.message}
          confirmText={confirmAction.confirmText}
          isDangerous={confirmAction.isDangerous}
          onConfirm={confirmAction.onConfirm}
        />
      )}
    </div>
  );
};

export default ProductApproval;
