import React from 'react';
import { ShieldCheck, Shield, Clock, AlertTriangle } from 'lucide-react';

/**
 * VerificationStatusBadge - Shows verification status with appropriate styling
 *
 * @param {boolean} isVerified - Whether the entity is verified
 * @param {string} verificationDate - Date of verification
 * @param {string} size - Badge size ('small', 'default', 'large')
 * @param {boolean} showDate - Whether to show verification date
 * @param {string} status - Custom status override
 */
const VerificationStatusBadge = ({
  isVerified,
  verificationDate,
  size = 'default',
  showDate = true,
  status = null,
}) => {
  const baseClasses =
    'inline-flex items-center gap-2 rounded-2xl font-medium transition-all duration-200 border';

  const sizeClasses = {
    small: 'px-3 py-1 text-xs',
    default: 'px-4 py-2 text-sm',
    large: 'px-6 py-3 text-base',
  };

  // Determine status and styling
  let statusConfig;

  if (status) {
    // Custom status override
    switch (status) {
      case 'processing':
        statusConfig = {
          className: 'bg-blue-50/80 text-blue-700 border-blue-200/50',
          icon: Clock,
          text: 'Processing',
          pulseIcon: true,
        };
        break;
      case 'rejected':
        statusConfig = {
          className: 'bg-tomato-red/5 text-tomato-red border-tomato-red/20',
          icon: AlertTriangle,
          text: 'Rejected',
        };
        break;
      default:
        statusConfig = {
          className: 'bg-gray-100 text-gray-600 border-gray-200',
          icon: Shield,
          text: status,
        };
    }
  } else if (isVerified) {
    statusConfig = {
      className: 'bg-mint-fresh/20 text-bottle-green border-mint-fresh/30',
      icon: ShieldCheck,
      text: 'Verified',
      isVerified: true,
    };
  } else {
    statusConfig = {
      className: 'bg-amber-50/80 text-amber-700 border-amber-200/50',
      icon: Clock,
      text: 'Pending Verification',
      pulseIcon: true,
    };
  }

  const Icon = statusConfig.icon;

  return (
    <div
      className={`${baseClasses} ${sizeClasses[size]} ${statusConfig.className}`}
    >
      <Icon
        className={`w-4 h-4 ${statusConfig.pulseIcon ? 'animate-pulse' : ''} ${statusConfig.isVerified ? 'animate-glow' : ''}`}
      />

      <span className="font-medium">{statusConfig.text}</span>

      {showDate && verificationDate && statusConfig.isVerified && (
        <span className="text-xs opacity-70 ml-1">
          {new Date(verificationDate).toLocaleDateString()}
        </span>
      )}
    </div>
  );
};

export default VerificationStatusBadge;
