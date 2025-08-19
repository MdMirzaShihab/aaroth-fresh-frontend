import React from 'react';
import {
  CheckCircle,
  XCircle,
  Clock,
  Store,
  Utensils,
  Eye,
  User,
  Phone,
  MapPin,
  Calendar,
  AlertTriangle,
} from 'lucide-react';
import Button from '../ui/Button';

const ApprovalCard = ({ approval, onViewDetails, onSelect, selected }) => {
  // Get status badge styling
  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return {
          className:
            'bg-earthy-yellow/20 text-earthy-brown border-earthy-yellow/30',
          icon: Clock,
          text: 'Pending Review',
        };
      case 'approved':
        return {
          className: 'bg-mint-fresh/20 text-bottle-green border-mint-fresh/30',
          icon: CheckCircle,
          text: 'Approved',
        };
      case 'rejected':
        return {
          className: 'bg-tomato-red/20 text-tomato-red border-tomato-red/30',
          icon: XCircle,
          text: 'Rejected',
        };
      default:
        return {
          className: 'bg-gray-100 text-gray-600 border-gray-300',
          icon: Clock,
          text: 'Unknown',
        };
    }
  };

  // Get type display information
  const getTypeDisplay = (type) => {
    switch (type) {
      case 'vendor':
        return {
          icon: Store,
          color: 'text-green-600',
          bgColor: 'bg-green-100',
          label: 'Vendor Application',
        };
      case 'restaurant':
        return {
          icon: Utensils,
          color: 'text-blue-600',
          bgColor: 'bg-blue-100',
          label: 'Restaurant Application',
        };
      default:
        return {
          icon: User,
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
          label: 'Unknown Application',
        };
    }
  };

  // Calculate urgency based on waiting time
  const getUrgencyLevel = (createdAt) => {
    if (!createdAt) return { level: 'normal', days: 0 };

    const daysWaiting = Math.floor(
      (new Date() - new Date(createdAt)) / (1000 * 60 * 60 * 24)
    );

    if (daysWaiting > 7) {
      return { level: 'urgent', days: daysWaiting };
    } else if (daysWaiting > 3) {
      return { level: 'high', days: daysWaiting };
    }

    return { level: 'normal', days: daysWaiting };
  };

  const statusBadge = getStatusBadge(approval.status);
  const typeDisplay = getTypeDisplay(approval.type);
  const urgency = getUrgencyLevel(approval.createdAt);

  return (
    <div
      className={`glass rounded-3xl p-6 hover:shadow-soft transition-all duration-200 cursor-pointer group relative ${
        selected ? 'ring-2 ring-bottle-green bg-bottle-green/5' : ''
      }`}
      onClick={() => onViewDetails(approval)}
    >
      {/* Selection Checkbox */}
      <div className="absolute top-4 left-4">
        <div
          className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all duration-200 ${
            selected
              ? 'bg-bottle-green border-bottle-green text-white'
              : 'border-gray-300 hover:border-bottle-green'
          }`}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(approval._id);
          }}
        >
          {selected && <CheckCircle className="w-4 h-4" />}
        </div>
      </div>

      {/* Urgency Indicator */}
      {urgency.level !== 'normal' && (
        <div className="absolute top-4 right-4">
          <div
            className={`p-1 rounded-full ${
              urgency.level === 'urgent'
                ? 'bg-tomato-red/20 text-tomato-red'
                : 'bg-earthy-yellow/20 text-earthy-brown'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start gap-4 mb-4 mt-8">
        {/* Type Icon */}
        <div
          className={`w-12 h-12 rounded-2xl ${typeDisplay.bgColor} flex items-center justify-center flex-shrink-0`}
        >
          <typeDisplay.icon className={`w-6 h-6 ${typeDisplay.color}`} />
        </div>

        {/* Basic Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-text-dark dark:text-white text-lg truncate">
            {approval.businessName || approval.name || 'Unknown Business'}
          </h3>
          <p className="text-sm text-text-muted mb-1">{typeDisplay.label}</p>

          {/* Contact Info */}
          <div className="flex items-center gap-1 text-xs text-text-muted">
            <Phone className="w-3 h-3" />
            <span>{approval.phone}</span>
          </div>
        </div>
      </div>

      {/* Status Badge */}
      <div className="flex items-center gap-2 mb-4">
        <statusBadge.icon className="w-4 h-4" />
        <span
          className={`px-3 py-1 rounded-full text-sm font-medium border ${statusBadge.className}`}
        >
          {statusBadge.text}
        </span>
      </div>

      {/* Details */}
      <div className="space-y-3 mb-6">
        {/* Address */}
        {approval.address && (
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-text-muted mt-0.5 flex-shrink-0" />
            <p className="text-sm text-text-muted line-clamp-2">
              {typeof approval.address === 'string'
                ? approval.address
                : `${approval.address?.street || ''}, ${approval.address?.city || ''}, ${approval.address?.state || ''}`}
            </p>
          </div>
        )}

        {/* Submission Date */}
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-text-muted" />
          <span className="text-sm text-text-muted">
            Submitted{' '}
            {approval.createdAt
              ? new Date(approval.createdAt).toLocaleDateString()
              : 'Unknown'}
          </span>
        </div>

        {/* Waiting Time */}
        {urgency.days > 0 && (
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-text-muted" />
            <span
              className={`text-sm font-medium ${
                urgency.level === 'urgent'
                  ? 'text-tomato-red'
                  : urgency.level === 'high'
                    ? 'text-earthy-brown'
                    : 'text-text-muted'
              }`}
            >
              Waiting {urgency.days} days
            </span>
          </div>
        )}

        {/* Business Type Specific Info */}
        {approval.type === 'vendor' && approval.businessLicense && (
          <div className="text-xs text-text-muted">
            License: {approval.businessLicense}
          </div>
        )}

        {approval.type === 'restaurant' && approval.cuisineType && (
          <div className="text-xs text-text-muted">
            Cuisine: {approval.cuisineType}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3">
        <Button
          size="sm"
          variant="outline"
          className="flex-1 text-text-muted border-gray-300 hover:bg-gray-50"
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails(approval);
          }}
        >
          <Eye className="w-4 h-4 mr-2" />
          Review
        </Button>

        {approval.status === 'pending' && (
          <>
            <Button
              size="sm"
              className="flex-1 bg-bottle-green hover:bg-bottle-green/90 text-white"
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails(approval);
              }}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Approve
            </Button>
          </>
        )}
      </div>

      {/* Approval/Rejection Info */}
      {approval.status !== 'pending' && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 text-xs text-text-muted">
            <User className="w-3 h-3" />
            <span>
              {approval.status === 'approved' ? 'Approved' : 'Rejected'} by{' '}
              {approval.processedBy || 'Admin'}
              {approval.processedAt && (
                <> on {new Date(approval.processedAt).toLocaleDateString()}</>
              )}
            </span>
          </div>

          {(approval.approvalNotes || approval.rejectionReason) && (
            <p className="text-xs text-text-muted mt-1 line-clamp-2">
              "{approval.approvalNotes || approval.rejectionReason}"
            </p>
          )}
        </div>
      )}

      {/* Hover Effect Indicator */}
      <div className="absolute inset-0 rounded-3xl border-2 border-transparent group-hover:border-bottle-green/20 transition-all duration-200 pointer-events-none" />
    </div>
  );
};

export default ApprovalCard;
