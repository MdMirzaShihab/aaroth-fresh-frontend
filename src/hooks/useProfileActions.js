/**
 * Custom hook for user profile actions following backend API specifications
 * Handles profile updates, password changes, and manager management
 */

import { toast } from 'react-toastify';
import {
  useUpdateUserProfileMutation,
  useChangePasswordMutation,
  useCreateBuyerManagerMutation,
  useUpdateBuyerManagerMutation,
  useGetBuyerManagersQuery,
  useDeactivateBuyerManagerMutation,
  useDeleteBuyerManagerMutation,
} from '../store/slices/apiSlice';

/**
 * Hook for profile management actions
 */
export const useProfileActions = () => {
  const [updateProfile, { isLoading: isUpdatingProfile }] =
    useUpdateUserProfileMutation();
  const [changePassword, { isLoading: isChangingPassword }] =
    useChangePasswordMutation();

  const updateUserProfile = async (profileData) => {
    try {
      const result = await updateProfile(profileData).unwrap();

      if (result.success) {
        toast.success('Profile updated successfully');
        return { success: true, user: result.user };
      }

      return { success: false, message: result.message };
    } catch (error) {
      const message = error?.data?.message || 'Failed to update profile';
      toast.error(message);
      return { success: false, message };
    }
  };

  const updatePassword = async (passwordData) => {
    try {
      const result = await changePassword(passwordData).unwrap();

      if (result.success) {
        toast.success('Password changed successfully');
        return { success: true };
      }

      return { success: false, message: result.message };
    } catch (error) {
      const message = error?.data?.message || 'Failed to change password';
      toast.error(message);
      return { success: false, message };
    }
  };

  return {
    updateUserProfile,
    updatePassword,
    isUpdatingProfile,
    isChangingPassword,
    isLoading: isUpdatingProfile || isChangingPassword,
  };
};

/**
 * Hook for buyer manager management (Buyer Owner Only)
 */
export const useManagerActions = () => {
  const [createManager, { isLoading: isCreatingManager }] =
    useCreateBuyerManagerMutation();
  const [updateManager, { isLoading: isUpdatingManager }] =
    useUpdateBuyerManagerMutation();
  const [deactivateManager, { isLoading: isDeactivatingManager }] =
    useDeactivateBuyerManagerMutation();
  const [deleteManager, { isLoading: isDeletingManager }] =
    useDeleteBuyerManagerMutation();
  const {
    data: managersData,
    isLoading: isLoadingManagers,
    refetch: refetchManagers,
  } = useGetBuyerManagersQuery();

  const addManager = async (managerData) => {
    try {
      const result = await createManager(managerData).unwrap();

      if (result.success) {
        toast.success('Manager account created successfully');
        refetchManagers(); // Refresh the managers list
        return { success: true, manager: result.user };
      }

      return { success: false, message: result.message };
    } catch (error) {
      const message =
        error?.data?.message || 'Failed to create manager account';
      toast.error(message);
      return { success: false, message };
    }
  };

  const updateManagerProfile = async (managerId, managerData) => {
    try {
      const result = await updateManager({
        id: managerId,
        ...managerData,
      }).unwrap();

      if (result.success) {
        toast.success('Manager profile updated successfully');
        refetchManagers(); // Refresh the managers list
        return { success: true, manager: result.manager };
      }

      return { success: false, message: result.message };
    } catch (error) {
      const message =
        error?.data?.message || 'Failed to update manager profile';
      toast.error(message);
      return { success: false, message };
    }
  };

  const toggleManagerStatus = async (managerId, isActive) => {
    try {
      const result = await deactivateManager({
        id: managerId,
        isActive,
      }).unwrap();

      if (result.success) {
        const action = isActive ? 'activated' : 'deactivated';
        toast.success(`Manager ${action} successfully`);
        refetchManagers(); // Refresh the managers list
        return { success: true };
      }

      return { success: false, message: result.message };
    } catch (error) {
      const message = error?.data?.message || 'Failed to update manager status';
      toast.error(message);
      return { success: false, message };
    }
  };

  const removeManager = async (managerId) => {
    try {
      const result = await deleteManager({
        id: managerId,
      }).unwrap();

      if (result.success) {
        toast.success('Manager deleted successfully');
        refetchManagers(); // Refresh the managers list
        return { success: true };
      }

      return { success: false, message: result.message };
    } catch (error) {
      const message = error?.data?.message || 'Failed to delete manager';
      toast.error(message);
      return { success: false, message };
    }
  };

  const managers = managersData?.managers || [];

  return {
    addManager,
    updateManagerProfile,
    toggleManagerStatus,
    removeManager,
    managers,
    isCreatingManager,
    isUpdatingManager,
    isDeactivatingManager,
    isDeletingManager,
    isLoadingManagers,
    refetchManagers,
    isLoading:
      isCreatingManager ||
      isUpdatingManager ||
      isDeactivatingManager ||
      isDeletingManager ||
      isLoadingManagers,
  };
};

/**
 * Combined hook for all profile-related actions
 */
export const useCompleteProfile = () => {
  const profileActions = useProfileActions();
  const managerActions = useManagerActions();

  return {
    // Profile actions
    updateUserProfile: profileActions.updateUserProfile,
    updatePassword: profileActions.updatePassword,
    isUpdatingProfile: profileActions.isUpdatingProfile,
    isChangingPassword: profileActions.isChangingPassword,

    // Manager actions (for buyer owners)
    addManager: managerActions.addManager,
    updateManagerProfile: managerActions.updateManagerProfile,
    toggleManagerStatus: managerActions.toggleManagerStatus,
    removeManager: managerActions.removeManager,
    managers: managerActions.managers,
    isCreatingManager: managerActions.isCreatingManager,
    isUpdatingManager: managerActions.isUpdatingManager,
    isDeactivatingManager: managerActions.isDeactivatingManager,
    isDeletingManager: managerActions.isDeletingManager,
    isLoadingManagers: managerActions.isLoadingManagers,
    refetchManagers: managerActions.refetchManagers,

    // Combined loading state
    isLoading: profileActions.isLoading || managerActions.isLoading,
  };
};
