/**
 * ProgressBar - Enhanced UI Component
 * Generic progress indicators for workflows, multi-step processes, and linear progress
 * Supports both linear and stepped workflow progress for all dashboards
 */

import React from 'react';
import { CheckCircle, Clock, AlertTriangle, Circle, Play } from 'lucide-react';

const ProgressBar = ({
  steps,
  currentStep,
  type = 'workflow',
  size = 'default',
  showLabels = true,
  showProgress = true,
  className = '',
  variant = 'default',
}) => {
  const getStepStatus = (stepIndex) => {
    if (stepIndex < currentStep) return 'completed';
    if (stepIndex === currentStep) return 'active';
    return 'pending';
  };

  const getStepIcon = (step, status) => {
    if (step.icon) return step.icon;
    if (status === 'completed') return CheckCircle;
    if (status === 'active') return Play;
    if (step.error) return AlertTriangle;
    return Clock;
  };

  const getStepColors = (status, hasError = false) => {
    if (hasError)
      return {
        bg: 'bg-tomato-red/10 dark:bg-tomato-red/20',
        text: 'text-tomato-red',
        icon: 'text-tomato-red',
        line: 'bg-tomato-red/20',
        border: 'border-tomato-red',
      };

    switch (status) {
      case 'completed':
        return {
          bg: 'bg-mint-fresh/10 dark:bg-mint-fresh/20',
          text: 'text-bottle-green dark:text-mint-fresh',
          icon: 'text-bottle-green dark:text-mint-fresh',
          line: 'bg-mint-fresh',
          border: 'border-mint-fresh',
        };
      case 'active':
        return {
          bg: 'bg-blue-100 dark:bg-blue-900/20',
          text: 'text-blue-800 dark:text-blue-400',
          icon: 'text-blue-600 dark:text-blue-400',
          line: 'bg-blue-200 dark:bg-blue-700',
          border: 'border-blue-500 dark:border-blue-400',
        };
      default:
        return {
          bg: 'bg-gray-100 dark:bg-gray-800',
          text: 'text-gray-600 dark:text-gray-400',
          icon: 'text-gray-400',
          line: 'bg-gray-200 dark:bg-gray-700',
          border: 'border-gray-300 dark:border-gray-600',
        };
    }
  };

  const getSizeConfig = () => {
    const configs = {
      sm: {
        icon: 'w-6 h-6',
        iconContainer: 'w-8 h-8',
        text: 'text-xs',
        maxWidth: 'max-w-16',
      },
      default: {
        icon: 'w-5 h-5',
        iconContainer: 'w-10 h-10',
        text: 'text-xs',
        maxWidth: 'max-w-20',
      },
      lg: {
        icon: 'w-6 h-6',
        iconContainer: 'w-12 h-12',
        text: 'text-sm',
        maxWidth: 'max-w-24',
      },
    };
    return configs[size] || configs.default;
  };

  const sizeConfig = getSizeConfig();

  // Linear progress bar
  if (type === 'linear') {
    const progress =
      steps && steps.length > 0 ? ((currentStep + 1) / steps.length) * 100 : 0;

    return (
      <div className={`w-full ${className}`}>
        {showProgress && (
          <div className="flex justify-between text-sm text-text-muted dark:text-gray-400 mb-2">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
        )}

        <div
          className={`w-full bg-gray-200 dark:bg-gray-700 rounded-full ${
            size === 'sm' ? 'h-1.5' : size === 'lg' ? 'h-3' : 'h-2'
          }`}
        >
          <div
            className={`
              bg-gradient-to-r from-bottle-green to-mint-fresh rounded-full transition-all duration-500
              ${size === 'sm' ? 'h-1.5' : size === 'lg' ? 'h-3' : 'h-2'}
            `}
            style={{ width: `${progress}%` }}
          />
        </div>

        {showLabels && steps && steps[currentStep] && (
          <div
            className={`${sizeConfig.text} text-text-muted dark:text-gray-400 mt-2`}
          >
            Step {currentStep + 1} of {steps.length}:{' '}
            {steps[currentStep]?.title}
          </div>
        )}
      </div>
    );
  }

  // Simple percentage progress bar
  if (type === 'percentage') {
    const progress =
      typeof currentStep === 'number'
        ? Math.min(Math.max(currentStep, 0), 100)
        : 0;

    return (
      <div className={`w-full ${className}`}>
        {showProgress && (
          <div className="flex justify-between text-sm text-text-muted dark:text-gray-400 mb-2">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
        )}

        <div
          className={`w-full bg-gray-200 dark:bg-gray-700 rounded-full ${
            size === 'sm' ? 'h-1.5' : size === 'lg' ? 'h-3' : 'h-2'
          }`}
        >
          <div
            className={`
              bg-gradient-to-r from-bottle-green to-mint-fresh rounded-full transition-all duration-500
              ${size === 'sm' ? 'h-1.5' : size === 'lg' ? 'h-3' : 'h-2'}
            `}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    );
  }

  // Stepped workflow progress (default)
  if (!steps || steps.length === 0) {
    return (
      <div className={`text-text-muted dark:text-gray-400 ${className}`}>
        No steps defined
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      <div
        className={`
        flex items-center 
        ${variant === 'vertical' ? 'flex-col space-y-4' : 'justify-between'}
      `}
      >
        {steps.map((step, index) => {
          const status = getStepStatus(index);
          const colors = getStepColors(status, step.error);
          const Icon = getStepIcon(step, status);
          const isLast = index === steps.length - 1;

          return (
            <React.Fragment key={index}>
              <div
                className={`
                flex items-center relative
                ${variant === 'vertical' ? 'w-full' : 'flex-col'}
              `}
              >
                {/* Step Icon */}
                <div
                  className={`
                  ${sizeConfig.iconContainer} rounded-full flex items-center justify-center
                  border-2 transition-all duration-300 flex-shrink-0
                  ${colors.bg}
                  ${colors.border}
                  ${status === 'active' ? 'animate-pulse shadow-lg' : ''}
                  ${step.error ? 'animate-bounce' : ''}
                `}
                >
                  <Icon className={`${sizeConfig.icon} ${colors.icon}`} />
                </div>

                {/* Step Label */}
                {showLabels && (
                  <div
                    className={`
                    ${variant === 'vertical' ? 'ml-4 flex-1' : `mt-2 text-center ${sizeConfig.maxWidth}`}
                  `}
                  >
                    <div
                      className={`${sizeConfig.text} font-medium ${colors.text}`}
                    >
                      {step.title}
                    </div>
                    {step.description && (
                      <div
                        className={`${sizeConfig.text} text-text-muted dark:text-gray-400 mt-1`}
                      >
                        {step.description}
                      </div>
                    )}
                    {step.error && (
                      <div
                        className={`${sizeConfig.text} text-tomato-red mt-1 font-medium`}
                      >
                        {step.error}
                      </div>
                    )}
                    {step.timestamp && (
                      <div
                        className={`text-xs text-text-muted dark:text-gray-400 mt-1`}
                      >
                        {step.timestamp}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Connecting Line */}
              {!isLast && (
                <div
                  className={`
                  transition-all duration-300
                  ${
                    variant === 'vertical'
                      ? `w-0.5 h-6 ml-${sizeConfig.iconContainer.split('-')[1]} ${status === 'completed' ? colors.line : 'bg-gray-200 dark:bg-gray-700'}`
                      : `flex-1 h-0.5 mx-2 ${status === 'completed' ? colors.line : 'bg-gray-200 dark:bg-gray-700'}`
                  }
                `}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

// Predefined progress components for common use cases
export const WorkflowProgress = ({ steps, currentStep, ...props }) => (
  <ProgressBar
    type="workflow"
    steps={steps}
    currentStep={currentStep}
    {...props}
  />
);

export const LinearProgress = ({ steps, currentStep, ...props }) => (
  <ProgressBar
    type="linear"
    steps={steps}
    currentStep={currentStep}
    {...props}
  />
);

export const PercentageProgress = ({ percentage, ...props }) => (
  <ProgressBar type="percentage" currentStep={percentage} {...props} />
);

export const VerticalWorkflow = ({ steps, currentStep, ...props }) => (
  <ProgressBar
    type="workflow"
    variant="vertical"
    steps={steps}
    currentStep={currentStep}
    {...props}
  />
);

export default ProgressBar;
