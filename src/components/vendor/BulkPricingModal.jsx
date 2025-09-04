import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  DollarSign,
  Percent,
  Calculator,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Settings,
} from 'lucide-react';
import { Card } from '../ui/Card';
import Button from '../ui/Button';
import FormField from '../ui/FormField';
import { useBulkPricingUpdateMutation } from '../../store/slices/vendor/vendorListingsApi';

const BulkPricingModal = ({ 
  isOpen, 
  onClose, 
  selectedListings = [],
  onSuccess 
}) => {
  const [updateType, setUpdateType] = useState('percentage');
  const [pricingData, setPricingData] = useState({
    percentage: 5.0,
    fixedAmount: 0,
    applyTo: 'selling',
    category: '',
    minCurrentPrice: '',
    maxCurrentPrice: '',
  });
  const [individualUpdates, setIndividualUpdates] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewData, setPreviewData] = useState(null);

  const [bulkPricingUpdate] = useBulkPricingUpdateMutation();

  const handlePreview = () => {
    // Calculate preview based on selected listings and pricing rules
    const preview = selectedListings.map(listing => {
      let newPrice = listing.price.selling;
      
      if (updateType === 'percentage') {
        const multiplier = 1 + (pricingData.percentage / 100);
        newPrice = listing.price.selling * multiplier;
      } else if (updateType === 'fixed') {
        newPrice = listing.price.selling + parseFloat(pricingData.fixedAmount || 0);
      }
      
      return {
        ...listing,
        oldPrice: listing.price.selling,
        newPrice: Math.max(0.01, newPrice), // Ensure minimum price
        increase: newPrice - listing.price.selling,
        percentageIncrease: ((newPrice - listing.price.selling) / listing.price.selling) * 100,
      };
    });
    
    setPreviewData(preview);
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      
      const updatePayload = {
        updateType,
        updates: updateType === 'individual' 
          ? { individualUpdates }
          : {
              percentage: updateType === 'percentage' ? pricingData.percentage : undefined,
              fixedAmount: updateType === 'fixed' ? parseFloat(pricingData.fixedAmount) : undefined,
              applyTo: pricingData.applyTo,
              category: pricingData.category || undefined,
              minCurrentPrice: pricingData.minCurrentPrice ? parseFloat(pricingData.minCurrentPrice) : undefined,
              maxCurrentPrice: pricingData.maxCurrentPrice ? parseFloat(pricingData.maxCurrentPrice) : undefined,
            }
      };

      const result = await bulkPricingUpdate(updatePayload).unwrap();
      
      onSuccess?.(result);
      onClose();
    } catch (error) {
      // Error will be handled by the mutation hook
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalImpact = previewData?.reduce((sum, item) => sum + item.increase, 0) || 0;
  const avgIncrease = previewData?.length > 0 ? totalImpact / previewData.length : 0;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-4xl max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <Card className="glass">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-2xl bg-earthy-yellow/10">
                  <Calculator className="w-5 h-5 text-earthy-yellow" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-text-dark">
                    Bulk Price Update
                  </h2>
                  <p className="text-text-muted text-sm">
                    Update prices for {selectedListings.length} selected listings
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-2xl hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5 text-text-muted" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Update Type Selection */}
              <div>
                <label className="block text-sm font-medium text-text-dark mb-3">
                  Update Method
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    {
                      id: 'percentage',
                      icon: Percent,
                      title: 'Percentage Change',
                      desc: 'Increase/decrease by percentage',
                    },
                    {
                      id: 'fixed',
                      icon: DollarSign,
                      title: 'Fixed Amount',
                      desc: 'Add/subtract fixed amount',
                    },
                    {
                      id: 'individual',
                      icon: Settings,
                      title: 'Individual Prices',
                      desc: 'Set specific prices per item',
                    },
                  ].map((method) => (
                    <button
                      key={method.id}
                      onClick={() => setUpdateType(method.id)}
                      className={`p-4 rounded-2xl border text-left transition-all ${
                        updateType === method.id
                          ? 'border-muted-olive/50 bg-muted-olive/10 text-muted-olive'
                          : 'border-white/20 bg-white/5 hover:bg-white/10'
                      }`}
                    >
                      <method.icon className="w-5 h-5 mb-2" />
                      <div className="font-medium text-sm">{method.title}</div>
                      <div className="text-xs text-text-muted">{method.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Percentage Update */}
              {updateType === 'percentage' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    label="Percentage Change (%)"
                    type="number"
                    step="0.1"
                    value={pricingData.percentage}
                    onChange={(e) => setPricingData(prev => ({ 
                      ...prev, 
                      percentage: parseFloat(e.target.value) || 0 
                    }))}
                    placeholder="e.g., 5 for +5% or -5 for -5%"
                    helperText="Positive for increase, negative for decrease"
                  />
                  <FormField
                    label="Apply To"
                    type="select"
                    value={pricingData.applyTo}
                    onChange={(e) => setPricingData(prev => ({ ...prev, applyTo: e.target.value }))}
                    options={[
                      { value: 'selling', label: 'Selling Price' },
                      { value: 'minimum', label: 'Minimum Price' },
                      { value: 'bulk', label: 'Bulk Price' },
                      { value: 'all', label: 'All Prices' },
                    ]}
                  />
                </div>
              )}

              {/* Fixed Amount Update */}
              {updateType === 'fixed' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    label="Fixed Amount (BDT)"
                    type="number"
                    step="0.01"
                    value={pricingData.fixedAmount}
                    onChange={(e) => setPricingData(prev => ({ 
                      ...prev, 
                      fixedAmount: e.target.value 
                    }))}
                    placeholder="e.g., 10 for +10 BDT or -5 for -5 BDT"
                    helperText="Positive to increase, negative to decrease"
                  />
                  <FormField
                    label="Apply To"
                    type="select"
                    value={pricingData.applyTo}
                    onChange={(e) => setPricingData(prev => ({ ...prev, applyTo: e.target.value }))}
                    options={[
                      { value: 'selling', label: 'Selling Price' },
                      { value: 'minimum', label: 'Minimum Price' },
                      { value: 'bulk', label: 'Bulk Price' },
                      { value: 'all', label: 'All Prices' },
                    ]}
                  />
                </div>
              )}

              {/* Price Range Filters */}
              {updateType !== 'individual' && (
                <div>
                  <h3 className="text-lg font-medium text-text-dark mb-3">
                    Optional Filters
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      label="Category Filter"
                      type="text"
                      value={pricingData.category}
                      onChange={(e) => setPricingData(prev => ({ ...prev, category: e.target.value }))}
                      placeholder="e.g., Vegetables"
                      helperText="Leave empty to apply to all categories"
                    />
                    <FormField
                      label="Min Current Price (BDT)"
                      type="number"
                      step="0.01"
                      value={pricingData.minCurrentPrice}
                      onChange={(e) => setPricingData(prev => ({ ...prev, minCurrentPrice: e.target.value }))}
                      placeholder="e.g., 20"
                      helperText="Only items above this price"
                    />
                    <FormField
                      label="Max Current Price (BDT)"
                      type="number"
                      step="0.01"
                      value={pricingData.maxCurrentPrice}
                      onChange={(e) => setPricingData(prev => ({ ...prev, maxCurrentPrice: e.target.value }))}
                      placeholder="e.g., 100"
                      helperText="Only items below this price"
                    />
                  </div>
                </div>
              )}

              {/* Preview Section */}
              {previewData && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-text-dark">
                      Price Update Preview
                    </h3>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-sage-green" />
                        <span className="text-text-muted">
                          Avg Change: ±{Math.abs(avgIncrease).toFixed(2)} BDT
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-earthy-yellow" />
                        <span className="text-text-muted">
                          Total Impact: ±{Math.abs(totalImpact).toFixed(2)} BDT
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="max-h-64 overflow-y-auto rounded-2xl border border-white/20">
                    <table className="w-full">
                      <thead className="bg-white/5 border-b border-white/10">
                        <tr>
                          <th className="text-left p-3 text-sm font-medium text-text-muted">
                            Product
                          </th>
                          <th className="text-right p-3 text-sm font-medium text-text-muted">
                            Current Price
                          </th>
                          <th className="text-right p-3 text-sm font-medium text-text-muted">
                            New Price
                          </th>
                          <th className="text-right p-3 text-sm font-medium text-text-muted">
                            Change
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {previewData.map((item, index) => (
                          <tr key={index} className="border-b border-white/5 hover:bg-white/5">
                            <td className="p-3">
                              <div className="font-medium text-text-dark truncate">
                                {item.title}
                              </div>
                              <div className="text-xs text-text-muted">
                                {item.productId?.category}
                              </div>
                            </td>
                            <td className="text-right p-3 text-text-dark font-medium">
                              ৳{item.oldPrice.toFixed(2)}
                            </td>
                            <td className="text-right p-3 text-text-dark font-medium">
                              ৳{item.newPrice.toFixed(2)}
                            </td>
                            <td className="text-right p-3">
                              <span className={`flex items-center gap-1 justify-end ${
                                item.increase >= 0 ? 'text-sage-green' : 'text-tomato-red'
                              }`}>
                                {item.increase >= 0 ? (
                                  <TrendingUp className="w-3 h-3" />
                                ) : (
                                  <TrendingDown className="w-3 h-3" />
                                )}
                                {item.increase >= 0 ? '+' : ''}৳{item.increase.toFixed(2)}
                                <span className="text-xs ml-1">
                                  ({item.percentageIncrease > 0 ? '+' : ''}{item.percentageIncrease.toFixed(1)}%)
                                </span>
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-between items-center pt-4">
                <div className="flex items-center gap-2 text-sm text-text-muted">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Changes will be applied immediately to all selected listings</span>
                </div>
                
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={onClose}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  
                  {!previewData ? (
                    <Button
                      onClick={handlePreview}
                      disabled={isSubmitting}
                      className="bg-muted-olive hover:bg-muted-olive/90 text-white"
                    >
                      Preview Changes
                    </Button>
                  ) : (
                    <Button
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="bg-sage-green hover:bg-sage-green/90 text-white"
                    >
                      {isSubmitting ? 'Updating...' : 'Apply Changes'}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default BulkPricingModal;