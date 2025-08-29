/**
 * VendorProfileModal - Comprehensive Vendor Profile Editor
 * Professional modal for editing vendor business information, documents, and performance tracking
 * Features: Multi-section editing, document management, business metrics, activity timeline
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import {
  X,
  Save,
  User,
  Building2,
  MapPin,
  Phone,
  Mail,
  Globe,
  Calendar,
  Clock,
  Star,
  TrendingUp,
  Package,
  DollarSign,
  FileText,
  Upload,
  Eye,
  Edit3,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Camera,
  Trash2
} from 'lucide-react';
import { useTheme } from '../../../../hooks/useTheme';
import { Modal } from '../../../../components/ui';
import { Card } from '../../../../components/ui';
import { Button } from '../../../../components/ui';
import { Input } from '../../../../components/ui';
import { StatusBadge } from '../../../../components/ui';
import LoadingSpinner from '../../../../components/ui/LoadingSpinner';
import { 
  useUpdateVendorMutation,
  useGetVendorPerformanceQuery,
  useLazyGetVendorDetailsQuery
} from '../../../../services/admin-v2/vendorsService';
import toast from 'react-hot-toast';

// Profile sections tabs
const PROFILE_SECTIONS = [
  { id: 'business', label: 'Business Info', icon: Building2 },
  { id: 'contact', label: 'Contact', icon: Phone },
  { id: 'documents', label: 'Documents', icon: FileText },
  { id: 'performance', label: 'Performance', icon: TrendingUp },
  { id: 'activity', label: 'Activity', icon: Clock }
];

// Business information form
const BusinessInfoForm = ({ vendor, register, errors, watch, setValue }) => {
  const businessTypes = [
    { value: 'farm', label: 'Farm' },
    { value: 'wholesaler', label: 'Wholesaler' },
    { value: 'distributor', label: 'Distributor' },
    { value: 'co-op', label: 'Cooperative' },
    { value: 'processor', label: 'Food Processor' },
    { value: 'supplier', label: 'Supplier' }
  ];

  return (
    <div className="space-y-6">
      {/* Business Identity */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Building2 className="w-5 h-5 text-muted-olive" />
          <h3 className="text-lg font-semibold text-text-dark">Business Identity</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-dark">Business Name *</label>
            <Input
              {...register('businessName', { required: 'Business name is required' })}
              placeholder="Enter business name"
              error={errors.businessName?.message}
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-dark">Business Type *</label>
            <select
              {...register('businessType', { required: 'Business type is required' })}
              className="w-full px-4 py-3 rounded-2xl bg-earthy-beige/30 border-0 focus:glass-3 
                         focus:shadow-glow-olive transition-all duration-300 text-text-dark focus:outline-none"
            >
              <option value="">Select business type</option>
              {businessTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
            {errors.businessType && (
              <p className="text-tomato-red text-sm">{errors.businessType.message}</p>
            )}
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <label className="text-sm font-medium text-text-dark">Business Description</label>
          <textarea
            {...register('businessDescription')}
            placeholder="Describe your business operations, products, and services..."
            rows={4}
            className="w-full px-4 py-3 rounded-2xl bg-earthy-beige/30 border-0 focus:glass-3 
                       focus:shadow-glow-olive transition-all duration-300 placeholder:text-text-muted/60 
                       resize-none focus:outline-none text-text-dark"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-dark">Registration Number</label>
            <Input
              {...register('registrationNumber')}
              placeholder="Business registration number"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-dark">Tax ID</label>
            <Input
              {...register('taxId')}
              placeholder="Tax identification number"
            />
          </div>
        </div>
      </Card>

      {/* Address Information */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="w-5 h-5 text-muted-olive" />
          <h3 className="text-lg font-semibold text-text-dark">Business Address</h3>
        </div>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-dark">Street Address *</label>
            <Input
              {...register('address.street', { required: 'Street address is required' })}
              placeholder="Street address"
              error={errors.address?.street?.message}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-dark">City *</label>
              <Input
                {...register('address.city', { required: 'City is required' })}
                placeholder="City"
                error={errors.address?.city?.message}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-dark">State/Province</label>
              <Input
                {...register('address.state')}
                placeholder="State or Province"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-dark">Postal Code</label>
              <Input
                {...register('address.zipCode')}
                placeholder="Postal code"
              />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

// Contact information form
const ContactInfoForm = ({ vendor, register, errors }) => {
  return (
    <div className="space-y-6">
      {/* Owner Information */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <User className="w-5 h-5 text-muted-olive" />
          <h3 className="text-lg font-semibold text-text-dark">Owner Information</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-dark">Owner Name *</label>
            <Input
              {...register('ownerName', { required: 'Owner name is required' })}
              placeholder="Full name of business owner"
              error={errors.ownerName?.message}
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-dark">Owner Title</label>
            <Input
              {...register('ownerTitle')}
              placeholder="e.g., CEO, Founder, Manager"
            />
          </div>
        </div>
      </Card>

      {/* Contact Details */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Phone className="w-5 h-5 text-muted-olive" />
          <h3 className="text-lg font-semibold text-text-dark">Contact Details</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-dark">Primary Phone *</label>
            <Input
              {...register('phone', { required: 'Phone number is required' })}
              placeholder="+1234567890"
              error={errors.phone?.message}
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-dark">Secondary Phone</label>
            <Input
              {...register('alternatePhone')}
              placeholder="Alternative contact number"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-dark">Email Address *</label>
            <Input
              {...register('email', { 
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address'
                }
              })}
              placeholder="business@example.com"
              error={errors.email?.message}
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-dark">Website</label>
            <Input
              {...register('website')}
              placeholder="https://www.business.com"
            />
          </div>
        </div>

        {/* Operating Hours */}
        <div className="mt-6">
          <h4 className="font-medium text-text-dark mb-3">Operating Hours</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-xs text-text-muted">Opening Time</label>
              <Input
                {...register('operatingHours.open')}
                type="time"
                placeholder="09:00"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-text-muted">Closing Time</label>
              <Input
                {...register('operatingHours.close')}
                type="time"
                placeholder="17:00"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-text-muted">Working Days</label>
              <Input
                {...register('operatingHours.days')}
                placeholder="Mon-Fri"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-text-muted">Timezone</label>
              <select
                {...register('operatingHours.timezone')}
                className="w-full px-3 py-2 rounded-xl bg-earthy-beige/30 border-0 text-sm text-text-dark focus:outline-none"
              >
                <option value="">Select timezone</option>
                <option value="America/New_York">Eastern Time</option>
                <option value="America/Chicago">Central Time</option>
                <option value="America/Denver">Mountain Time</option>
                <option value="America/Los_Angeles">Pacific Time</option>
              </select>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

// Document management section
const DocumentsSection = ({ vendor }) => {
  const [documents, setDocuments] = useState(vendor.documents || {});
  
  const documentTypes = [
    { key: 'businessLicense', label: 'Business License', required: true },
    { key: 'taxId', label: 'Tax ID Document', required: true },
    { key: 'ownerIdentification', label: 'Owner ID', required: true },
    { key: 'bankAccount', label: 'Bank Verification', required: true },
    { key: 'insurance', label: 'Business Insurance', required: false },
    { key: 'foodSafety', label: 'Food Safety Certificate', required: false }
  ];

  return (
    <div className="space-y-6">
      {documentTypes.map(docType => (
        <Card key={docType.key} className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-muted-olive" />
              <h3 className="font-semibold text-text-dark">{docType.label}</h3>
              {docType.required && (
                <span className="text-xs px-2 py-1 bg-tomato-red/10 text-tomato-red rounded-full">
                  Required
                </span>
              )}
            </div>
            
            {documents[docType.key]?.verified ? (
              <CheckCircle className="w-5 h-5 text-mint-fresh" />
            ) : documents[docType.key]?.provided ? (
              <Clock className="w-5 h-5 text-earthy-yellow" />
            ) : (
              <XCircle className="w-5 h-5 text-gray-400" />
            )}
          </div>

          {documents[docType.key]?.provided ? (
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-muted-olive/10 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-muted-olive" />
                </div>
                <div>
                  <p className="font-medium text-text-dark">Document uploaded</p>
                  <p className="text-sm text-text-muted">
                    Status: {documents[docType.key].verified ? 'Verified' : 'Under Review'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Eye className="w-4 h-4 mr-2" />
                  View
                </Button>
                <Button variant="outline" size="sm">
                  <Upload className="w-4 h-4 mr-2" />
                  Replace
                </Button>
              </div>
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-text-muted mb-2">No document uploaded</p>
              <Button variant="outline" size="sm">
                <Upload className="w-4 h-4 mr-2" />
                Upload Document
              </Button>
            </div>
          )}
        </Card>
      ))}
    </div>
  );
};

// Performance metrics section
const PerformanceSection = ({ vendor }) => {
  const { data: performanceData, isLoading } = useGetVendorPerformanceQuery({
    vendorId: vendor.id,
    period: 'monthly'
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="md" />
      </div>
    );
  }

  const metrics = vendor.businessMetrics || {};

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 text-center">
          <div className="w-12 h-12 bg-mint-fresh/10 rounded-xl flex items-center justify-center mx-auto mb-2">
            <DollarSign className="w-6 h-6 text-mint-fresh" />
          </div>
          <p className="text-2xl font-bold text-text-dark">
            ${(metrics.totalRevenue || 0).toLocaleString()}
          </p>
          <p className="text-sm text-text-muted">Total Revenue</p>
        </Card>

        <Card className="p-4 text-center">
          <div className="w-12 h-12 bg-sage-green/10 rounded-xl flex items-center justify-center mx-auto mb-2">
            <Package className="w-6 h-6 text-sage-green" />
          </div>
          <p className="text-2xl font-bold text-text-dark">{metrics.totalOrders || 0}</p>
          <p className="text-sm text-text-muted">Total Orders</p>
        </Card>

        <Card className="p-4 text-center">
          <div className="w-12 h-12 bg-earthy-yellow/10 rounded-xl flex items-center justify-center mx-auto mb-2">
            <Star className="w-6 h-6 text-earthy-yellow" />
          </div>
          <p className="text-2xl font-bold text-text-dark">
            {(metrics.rating || 0).toFixed(1)}
          </p>
          <p className="text-sm text-text-muted">Average Rating</p>
        </Card>

        <Card className="p-4 text-center">
          <div className="w-12 h-12 bg-dusty-cedar/10 rounded-xl flex items-center justify-center mx-auto mb-2">
            <TrendingUp className="w-6 h-6 text-dusty-cedar" />
          </div>
          <p className="text-2xl font-bold text-text-dark">{metrics.totalListings || 0}</p>
          <p className="text-sm text-text-muted">Active Listings</p>
        </Card>
      </div>

      {/* Performance Indicators */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-text-dark mb-4">Performance Indicators</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-text-muted">Customer Satisfaction</span>
            <div className="flex items-center gap-2">
              <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-mint-fresh rounded-full"
                  style={{ width: `${(metrics.rating || 0) * 20}%` }}
                />
              </div>
              <span className="text-sm font-medium text-text-dark">
                {((metrics.rating || 0) * 20).toFixed(0)}%
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-text-muted">Order Fulfillment Rate</span>
            <div className="flex items-center gap-2">
              <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-sage-green rounded-full"
                  style={{ width: `${(metrics.fulfillmentRate || 0.85) * 100}%` }}
                />
              </div>
              <span className="text-sm font-medium text-text-dark">
                {((metrics.fulfillmentRate || 0.85) * 100).toFixed(0)}%
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-text-muted">Response Time</span>
            <span className="text-sm font-medium text-text-dark">
              {metrics.averageResponseTime || '< 2 hours'}
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
};

// Activity timeline section
const ActivitySection = ({ vendor }) => {
  const activities = [
    {
      id: 1,
      type: 'verification',
      message: 'Verification approved',
      timestamp: vendor.verificationDate || '2024-01-15T10:30:00Z',
      icon: CheckCircle,
      color: 'text-mint-fresh'
    },
    {
      id: 2,
      type: 'profile',
      message: 'Profile updated',
      timestamp: '2024-01-10T14:20:00Z',
      icon: Edit3,
      color: 'text-sage-green'
    },
    {
      id: 3,
      type: 'registration',
      message: 'Account created',
      timestamp: vendor.createdAt,
      icon: User,
      color: 'text-muted-olive'
    }
  ];

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-text-dark mb-4">Recent Activity</h3>
      <div className="space-y-4">
        {activities.map((activity) => {
          const IconComponent = activity.icon;
          return (
            <div key={activity.id} className="flex items-start gap-3">
              <div className={`w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center ${activity.color}`}>
                <IconComponent className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-dark">{activity.message}</p>
                <p className="text-xs text-text-muted">
                  {new Date(activity.timestamp).toLocaleDateString()} at {new Date(activity.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

const VendorProfileModal = ({ vendor, isOpen, onClose, onVendorUpdate }) => {
  const { isDarkMode } = useTheme();
  const [activeSection, setActiveSection] = useState('business');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [updateVendor] = useUpdateVendorMutation();
  
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isDirty }
  } = useForm({
    defaultValues: {
      businessName: vendor?.businessName || '',
      businessType: vendor?.businessType || '',
      businessDescription: vendor?.businessDescription || '',
      ownerName: vendor?.ownerName || '',
      phone: vendor?.phone || '',
      email: vendor?.email || '',
      address: {
        street: vendor?.address?.street || '',
        city: vendor?.address?.city || '',
        state: vendor?.address?.state || '',
        zipCode: vendor?.address?.zipCode || ''
      }
    }
  });

  useEffect(() => {
    if (vendor && isOpen) {
      reset({
        businessName: vendor.businessName || '',
        businessType: vendor.businessType || '',
        businessDescription: vendor.businessDescription || '',
        ownerName: vendor.ownerName || '',
        phone: vendor.phone || '',
        email: vendor.email || '',
        address: {
          street: vendor.address?.street || '',
          city: vendor.address?.city || '',
          state: vendor.address?.state || '',
          zipCode: vendor.address?.zipCode || ''
        }
      });
    }
  }, [vendor, isOpen, reset]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await updateVendor({
        vendorId: vendor.id,
        updates: data
      }).unwrap();
      
      toast.success('Vendor profile updated successfully');
      onVendorUpdate?.();
      onClose();
    } catch (error) {
      toast.error(`Failed to update vendor: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (isDirty && !window.confirm('You have unsaved changes. Are you sure you want to close?')) {
      return;
    }
    onClose();
  };

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'business':
        return <BusinessInfoForm vendor={vendor} register={register} errors={errors} watch={watch} setValue={setValue} />;
      case 'contact':
        return <ContactInfoForm vendor={vendor} register={register} errors={errors} />;
      case 'documents':
        return <DocumentsSection vendor={vendor} />;
      case 'performance':
        return <PerformanceSection vendor={vendor} />;
      case 'activity':
        return <ActivitySection vendor={vendor} />;
      default:
        return null;
    }
  };

  if (!isOpen || !vendor) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/30 backdrop-blur-md"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative glass-5 rounded-3xl shadow-depth-5 w-full max-w-6xl max-h-[90vh] 
                      border animate-scale-in flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-bottle-green via-sage-green to-mint-fresh 
                            flex items-center justify-center shadow-lg text-white">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-text-dark dark:text-dark-text-primary">
                {vendor.businessName}
              </h2>
              <p className="text-sm text-text-muted">
                Owner: {vendor.ownerName}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <StatusBadge status={vendor.verificationStatus} variant="glass" />
            <button 
              onClick={handleClose}
              className="glass-2 p-2 rounded-xl hover:glass-3 transition-all duration-200 
                         focus:outline-none focus:ring-2 focus:ring-muted-olive/30"
            >
              <X className="w-5 h-5 text-text-muted" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Section Navigation */}
          <div className="w-64 p-6 border-r border-white/10 flex-shrink-0 overflow-y-auto">
            <nav className="space-y-2">
              {PROFILE_SECTIONS.map(section => {
                const IconComponent = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium 
                               transition-all duration-200 ${
                                 activeSection === section.id
                                   ? 'bg-muted-olive text-white shadow-glow-olive'
                                   : 'text-text-dark dark:text-dark-text-primary hover:bg-gray-100 dark:hover:bg-gray-700'
                               }`}
                  >
                    <IconComponent className="w-4 h-4" />
                    {section.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Section Content */}
          <div className="flex-1 overflow-y-auto">
            <form onSubmit={handleSubmit(onSubmit)} className="p-6">
              {renderSectionContent()}
              
              {/* Form Actions */}
              {(activeSection === 'business' || activeSection === 'contact') && (
                <div className="flex items-center justify-end gap-3 pt-6 mt-6 border-t border-white/10 sticky bottom-0 
                               bg-white/80 dark:bg-dark-bg/80 backdrop-blur-sm">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClose}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting || !isDirty}
                    className="bg-gradient-to-r from-muted-olive to-sage-green text-white"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorProfileModal;