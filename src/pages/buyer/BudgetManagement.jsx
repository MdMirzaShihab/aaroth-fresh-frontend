import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Target,
  Plus,
  Edit,
  TrendingUp,
  TrendingDown,
  Calendar,
  DollarSign,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { selectAuth } from '../../store/slices/authSlice';
import { useGetBuyerBudgetQuery } from '../../store/slices/apiSlice';
import { formatCurrency } from '../../utils';
import Button from '../../components/ui/Button';
import BudgetCreationModal from '../../components/buyer/BudgetCreationModal';
import BudgetEditModal from '../../components/buyer/BudgetEditModal';

const BudgetManagement = () => {
  const { user } = useSelector(selectAuth);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  // Fetch budget data
  const { data: budgetData, isLoading, refetch } = useGetBuyerBudgetQuery(
    { period: selectedPeriod },
    { skip: !user }
  );

  const budget = budgetData?.data || {};
  const budgets = budgetData?.data?.budgets || [];
  const currentBudget = budgetData?.data || {};

  const handleEditBudget = (budget) => {
    setSelectedBudget(budget);
    setIsEditModalOpen(true);
  };

  const handleSuccess = () => {
    refetch();
  };

  const getBudgetStatus = (used, total) => {
    if (total === 0) return 'none';
    const percentage = (used / total) * 100;
    if (percentage >= 100) return 'exceeded';
    if (percentage >= 90) return 'warning';
    if (percentage >= 75) return 'caution';
    return 'healthy';
  };

  const budgetStatus = getBudgetStatus(currentBudget.used || 0, currentBudget.total || 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-sage-green/5 via-white to-muted-olive/5 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-light text-text-dark dark:text-dark-text-primary tracking-wide mb-2">
              Budget Management
            </h1>
            <p className="text-text-muted dark:text-dark-text-muted font-light">
              Track and manage your buyer spending limits
            </p>
          </div>
          {user?.role === 'buyerOwner' && (
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-gradient-secondary text-white hover:shadow-glow-green"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Budget
            </Button>
          )}
        </div>

        {/* Period Selector */}
        <div className="glass-layer-1 dark:glass-1-dark rounded-3xl p-6 mb-8 shadow-organic animate-fade-in">
          <h2 className="text-lg font-medium text-text-dark dark:text-dark-text-primary mb-4">
            <Calendar className="w-5 h-5 inline mr-2" />
            Budget Period
          </h2>
          <div className="flex gap-3">
            {['month', 'quarter', 'year'].map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`px-4 py-2 rounded-xl transition-all duration-200 ${
                  selectedPeriod === period
                    ? 'bg-gradient-secondary text-white shadow-glow-green'
                    : 'glass-layer-1 dark:glass-1-dark text-text-dark dark:text-dark-text-primary hover:glass-layer-2'
                }`}
              >
                {period === 'month' ? 'Monthly' : period === 'quarter' ? 'Quarterly' : 'Yearly'}
              </button>
            ))}
          </div>
        </div>

        {/* Current Budget Overview */}
        {isLoading ? (
          <div className="glass-layer-1 dark:glass-1-dark rounded-3xl p-6 mb-8 animate-pulse">
            <div className="h-48 bg-gray-200 rounded-2xl"></div>
          </div>
        ) : currentBudget.total > 0 ? (
          <div className="glass-layer-2 dark:glass-2-dark rounded-3xl p-8 mb-8 shadow-organic animate-fade-in">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-semibold text-text-dark dark:text-dark-text-primary mb-2">
                  Current Budget
                </h2>
                <p className="text-text-muted dark:text-dark-text-muted capitalize">
                  {currentBudget.budgetPeriod} Budget - {currentBudget.year}
                  {currentBudget.month && ` (Month: ${currentBudget.month})`}
                  {currentBudget.quarter && ` (Q${currentBudget.quarter})`}
                </p>
              </div>
              {user?.role === 'buyerOwner' && (
                <button
                  onClick={() => handleEditBudget(currentBudget)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl glass-layer-1 dark:glass-1-dark hover:glass-layer-2 transition-all duration-200 text-text-dark dark:text-dark-text-primary"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
              )}
            </div>

            {/* Budget Progress */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-3">
                <div>
                  <p className="text-sm text-text-muted dark:text-dark-text-muted">Spent</p>
                  <p className="text-3xl font-bold text-text-dark dark:text-dark-text-primary">
                    {formatCurrency(currentBudget.used || 0)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-text-muted dark:text-dark-text-muted">Budget Limit</p>
                  <p className="text-3xl font-bold text-text-dark dark:text-dark-text-primary">
                    {formatCurrency(currentBudget.total || 0)}
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 mb-2">
                <div
                  className={`h-4 rounded-full transition-all duration-500 ${
                    budgetStatus === 'exceeded'
                      ? 'bg-red-500'
                      : budgetStatus === 'warning'
                        ? 'bg-amber-500'
                        : budgetStatus === 'caution'
                          ? 'bg-yellow-500'
                          : 'bg-sage-green'
                  }`}
                  style={{
                    width: `${Math.min((currentBudget.percentage || 0), 100)}%`,
                  }}
                ></div>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-sm text-text-muted dark:text-dark-text-muted">
                  {currentBudget.percentage?.toFixed(1) || 0}% used
                </p>
                <p className="text-sm font-medium text-text-dark dark:text-dark-text-primary">
                  {formatCurrency((currentBudget.total || 0) - (currentBudget.used || 0))} remaining
                </p>
              </div>
            </div>

            {/* Status Alert */}
            {budgetStatus === 'exceeded' && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-4 mb-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-red-800 dark:text-red-400">Budget Exceeded</p>
                    <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                      You have exceeded your budget limit by {formatCurrency((currentBudget.used || 0) - (currentBudget.total || 0))}. Consider reviewing your spending or adjusting your budget.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {budgetStatus === 'warning' && (
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 mb-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-amber-800 dark:text-amber-400">Approaching Budget Limit</p>
                    <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                      You've used over 90% of your budget. Only {formatCurrency((currentBudget.total || 0) - (currentBudget.used || 0))} remaining.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {budgetStatus === 'healthy' && (
              <div className="bg-sage-green/10 border border-sage-green/20 rounded-2xl p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-sage-green flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-sage-green">Budget On Track</p>
                    <p className="text-sm text-sage-green/80 mt-1">
                      Your spending is within budget limits. Keep up the good work!
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Category Breakdown */}
            {currentBudget.categoryLimits && currentBudget.categoryLimits.length > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-text-dark dark:text-dark-text-primary mb-4">
                  Category Breakdown
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentBudget.categoryLimits.map((category, index) => (
                    <div
                      key={index}
                      className="p-4 rounded-xl glass-layer-1 dark:glass-1-dark"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <p className="font-medium text-text-dark dark:text-dark-text-primary">
                          {category.categoryName || category.categoryId}
                        </p>
                        <p className="text-sm text-text-muted dark:text-dark-text-muted">
                          {formatCurrency(category.spent || 0)} / {formatCurrency(category.budgetLimit)}
                        </p>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="h-2 rounded-full bg-sage-green transition-all duration-500"
                          style={{
                            width: `${Math.min(((category.spent || 0) / category.budgetLimit) * 100, 100)}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="glass-layer-1 dark:glass-1-dark rounded-3xl p-12 text-center mb-8">
            <Target className="w-16 h-16 text-text-muted dark:text-dark-text-muted mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-text-dark dark:text-dark-text-primary mb-2">
              No Budget Set
            </h3>
            <p className="text-text-muted dark:text-dark-text-muted mb-6">
              Create a budget to track and manage your buyer spending
            </p>
            {user?.role === 'buyerOwner' && (
              <Button
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-gradient-secondary text-white hover:shadow-glow-green"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Budget
              </Button>
            )}
          </div>
        )}

        {/* Budget History (if available) */}
        {budgets.length > 0 && (
          <div className="glass-layer-1 dark:glass-1-dark rounded-3xl p-6 shadow-organic animate-fade-in">
            <h2 className="text-lg font-medium text-text-dark dark:text-dark-text-primary mb-4">
              Budget History
            </h2>
            <div className="space-y-3">
              {budgets.slice(0, 5).map((budget) => (
                <div
                  key={budget._id}
                  className="p-4 rounded-xl glass-layer-2 dark:glass-2-dark hover:shadow-glow-green/10 transition-all duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-text-dark dark:text-dark-text-primary capitalize">
                        {budget.budgetPeriod} - {budget.year}
                        {budget.month && ` (Month: ${budget.month})`}
                        {budget.quarter && ` (Q${budget.quarter})`}
                      </p>
                      <p className="text-sm text-text-muted dark:text-dark-text-muted">
                        {formatCurrency(budget.used || 0)} / {formatCurrency(budget.total || 0)}
                      </p>
                    </div>
                    <div className="text-right">
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
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <BudgetCreationModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleSuccess}
      />
      <BudgetEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={handleSuccess}
        budget={selectedBudget}
      />
    </div>
  );
};

export default BudgetManagement;
