import React, { useState, useEffect } from 'react';
import { X, DollarSign, Target, Plus, Trash2, Edit2 } from 'lucide-react';
import Button from '../ui/Button';
import { useUpdateRestaurantBudgetMutation } from '../../store/slices/apiSlice';

const BudgetEditModal = ({ isOpen, onClose, onSuccess, budget }) => {
  const [updateBudget, { isLoading }] = useUpdateRestaurantBudgetMutation();

  const [formData, setFormData] = useState({
    totalBudgetLimit: '',
    categoryLimits: [],
    status: 'active',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (budget && isOpen) {
      setFormData({
        totalBudgetLimit: budget.totalBudgetLimit || '',
        categoryLimits: budget.categoryLimits || [],
        status: budget.status || 'active',
      });
    }
  }, [budget, isOpen]);

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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!budget?._id) {
      setErrors({ submit: 'Budget ID is missing' });
      return;
    }

    try {
      const budgetData = {
        budgetId: budget._id,
        totalBudgetLimit: parseFloat(formData.totalBudgetLimit),
        status: formData.status,
      };

      if (formData.categoryLimits.length > 0) {
        budgetData.categoryLimits = formData.categoryLimits
          .filter((cat) => cat.categoryId && cat.budgetLimit)
          .map((cat) => ({
            categoryId: cat.categoryId,
            budgetLimit: parseFloat(cat.budgetLimit),
          }));
      }

      await updateBudget(budgetData).unwrap();

      if (onSuccess) {
        onSuccess();
      }

      onClose();
    } catch (error) {
      console.error('Failed to update budget:', error);
      setErrors({ submit: error?.data?.message || 'Failed to update budget. Please try again.' });
    }
  };

  if (!isOpen || !budget) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="glass-layer-2 dark:glass-2-dark rounded-3xl shadow-organic dark:shadow-dark-glass max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-secondary rounded-2xl flex items-center justify-center">
              <Edit2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-text-dark dark:text-dark-text-primary">
                Edit Budget
              </h2>
              <p className="text-sm text-text-muted dark:text-dark-text-muted">
                Update spending limits for {budget.budgetPeriod} budget
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
          {/* Budget Period Info (Read-only) */}
          <div className="p-4 bg-sage-green/5 rounded-xl border border-sage-green/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-muted">Budget Period</p>
                <p className="font-semibold text-text-dark dark:text-dark-text-primary capitalize">
                  {budget.budgetPeriod} - {budget.year}
                  {budget.month && ` (Month: ${budget.month})`}
                  {budget.quarter && ` (Q${budget.quarter})`}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-text-muted">Current Status</p>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                    budget.status === 'active'
                      ? 'bg-sage-green/10 text-sage-green'
                      : budget.status === 'draft'
                        ? 'bg-gray-100 text-gray-600'
                        : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {budget.status}
                </span>
              </div>
            </div>
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

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-text-dark dark:text-dark-text-primary mb-2">
              <Target className="w-4 h-4 inline mr-1" />
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-text-dark dark:text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-sage-green/20 transition-all"
            >
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="expired">Expired</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          {/* Category Limits */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-text-dark dark:text-dark-text-primary">
                Category Limits
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

            {formData.categoryLimits.length === 0 ? (
              <div className="text-center py-8 text-text-muted dark:text-dark-text-muted bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                <p className="text-sm">No category limits set. Click "Add Category" to set limits.</p>
              </div>
            ) : (
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
            )}
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
              {isLoading ? 'Updating...' : 'Update Budget'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BudgetEditModal;
