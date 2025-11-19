import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Shield,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  FileText,
  Upload,
  Download,
  Eye,
  MessageSquare,
  Calendar,
  Building2,
  Phone,
  Mail,
  MapPin,
  User,
  Star,
  Flag,
  MoreHorizontal,
  ChevronDown,
  ChevronUp,
  Filter,
  Search,
  RefreshCw,
} from 'lucide-react';
import { format } from 'date-fns';
import {
  useApproveBuyerVerificationMutation,
  useRejectBuyerVerificationMutation,
  useRequestAdditionalDocumentsMutation,
} from '../../../store/slices/apiSlice';
import { Card } from '../../ui/Card';
import Button from '../../ui/Button';
import LoadingSpinner from '../../ui/LoadingSpinner';
import EmptyState from '../../ui/EmptyState';
import { Modal } from '../../ui/Modal';
import { Input } from '../../ui/Input';
import FormField from '../../ui/FormField';
import SearchBar from '../../ui/SearchBar';

const BuyerVerification = ({
  buyers,
  isLoading,
  error,
  filters,
  onFiltersChange,
  stats,
  onRefresh,
}) => {
  const [selectedBuyer, setSelectedBuyer] = useState(null);
  const [modalType, setModalType] = useState(null); // 'approve', 'reject', 'request_docs'
  const [actionData, setActionData] = useState({});
  const [expandedCards, setExpandedCards] = useState(new Set());
  const [sortBy, setSortBy] = useState('urgency'); // 'urgency', 'date', 'name'
  const [filterUrgency, setFilterUrgency] = useState('all');

  // RTK Mutations
  const [approveVerification] = useApproveBuyerVerificationMutation();
  const [rejectVerification] = useRejectBuyerVerificationMutation();
  const [requestDocuments] = useRequestAdditionalDocumentsMutation();

  // Process and sort buyers for verification queue
  const verificationQueue = useMemo(() => {
    let queue = buyers.filter((r) => r.verificationStatus === 'pending');

    // Apply urgency filter
    if (filterUrgency !== 'all') {
      queue = queue.filter((r) => r.urgencyLevel === filterUrgency);
    }

    // Sort by selected criteria
    queue.sort((a, b) => {
      switch (sortBy) {
        case 'urgency':
          const urgencyOrder = { critical: 4, high: 3, medium: 2, low: 1 };
          return (
            (urgencyOrder[b.urgencyLevel] || 0) -
            (urgencyOrder[a.urgencyLevel] || 0)
          );
        case 'date':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'name':
          return a.businessName.localeCompare(b.businessName);
        default:
          return 0;
      }
    });

    return queue;
  }, [buyers, sortBy, filterUrgency]);

  const getUrgencyConfig = (urgencyLevel) => {
    const configs = {
      critical: {
        color: 'bg-tomato-red text-white',
        bgColor: 'bg-tomato-red/10',
        textColor: 'text-tomato-red',
        icon: AlertTriangle,
        pulse: true,
      },
      high: {
        color: 'bg-amber-500 text-white',
        bgColor: 'bg-amber-500/10',
        textColor: 'text-amber-600',
        icon: Clock,
        pulse: false,
      },
      medium: {
        color: 'bg-blue-500 text-white',
        bgColor: 'bg-blue-500/10',
        textColor: 'text-blue-600',
        icon: Clock,
        pulse: false,
      },
      low: {
        color: 'bg-gray-500 text-white',
        bgColor: 'bg-gray-500/10',
        textColor: 'text-gray-600',
        icon: Clock,
        pulse: false,
      },
    };
    return configs[urgencyLevel] || configs.low;
  };

  const handleCardExpand = (buyerId) => {
    setExpandedCards((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(buyerId)) {
        newSet.delete(buyerId);
      } else {
        newSet.add(buyerId);
      }
      return newSet;
    });
  };

  const handleApprovalAction = (buyer, type) => {
    setSelectedBuyer(buyer);
    setModalType(type);
    setActionData({});
  };

  const handleSubmitAction = async () => {
    try {
      const buyerId = selectedBuyer.id;

      // Validate required fields based on action type
      if (modalType === 'reject') {
        if (!actionData.reason || actionData.reason === '') {
          alert('Please select a rejection reason');
          return;
        }
        if (!actionData.notes || actionData.notes.trim().length < 5) {
          alert('Please provide rejection notes (minimum 5 characters)');
          return;
        }
      }

      if (modalType === 'request_docs') {
        if (!actionData.documents || actionData.documents.length === 0) {
          alert('Please select at least one document to request');
          return;
        }
        if (!actionData.message || actionData.message.trim().length < 5) {
          alert('Please provide a message explaining why documents are needed (minimum 5 characters)');
          return;
        }
      }

      switch (modalType) {
        case 'approve':
          await approveVerification({
            id: buyerId,
            notes: actionData.notes || '',
          }).unwrap();
          break;
        case 'reject':
          await rejectVerification({
            id: buyerId,
            reason: actionData.reason,
            notes: actionData.notes,
          }).unwrap();
          break;
        case 'request_docs':
          await requestDocuments({
            id: buyerId,
            requiredDocuments: actionData.documents,
            message: actionData.message,
          }).unwrap();
          break;
      }

      // Close modal and refresh data
      setModalType(null);
      setSelectedBuyer(null);
      setActionData({});
      onRefresh();
    } catch (error) {
      console.error('Action failed:', error);
      alert(error?.data?.error || 'Action failed. Please try again.');
    }
  };

  if (error) {
    return (
      <EmptyState
        icon={AlertTriangle}
        title="Failed to load verification queue"
        description="There was an error loading verification data. Please try again."
        actionLabel="Retry"
        onAction={onRefresh}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <Card className="p-4 glass">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <SearchBar
              value={filters.search}
              onChange={(value) =>
                onFiltersChange({ ...filters, search: value, page: 1 })
              }
              placeholder="Search buyers pending verification..."
              className="w-full"
            />
          </div>

          {/* Filters and Sort */}
          <div className="flex items-center gap-3">
            {/* Urgency Filter */}
            <select
              value={filterUrgency}
              onChange={(e) => setFilterUrgency(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-2xl bg-white text-sm focus:ring-2 focus:ring-muted-olive/20"
            >
              <option value="all">All Urgency</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            {/* Sort By */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-2xl bg-white text-sm focus:ring-2 focus:ring-muted-olive/20"
            >
              <option value="urgency">Sort by Urgency</option>
              <option value="date">Sort by Date</option>
              <option value="name">Sort by Name</option>
            </select>

            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={isLoading}
            >
              <RefreshCw
                className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`}
              />
            </Button>
          </div>
        </div>
      </Card>

      {/* Queue Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: 'Critical',
            count: stats.urgencyCounts?.critical || 0,
            color: 'tomato-red',
            urgent: true,
          },
          {
            label: 'High',
            count: stats.urgencyCounts?.high || 0,
            color: 'amber-500',
            urgent: false,
          },
          {
            label: 'Medium',
            count: stats.urgencyCounts?.medium || 0,
            color: 'blue-500',
            urgent: false,
          },
          {
            label: 'Low',
            count: stats.urgencyCounts?.low || 0,
            color: 'gray-500',
            urgent: false,
          },
        ].map((stat) => (
          <Card
            key={stat.label}
            className={`p-4 glass ${stat.urgent ? 'border-tomato-red/30' : ''}`}
          >
            <div className="text-center">
              <p
                className={`text-2xl font-bold ${stat.urgent ? 'text-tomato-red' : 'text-text-dark'}`}
              >
                {stat.count}
              </p>
              <p className="text-sm text-text-muted">{stat.label} Priority</p>
              {stat.urgent && stat.count > 0 && (
                <div className="w-2 h-2 bg-tomato-red rounded-full mx-auto mt-2 animate-pulse" />
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Verification Queue */}
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[50vh]">
          <LoadingSpinner size="lg" />
        </div>
      ) : verificationQueue.length === 0 ? (
        <EmptyState
          icon={CheckCircle}
          title="No pending verifications"
          description="All buyers are verified or there are no pending verification requests."
          actionLabel="View All Buyers"
          onAction={() =>
            onFiltersChange({ ...filters, verificationStatus: 'all' })
          }
        />
      ) : (
        <motion.div className="space-y-4">
          {verificationQueue.map((buyer, index) => (
            <VerificationCard
              key={buyer.id}
              buyer={buyer}
              isExpanded={expandedCards.has(buyer.id)}
              onExpand={() => handleCardExpand(buyer.id)}
              onAction={handleApprovalAction}
              index={index}
            />
          ))}
        </motion.div>
      )}

      {/* Action Modals */}
      <ActionModal
        isOpen={modalType !== null}
        onClose={() => {
          setModalType(null);
          setSelectedBuyer(null);
          setActionData({});
        }}
        type={modalType}
        buyer={selectedBuyer}
        data={actionData}
        onChange={setActionData}
        onSubmit={handleSubmitAction}
      />
    </div>
  );
};

// Verification Card Component
const VerificationCard = ({
  buyer,
  isExpanded,
  onExpand,
  onAction,
  index,
}) => {
  const urgencyConfig = getUrgencyConfig(buyer.urgencyLevel);
  const UrgencyIcon = urgencyConfig.icon;

  const documentsSubmitted = [
    {
      name: 'Business License',
      submitted: !!buyer.businessLicense,
      required: true,
    },
    { name: 'Tax ID', submitted: !!buyer.taxId, required: true },
    {
      name: 'Operating Permit',
      submitted: !!buyer.operatingPermit,
      required: true,
    },
    { name: 'Menu', submitted: !!buyer.menuDocument, required: false },
    {
      name: 'Photos',
      submitted: !!buyer.buyerPhotos?.length,
      required: false,
    },
  ];

  const completionRate = Math.round(
    (documentsSubmitted.filter((doc) => doc.submitted).length /
      documentsSubmitted.length) *
      100
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card
        className={`glass ${urgencyConfig.pulse ? 'animate-pulse' : ''} border-l-4 border-l-${urgencyConfig.color.includes('tomato-red') ? 'tomato-red' : urgencyConfig.color.includes('amber') ? 'amber-500' : urgencyConfig.color.includes('blue') ? 'blue-500' : 'gray-500'}`}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              <div className="w-12 h-12 bg-gradient-secondary rounded-2xl flex items-center justify-center text-white font-bold text-lg">
                {buyer.businessName?.[0]?.toUpperCase() || 'R'}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-text-dark text-lg truncate">
                    {buyer.businessName}
                  </h3>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${urgencyConfig.color} ${urgencyConfig.pulse ? 'animate-pulse' : ''}`}
                  >
                    <UrgencyIcon className="w-3 h-3 inline mr-1" />
                    {buyer.urgencyLevel?.toUpperCase()} PRIORITY
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-text-muted">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Submitted{' '}
                    {format(new Date(buyer.createdAt), 'MMM dd, yyyy')}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {Math.floor(
                      (Date.now() - new Date(buyer.createdAt)) /
                        (1000 * 60 * 60 * 24)
                    )}{' '}
                    days waiting
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Completion Progress */}
              <div className="text-center">
                <div
                  className={`text-lg font-bold ${completionRate === 100 ? 'text-sage-green' : 'text-amber-600'}`}
                >
                  {completionRate}%
                </div>
                <div className="text-xs text-text-muted">Complete</div>
              </div>

              <button
                onClick={onExpand}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5 text-text-muted" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-text-muted" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Basic Info */}
        <div className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2 text-sm">
              <User className="w-4 h-4 text-text-muted" />
              <span className="truncate">{buyer.ownerName}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Phone className="w-4 h-4 text-text-muted" />
              <span>{buyer.phone}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Mail className="w-4 h-4 text-text-muted" />
              <span className="truncate">{buyer.email}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4 text-text-muted" />
              <span className="truncate">{buyer.location}</span>
            </div>
          </div>

          {/* Documents Status */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-text-dark">
                Document Verification
              </h4>
              <span className="text-sm text-text-muted">
                {documentsSubmitted.filter((doc) => doc.submitted).length} of{' '}
                {documentsSubmitted.length} submitted
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {documentsSubmitted.map((doc) => (
                <div
                  key={doc.name}
                  className={`p-2 rounded-xl text-xs font-medium text-center ${
                    doc.submitted
                      ? 'bg-sage-green/10 text-sage-green'
                      : doc.required
                        ? 'bg-tomato-red/10 text-tomato-red'
                        : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  <div className="flex items-center justify-center gap-1">
                    {doc.submitted ? (
                      <CheckCircle className="w-3 h-3" />
                    ) : doc.required ? (
                      <XCircle className="w-3 h-3" />
                    ) : (
                      <Clock className="w-3 h-3" />
                    )}
                    <span>{doc.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Expanded Content */}
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-gray-100"
          >
            <div className="p-4 space-y-4">
              {/* Additional Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h5 className="font-medium text-text-dark mb-2">
                    Business Information
                  </h5>
                  <div className="space-y-2 text-sm text-text-muted">
                    <div>
                      Cuisine Type: {buyer.cuisineType || 'Not specified'}
                    </div>
                    <div>
                      Business Hours:{' '}
                      {buyer.businessHours || 'Not provided'}
                    </div>
                    <div>
                      Seating Capacity:{' '}
                      {buyer.seatingCapacity || 'Not provided'}
                    </div>
                  </div>
                </div>
                <div>
                  <h5 className="font-medium text-text-dark mb-2">
                    Risk Assessment
                  </h5>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span>Risk Score:</span>
                      <span
                        className={`font-medium ${
                          buyer.riskScore >= 70
                            ? 'text-tomato-red'
                            : buyer.riskScore >= 40
                              ? 'text-amber-600'
                              : 'text-sage-green'
                        }`}
                      >
                        {buyer.riskScore || 0}/100
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Profile Completeness:</span>
                      <span className="font-medium">{completionRate}%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Document Links */}
              {buyer.submittedDocuments &&
                buyer.submittedDocuments.length > 0 && (
                  <div>
                    <h5 className="font-medium text-text-dark mb-2">
                      Submitted Documents
                    </h5>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {buyer.submittedDocuments.map((doc, index) => (
                        <button
                          key={index}
                          className="p-2 bg-gray-50 hover:bg-gray-100 rounded-2xl text-sm flex items-center gap-2 transition-colors"
                        >
                          <FileText className="w-4 h-4 text-muted-olive" />
                          <span className="truncate">{doc.name}</span>
                          <Eye className="w-3 h-3 text-text-muted" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          </motion.div>
        )}

        {/* Action Buttons */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={() => onAction(buyer, 'approve')}
                className="bg-sage-green hover:bg-sage-green/90 text-white flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Approve
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onAction(buyer, 'reject')}
                className="border-tomato-red/30 text-tomato-red hover:bg-tomato-red/10 flex items-center gap-2"
              >
                <XCircle className="w-4 h-4" />
                Reject
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onAction(buyer, 'request_docs')}
                className="flex items-center gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                Request Docs
              </Button>
            </div>

            <div className="text-xs text-text-muted">ID: {buyer.id}</div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

// Action Modal Component
const ActionModal = ({
  isOpen,
  onClose,
  type,
  buyer,
  data,
  onChange,
  onSubmit,
}) => {
  if (!isOpen || !buyer) return null;

  const modalConfig = {
    approve: {
      title: 'Approve Verification',
      color: 'sage-green',
      icon: CheckCircle,
    },
    reject: {
      title: 'Reject Verification',
      color: 'tomato-red',
      icon: XCircle,
    },
    request_docs: {
      title: 'Request Additional Documents',
      color: 'blue-500',
      icon: MessageSquare,
    },
  };

  const config = modalConfig[type] || modalConfig.approve;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={config.title} size="md">
      <div className="space-y-4">
        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl">
          <div className="w-10 h-10 bg-gradient-secondary rounded-2xl flex items-center justify-center text-white font-bold">
            {buyer.businessName?.[0]?.toUpperCase() || 'R'}
          </div>
          <div>
            <p className="font-medium text-text-dark">
              {buyer.businessName}
            </p>
            <p className="text-sm text-text-muted">{buyer.ownerName}</p>
          </div>
        </div>

        {type === 'reject' && (
          <FormField label="Rejection Reason (Required)">
            <select
              value={data.reason || ''}
              onChange={(e) => onChange({ ...data, reason: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-tomato-red/20"
              required
            >
              <option value="">Select a reason</option>
              <option value="incomplete_documents">Incomplete Documents</option>
              <option value="invalid_information">Invalid Information</option>
              <option value="fake_documents">Suspicious/Fake Documents</option>
              <option value="policy_violation">Policy Violation</option>
              <option value="other">Other</option>
            </select>
          </FormField>
        )}

        {type === 'request_docs' && (
          <FormField label="Required Documents (Select at least one)">
            <div className="space-y-2">
              {[
                'Business License',
                'Tax ID Certificate',
                'Operating Permit',
                'Menu Photos',
                'Buyer Interior Photos',
                'Kitchen Photos',
                'Food Safety Certificate',
              ].map((doc) => (
                <label key={doc} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={data.documents?.includes(doc) || false}
                    onChange={(e) => {
                      const docs = data.documents || [];
                      onChange({
                        ...data,
                        documents: e.target.checked
                          ? [...docs, doc]
                          : docs.filter((d) => d !== doc),
                      });
                    }}
                    className="w-4 h-4 text-muted-olive border-gray-300 rounded focus:ring-muted-olive"
                  />
                  <span className="text-sm">{doc}</span>
                </label>
              ))}
            </div>
          </FormField>
        )}

        <FormField
          label={
            type === 'request_docs'
              ? 'Message to Buyer (Required)'
              : type === 'reject'
                ? 'Rejection Notes (Required)'
                : 'Notes (Optional)'
          }
        >
          <textarea
            value={data.notes || data.message || ''}
            onChange={(e) =>
              onChange({
                ...data,
                [type === 'request_docs' ? 'message' : 'notes']: e.target.value,
              })
            }
            placeholder={
              type === 'approve'
                ? 'Add any notes about the approval...'
                : type === 'reject'
                  ? 'Explain the reasons for rejection (minimum 5 characters)...'
                  : 'Explain what documents are needed and why (minimum 5 characters)...'
            }
            rows={4}
            className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-muted-olive/20 resize-none"
            required={type !== 'approve'}
          />
        </FormField>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={onSubmit}
            className={`bg-${config.color} hover:bg-${config.color}/90 text-white flex items-center gap-2`}
          >
            <config.icon className="w-4 h-4" />
            {type === 'approve'
              ? 'Approve'
              : type === 'reject'
                ? 'Reject'
                : 'Send Request'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

// Utility function (moved outside component to avoid re-creation)
const getUrgencyConfig = (urgencyLevel) => {
  const configs = {
    critical: {
      color: 'bg-tomato-red text-white',
      bgColor: 'bg-tomato-red/10',
      textColor: 'text-tomato-red',
      icon: AlertTriangle,
      pulse: true,
    },
    high: {
      color: 'bg-amber-500 text-white',
      bgColor: 'bg-amber-500/10',
      textColor: 'text-amber-600',
      icon: Clock,
      pulse: false,
    },
    medium: {
      color: 'bg-blue-500 text-white',
      bgColor: 'bg-blue-500/10',
      textColor: 'text-blue-600',
      icon: Clock,
      pulse: false,
    },
    low: {
      color: 'bg-gray-500 text-white',
      bgColor: 'bg-gray-500/10',
      textColor: 'text-gray-600',
      icon: Clock,
      pulse: false,
    },
  };
  return configs[urgencyLevel] || configs.low;
};

export default BuyerVerification;
