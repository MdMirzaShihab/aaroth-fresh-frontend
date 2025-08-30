/**
 * VerificationQueue - Document Review and Approval Workflow
 * Comprehensive verification interface with document review, priority queue, and batch processing
 * Features: Document viewer, verification checklist, approval workflow, priority management
 */

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Eye,
  Download,
  Upload,
  User,
  Building2,
  CreditCard,
  Shield,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Star,
  MessageSquare,
  ArrowRight,
  Filter,
  SortAsc,
  SortDesc
} from 'lucide-react';
import { useTheme } from '../../../../hooks/useTheme';
import { Card } from '../../../../components/ui';
import { Button } from '../../../../components/ui';
import { Modal } from '../../../../components/ui';
import { Input } from '../../../../components/ui';
import LoadingSpinner from '../../../../components/ui/LoadingSpinner';
import EmptyState from '../../../../components/ui/EmptyState';
import toast from 'react-hot-toast';

// Document type configuration
const DOCUMENT_TYPES = {
  businessLicense: {
    label: 'Business License',
    icon: Building2,
    required: true,
    description: 'Valid business registration certificate'
  },
  taxId: {
    label: 'Tax ID',
    icon: CreditCard,
    required: true,
    description: 'Tax identification number'
  },
  ownerIdentification: {
    label: 'Owner ID',
    icon: User,
    required: true,
    description: 'Government issued photo ID'
  },
  bankAccount: {
    label: 'Bank Account',
    icon: Shield,
    required: true,
    description: 'Bank account verification'
  },
  insurance: {
    label: 'Insurance',
    icon: Shield,
    required: false,
    description: 'Business insurance certificate'
  },
  foodSafety: {
    label: 'Food Safety',
    icon: Shield,
    required: false,
    description: 'Food safety certification'
  }
};

// Priority badge component
const PriorityBadge = ({ level, daysWaiting }) => {
  const config = {
    critical: { color: 'text-tomato-red bg-tomato-red/10 border-tomato-red/20', label: 'Critical' },
    high: { color: 'text-earthy-yellow bg-earthy-yellow/10 border-earthy-yellow/20', label: 'High' },
    medium: { color: 'text-sage-green bg-sage-green/10 border-sage-green/20', label: 'Medium' },
    low: { color: 'text-gray-500 bg-gray-100 border-gray-200', label: 'Low' }
  };

  const { color, label } = config[level] || config.low;

  return (
    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium border ${color}`}>
      <Clock className="w-3 h-3" />
      <span>{label}</span>
      <span className="opacity-60">({daysWaiting}d)</span>
    </div>
  );
};

// Document status component
const DocumentStatus = ({ document, type }) => {
  const config = DOCUMENT_TYPES[type];
  const IconComponent = config?.icon || FileText;
  
  if (!document?.provided) {
    return (
      <div className="flex items-center gap-2 text-gray-400">
        <IconComponent className="w-4 h-4" />
        <span className="text-sm">Not provided</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <IconComponent className={`w-4 h-4 ${document.verified ? 'text-sage-green' : 'text-earthy-yellow'}`} />
      <span className="text-sm text-text-dark">
        {config?.label}
      </span>
      {document.verified ? (
        <CheckCircle className="w-4 h-4 text-sage-green" />
      ) : (
        <Clock className="w-4 h-4 text-earthy-yellow" />
      )}
    </div>
  );
};

// Verification checklist component
const VerificationChecklist = ({ vendor, onDocumentView }) => {
  const { documents = {}, businessInfo = {} } = vendor;
  
  const completionPercentage = useMemo(() => {
    const totalRequired = Object.values(DOCUMENT_TYPES).filter(type => type.required).length;
    const provided = Object.entries(DOCUMENT_TYPES)
      .filter(([key, type]) => type.required && documents[key]?.provided)
      .length;
    return Math.round((provided / totalRequired) * 100);
  }, [documents]);

  return (
    <div className="space-y-4">
      {/* Progress indicator */}
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="font-medium text-text-dark">Document Completion</span>
            <span className="text-muted-olive font-medium">{completionPercentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-muted-olive to-sage-green h-2 rounded-full transition-all duration-500"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Documents list */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {Object.entries(DOCUMENT_TYPES).map(([key, config]) => {
          const document = documents[key];
          return (
            <div 
              key={key}
              className={`p-3 rounded-xl border transition-all duration-200 cursor-pointer hover:border-muted-olive/30 ${
                document?.provided 
                  ? document.verified 
                    ? 'bg-sage-green/5 border-sage-green/20' 
                    : 'bg-earthy-yellow/5 border-earthy-yellow/20'
                  : 'bg-gray-50 border-gray-200'
              }`}
              onClick={() => document?.provided && onDocumentView?.(key, document)}
            >
              <DocumentStatus document={document} type={key} />
              <p className="text-xs text-text-muted mt-1">{config.description}</p>
              {config.required && (
                <span className="inline-block text-xs text-tomato-red mt-1">Required</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Business information completeness */}
      <div className="p-4 bg-gradient-to-r from-earthy-beige/20 to-sage-green/10 rounded-xl">
        <h4 className="font-medium text-text-dark mb-3">Business Information</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-muted-olive" />
            <span className={businessInfo.businessName ? 'text-text-dark' : 'text-text-muted'}>
              {businessInfo.businessName || 'Business name missing'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-muted-olive" />
            <span className={businessInfo.address ? 'text-text-dark' : 'text-text-muted'}>
              {businessInfo.address || 'Address missing'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-muted-olive" />
            <span className={vendor.phone ? 'text-text-dark' : 'text-text-muted'}>
              {vendor.phone || 'Phone missing'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-muted-olive" />
            <span className={vendor.email ? 'text-text-dark' : 'text-text-muted'}>
              {vendor.email || 'Email missing'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Verification actions component
const VerificationActions = ({ vendor, onApprove, onReject, isProcessing }) => {
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showApproveConfirm, setShowApproveConfirm] = useState(false);

  const handleApprove = () => {
    setShowApproveConfirm(false);
    onApprove(vendor.id, 'Business verification approved after document review');
  };

  const handleReject = () => {
    if (!rejectReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }
    setShowRejectModal(false);
    onReject(vendor.id, rejectReason);
    setRejectReason('');
  };

  return (
    <>
      <div className="flex gap-3">
        <Button
          onClick={() => setShowApproveConfirm(true)}
          disabled={isProcessing}
          className="flex-1 bg-gradient-to-r from-muted-olive to-sage-green text-white hover:shadow-glow-olive"
        >
          <CheckCircle className="w-4 h-4 mr-2" />
          {isProcessing ? 'Processing...' : 'Approve'}
        </Button>
        <Button
          onClick={() => setShowRejectModal(true)}
          disabled={isProcessing}
          variant="outline"
          className="flex-1 border-tomato-red/30 text-tomato-red hover:bg-tomato-red/5"
        >
          <XCircle className="w-4 h-4 mr-2" />
          {isProcessing ? 'Processing...' : 'Reject'}
        </Button>
      </div>

      {/* Approve confirmation modal */}
      <Modal
        isOpen={showApproveConfirm}
        onClose={() => setShowApproveConfirm(false)}
        title="Confirm Approval"
        size="default"
      >
        <div className="space-y-4">
          <p className="text-text-muted">
            Are you sure you want to approve verification for <strong>{vendor.businessName}</strong>?
            This will grant them full access to the platform.
          </p>
          <div className="flex gap-3">
            <Button
              onClick={() => setShowApproveConfirm(false)}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleApprove}
              className="flex-1 bg-sage-green text-white"
            >
              Confirm Approval
            </Button>
          </div>
        </div>
      </Modal>

      {/* Reject reason modal */}
      <Modal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        title="Rejection Reason"
        size="default"
      >
        <div className="space-y-4">
          <p className="text-text-muted">
            Please provide a reason for rejecting <strong>{vendor.businessName}</strong>'s verification:
          </p>
          <textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Enter rejection reason..."
            className="w-full px-4 py-3 rounded-2xl bg-earthy-beige/30 border-0 focus:glass-3 
                       focus:shadow-glow-olive transition-all duration-300 placeholder:text-text-muted/60 
                       resize-none h-24 focus:outline-none"
          />
          <div className="flex gap-3">
            <Button
              onClick={() => setShowRejectModal(false)}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleReject}
              disabled={!rejectReason.trim()}
              className="flex-1 bg-tomato-red text-white"
            >
              Confirm Rejection
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

// Main verification queue item
const VerificationQueueItem = ({ vendor, onVerificationAction, onVendorAction, isProcessing }) => {
  const { isDarkMode } = useTheme();
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`glass-2 rounded-2xl border transition-all duration-300 ${
        vendor.urgencyLevel === 'critical' 
          ? 'border-tomato-red/30 bg-tomato-red/5 shadow-glow-amber/20' 
          : 'border-white/20 hover:shadow-glow-sage/20'
      }`}
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-muted-olive via-sage-green to-sage-green 
                            flex items-center justify-center shadow-lg text-white font-medium">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-text-dark dark:text-dark-text-primary">
                {vendor.businessName}
              </h3>
              <p className="text-sm text-text-muted">
                Owner: {vendor.ownerName}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <PriorityBadge level={vendor.urgencyLevel} daysWaiting={vendor.waitingDays} />
            <Button
              variant="outline"
              size="sm"
              onClick={() => setExpanded(!expanded)}
            >
              <Eye className="w-4 h-4 mr-2" />
              {expanded ? 'Less' : 'Details'}
            </Button>
          </div>
        </div>

        {/* Summary info */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <div className="text-center p-3 bg-earthy-beige/20 rounded-xl">
            <p className="text-xs text-text-muted">Submitted</p>
            <p className="font-medium text-text-dark">{vendor.submittedAt}</p>
          </div>
          <div className="text-center p-3 bg-earthy-beige/20 rounded-xl">
            <p className="text-xs text-text-muted">Business Type</p>
            <p className="font-medium text-text-dark">{vendor.businessInfo?.type || 'Not specified'}</p>
          </div>
          <div className="text-center p-3 bg-earthy-beige/20 rounded-xl">
            <p className="text-xs text-text-muted">Risk Score</p>
            <p className={`font-medium ${
              vendor.riskAssessment?.score > 70 
                ? 'text-tomato-red' 
                : vendor.riskAssessment?.score > 40 
                ? 'text-earthy-yellow'
                : 'text-sage-green'
            }`}>
              {vendor.riskAssessment?.score || 0}%
            </p>
          </div>
        </div>

        {/* Expanded details */}
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-white/10 pt-6 mt-6"
          >
            <VerificationChecklist 
              vendor={vendor} 
              onDocumentView={(type, document) => {
                // Handle document viewing
                console.log('View document:', type, document);
              }}
            />
          </motion.div>
        )}

        {/* Actions */}
        <div className="mt-6 pt-4 border-t border-white/10">
          <VerificationActions
            vendor={vendor}
            onApprove={onVerificationAction}
            onReject={onVerificationAction}
            isProcessing={isProcessing}
          />
        </div>
      </div>
    </motion.div>
  );
};

const VerificationQueue = ({
  vendors = [],
  loading = false,
  urgentCount = 0,
  averageWaitTime = 0,
  onVerificationAction,
  onVendorAction
}) => {
  const { isDarkMode } = useTheme();
  const [sortBy, setSortBy] = useState('urgency'); // 'urgency', 'date', 'name'
  const [filterBy, setFilterBy] = useState('all'); // 'all', 'critical', 'high', 'medium', 'low'
  const [processingVendor, setProcessingVendor] = useState(null);

  // Handle verification action with loading state
  const handleVerificationAction = async (vendorId, status, reason = '') => {
    setProcessingVendor(vendorId);
    try {
      await onVerificationAction(vendorId, status, reason);
    } finally {
      setProcessingVendor(null);
    }
  };

  // Filter and sort vendors
  const processedVendors = useMemo(() => {
    let filtered = vendors;

    // Apply filter
    if (filterBy !== 'all') {
      filtered = filtered.filter(vendor => vendor.urgencyLevel === filterBy);
    }

    // Apply sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'urgency':
          const urgencyOrder = { critical: 4, high: 3, medium: 2, low: 1 };
          return urgencyOrder[b.urgencyLevel] - urgencyOrder[a.urgencyLevel];
        case 'date':
          return new Date(a.submittedAt) - new Date(b.submittedAt);
        case 'name':
          return a.businessName.localeCompare(b.businessName);
        default:
          return 0;
      }
    });

    return filtered;
  }, [vendors, filterBy, sortBy]);

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Empty state
  if (vendors.length === 0) {
    return (
      <div className="py-12">
        <EmptyState
          icon={CheckCircle}
          title="No pending verifications"
          description="All vendor verifications have been processed"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Queue Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 bg-gradient-to-br from-earthy-yellow/10 to-earthy-yellow/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-earthy-yellow/20 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-earthy-yellow" />
            </div>
            <div>
              <p className="text-sm text-text-muted">Urgent Reviews</p>
              <p className="text-2xl font-bold text-earthy-yellow">{urgentCount}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-sage-green/10 to-sage-green/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-sage-green/20 rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5 text-sage-green" />
            </div>
            <div>
              <p className="text-sm text-text-muted">Avg. Wait Time</p>
              <p className="text-2xl font-bold text-sage-green">{averageWaitTime}d</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-muted-olive/10 to-muted-olive/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-muted-olive/20 rounded-xl flex items-center justify-center">
              <FileText className="w-5 h-5 text-muted-olive" />
            </div>
            <div>
              <p className="text-sm text-text-muted">Total Queue</p>
              <p className="text-2xl font-bold text-muted-olive">{vendors.length}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Queue Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-text-muted" />
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value)}
              className="px-3 py-2 rounded-xl bg-white dark:bg-dark-surface border 
                         border-gray-200 dark:border-dark-border text-sm"
            >
              <option value="all">All Priority</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-text-muted">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 rounded-xl bg-white dark:bg-dark-surface border 
                         border-gray-200 dark:border-dark-border text-sm"
            >
              <option value="urgency">Urgency</option>
              <option value="date">Date Submitted</option>
              <option value="name">Business Name</option>
            </select>
          </div>
        </div>

        <p className="text-sm text-text-muted">
          Showing {processedVendors.length} of {vendors.length} vendors
        </p>
      </div>

      {/* Verification Queue */}
      <div className="space-y-4">
        {processedVendors.map((vendor) => (
          <VerificationQueueItem
            key={vendor.id}
            vendor={vendor}
            onVerificationAction={handleVerificationAction}
            onVendorAction={onVendorAction}
            isProcessing={processingVendor === vendor.id}
          />
        ))}
      </div>
    </div>
  );
};

export default VerificationQueue;