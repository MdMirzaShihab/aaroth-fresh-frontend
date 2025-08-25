import React from 'react';
import {
  MapPin,
  Phone,
  Mail,
  Calendar,
  User,
  Store,
  Utensils,
  Building,
} from 'lucide-react';
import VerificationStatusBadge from './VerificationStatusBadge';
import QuickVerificationAction from './QuickVerificationAction';

/**
 * EntityCard - Displays business entity information with verification controls
 *
 * @param {Object} entity - The business entity (vendor or restaurant)
 * @param {string} type - Entity type ('vendor' or 'restaurant')
 * @param {Function} onToggleVerification - Verification toggle handler
 * @param {boolean} isVerificationLoading - Loading state for verification
 * @param {Function} onViewDetails - View details handler
 */
const EntityCard = ({
  entity,
  type,
  onToggleVerification,
  isVerificationLoading = false,
  onViewDetails = null,
}) => {
  const getEntityName = () => {
    if (type === 'vendor') return entity.businessName || entity.name;
    return entity.name || entity.businessName;
  };

  const getEntityAddress = () => {
    if (!entity.address) return 'Address not provided';
    const { street, city, area, postalCode } = entity.address;
    return [street, area, city, postalCode].filter(Boolean).join(', ');
  };

  const getEntityIcon = () => {
    return type === 'vendor'
      ? Store
      : type === 'restaurant'
        ? Utensils
        : Building;
  };

  const EntityIcon = getEntityIcon();

  const getOwnerName = () => {
    return entity.ownerName || entity.contactPerson || 'Owner not specified';
  };

  const getPhone = () => {
    return entity.phone || entity.contactPhone || 'Phone not provided';
  };

  const getEmail = () => {
    return entity.email || entity.contactEmail || 'Email not provided';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not available';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-soft hover:shadow-2xl hover:shadow-shadow-soft transition-all duration-500 p-6 border border-white/50 hover:-translate-y-1 group">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-primary rounded-2xl flex items-center justify-center">
            <EntityIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-text-dark group-hover:text-bottle-green transition-colors duration-200">
              {getEntityName()}
            </h3>
            <p className="text-sm text-text-muted capitalize">
              {type} business
            </p>
          </div>
        </div>

        <VerificationStatusBadge
          verificationStatus={entity.verificationStatus || 'pending'}
          adminNotes={entity.adminNotes}
          verificationDate={entity.verificationDate}
          size="small"
        />
      </div>

      {/* Details */}
      <div className="space-y-3 mb-6">
        <div className="flex items-center gap-3 text-sm text-text-muted">
          <User className="w-4 h-4 flex-shrink-0" />
          <span className="truncate">{getOwnerName()}</span>
        </div>

        <div className="flex items-center gap-3 text-sm text-text-muted">
          <Mail className="w-4 h-4 flex-shrink-0" />
          <span className="truncate">{getEmail()}</span>
        </div>

        <div className="flex items-center gap-3 text-sm text-text-muted">
          <Phone className="w-4 h-4 flex-shrink-0" />
          <span className="truncate">{getPhone()}</span>
        </div>

        <div className="flex items-start gap-3 text-sm text-text-muted">
          <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span className="leading-relaxed">{getEntityAddress()}</span>
        </div>

        <div className="flex items-center gap-3 text-sm text-text-muted">
          <Calendar className="w-4 h-4 flex-shrink-0" />
          <span>Applied: {formatDate(entity.createdAt)}</span>
        </div>

        {/* Business License */}
        {entity.tradeLicenseNo && (
          <div className="bg-earthy-beige/50 rounded-xl p-3 mt-4">
            <div className="text-xs text-text-muted mb-1">Trade License</div>
            <div className="text-sm font-medium text-text-dark font-mono">
              {entity.tradeLicenseNo}
            </div>
          </div>
        )}
      </div>

      {/* Admin Notes */}
      {entity.adminNotes && (
        <div className="bg-amber-50/80 border border-amber-200/50 rounded-xl p-3 mb-4">
          <div className="text-xs text-amber-700 mb-1 font-medium">
            Admin Notes
          </div>
          <div className="text-sm text-amber-800">{entity.adminNotes}</div>
        </div>
      )}

      {/* Verification History */}
      {entity.statusUpdatedAt && (
        <div className="bg-blue-50/50 border border-blue-200/50 rounded-xl p-3 mb-4">
          <div className="text-xs text-blue-700 mb-1 font-medium">
            Last Updated
          </div>
          <div className="text-sm text-blue-800">
            {formatDate(entity.statusUpdatedAt)}
            {entity.statusUpdatedBy?.name && (
              <span className="text-xs text-blue-600 ml-2">
                by {entity.statusUpdatedBy.name}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="border-t border-gray-100 pt-4">
        <div className="flex items-center justify-between gap-3">
          {onViewDetails && (
            <button
              onClick={() => onViewDetails(entity)}
              className="flex-1 px-4 py-2 text-sm text-bottle-green hover:bg-bottle-green/5 rounded-xl font-medium transition-all duration-200 min-h-[40px] flex items-center justify-center gap-2"
            >
              <User className="w-4 h-4" />
              View Details
            </button>
          )}

          <QuickVerificationAction
            entityId={entity._id}
            entityType={type}
            verificationStatus={entity.verificationStatus || 'pending'}
            onToggleVerification={onToggleVerification}
            isLoading={isVerificationLoading}
            size="sm"
          />
        </div>
      </div>
    </div>
  );
};

export default EntityCard;
