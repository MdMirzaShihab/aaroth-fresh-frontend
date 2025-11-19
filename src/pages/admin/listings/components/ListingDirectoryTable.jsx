/**
 * ListingDirectoryTable - Admin V2 Listing Table Component
 * Displays listings in a table format with sorting, actions, and pagination
 */

import React from 'react';
import { motion } from 'framer-motion';
import {
  Eye,
  Star,
  Flag,
  MoreVertical,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Ban,
  Package,
} from 'lucide-react';
import { Card, Button } from '../../../../components/ui';
import {
  formatPrice,
  formatListingDate,
  getStatusBadge,
  calculateListingHealth,
} from '../../../../services/admin/listingsService';

const ListingDirectoryTable = ({
  listings,
  isLoading,
  error,
  selectedListings,
  sortConfig,
  onSort,
  onSelect,
  onSelectAll,
  onViewDetails,
  onStatusUpdate,
  onFeaturedToggle,
  currentPage,
  totalPages,
  onPageChange,
}) => {
  if (isLoading) {
    return (
      <Card className="p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-bottle-green" />
          <span className="ml-3 text-slate-600">Loading listings...</span>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-8">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-tomato-red mx-auto mb-4" />
          <p className="text-slate-600 mb-4">
            {error?.data?.message || 'Failed to load listings'}
          </p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </Card>
    );
  }

  if (!listings || listings.length === 0) {
    return (
      <Card className="p-8">
        <div className="text-center">
          <Package className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600">No listings found</p>
        </div>
      </Card>
    );
  }

  const allSelected = selectedListings.length === listings.length;
  const someSelected = selectedListings.length > 0 && !allSelected;

  return (
    <Card className="overflow-hidden z-0 shadow-lg shadow-sage-green/5">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-sage-green/10 to-muted-olive/10 border-b-2 border-sage-green/20 dark:bg-slate-800 dark:border-slate-700">
            <tr>
              <th className="px-6 py-4 text-left">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(el) => el && (el.indeterminate = someSelected)}
                  onChange={(e) => onSelectAll(e.target.checked)}
                  className="rounded border-slate-300 text-bottle-green focus:ring-bottle-green"
                />
              </th>
              <th className="px-6 py-4 text-left">
                <button
                  onClick={() => onSort('productName')}
                  className="flex items-center gap-2 font-bold text-text-dark dark:text-dark-text-primary hover:text-bottle-green"
                >
                  Product
                  <ArrowUpDown className="w-4 h-4" />
                </button>
              </th>
              <th className="px-6 py-4 text-left">
                <button
                  onClick={() => onSort('vendor')}
                  className="flex items-center gap-2 font-bold text-text-dark dark:text-dark-text-primary hover:text-bottle-green"
                >
                  Vendor
                  <ArrowUpDown className="w-4 h-4" />
                </button>
              </th>
              <th className="px-6 py-4 text-left">
                <button
                  onClick={() => onSort('price')}
                  className="flex items-center gap-2 font-bold text-text-dark dark:text-dark-text-primary hover:text-bottle-green"
                >
                  Price
                  <ArrowUpDown className="w-4 h-4" />
                </button>
              </th>
              <th className="px-6 py-4 text-left">Status</th>
              <th className="px-4 py-3 text-center">Featured</th>
              <th className="px-4 py-3 text-center">Flagged</th>
              <th className="px-6 py-4 text-left">
                <button
                  onClick={() => onSort('createdAt')}
                  className="flex items-center gap-2 font-bold text-text-dark dark:text-dark-text-primary hover:text-bottle-green"
                >
                  Created
                  <ArrowUpDown className="w-4 h-4" />
                </button>
              </th>
              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
            {listings.map((listing, index) => {
              const statusBadge = getStatusBadge(listing.status);
              const health = calculateListingHealth(listing);
              const isSelected = selectedListings.includes(listing._id);

              return (
                <motion.tr
                  key={listing._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${
                    isSelected ? 'bg-mint-fresh/5' : ''
                  }`}
                >
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) =>
                        onSelect(listing._id, e.target.checked)
                      }
                      className="rounded border-slate-300 text-bottle-green focus:ring-bottle-green"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {(listing.images?.[0]?.url || listing.images?.[0] || listing.primaryImage?.url || listing.primaryImage) ? (
                        <img
                          src={listing.images?.[0]?.url || listing.images?.[0] || listing.primaryImage?.url || listing.primaryImage}
                          alt={(listing.productId?.name || listing.product?.name || 'Product')}
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                          <Package className="w-5 h-5 text-slate-400" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-slate-800 dark:text-white">
                          {listing.productId?.name || listing.product?.name || 'Unknown Product'}
                        </p>
                        <p className="text-xs text-slate-500">
                          {listing.productId?.category?.name || listing.product?.category?.name || 'No Category'}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-slate-800 dark:text-white">
                      {listing.vendorId?.businessName || listing.vendor?.businessName || 'Unknown Vendor'}
                    </p>
                    <p className="text-xs text-slate-500">
                      {listing.vendorId?.email || listing.vendor?.email || ''}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    {listing.pricing && listing.pricing.length > 0 ? (
                      <div>
                        <p className="font-medium text-slate-800 dark:text-white">
                          {formatPrice(listing.pricing[0].pricePerUnit)}
                        </p>
                        {listing.pricing.length > 1 && (
                          <p className="text-xs text-mint-fresh">
                            +{listing.pricing.length - 1} more tier{listing.pricing.length > 2 ? 's' : ''}
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="font-medium text-slate-800 dark:text-white">
                        {formatPrice(listing.price)}
                      </p>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium border ${statusBadge.color}`}
                    >
                      {statusBadge.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => onFeaturedToggle(listing._id)}
                      className={`p-1 rounded-lg transition-colors ${
                        listing.featured
                          ? 'text-earthy-yellow bg-earthy-yellow/10'
                          : 'text-slate-400 hover:text-earthy-yellow hover:bg-earthy-yellow/10'
                      }`}
                    >
                      <Star
                        className="w-5 h-5"
                        fill={listing.featured ? 'currentColor' : 'none'}
                      />
                    </button>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {listing.isFlagged ? (
                      <Flag className="w-5 h-5 text-tomato-red mx-auto" />
                    ) : (
                      <span className="text-slate-300 dark:text-slate-600">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                    {formatListingDate(listing.createdAt)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewDetails(listing)}
                      className="flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </Button>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Page {currentPage} of {totalPages}
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default ListingDirectoryTable;
