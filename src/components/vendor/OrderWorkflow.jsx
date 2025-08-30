import React, { useState, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import {
  CheckCircle,
  Circle,
  Clock,
  Package,
  Truck,
  User,
  MapPin,
  Phone,
  AlertTriangle,
  FileText,
  Camera,
  MessageSquare,
  Timer,
  ChevronRight,
  Play,
  Pause,
  RotateCcw,
} from 'lucide-react';
import {
  useGetOrderWorkflowStepsQuery,
  useUpdateOrderFulfillmentStepMutation,
  useUpdateOrderStatusWorkflowMutation,
} from '../../store/slices/apiSlice';
import { addNotification } from '../../store/slices/notificationSlice';

// State machine pattern for order workflow
const ORDER_WORKFLOW_STATES = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PREPARING: 'preparing',
  PREPARED: 'prepared',
  SHIPPING: 'shipping',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
};

const WORKFLOW_TRANSITIONS = {
  [ORDER_WORKFLOW_STATES.PENDING]: [
    ORDER_WORKFLOW_STATES.CONFIRMED,
    ORDER_WORKFLOW_STATES.CANCELLED,
  ],
  [ORDER_WORKFLOW_STATES.CONFIRMED]: [
    ORDER_WORKFLOW_STATES.PREPARING,
    ORDER_WORKFLOW_STATES.CANCELLED,
  ],
  [ORDER_WORKFLOW_STATES.PREPARING]: [
    ORDER_WORKFLOW_STATES.PREPARED,
    ORDER_WORKFLOW_STATES.CANCELLED,
  ],
  [ORDER_WORKFLOW_STATES.PREPARED]: [
    ORDER_WORKFLOW_STATES.SHIPPING,
    ORDER_WORKFLOW_STATES.CANCELLED,
  ],
  [ORDER_WORKFLOW_STATES.SHIPPING]: [
    ORDER_WORKFLOW_STATES.SHIPPED,
    ORDER_WORKFLOW_STATES.CANCELLED,
  ],
  [ORDER_WORKFLOW_STATES.SHIPPED]: [ORDER_WORKFLOW_STATES.DELIVERED],
  [ORDER_WORKFLOW_STATES.DELIVERED]: [],
  [ORDER_WORKFLOW_STATES.CANCELLED]: [],
};

const OrderWorkflow = ({ orderId, currentStatus, onStatusChange }) => {
  const dispatch = useDispatch();
  const [activeStep, setActiveStep] = useState(null);
  const [stepNotes, setStepNotes] = useState({});
  const [workflowTimer, setWorkflowTimer] = useState(null);
  const [timerStartTime, setTimerStartTime] = useState(null);

  // Fetch workflow steps
  const {
    data: workflowData,
    isLoading,
    error,
    refetch,
  } = useGetOrderWorkflowStepsQuery(orderId, {
    pollingInterval: 60000, // Poll every minute
    skip: !orderId,
  });

  // Mutations
  const [updateFulfillmentStep] = useUpdateOrderFulfillmentStepMutation();
  const [updateOrderStatus] = useUpdateOrderStatusWorkflowMutation();

  const workflowSteps = workflowData?.data?.steps || [];

  // Define workflow stages with their associated steps
  const workflowStages = useMemo(
    () => [
      {
        id: 'confirmation',
        title: 'Order Confirmation',
        status: ORDER_WORKFLOW_STATES.CONFIRMED,
        icon: CheckCircle,
        color: 'text-blue-600 bg-blue-50',
        estimatedTime: '5 minutes',
        steps: [
          { id: 'verify_order', title: 'Verify order details', required: true },
          {
            id: 'check_inventory',
            title: 'Check inventory availability',
            required: true,
          },
          {
            id: 'confirm_pricing',
            title: 'Confirm pricing and discounts',
            required: false,
          },
          {
            id: 'send_confirmation',
            title: 'Send confirmation to customer',
            required: true,
          },
        ],
      },
      {
        id: 'preparation',
        title: 'Order Preparation',
        status: ORDER_WORKFLOW_STATES.PREPARING,
        icon: Package,
        color: 'text-purple-600 bg-purple-50',
        estimatedTime: '15-30 minutes',
        steps: [
          {
            id: 'gather_items',
            title: 'Gather all ordered items',
            required: true,
          },
          { id: 'quality_check', title: 'Quality inspection', required: true },
          {
            id: 'special_requests',
            title: 'Handle special requests',
            required: false,
          },
          { id: 'packaging', title: 'Package items securely', required: true },
          {
            id: 'add_invoice',
            title: 'Add invoice and receipt',
            required: true,
          },
        ],
      },
      {
        id: 'shipping',
        title: 'Shipping & Delivery',
        status: ORDER_WORKFLOW_STATES.SHIPPING,
        icon: Truck,
        color: 'text-indigo-600 bg-indigo-50',
        estimatedTime: '30-60 minutes',
        steps: [
          {
            id: 'assign_driver',
            title: 'Assign delivery driver',
            required: true,
          },
          {
            id: 'prepare_route',
            title: 'Plan delivery route',
            required: false,
          },
          {
            id: 'load_vehicle',
            title: 'Load items in delivery vehicle',
            required: true,
          },
          {
            id: 'start_delivery',
            title: 'Start delivery journey',
            required: true,
          },
          {
            id: 'customer_contact',
            title: 'Contact customer for delivery',
            required: false,
          },
        ],
      },
      {
        id: 'completion',
        title: 'Order Completion',
        status: ORDER_WORKFLOW_STATES.DELIVERED,
        icon: CheckCircle,
        color: 'text-muted-olive bg-sage-green/20',
        estimatedTime: '5 minutes',
        steps: [
          {
            id: 'confirm_delivery',
            title: 'Confirm delivery with customer',
            required: true,
          },
          {
            id: 'collect_payment',
            title: 'Collect payment (if COD)',
            required: false,
          },
          {
            id: 'get_signature',
            title: 'Get delivery signature/photo',
            required: false,
          },
          {
            id: 'update_inventory',
            title: 'Update inventory records',
            required: true,
          },
          { id: 'send_receipt', title: 'Send final receipt', required: false },
        ],
      },
    ],
    []
  );

  // Get current stage based on order status
  const getCurrentStage = () => {
    return (
      workflowStages.find((stage) => stage.status === currentStatus) ||
      workflowStages[0]
    );
  };

  // Get completed steps from API data
  const getStepStatus = (stepId) => {
    const step = workflowSteps.find((s) => s.id === stepId);
    return step ? step.completed : false;
  };

  // Handle step completion
  const handleStepToggle = async (stepId, completed) => {
    try {
      await updateFulfillmentStep({
        orderId,
        stepId,
        completed,
        notes: stepNotes[stepId] || '',
      }).unwrap();

      dispatch(
        addNotification({
          type: 'success',
          title: `Step ${completed ? 'completed' : 'updated'}`,
          message: `Workflow step has been ${completed ? 'marked as completed' : 'updated'}`,
        })
      );

      // Auto-advance workflow if all required steps in current stage are completed
      const currentStage = getCurrentStage();
      const requiredSteps = currentStage.steps.filter((s) => s.required);
      const completedRequiredSteps = requiredSteps.filter((s) =>
        s.id === stepId ? completed : getStepStatus(s.id)
      );

      if (completedRequiredSteps.length === requiredSteps.length) {
        // All required steps completed - suggest advancing to next stage
        const nextTransitions = WORKFLOW_TRANSITIONS[currentStatus] || [];
        const nextStatus = getNextLogicalStatus(currentStatus);

        if (nextStatus && nextTransitions.includes(nextStatus)) {
          dispatch(
            addNotification({
              type: 'info',
              title: 'Ready to advance',
              message: `All required steps completed. Ready to move to ${nextStatus}.`,
              autoClose: false,
            })
          );
        }
      }
    } catch (error) {
      dispatch(
        addNotification({
          type: 'error',
          title: 'Update failed',
          message: error.data?.message || 'Failed to update workflow step',
        })
      );
    }
  };

  // Get next logical status in workflow
  const getNextLogicalStatus = (current) => {
    const statusOrder = [
      ORDER_WORKFLOW_STATES.PENDING,
      ORDER_WORKFLOW_STATES.CONFIRMED,
      ORDER_WORKFLOW_STATES.PREPARING,
      ORDER_WORKFLOW_STATES.PREPARED,
      ORDER_WORKFLOW_STATES.SHIPPING,
      ORDER_WORKFLOW_STATES.SHIPPED,
      ORDER_WORKFLOW_STATES.DELIVERED,
    ];

    const currentIndex = statusOrder.indexOf(current);
    return statusOrder[currentIndex + 1] || null;
  };

  // Handle status advancement
  const handleAdvanceStatus = async () => {
    const nextStatus = getNextLogicalStatus(currentStatus);
    if (!nextStatus) return;

    try {
      await updateOrderStatus({
        id: orderId,
        status: nextStatus,
        notes: `Advanced to ${nextStatus} via workflow`,
        estimatedTime: getCurrentStage()?.estimatedTime,
      }).unwrap();

      onStatusChange?.(nextStatus);

      dispatch(
        addNotification({
          type: 'success',
          title: 'Status updated',
          message: `Order advanced to ${nextStatus}`,
        })
      );
    } catch (error) {
      dispatch(
        addNotification({
          type: 'error',
          title: 'Status update failed',
          message: error.data?.message || 'Failed to advance order status',
        })
      );
    }
  };

  // Start/stop workflow timer
  const handleTimer = (action) => {
    if (action === 'start') {
      setTimerStartTime(Date.now());
      const timer = setInterval(() => {
        setWorkflowTimer((prev) => prev + 1000);
      }, 1000);
      setWorkflowTimer(timer);
    } else if (action === 'stop') {
      clearInterval(workflowTimer);
      setWorkflowTimer(null);
      setTimerStartTime(null);
    } else if (action === 'reset') {
      clearInterval(workflowTimer);
      setWorkflowTimer(null);
      setTimerStartTime(null);
    }
  };

  // Format timer display
  const formatTimer = () => {
    if (!timerStartTime) return '00:00';
    const elapsed = Math.floor((Date.now() - timerStartTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const currentStage = getCurrentStage();
  const currentStageIndex = workflowStages.findIndex(
    (s) => s.id === currentStage.id
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-muted-olive"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="w-12 h-12 text-tomato-red/60 mx-auto mb-3" />
        <p className="text-text-muted mb-4">Failed to load workflow</p>
        <button
          onClick={() => refetch()}
          className="text-muted-olive hover:text-muted-olive/80 font-medium"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Workflow Progress Header */}
      <div className="bg-white rounded-3xl shadow-soft p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-text-dark">Order Workflow</h3>
            <p className="text-text-muted">
              Track and manage order fulfillment steps
            </p>
          </div>

          {/* Timer */}
          <div className="flex items-center gap-3">
            <div className="bg-gray-100 rounded-2xl px-4 py-2 flex items-center gap-2">
              <Timer className="w-4 h-4 text-text-muted" />
              <span className="font-mono font-medium text-text-dark">
                {formatTimer()}
              </span>
            </div>

            <div className="flex gap-2">
              {!workflowTimer ? (
                <button
                  onClick={() => handleTimer('start')}
                  className="p-2 bg-muted-olive text-white rounded-xl hover:opacity-90 transition-opacity"
                >
                  <Play className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => handleTimer('stop')}
                  className="p-2 bg-orange-500 text-white rounded-xl hover:opacity-90 transition-opacity"
                >
                  <Pause className="w-4 h-4" />
                </button>
              )}

              <button
                onClick={() => handleTimer('reset')}
                className="p-2 bg-gray-100 text-text-muted rounded-xl hover:bg-gray-200 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Stage Progress */}
        <div className="flex items-center justify-between mb-4">
          {workflowStages.map((stage, index) => {
            const Icon = stage.icon;
            const isCompleted = index < currentStageIndex;
            const isCurrent = index === currentStageIndex;
            const isUpcoming = index > currentStageIndex;

            return (
              <React.Fragment key={stage.id}>
                <div className="flex flex-col items-center">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-2 ${
                      isCompleted
                        ? 'bg-muted-olive text-white'
                        : isCurrent
                          ? stage.color
                          : 'bg-gray-100 text-text-muted'
                    }`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="text-center">
                    <div
                      className={`text-sm font-medium ${
                        isCurrent ? 'text-text-dark' : 'text-text-muted'
                      }`}
                    >
                      {stage.title}
                    </div>
                    <div className="text-xs text-text-muted mt-1">
                      {stage.estimatedTime}
                    </div>
                  </div>
                </div>

                {index < workflowStages.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-4 ${
                      isCompleted ? 'bg-muted-olive' : 'bg-gray-200'
                    }`}
                  ></div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Current Stage Steps */}
      <div className="bg-white rounded-3xl shadow-soft p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h4 className="text-lg font-bold text-text-dark">
              {currentStage.title}
            </h4>
            <p className="text-text-muted text-sm">
              Complete the required steps below
            </p>
          </div>

          {/* Advance Button */}
          {getNextLogicalStatus(currentStatus) && (
            <button
              onClick={handleAdvanceStatus}
              className="flex items-center gap-2 px-4 py-2 bg-muted-olive hover:bg-muted-olive/90 text-white rounded-2xl font-medium transition-colors"
            >
              Advance to {getNextLogicalStatus(currentStatus)}
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="space-y-4">
          {currentStage.steps.map((step) => {
            const isCompleted = getStepStatus(step.id);
            const isActive = activeStep === step.id;

            return (
              <div
                key={step.id}
                className="border border-gray-200 rounded-2xl p-4"
              >
                <div className="flex items-start gap-4">
                  {/* Checkbox */}
                  <button
                    onClick={() => handleStepToggle(step.id, !isCompleted)}
                    className="mt-1 flex-shrink-0"
                  >
                    {isCompleted ? (
                      <CheckCircle className="w-5 h-5 text-muted-olive" />
                    ) : (
                      <Circle className="w-5 h-5 text-text-muted" />
                    )}
                  </button>

                  {/* Step Content */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`font-medium ${
                          isCompleted
                            ? 'text-text-muted line-through'
                            : 'text-text-dark'
                        }`}
                      >
                        {step.title}
                      </span>
                      {step.required && (
                        <span className="text-xs bg-tomato-red/10 text-tomato-red px-2 py-1 rounded-lg">
                          Required
                        </span>
                      )}
                    </div>

                    {/* Step Notes */}
                    {(isActive || stepNotes[step.id]) && (
                      <div className="mt-3">
                        <textarea
                          value={stepNotes[step.id] || ''}
                          onChange={(e) =>
                            setStepNotes((prev) => ({
                              ...prev,
                              [step.id]: e.target.value,
                            }))
                          }
                          placeholder="Add notes for this step..."
                          rows={2}
                          className="w-full px-3 py-2 bg-gray-50 border-0 rounded-xl text-text-dark placeholder-text-muted focus:ring-2 focus:ring-muted-olive/20 focus:bg-white transition-all duration-200 resize-none text-sm"
                        />
                      </div>
                    )}

                    {/* Step Actions */}
                    <div className="flex items-center gap-2 mt-3">
                      <button
                        onClick={() => setActiveStep(isActive ? null : step.id)}
                        className="flex items-center gap-1 text-xs text-text-muted hover:text-text-dark transition-colors"
                      >
                        <MessageSquare className="w-3 h-3" />
                        {isActive ? 'Hide' : 'Add'} notes
                      </button>

                      {step.id === 'get_signature' && (
                        <button className="flex items-center gap-1 text-xs text-text-muted hover:text-text-dark transition-colors">
                          <Camera className="w-3 h-3" />
                          Take photo
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Workflow Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl shadow-soft p-4 text-center">
          <div className="text-2xl font-bold text-muted-olive mb-1">
            {workflowSteps.filter((s) => s.completed).length}
          </div>
          <div className="text-sm text-text-muted">Steps Completed</div>
        </div>

        <div className="bg-white rounded-2xl shadow-soft p-4 text-center">
          <div className="text-2xl font-bold text-orange-600 mb-1">
            {
              currentStage.steps.filter(
                (s) => s.required && !getStepStatus(s.id)
              ).length
            }
          </div>
          <div className="text-sm text-text-muted">Required Remaining</div>
        </div>

        <div className="bg-white rounded-2xl shadow-soft p-4 text-center">
          <div className="text-2xl font-bold text-text-dark mb-1">
            {Math.round(
              (workflowSteps.filter((s) => s.completed).length /
                Math.max(workflowSteps.length, 1)) *
                100
            )}
            %
          </div>
          <div className="text-sm text-text-muted">Overall Progress</div>
        </div>
      </div>
    </div>
  );
};

export default OrderWorkflow;
