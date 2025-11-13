import React from 'react';
import { X, Package, Calendar, Edit } from 'lucide-react';
import { format } from 'date-fns';
import { Modal } from '../../../../../components/ui/Modal';
import Button from '../../../../../components/ui/Button';
import { Card } from '../../../../../components/ui/Card';

const ProductDetailsModal = ({ product, isOpen, onClose, onEdit }) => {
  if (!isOpen || !product) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Product Details" size="lg">
      <div className="space-y-6">
        {/* Product Image */}
        {product.images && product.images.length > 0 && (
          <div className="w-full h-64 bg-gray-100 rounded-2xl overflow-hidden">
            <img
              src={product.images[0].url}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Product Information */}
        <div className="space-y-4">
          <div>
            <h3 className="text-2xl font-bold text-text-dark">{product.name}</h3>
            <p className="text-text-muted mt-2">{product.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Card className="p-4">
              <p className="text-sm text-text-muted">Category</p>
              <p className="font-medium text-text-dark mt-1">
                {product.category?.name || 'Uncategorized'}
              </p>
            </Card>

            <Card className="p-4">
              <p className="text-sm text-text-muted">Status</p>
              <p className="font-medium text-text-dark mt-1">
                {product.isActive ? 'Active' : 'Inactive'}
              </p>
            </Card>

            <Card className="p-4">
              <p className="text-sm text-text-muted">Created</p>
              <p className="font-medium text-text-dark mt-1">
                {format(new Date(product.createdAt), 'MMM dd, yyyy')}
              </p>
            </Card>

            <Card className="p-4">
              <p className="text-sm text-text-muted">Performance Score</p>
              <p className="font-medium text-text-dark mt-1">
                {product.performanceScore || 0}/100
              </p>
            </Card>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button onClick={onEdit} className="flex items-center gap-2">
            <Edit className="w-4 h-4" />
            Edit Product
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ProductDetailsModal;
