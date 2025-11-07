/**
 * BulkListingOperations - Bulk actions for listings
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle,
  XCircle,
  Trash2,
  ThumbsUp,
  ThumbsDown,
} from 'lucide-react';
import { Card, Button } from '../../../../components/ui';
import { BULK_ACTIONS } from '../../../../services/admin-v2/listingsService';

const BulkListingOperations = ({ selectedCount, onBulkAction, onCancel }) => {
  const [showReasonInput, setShowReasonInput] = useState(false);
  const [currentAction, setCurrentAction] = useState(null);
  const [reason, setReason] = useState('');

  const handleActionClick = (action) => {
    const actionConfig = BULK_ACTIONS[action];
    if (actionConfig.requiresReason) {
      setCurrentAction(action);
      setShowReasonInput(true);
    } else {
      onBulkAction(action);
    }
  };

  const handleSubmit = () => {
    if (currentAction) {
      onBulkAction(currentAction, reason);
      setShowReasonInput(false);
      setCurrentAction(null);
      setReason('');
    }
  };

  return (
    <Card className="p-4 bg-gradient-to-r from-mint-fresh/10 to-bottle-green/10 border-2 border-bottle-green/20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-bottle-green" />
            <span className="font-medium text-slate-800 dark:text-white">
              {selectedCount} listing{selectedCount !== 1 ? 's' : ''} selected
            </span>
          </div>

          {!showReasonInput && (
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleActionClick('activate')}
                className="flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Activate
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleActionClick('deactivate')}
                className="flex items-center gap-2"
              >
                <XCircle className="w-4 h-4" />
                Deactivate
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleActionClick('delete')}
                className="flex items-center gap-2 border-tomato-red text-tomato-red hover:bg-tomato-red hover:text-white"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </Button>
            </div>
          )}
        </div>

        {!showReasonInput && (
          <Button variant="ghost" size="sm" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>

      {showReasonInput && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-4 p-4 bg-white dark:bg-slate-800 rounded-lg space-y-3"
        >
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {BULK_ACTIONS[currentAction]?.description}
          </p>
          <textarea
            placeholder="Reason (required)"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg"
            rows="3"
          />
          <div className="flex gap-2">
            <Button onClick={handleSubmit} disabled={!reason.trim()}>
              Confirm {BULK_ACTIONS[currentAction]?.label}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setShowReasonInput(false);
                setCurrentAction(null);
                setReason('');
              }}
            >
              Cancel
            </Button>
          </div>
        </motion.div>
      )}
    </Card>
  );
};

export default BulkListingOperations;
