import React from 'react';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

/**
 * VerificationStatusBadge - Display verification status with icon and text
 */
const VerificationStatusBadge = ({
  isVerified,
  size = 'default',
  showDate = false,
  verifiedDate = null
}) => {
  const sizeClasses = {
    small: 'px-2 py-1 text-xs',
    default: 'px-3 py-1.5 text-sm',
    large: 'px-4 py-2 text-base'
  };

  const iconSizes = {
    small: 'w-3 h-3',
    default: 'w-4 h-4',
    large: 'w-5 h-5'
  };

  const getStatusConfig = () => {
    if (isVerified) {
      return {
        icon: CheckCircle,
        text: 'Verified',
        bgColor: 'bg-mint-fresh/10',
        textColor: 'text-bottle-green',
        borderColor: 'border-mint-fresh/30'
      };
    }
    return {
      icon: Clock,
      text: 'Pending Verification',
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-700',
      borderColor: 'border-amber-200'
    };
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <div
      className={`
        inline-flex items-center gap-2 rounded-full border
        ${sizeClasses[size]}
        ${config.bgColor}
        ${config.textColor}
        ${config.borderColor}
        font-medium
      `}
    >
      <Icon className={iconSizes[size]} />
      <span>{config.text}</span>
      {showDate && verifiedDate && (
        <span className="text-xs opacity-70">
          {new Date(verifiedDate).toLocaleDateString()}
        </span>
      )}
    </div>
  );
};

export default VerificationStatusBadge;
