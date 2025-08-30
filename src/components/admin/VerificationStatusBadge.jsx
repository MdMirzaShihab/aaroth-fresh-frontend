import React from 'react';
import {
  ShieldCheck,
  Shield,
  Clock,
  AlertTriangle,
  XCircle,
} from 'lucide-react';

/**
 * VerificationStatusBadge - Shows verification status with three-state system
 *
 * @param {string} verificationStatus - Verification status ('pending', 'approved', 'rejected')
 * @param {string} adminNotes - Admin notes for rejected status
 * @param {string} verificationDate - Date of verification
 * @param {string} size - Badge size ('small', 'default', 'large')
 * @param {boolean} showDate - Whether to show verification date
 * @param {boolean} showNotes - Whether to show admin notes for rejected status
 * @param {boolean} isVerified - Legacy prop (deprecated)
 */
const VerificationStatusBadge = ({
  verificationStatus = 'pending',
  adminNotes,
  verificationDate,
  size = 'default',
  showDate = true,
  showNotes = false,
  // Legacy prop support (will be removed)
  isVerified,
}) => {
  // Handle legacy prop
  const status = verificationStatus || (isVerified ? 'approved' : 'pending');
  const baseClasses =
    'inline-flex items-center gap-2 rounded-2xl font-medium transition-all duration-200 border';

  const sizeClasses = {
    small: 'px-3 py-1 text-xs',
    default: 'px-4 py-2 text-sm',
    large: 'px-6 py-3 text-base',
  };

  // Determine status and styling (three-state system)
  let statusConfig;

  switch (status) {
    case 'approved':
      statusConfig = {
        className: 'bg-sage-green/20 text-muted-olive border-sage-green/30',
        icon: ShieldCheck,
        text: 'Approved',
        isApproved: true,
      };
      break;
    case 'rejected':
      statusConfig = {
        className: 'bg-tomato-red/5 text-tomato-red border-tomato-red/20',
        icon: XCircle,
        text: 'Rejected',
        isRejected: true,
      };
      break;
    case 'pending':
    default:
      statusConfig = {
        className: 'bg-amber-50/80 text-amber-700 border-amber-200/50',
        icon: Clock,
        text: 'Pending',
        pulseIcon: true,
      };
      break;
  }

  const Icon = statusConfig.icon;

  return (
    <div className="flex flex-col">
      <div
        className={`${baseClasses} ${sizeClasses[size]} ${statusConfig.className}`}
      >
        <Icon
          className={`w-4 h-4 ${statusConfig.pulseIcon ? 'animate-pulse' : ''} ${statusConfig.isApproved ? 'animate-glow' : ''}`}
        />

        <span className="font-medium">{statusConfig.text}</span>

        {showDate && verificationDate && statusConfig.isApproved && (
          <span className="text-xs opacity-70 ml-1">
            {new Date(verificationDate).toLocaleDateString()}
          </span>
        )}
      </div>

      {/* Admin notes for rejected status */}
      {showNotes && statusConfig.isRejected && adminNotes && (
        <div className="mt-2 p-3 bg-tomato-red/5 border border-tomato-red/20 rounded-xl text-sm text-tomato-red/90">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-tomato-red/70 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-tomato-red">Admin Feedback:</p>
              <p className="mt-1 text-tomato-red/80">{adminNotes}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VerificationStatusBadge;
