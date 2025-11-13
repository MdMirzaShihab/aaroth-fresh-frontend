import React, { useState } from 'react';
import { CheckCircle, XCircle, Trash2, Edit, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card } from '../../../../../components/ui/Card';
import Button from '../../../../../components/ui/Button';
import { Modal } from '../../../../../components/ui/Modal';
import { useBulkUpdateProductsMutation } from '../../../../../store/slices/apiSlice';

const BulkProductOperations = ({
  selectedCount,
  selectedIds,
  onClearSelection,
  onRefresh,
}) => {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [bulkAction, setBulkAction] = useState(null);

  const [bulkUpdate, { isLoading }] = useBulkUpdateProductsMutation();

  const handleBulkAction = async () => {
    if (!bulkAction) return;

    try {
      await bulkUpdate({
        productIds: selectedIds,
        action: bulkAction,
      }).unwrap();

      setShowConfirmModal(false);
      setBulkAction(null);
      onClearSelection();
      onRefresh();
    } catch (error) {
      console.error('Bulk action failed:', error);
      alert(error?.data?.error || 'Bulk action failed');
    }
  };

  const openConfirmModal = (action) => {
    setBulkAction(action);
    setShowConfirmModal(true);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
      >
        <Card className="p-4 glass border-muted-olive">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <p className="font-medium text-text-dark">
                {selectedCount} product{selectedCount !== 1 ? 's' : ''} selected
              </p>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openConfirmModal('activate')}
                  className="flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Activate
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openConfirmModal('deactivate')}
                  className="flex items-center gap-2"
                >
                  <XCircle className="w-4 h-4" />
                  Deactivate
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openConfirmModal('delete')}
                  className="flex items-center gap-2 text-tomato-red border-tomato-red/30 hover:bg-tomato-red/10"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </Button>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={onClearSelection}
              className="flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Clear Selection
            </Button>
          </div>
        </Card>
      </motion.div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false);
          setBulkAction(null);
        }}
        title="Confirm Bulk Action"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-text-dark">
            Are you sure you want to{' '}
            <span className="font-semibold">{bulkAction}</span>{' '}
            {selectedCount} product{selectedCount !== 1 ? 's' : ''}?
          </p>

          {bulkAction === 'delete' && (
            <div className="p-4 bg-tomato-red/10 rounded-2xl">
              <p className="text-sm text-tomato-red">
                <strong>Warning:</strong> This action cannot be undone. Deleted
                products will be permanently removed from the system.
              </p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setShowConfirmModal(false);
                setBulkAction(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleBulkAction}
              disabled={isLoading}
              className={`${
                bulkAction === 'delete'
                  ? 'bg-tomato-red hover:bg-tomato-red/90'
                  : ''
              }`}
            >
              {isLoading ? 'Processing...' : `Confirm ${bulkAction || 'Action'}`}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default BulkProductOperations;
