import React, { useState } from 'react';
import { X, DollarSign, Calendar, Target, Plus, Trash2 } from 'lucide-react';
import Button from '../ui/Button';
import { useCreateBuyerBudgetMutation } from '../../store/slices/apiSlice';

const BudgetCreationModal = ({ isOpen, onClose, onSuccess }) => {
  const [createBudget, { isLoading }] = useCreateBuyerBudgetMutation();

  const [formData, setFormData] = useState({
    budgetPeriod: 'monthly',
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    quarter: 1,
    totalBudgetLimit: '',
    categoryLimits: [],
  });

  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleAddCategory = () => {
    setFormData((prev) => ({
      ...prev,
      categoryLimits: [
        ...prev.categoryLimits,
        { categoryId: '', budgetLimit: '' },
      ],
    }));
  };

  const handleRemoveCategory = (index) => {
    setFormData((prev) => ({
      ...prev,
      categoryLimits: prev.categoryLimits.filter((_, i) => i !== index),
    }));
  };

  const handleCategoryChange = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      categoryLimits: prev.categoryLimits.map((cat, i) =>
        i === index ? { ...cat, [field]: value } : cat
      ),
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.totalBudgetLimit || formData.totalBudgetLimit <= 0) {
      newErrors.totalBudgetLimit = 'Total budget limit must be greater than 0';
    }

    if (formData.budgetPeriod === 'monthly' && (!formData.month || formData.month < 1 || formData.month > 12)) {
      newErrors.month = 'Month must be between 1 and 12';
    }

    if (formData.budgetPeriod === 'quarterly' && (!formData.quarter || formData.quarter < 1 || formData.quarter > 4)) {
      newErrors.quarter = 'Quarter must be between 1 and 4';
    }

    if (!formData.year || formData.year < 2020) {
      newErrors.year = 'Please enter a valid year';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const budgetData = {
        budgetPeriod: formData.budgetPeriod,
        year: parseInt(formData.year),
        totalBudgetLimit: parseFloat(formData.totalBudgetLimit),
      };

      if (formData.budgetPeriod === 'monthly') {
        budgetData.month = parseInt(formData.month);
      } else if (formData.budgetPeriod === 'quarterly') {
        budgetData.quarter = parseInt(formData.quarter);
      }

      if (formData.categoryLimits.length > 0) {
        budgetData.categoryLimits = formData.categoryLimits
          .filter((cat) => cat.categoryId && cat.budgetLimit)
          .map((cat) => ({
            categoryId: cat.categoryId,
            budgetLimit: parseFloat(cat.budgetLimit),
          }));
      }

      await createBudget(budgetData).unwrap();

      if (onSuccess) {
        onSuccess();
      }

      onClose();
    } catch (error) {
      console.error('Failed to create budget:', error);
      setErrors({ submit: error?.data?.message || 'Failed to create budget. Please try again.' });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="glass-layer-2 dark:glass-2-dark rounded-3xl shadow-organic dark:shadow-dark-glass max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-secondary rounded-2xl flex items-center justify-center">
              <Target className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-text-dark dark:text-dark-text-primary">
                Create Budget
              </h2>
              <p className="text-sm text-text-muted dark:text-dark-text-muted">
                Set spending limits for your buyer
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5 text-text-muted" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Budget Period */}
          <div>
            <label className="block text-sm font-medium text-text-dark dark:text-dark-text-primary mb-2">
              Budget Period
            </label>
            <select
              name="budgetPeriod"
              value={formData.budgetPeriod}
              onChange={handleInputChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-text-dark dark:text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-sage-green/20 transition-all"
            >
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>

          {/* Year and Month/Quarter */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-dark dark:text-dark-text-primary mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Year
              </label>
              <input
                type="number"
                name="year"
                value={formData.year}
                onChange={handleInputChange}
                min="2020"
                max="2050"
                className={`w-full px-4 py-3 rounded-xl border ${
                  errors.year ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'
                } bg-white dark:bg-gray-800 text-text-dark dark:text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-sage-green/20 transition-all`}
              />
              {errors.year && (
                <p className="text-red-500 text-sm mt-1">{errors.year}</p>
              )}
            </div>

            {formData.budgetPeriod === 'monthly' && (
              <div>
                <label className="block text-sm font-medium text-text-dark dark:text-dark-text-primary mb-2">
                  Month
                </label>
                <input
                  type="number"
                  name="month"
                  value={formData.month}
                  onChange={handleInputChange}
                  min="1"
                  max="12"
                  className={`w-full px-4 py-3 rounded-xl border ${
                    errors.month ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'
                  } bg-white dark:bg-gray-800 text-text-dark dark:text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-sage-green/20 transition-all`}
                />
                {errors.month && (
                  <p className="text-red-500 text-sm mt-1">{errors.month}</p>
                )}
              </div>
            )}

            {formData.budgetPeriod === 'quarterly' && (
              <div>
                <label className="block text-sm font-medium text-text-dark dark:text-dark-text-primary mb-2">
                  Quarter
                </label>
                <select
                  name="quarter"
                  value={formData.quarter}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 rounded-xl border ${
                    errors.quarter ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'
                  } bg-white dark:bg-gray-800 text-text-dark dark:text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-sage-green/20 transition-all`}
                >
                  <option value="1">Q1 (Jan-Mar)</option>
                  <option value="2">Q2 (Apr-Jun)</option>
                  <option value="3">Q3 (Jul-Sep)</option>
                  <option value="4">Q4 (Oct-Dec)</option>
                </select>
                {errors.quarter && (
                  <p className="text-red-500 text-sm mt-1">{errors.quarter}</p>
                )}
              </div>
            )}
          </div>

          {/* Total Budget Limit */}
          <div>
            <label className="block text-sm font-medium text-text-dark dark:text-dark-text-primary mb-2">
              <DollarSign className="w-4 h-4 inline mr-1" />
              Total Budget Limit (₹)
            </label>
            <input
              type="number"
              name="totalBudgetLimit"
              value={formData.totalBudgetLimit}
              onChange={handleInputChange}
              placeholder="e.g., 50000"
              min="0"
              step="0.01"
              className={`w-full px-4 py-3 rounded-xl border ${
                errors.totalBudgetLimit ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'
              } bg-white dark:bg-gray-800 text-text-dark dark:text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-sage-green/20 transition-all`}
            />
            {errors.totalBudgetLimit && (
              <p className="text-red-500 text-sm mt-1">{errors.totalBudgetLimit}</p>
            )}
          </div>

          {/* Category Limits (Optional) */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-text-dark dark:text-dark-text-primary">
                Category Limits (Optional)
              </label>
              <button
                type="button"
                onClick={handleAddCategory}
                className="flex items-center gap-1 text-sm text-sage-green hover:text-sage-green/80 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Category
              </button>
            </div>

            <div className="space-y-3">
              {formData.categoryLimits.map((category, index) => (
                <div key={index} className="flex gap-3">
                  <input
                    type="text"
                    placeholder="Category ID"
                    value={category.categoryId}
                    onChange={(e) =>
                      handleCategoryChange(index, 'categoryId', e.target.value)
                    }
                    className="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-text-dark dark:text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-sage-green/20 transition-all"
                  />
                  <input
                    type="number"
                    placeholder="Budget Limit"
                    value={category.budgetLimit}
                    onChange={(e) =>
                      handleCategoryChange(index, 'budgetLimit', e.target.value)
                    }
                    min="0"
                    step="0.01"
                    className="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-text-dark dark:text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-sage-green/20 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveCategory(index)}
                    className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Error Message */}
          {errors.submit && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
              <p className="text-red-600 dark:text-red-400 text-sm">{errors.submit}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="flex-1"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-secondary text-white hover:shadow-glow-green"
              disabled={isLoading}
            >
              {isLoading ? 'Creating...' : 'Create Budget'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BudgetCreationModal;
