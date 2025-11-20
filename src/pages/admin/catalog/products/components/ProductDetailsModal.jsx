/**
 * ProductDetailsModal - Enhanced Design V2
 * Beautiful modal for viewing product details
 * Features: Image gallery, stats cards, glassmorphism, smooth animations
 */

import React, { useState } from 'react';
import {
  Package,
  Edit,
  Calendar,
  FolderOpen,
  Star,
  TrendingUp,
  Activity,
  ChevronLeft,
  ChevronRight,
  Info,
  Settings,
} from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

// UI Components
import { Modal } from '../../../../../components/ui/Modal';
import Button from '../../../../../components/ui/Button';
import FormSection from '../../../../../components/ui/FormSection';

const ProductDetailsModal = ({ product, isOpen, onClose, onEdit }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!isOpen || !product) return null;

  const images = product.images || [];
  const hasMultipleImages = images.length > 1;

  // Navigate to next image
  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  // Navigate to previous image
  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  // Get status badge color
  const getStatusBadge = () => {
    if (product.isActive) {
      return {
        bg: 'bg-mint-fresh/20',
        text: 'text-bottle-green',
        border: 'border-sage-green/30',
        label: 'Active',
      };
    }
    return {
      bg: 'bg-red-50',
      text: 'text-red-800',
      border: 'border-red-200',
      label: 'Inactive',
    };
  };

  const statusBadge = getStatusBadge();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-muted-olive to-sage-green flex items-center justify-center">
            <Package className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-text-dark">Product Details</h2>
            <p className="text-sm text-text-muted">
              View complete product information
            </p>
          </div>
        </div>
      }
      size="xl"
    >
      <div className="space-y-6">
        {/* Image Gallery */}
        {images.length > 0 && (
          <FormSection title="Product Images" variant="glass">
            <div className="relative group">
              {/* Main Image Display */}
              <div className="aspect-video rounded-2xl overflow-hidden border-2 border-sage-green/20 shadow-lg">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={currentImageIndex}
                    src={images[currentImageIndex].url}
                    alt={product.name}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    className="w-full h-full object-cover"
                  />
                </AnimatePresence>

                {/* Image Navigation Arrows */}
                {hasMultipleImages && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 backdrop-blur-sm text-text-dark rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white shadow-lg"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 backdrop-blur-sm text-text-dark rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white shadow-lg"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}

                {/* Image Counter */}
                {hasMultipleImages && (
                  <div className="absolute bottom-4 right-4 px-3 py-1 bg-black/60 backdrop-blur-sm text-white text-sm rounded-full">
                    {currentImageIndex + 1} / {images.length}
                  </div>
                )}

                {/* Primary Badge */}
                {images[currentImageIndex].isPrimary && (
                  <div className="absolute top-4 left-4">
                    <span className="bg-earthy-yellow/90 backdrop-blur-sm text-earthy-brown text-xs px-3 py-1 rounded-full font-medium flex items-center gap-1 shadow-lg">
                      <Star className="w-3 h-3 fill-current" />
                      Primary Image
                    </span>
                  </div>
                )}
              </div>

              {/* Thumbnail Navigation */}
              {hasMultipleImages && (
                <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                  {images.map((img, index) => (
                    <motion.button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`
                        relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all
                        ${
                          index === currentImageIndex
                            ? 'border-bottle-green shadow-lg'
                            : 'border-gray-200 opacity-60 hover:opacity-100'
                        }
                      `}
                    >
                      <img
                        src={img.url}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </motion.button>
                  ))}
                </div>
              )}
            </div>
          </FormSection>
        )}

        {/* Product Information */}
        <FormSection
          title="Product Information"
          description="Basic product details and description"
          icon={Info}
          variant="glass"
        >
          <div className="space-y-4">
            {/* Name and Status */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-text-dark mb-2">
                  {product.name}
                </h3>
                {product.description && (
                  <p className="text-text-muted leading-relaxed">
                    {product.description}
                  </p>
                )}
              </div>
              <div
                className={`px-4 py-2 rounded-xl border-2 ${statusBadge.bg} ${statusBadge.text} ${statusBadge.border} font-medium text-sm whitespace-nowrap`}
              >
                {statusBadge.label}
              </div>
            </div>

            {/* Category Badge */}
            {product.category && (
              <div className="flex items-center gap-2 p-4 rounded-xl bg-sage-green/5 border border-sage-green/20">
                <FolderOpen className="w-5 h-5 text-bottle-green" />
                <div>
                  <p className="text-xs text-text-muted">Category</p>
                  <p className="font-semibold text-text-dark">
                    {product.category.name}
                  </p>
                </div>
              </div>
            )}
          </div>
        </FormSection>

        {/* Statistics & Metadata */}
        <FormSection
          title="Statistics & Performance"
          description="Product metrics and activity data"
          icon={Activity}
          variant="glass"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Created Date */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="p-4 rounded-xl glass-1 border border-sage-green/20 hover:shadow-glow-green/10 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-text-muted">Created On</p>
                  <p className="font-semibold text-text-dark">
                    {format(new Date(product.createdAt), 'MMM dd, yyyy')}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Performance Score */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="p-4 rounded-xl glass-1 border border-sage-green/20 hover:shadow-glow-green/10 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-text-muted">Performance Score</p>
                  <p className="font-semibold text-text-dark">
                    {product.performanceScore || 0}/100
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Total Images */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="p-4 rounded-xl glass-1 border border-sage-green/20 hover:shadow-glow-green/10 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                  <Package className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-xs text-text-muted">Total Images</p>
                  <p className="font-semibold text-text-dark">{images.length}</p>
                </div>
              </div>
            </motion.div>
          </div>
        </FormSection>

        {/* Additional Information */}
        {(product.updatedAt || product.createdBy) && (
          <FormSection
            title="Additional Information"
            description="Metadata and audit trail"
            icon={Settings}
            variant="glass"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {product.updatedAt && (
                <div className="p-3 rounded-xl bg-mint-fresh/5 border border-mint-fresh/20">
                  <p className="text-xs text-text-muted mb-1">Last Updated</p>
                  <p className="text-sm font-medium text-text-dark">
                    {format(new Date(product.updatedAt), 'MMM dd, yyyy HH:mm')}
                  </p>
                </div>
              )}
              {product.createdBy && (
                <div className="p-3 rounded-xl bg-mint-fresh/5 border border-mint-fresh/20">
                  <p className="text-xs text-text-muted mb-1">Created By</p>
                  <p className="text-sm font-medium text-text-dark">
                    {product.createdBy.name || product.createdBy.email || 'Admin'}
                  </p>
                </div>
              )}
            </div>
          </FormSection>
        )}

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200"
        >
          <Button
            variant="outline"
            onClick={onClose}
            className="min-w-[120px]"
          >
            Close
          </Button>
          <Button
            onClick={onEdit}
            className="bg-gradient-secondary text-white min-w-[120px] flex items-center gap-2"
          >
            <Edit className="w-4 h-4" />
            Edit Product
          </Button>
        </motion.div>
      </div>
    </Modal>
  );
};

export default ProductDetailsModal;
