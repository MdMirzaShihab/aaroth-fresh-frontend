/**
 * CreateRestaurantOwner - Restaurant Owner Creation Wizard
 * Features: Step-by-step wizard, form validation, document upload, auto-save
 */

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Building,
  FileText,
  Settings,
  ArrowRight,
  ArrowLeft,
  Check,
  Upload,
  MapPin,
  Phone,
  Mail,
  Store,
  Utensils,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useTheme } from '../../../hooks/useTheme';
import { Card, Button, Input } from '../../../components/ui';
import { Modal } from '../../../components/ui/Modal';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import FileUpload from '../../../components/ui/FileUpload';
import { useCreateRestaurantOwnerMutation } from '../../../services/admin-v2/usersService';

// Step indicator component
const StepIndicator = ({ currentStep, totalSteps, steps }) => {
  const { isDarkMode } = useTheme();

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center">
        {steps.map((step, index) => {
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;
          const IconComponent = step.icon;

          return (
            <div key={step.id} className="flex items-center">
              <div
                className={`
                flex items-center gap-3 px-4 py-2 rounded-xl transition-all
                ${
                  isActive
                    ? `${isDarkMode ? 'bg-sage-green/20 text-sage-green' : 'bg-muted-olive/20 text-muted-olive'}`
                    : isCompleted
                      ? 'bg-sage-green/10 text-sage-green'
                      : `${isDarkMode ? 'bg-dark-surface text-dark-text-muted' : 'bg-gray-100 text-gray-500'}`
                }
              `}
              >
                <div
                  className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                  ${
                    isActive
                      ? 'bg-muted-olive text-white'
                      : isCompleted
                        ? 'bg-sage-green text-white'
                        : 'bg-gray-300 text-gray-500'
                  }
                `}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <IconComponent className="w-4 h-4" />
                  )}
                </div>
                <span className="font-medium">{step.title}</span>
              </div>

              {index < steps.length - 1 && (
                <div
                  className={`
                  w-12 h-0.5 mx-2
                  ${isCompleted ? 'bg-sage-green' : 'bg-gray-300'}
                `}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const CreateRestaurantOwner = ({ isOpen, onClose, onSuccess }) => {
  const { isDarkMode } = useTheme();
  const [currentStep, setCurrentStep] = useState(0);
  const [createOwner, { isLoading }] = useCreateRestaurantOwnerMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm({
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      businessName: '',
      cuisineType: '',
      address: '',
      businessPhone: '',
      businessEmail: '',
      businessLicense: null,
      idDocument: null,
    },
  });

  const steps = [
    {
      id: 'owner_info',
      title: 'Owner Info',
      icon: User,
      description: 'Personal information and contact details',
    },
    {
      id: 'business_info',
      title: 'Business Details',
      icon: Building,
      description: 'Restaurant information and business details',
    },
    {
      id: 'documents',
      title: 'Documents',
      icon: FileText,
      description: 'Upload business license and ID verification',
    },
    {
      id: 'review',
      title: 'Review',
      icon: Settings,
      description: 'Review and submit restaurant owner application',
    },
  ];

  // Handle step navigation
  const nextStep = useCallback(() => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  }, [currentStep, steps.length]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep]);

  // Handle form submission
  const onSubmit = useCallback(
    async (data) => {
      try {
        await createOwner(data).unwrap();
        toast.success('Restaurant owner created successfully');
        reset();
        setCurrentStep(0);
        onSuccess?.();
      } catch (error) {
        toast.error('Failed to create restaurant owner');
      }
    },
    [createOwner, reset, onSuccess]
  );

  // Handle file upload
  const handleFileUpload = useCallback(
    (field, files) => {
      if (files && files.length > 0) {
        setValue(field, files[0]);
      }
    },
    [setValue]
  );

  // Handle modal close
  const handleClose = useCallback(() => {
    reset();
    setCurrentStep(0);
    onClose();
  }, [reset, onClose]);

  // Render step content
  const renderStepContent = () => {
    const watchedValues = watch();

    switch (currentStep) {
      case 0: // Owner Info
        return (
          <div className="space-y-4">
            <h3
              className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-dark-text-primary' : 'text-text-dark'}`}
            >
              Owner Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-dark-text-primary' : 'text-text-dark'}`}
                >
                  Full Name *
                </label>
                <Input
                  {...register('name', { required: 'Full name is required' })}
                  placeholder="Enter full name"
                  error={errors.name?.message}
                />
              </div>

              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-dark-text-primary' : 'text-text-dark'}`}
                >
                  Email Address *
                </label>
                <Input
                  type="email"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: 'Invalid email format',
                    },
                  })}
                  placeholder="owner@restaurant.com"
                  error={errors.email?.message}
                />
              </div>

              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-dark-text-primary' : 'text-text-dark'}`}
                >
                  Phone Number *
                </label>
                <Input
                  type="tel"
                  {...register('phone', {
                    required: 'Phone number is required',
                  })}
                  placeholder="+1 (555) 123-4567"
                  error={errors.phone?.message}
                />
              </div>

              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-dark-text-primary' : 'text-text-dark'}`}
                >
                  Address
                </label>
                <Input {...register('address')} placeholder="Owner's address" />
              </div>
            </div>
          </div>
        );

      case 1: // Business Info
        return (
          <div className="space-y-4">
            <h3
              className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-dark-text-primary' : 'text-text-dark'}`}
            >
              Business Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-dark-text-primary' : 'text-text-dark'}`}
                >
                  Restaurant Name *
                </label>
                <Input
                  {...register('businessName', {
                    required: 'Restaurant name is required',
                  })}
                  placeholder="Enter restaurant name"
                  error={errors.businessName?.message}
                />
              </div>

              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-dark-text-primary' : 'text-text-dark'}`}
                >
                  Cuisine Type *
                </label>
                <select
                  {...register('cuisineType', {
                    required: 'Cuisine type is required',
                  })}
                  className={`
                    w-full px-3 py-2 border rounded-lg transition-colors
                    ${
                      isDarkMode
                        ? 'bg-dark-surface border-dark-border text-dark-text-primary'
                        : 'bg-white border-gray-300 text-text-dark'
                    }
                    ${errors.cuisineType ? 'border-tomato-red' : ''}
                  `}
                >
                  <option value="">Select cuisine type</option>
                  <option value="italian">Italian</option>
                  <option value="chinese">Chinese</option>
                  <option value="mexican">Mexican</option>
                  <option value="american">American</option>
                  <option value="indian">Indian</option>
                  <option value="mediterranean">Mediterranean</option>
                  <option value="thai">Thai</option>
                  <option value="japanese">Japanese</option>
                  <option value="other">Other</option>
                </select>
                {errors.cuisineType && (
                  <p className="text-tomato-red text-sm mt-1">
                    {errors.cuisineType.message}
                  </p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label
                  className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-dark-text-primary' : 'text-text-dark'}`}
                >
                  Business Address *
                </label>
                <Input
                  {...register('businessAddress', {
                    required: 'Business address is required',
                  })}
                  placeholder="Enter restaurant address"
                  error={errors.businessAddress?.message}
                />
              </div>

              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-dark-text-primary' : 'text-text-dark'}`}
                >
                  Business Phone
                </label>
                <Input
                  type="tel"
                  {...register('businessPhone')}
                  placeholder="+1 (555) 987-6543"
                />
              </div>

              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-dark-text-primary' : 'text-text-dark'}`}
                >
                  Business Email
                </label>
                <Input
                  type="email"
                  {...register('businessEmail')}
                  placeholder="info@restaurant.com"
                />
              </div>
            </div>
          </div>
        );

      case 2: // Documents
        return (
          <div className="space-y-6">
            <h3
              className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-dark-text-primary' : 'text-text-dark'}`}
            >
              Document Upload
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-dark-text-primary' : 'text-text-dark'}`}
                >
                  Business License *
                </label>
                <FileUpload
                  onFileSelect={(files) =>
                    handleFileUpload('businessLicense', files)
                  }
                  acceptedTypes="image/*,.pdf"
                  maxFiles={1}
                  className="h-32"
                />
                <p
                  className={`text-xs mt-2 ${isDarkMode ? 'text-dark-text-muted' : 'text-text-muted'}`}
                >
                  Upload business license or registration document
                </p>
              </div>

              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-dark-text-primary' : 'text-text-dark'}`}
                >
                  ID Document *
                </label>
                <FileUpload
                  onFileSelect={(files) =>
                    handleFileUpload('idDocument', files)
                  }
                  acceptedTypes="image/*,.pdf"
                  maxFiles={1}
                  className="h-32"
                />
                <p
                  className={`text-xs mt-2 ${isDarkMode ? 'text-dark-text-muted' : 'text-text-muted'}`}
                >
                  Upload government-issued ID (driver's license, passport, etc.)
                </p>
              </div>
            </div>
          </div>
        );

      case 3: // Review
        return (
          <div className="space-y-6">
            <h3
              className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-dark-text-primary' : 'text-text-dark'}`}
            >
              Review Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-4">
                <h4
                  className={`font-medium mb-3 flex items-center gap-2 ${isDarkMode ? 'text-dark-text-primary' : 'text-text-dark'}`}
                >
                  <User className="w-4 h-4" />
                  Owner Information
                </h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Name:</span>{' '}
                    {watchedValues.name}
                  </div>
                  <div>
                    <span className="font-medium">Email:</span>{' '}
                    {watchedValues.email}
                  </div>
                  <div>
                    <span className="font-medium">Phone:</span>{' '}
                    {watchedValues.phone}
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <h4
                  className={`font-medium mb-3 flex items-center gap-2 ${isDarkMode ? 'text-dark-text-primary' : 'text-text-dark'}`}
                >
                  <Building className="w-4 h-4" />
                  Business Information
                </h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Restaurant:</span>{' '}
                    {watchedValues.businessName}
                  </div>
                  <div>
                    <span className="font-medium">Cuisine:</span>{' '}
                    {watchedValues.cuisineType}
                  </div>
                  <div>
                    <span className="font-medium">Address:</span>{' '}
                    {watchedValues.businessAddress}
                  </div>
                </div>
              </Card>
            </div>

            <Card className="p-4">
              <h4
                className={`font-medium mb-3 flex items-center gap-2 ${isDarkMode ? 'text-dark-text-primary' : 'text-text-dark'}`}
              >
                <FileText className="w-4 h-4" />
                Documents
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-3 h-3 rounded-full ${watchedValues.businessLicense ? 'bg-sage-green' : 'bg-gray-300'}`}
                  />
                  <span>Business License</span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-3 h-3 rounded-full ${watchedValues.idDocument ? 'bg-sage-green' : 'bg-gray-300'}`}
                  />
                  <span>ID Document</span>
                </div>
              </div>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="2xl">
      <div className="p-6">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-muted-olive via-sage-green to-sage-green flex items-center justify-center shadow-lg">
            <Utensils className="w-8 h-8 text-white" />
          </div>
          <h2
            className={`text-2xl font-bold ${isDarkMode ? 'text-dark-text-primary' : 'text-text-dark'}`}
          >
            Create Restaurant Owner
          </h2>
          <p
            className={`text-sm ${isDarkMode ? 'text-dark-text-muted' : 'text-text-muted'}`}
          >
            Complete the form to add a new restaurant owner to the platform
          </p>
        </div>

        {/* Step Indicator */}
        <StepIndicator
          currentStep={currentStep}
          totalSteps={steps.length}
          steps={steps}
        />

        {/* Form Content */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <Card className="p-6 mb-6">{renderStepContent()}</Card>

          {/* Navigation */}
          <div className="flex justify-between">
            <div>
              {currentStep > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  disabled={isLoading}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>
              )}
            </div>

            <div>
              {currentStep < steps.length - 1 ? (
                <Button type="button" onClick={nextStep} disabled={isLoading}>
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <LoadingSpinner size="sm" className="mr-2" />
                  ) : (
                    <Check className="w-4 h-4 mr-2" />
                  )}
                  Create Restaurant Owner
                </Button>
              )}
            </div>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default CreateRestaurantOwner;
