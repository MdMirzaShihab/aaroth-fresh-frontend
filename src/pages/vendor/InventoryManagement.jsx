import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Package,
  Plus,
  Edit3,
  Trash2,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Search,
  Filter,
  Download,
  Upload,
  History,
  BarChart3,
} from 'lucide-react';
import {
  useGetInventoryOverviewQuery,
  useGetInventoryItemQuery,
  useCreateInventoryItemMutation,
  useUpdateInventoryItemMutation,
  useDeleteInventoryItemMutation,
  useAdjustStockMutation,
  useGetLowStockAlertsQuery,
  useGetInventoryAnalyticsQuery,
  useGetInventoryValuationQuery,
  useGetPurchaseHistoryQuery,
  useRecordPurchaseMutation,
  useBulkUpdateInventoryMutation,
  useExportInventoryMutation,
} from '../../store/slices/vendor/vendorInventoryApi';
import { selectAuth } from '../../store/slices/authSlice';
import { addNotification } from '../../store/slices/notificationSlice';
import { useDispatch } from 'react-redux';
import { formatCurrency, timeAgo } from '../../utils';

// Components
import { Card } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Table from '../../components/ui/Table';
import { KPICard } from '../../components/dashboard';

const InventoryManagement = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(selectAuth);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [view, setView] = useState('overview'); // overview, items, analytics, purchases
  const [newItem, setNewItem] = useState({
    name: '',
    category: '',
    unit: '',
    currentStock: 0,
    minStockLevel: 0,
    maxStockLevel: 0,
    unitCost: 0,
    supplierInfo: '',
  });
  const [stockAdjustment, setStockAdjustment] = useState({
    adjustmentType: 'add',
    quantity: 0,
    reason: '',
    notes: '',
  });
  const [newPurchase, setNewPurchase] = useState({
    items: [],
    supplier: '',
    totalCost: 0,
    notes: '',
  });

  // API Queries
  const { data: inventoryOverview, isLoading: overviewLoading } = useGetInventoryOverviewQuery({
    search: searchTerm,
    status: filterStatus,
    sortBy,
    sortOrder,
  });

  const { data: lowStockAlerts, isLoading: alertsLoading } = useGetLowStockAlertsQuery({
    limit: 10,
  });

  const { data: inventoryAnalytics, isLoading: analyticsLoading } = useGetInventoryAnalyticsQuery({
    period: 'month',
  });

  const { data: inventoryValuation, isLoading: valuationLoading } = useGetInventoryValuationQuery({});

  const { data: purchaseHistory, isLoading: purchaseLoading } = useGetPurchaseHistoryQuery({
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  // Mutations
  const [createInventoryItem, { isLoading: creating }] = useCreateInventoryItemMutation();
  const [updateInventoryItem, { isLoading: updating }] = useUpdateInventoryItemMutation();
  const [deleteInventoryItem, { isLoading: deleting }] = useDeleteInventoryItemMutation();
  const [adjustStock, { isLoading: adjusting }] = useAdjustStockMutation();
  const [recordPurchase, { isLoading: recordingPurchase }] = useRecordPurchaseMutation();
  const [bulkUpdate, { isLoading: bulkUpdating }] = useBulkUpdateInventoryMutation();
  const [exportInventory, { isLoading: exporting }] = useExportInventoryMutation();

  const handleCreateItem = async () => {
    try {
      await createInventoryItem(newItem).unwrap();
      setShowCreateModal(false);
      setNewItem({
        name: '',
        category: '',
        unit: '',
        currentStock: 0,
        minStockLevel: 0,
        maxStockLevel: 0,
        unitCost: 0,
        supplierInfo: '',
      });
      dispatch(addNotification({
        type: 'success',
        message: 'Inventory item created successfully',
      }));
    } catch (error) {
      dispatch(addNotification({
        type: 'error',
        message: error.message || 'Failed to create inventory item',
      }));
    }
  };

  const handleEditItem = async () => {
    try {
      await updateInventoryItem({
        inventoryId: selectedItem.id,
        updateData: selectedItem,
      }).unwrap();
      setShowEditModal(false);
      setSelectedItem(null);
      dispatch(addNotification({
        type: 'success',
        message: 'Inventory item updated successfully',
      }));
    } catch (error) {
      dispatch(addNotification({
        type: 'error',
        message: error.message || 'Failed to update inventory item',
      }));
    }
  };

  const handleDeleteItem = async (itemId) => {
    try {
      await deleteInventoryItem(itemId).unwrap();
      dispatch(addNotification({
        type: 'success',
        message: 'Inventory item deleted successfully',
      }));
    } catch (error) {
      dispatch(addNotification({
        type: 'error',
        message: error.message || 'Failed to delete inventory item',
      }));
    }
  };

  const handleStockAdjustment = async () => {
    try {
      await adjustStock({
        inventoryId: selectedItem.id,
        adjustmentData: stockAdjustment,
      }).unwrap();
      setShowAdjustModal(false);
      setStockAdjustment({
        adjustmentType: 'add',
        quantity: 0,
        reason: '',
        notes: '',
      });
      setSelectedItem(null);
      dispatch(addNotification({
        type: 'success',
        message: 'Stock adjustment recorded successfully',
      }));
    } catch (error) {
      dispatch(addNotification({
        type: 'error',
        message: error.message || 'Failed to adjust stock',
      }));
    }
  };

  const handleRecordPurchase = async () => {
    try {
      await recordPurchase(newPurchase).unwrap();
      setShowPurchaseModal(false);
      setNewPurchase({
        items: [],
        supplier: '',
        totalCost: 0,
        notes: '',
      });
      dispatch(addNotification({
        type: 'success',
        message: 'Purchase recorded successfully',
      }));
    } catch (error) {
      dispatch(addNotification({
        type: 'error',
        message: error.message || 'Failed to record purchase',
      }));
    }
  };

  const handleExport = async () => {
    try {
      const result = await exportInventory({
        format: 'csv',
        includeHistory: true,
      }).unwrap();
      
      // Create download link
      const blob = new Blob([result.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `inventory-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      dispatch(addNotification({
        type: 'success',
        message: 'Inventory exported successfully',
      }));
    } catch (error) {
      dispatch(addNotification({
        type: 'error',
        message: error.message || 'Failed to export inventory',
      }));
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Total Items"
          value={inventoryOverview?.totalItems || 0}
          icon={Package}
          loading={overviewLoading}
          color="blue"
        />
        <KPICard
          title="Low Stock Items"
          value={lowStockAlerts?.count || 0}
          icon={AlertTriangle}
          loading={alertsLoading}
          color="orange"
          alert={lowStockAlerts?.count > 0}
        />
        <KPICard
          title="Total Value"
          value={formatCurrency(inventoryValuation?.totalValue || 0)}
          icon={DollarSign}
          loading={valuationLoading}
          color="green"
        />
        <KPICard
          title="Monthly Usage"
          value={inventoryAnalytics?.monthlyUsage || 0}
          change={inventoryAnalytics?.usageChange}
          icon={TrendingUp}
          loading={analyticsLoading}
          color="purple"
        />
      </div>

      {/* Low Stock Alerts */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-text-dark">Low Stock Alerts</h3>
          <AlertTriangle className="w-5 h-5 text-orange-500" />
        </div>
        
        {alertsLoading ? (
          <div className="animate-pulse space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {lowStockAlerts?.alerts?.map((alert, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-xl bg-amber-50/80 border border-amber-200/50"
              >
                <div>
                  <p className="text-sm font-medium text-amber-800">
                    {alert.productName}
                  </p>
                  <p className="text-xs text-amber-600">
                    Current: {alert.currentStock} | Min: {alert.minStockLevel}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={() => {
                      setSelectedItem(alert);
                      setShowAdjustModal(true);
                    }}
                    className="bg-amber-600 hover:bg-amber-700 text-white"
                  >
                    Restock
                  </Button>
                </div>
              </div>
            )) || (
              <div className="text-center py-4 text-text-muted text-sm">
                All inventory levels are healthy
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Recent Activity */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-text-dark">Recent Purchases</h3>
          <Button
            onClick={() => setShowPurchaseModal(true)}
            className="bg-gradient-secondary text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Record Purchase
          </Button>
        </div>

        {purchaseLoading ? (
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-200 rounded"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {purchaseHistory?.purchases?.map((purchase) => (
              <div
                key={purchase.id}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50"
              >
                <div>
                  <p className="font-medium text-text-dark">
                    Purchase from {purchase.supplier}
                  </p>
                  <p className="text-sm text-text-muted">
                    {purchase.items.length} items • {timeAgo(purchase.createdAt)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-text-dark">
                    {formatCurrency(purchase.totalCost)}
                  </p>
                </div>
              </div>
            )) || (
              <div className="text-center py-8 text-text-muted">
                No purchase history available
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );

  const renderItemsView = () => (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted w-4 h-4" />
            <Input
              type="text"
              placeholder="Search inventory items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Items</option>
            <option value="in_stock">In Stock</option>
            <option value="low_stock">Low Stock</option>
            <option value="out_of_stock">Out of Stock</option>
          </Select>

          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-secondary text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Item
          </Button>

          <Button
            onClick={handleExport}
            disabled={exporting}
            variant="outline"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Inventory Table */}
      <Card>
        <Table
          data={inventoryOverview?.items || []}
          loading={overviewLoading}
          columns={[
            {
              key: 'name',
              label: 'Item Name',
              render: (item) => (
                <div>
                  <p className="font-medium text-text-dark">{item.name}</p>
                  <p className="text-sm text-text-muted">{item.category}</p>
                </div>
              ),
            },
            {
              key: 'currentStock',
              label: 'Current Stock',
              render: (item) => (
                <div className="text-center">
                  <p className="font-medium">{item.currentStock} {item.unit}</p>
                  <div className={`text-xs px-2 py-1 rounded-full inline-block ${
                    item.currentStock <= item.minStockLevel
                      ? 'bg-red-100 text-red-800'
                      : item.currentStock <= item.minStockLevel * 1.5
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                  }`}>
                    {item.currentStock <= item.minStockLevel
                      ? 'Low Stock'
                      : item.currentStock <= item.minStockLevel * 1.5
                        ? 'Warning'
                        : 'Good'}
                  </div>
                </div>
              ),
            },
            {
              key: 'unitCost',
              label: 'Unit Cost',
              render: (item) => formatCurrency(item.unitCost),
            },
            {
              key: 'totalValue',
              label: 'Total Value',
              render: (item) => formatCurrency(item.currentStock * item.unitCost),
            },
            {
              key: 'actions',
              label: 'Actions',
              render: (item) => (
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedItem(item);
                      setShowEditModal(true);
                    }}
                  >
                    <Edit3 className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedItem(item);
                      setShowAdjustModal(true);
                    }}
                  >
                    <Package className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteItem(item.id)}
                    disabled={deleting}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ),
            },
          ]}
        />
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-earthy-beige via-white to-sage-green/10 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-medium text-text-dark mb-2">
                Inventory Management
              </h1>
              <p className="text-text-muted">
                Track and manage your product inventory
              </p>
            </div>

            {/* View Toggle */}
            <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-lg">
              <Button
                variant={view === 'overview' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setView('overview')}
              >
                Overview
              </Button>
              <Button
                variant={view === 'items' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setView('items')}
              >
                Items
              </Button>
              <Button
                variant={view === 'analytics' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setView('analytics')}
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Analytics
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        {view === 'overview' && renderOverview()}
        {view === 'items' && renderItemsView()}

        {/* Create Item Modal */}
        <Modal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Add New Inventory Item"
        >
          <div className="space-y-4">
            <Input
              label="Item Name"
              value={newItem.name}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              placeholder="Enter item name"
            />
            
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Category"
                value={newItem.category}
                onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                placeholder="e.g., Vegetables"
              />
              <Input
                label="Unit"
                value={newItem.unit}
                onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                placeholder="e.g., kg, pieces"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <Input
                label="Current Stock"
                type="number"
                value={newItem.currentStock}
                onChange={(e) => setNewItem({ ...newItem, currentStock: Number(e.target.value) })}
              />
              <Input
                label="Min Stock Level"
                type="number"
                value={newItem.minStockLevel}
                onChange={(e) => setNewItem({ ...newItem, minStockLevel: Number(e.target.value) })}
              />
              <Input
                label="Max Stock Level"
                type="number"
                value={newItem.maxStockLevel}
                onChange={(e) => setNewItem({ ...newItem, maxStockLevel: Number(e.target.value) })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Unit Cost"
                type="number"
                step="0.01"
                value={newItem.unitCost}
                onChange={(e) => setNewItem({ ...newItem, unitCost: Number(e.target.value) })}
              />
              <Input
                label="Supplier Info"
                value={newItem.supplierInfo}
                onChange={(e) => setNewItem({ ...newItem, supplierInfo: e.target.value })}
                placeholder="Supplier name or contact"
              />
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateItem} disabled={creating}>
                {creating ? 'Creating...' : 'Create Item'}
              </Button>
            </div>
          </div>
        </Modal>

        {/* Stock Adjustment Modal */}
        <Modal
          isOpen={showAdjustModal}
          onClose={() => setShowAdjustModal(false)}
          title={`Adjust Stock - ${selectedItem?.name}`}
        >
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-text-muted mb-2">Current Stock</p>
              <p className="text-lg font-semibold">
                {selectedItem?.currentStock} {selectedItem?.unit}
              </p>
            </div>

            <Select
              label="Adjustment Type"
              value={stockAdjustment.adjustmentType}
              onChange={(e) => setStockAdjustment({ ...stockAdjustment, adjustmentType: e.target.value })}
            >
              <option value="add">Add Stock</option>
              <option value="remove">Remove Stock</option>
              <option value="set">Set Stock Level</option>
            </Select>

            <Input
              label="Quantity"
              type="number"
              value={stockAdjustment.quantity}
              onChange={(e) => setStockAdjustment({ ...stockAdjustment, quantity: Number(e.target.value) })}
            />

            <Input
              label="Reason"
              value={stockAdjustment.reason}
              onChange={(e) => setStockAdjustment({ ...stockAdjustment, reason: e.target.value })}
              placeholder="e.g., Received shipment, Damaged goods"
            />

            <Input
              label="Notes (Optional)"
              value={stockAdjustment.notes}
              onChange={(e) => setStockAdjustment({ ...stockAdjustment, notes: e.target.value })}
              placeholder="Additional notes"
            />

            <div className="flex justify-end gap-4 pt-4">
              <Button variant="outline" onClick={() => setShowAdjustModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleStockAdjustment} disabled={adjusting}>
                {adjusting ? 'Adjusting...' : 'Adjust Stock'}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default InventoryManagement;