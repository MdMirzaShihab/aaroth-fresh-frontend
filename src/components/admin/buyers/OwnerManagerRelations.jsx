import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Crown,
  Shield,
  Building2,
  Phone,
  Mail,
  Calendar,
  AlertTriangle,
  Search,
  MapPin,
  TrendingUp,
} from 'lucide-react';
import { format } from 'date-fns';
import { useTransferOwnershipMutation } from '../../../store/slices/apiSlice';
import { Card } from '../../ui/Card';
import Button from '../../ui/Button';
import LoadingSpinner from '../../ui/LoadingSpinner';
import EmptyState from '../../ui/EmptyState';
import SearchBar from '../../ui/SearchBar';
import { Modal } from '../../ui/Modal';
import { Input } from '../../ui/Input';
import FormField from '../../ui/FormField';

const OwnerManagerRelations = ({
  buyers,
  isLoading,
  error,
  filters,
  onFiltersChange,
  stats,
  onRefresh,
}) => {
  const [selectedBuyer, setSelectedBuyer] = useState(null);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferData, setTransferData] = useState({});
  const [searchTerm, setSearchTerm] = useState('');

  // RTK Mutation
  const [transferOwnership] = useTransferOwnershipMutation();

  // Process buyers with manager data
  const buyersWithManagers = useMemo(() => {
    return buyers.map((buyer) => ({
      ...buyer,
      totalManagers: buyer.managers?.length || 0,
      ownerInfo: {
        name: buyer.ownerName,
        phone: buyer.phone,
        email: buyer.email,
        joinDate: buyer.createdAt,
        isActive: buyer.isActive,
      },
    }));
  }, [buyers]);

  // Filter buyers based on search
  const filteredBuyers = useMemo(() => {
    if (!searchTerm) return buyersWithManagers;
    return buyersWithManagers.filter(
      (buyer) =>
        buyer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        buyer.ownerName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [buyersWithManagers, searchTerm]);

  const handleBuyerSelect = (buyer) => {
    setSelectedBuyer(buyer);
  };

  const handleTransferOwnership = () => {
    setShowTransferModal(true);
  };

  const handleSubmitTransfer = async () => {
    try {
      await transferOwnership({
        buyerId: selectedBuyer.id,
        newOwnerPhone: transferData.newOwnerPhone,
        transferReason: transferData.reason,
      }).unwrap();

      setShowTransferModal(false);
      setTransferData({});
      onRefresh();
    } catch (error) {
      console.error('Ownership transfer failed:', error);
      alert(error?.data?.error || 'Failed to transfer ownership');
    }
  };

  if (error) {
    return (
      <EmptyState
        icon={AlertTriangle}
        title="Failed to load buyer data"
        description="There was an error loading owner-manager relationship data."
        actionLabel="Retry"
        onAction={onRefresh}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <Card className="p-4 glass">
        <div className="flex-1">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search buyers by name or owner..."
            className="w-full"
          />
        </div>
      </Card>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 glass">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-muted text-sm font-medium">
                Total Buyers
              </p>
              <p className="text-2xl font-bold text-text-dark">
                {stats.totalBuyers}
              </p>
            </div>
            <Building2 className="w-8 h-8 text-muted-olive" />
          </div>
        </Card>

        <Card className="p-4 glass">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-muted text-sm font-medium">
                Total Managers
              </p>
              <p className="text-2xl font-bold text-text-dark">
                {stats.totalManagers}
              </p>
            </div>
            <Shield className="w-8 h-8 text-earthy-brown" />
          </div>
        </Card>

        <Card className="p-4 glass">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-muted text-sm font-medium">
                With Managers
              </p>
              <p className="text-2xl font-bold text-text-dark">
                {buyers.filter((r) => r.managers?.length > 0).length}
              </p>
            </div>
            <Users className="w-8 h-8 text-sage-green" />
          </div>
        </Card>

        <Card className="p-4 glass">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-muted text-sm font-medium">
                Avg Managers/Buyer
              </p>
              <p className="text-2xl font-bold text-text-dark">
                {(stats.avgManagersPerBuyer || 0).toFixed(1)}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-earthy-yellow" />
          </div>
        </Card>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Buyer List */}
        <div className="lg:col-span-1">
          <Card className="p-4 glass h-fit max-h-[600px] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-text-dark">
                Buyers
              </h3>
              <span className="text-sm text-text-muted">
                {filteredBuyers.length} total
              </span>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <LoadingSpinner size="md" />
              </div>
            ) : filteredBuyers.length === 0 ? (
              <EmptyState
                icon={Building2}
                title="No buyers found"
                description="No buyers match your search criteria."
              />
            ) : (
              <div className="space-y-3">
                {filteredBuyers.map((buyer) => (
                  <BuyerCard
                    key={buyer.id}
                    buyer={buyer}
                    isSelected={selectedBuyer?.id === buyer.id}
                    onClick={() => handleBuyerSelect(buyer)}
                  />
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Detail Panel */}
        <div className="lg:col-span-2">
          {selectedBuyer ? (
            <BuyerDetailPanel
              buyer={selectedBuyer}
              onTransferOwnership={handleTransferOwnership}
            />
          ) : (
            <Card className="p-8 glass text-center">
              <Building2 className="w-12 h-12 text-text-muted mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-text-dark mb-2">
                Select a Buyer
              </h3>
              <p className="text-text-muted">
                Choose a buyer from the list to view its owner and manager information.
              </p>
            </Card>
          )}
        </div>
      </div>

      {/* Transfer Ownership Modal */}
      <TransferOwnershipModal
        isOpen={showTransferModal}
        onClose={() => {
          setShowTransferModal(false);
          setTransferData({});
        }}
        buyer={selectedBuyer}
        data={transferData}
        onChange={setTransferData}
        onSubmit={handleSubmitTransfer}
      />
    </div>
  );
};

// Buyer Card Component
const BuyerCard = ({ buyer, isSelected, onClick }) => {
  return (
    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
      <Card
        className={`p-3 cursor-pointer transition-all duration-200 ${
          isSelected
            ? 'border-muted-olive bg-muted-olive/5 shadow-md'
            : 'hover:shadow-sm hover:border-gray-300'
        }`}
        onClick={onClick}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-secondary rounded-2xl flex items-center justify-center text-white font-bold">
            {buyer.name?.[0]?.toUpperCase() || 'R'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-text-dark truncate">
              {buyer.name}
            </p>
            <p className="text-sm text-text-muted truncate">
              {buyer.ownerName}
            </p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 text-xs text-text-muted">
              <Users className="w-3 h-3" />
              <span>{buyer.totalManagers} {buyer.totalManagers === 1 ? 'manager' : 'managers'}</span>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

// Buyer Detail Panel Component
const BuyerDetailPanel = ({ buyer, onTransferOwnership }) => {
  return (
    <Card className="glass h-fit">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-secondary rounded-2xl flex items-center justify-center text-white font-bold text-lg">
              {buyer.name?.[0]?.toUpperCase() || 'R'}
            </div>
            <div>
              <h3 className="text-xl font-semibold text-text-dark">
                {buyer.name}
              </h3>
              <div className="flex items-center gap-1 text-text-muted text-sm">
                <MapPin className="w-3 h-3" />
                <span>{buyer.location || buyer.address?.city || 'Location not specified'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Owner Information */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-text-dark flex items-center gap-2">
            <Crown className="w-5 h-5 text-earthy-yellow" />
            Buyer Owner
          </h4>
          <Button
            size="sm"
            variant="outline"
            onClick={onTransferOwnership}
            className="text-xs"
          >
            Transfer Ownership
          </Button>
        </div>

        <Card className="p-4 bg-earthy-yellow/5 border-earthy-yellow/20">
          <p className="font-medium text-text-dark mb-3">
            {buyer.ownerInfo.name}
          </p>
          <div className="space-y-2 text-sm text-text-muted">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              <span>{buyer.ownerInfo.phone}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              <span>{buyer.ownerInfo.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>
                Owner since{' '}
                {format(new Date(buyer.ownerInfo.joinDate), 'MMM dd, yyyy')}
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Managers List */}
      <div className="p-6">
        <h4 className="text-lg font-semibold text-text-dark mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-earthy-brown" />
          Assigned Managers ({buyer.managers?.length || 0})
        </h4>

        {buyer.managers && buyer.managers.length > 0 ? (
          <div className="space-y-3">
            {buyer.managers.map((manager) => (
              <Card key={manager._id} className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-muted-olive to-sage-green rounded-2xl flex items-center justify-center text-white">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-text-dark">{manager.name}</p>
                    <p className="text-sm text-text-muted">{manager.email}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-text-muted mx-auto mb-4" />
            <p className="text-text-muted">
              No managers assigned to this buyer.
            </p>
            <p className="text-sm text-text-muted mt-2">
              Buyer owners can add managers from their dashboard.
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};

// Transfer Ownership Modal Component
const TransferOwnershipModal = ({
  isOpen,
  onClose,
  buyer,
  data,
  onChange,
  onSubmit,
}) => {
  if (!isOpen || !buyer) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Transfer Ownership" size="md">
      <div className="space-y-6">
        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl">
          <div className="w-10 h-10 bg-gradient-secondary rounded-2xl flex items-center justify-center text-white font-bold">
            {buyer.name?.[0]?.toUpperCase() || 'R'}
          </div>
          <div>
            <p className="font-medium text-text-dark">{buyer.name}</p>
            <p className="text-sm text-text-muted">Current Owner: {buyer.ownerName}</p>
          </div>
        </div>

        <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200">
          <div className="flex items-center gap-2 text-amber-800 mb-2">
            <AlertTriangle className="w-5 h-5" />
            <h5 className="font-medium">Warning: Ownership Transfer</h5>
          </div>
          <p className="text-sm text-amber-700">
            This action will permanently transfer ownership of the buyer. The
            current owner will lose all admin privileges.
          </p>
        </div>

        <FormField label="New Owner Phone Number (Required)">
          <Input
            value={data.newOwnerPhone || ''}
            onChange={(e) => onChange({ ...data, newOwnerPhone: e.target.value })}
            placeholder="Enter new owner's phone number with country code (e.g., +8801234567890)"
            required
          />
        </FormField>

        <FormField label="Transfer Reason (Required)">
          <textarea
            value={data.reason || ''}
            onChange={(e) => onChange({ ...data, reason: e.target.value })}
            placeholder="Explain why ownership is being transferred..."
            rows={3}
            className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-muted-olive/20 resize-none"
            required
          />
        </FormField>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={onSubmit}
            disabled={!data.newOwnerPhone || !data.reason}
            className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700"
          >
            <Crown className="w-4 h-4" />
            Transfer Ownership
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default OwnerManagerRelations;
