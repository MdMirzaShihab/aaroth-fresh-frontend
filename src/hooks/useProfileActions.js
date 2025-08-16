/**
 * Custom hook for user profile actions following backend API specifications
 * Handles profile updates, password changes, and manager management
 */

import { toast } from 'react-toastify';
import {
  useUpdateUserProfileMutation,
  useChangePasswordMutation,
  useCreateManagerMutation,
  useGetManagersQuery,
  useDeactivateManagerMutation,
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
 * Hook for restaurant manager management (Restaurant Owner Only)
 */
export const useManagerActions = () => {
  const [createManager, { isLoading: isCreatingManager }] =
    useCreateManagerMutation();
  const [deactivateManager, { isLoading: isDeactivatingManager }] =
    useDeactivateManagerMutation();
  const {
    data: managersData,
    isLoading: isLoadingManagers,
    refetch: refetchManagers,
  } = useGetManagersQuery();

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

  const managers = managersData?.managers || [];

  return {
    addManager,
    toggleManagerStatus,
    managers,
    isCreatingManager,
    isDeactivatingManager,
    isLoadingManagers,
    refetchManagers,
    isLoading: isCreatingManager || isDeactivatingManager || isLoadingManagers,
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

    // Manager actions (for restaurant owners)
    addManager: managerActions.addManager,
    toggleManagerStatus: managerActions.toggleManagerStatus,
    managers: managerActions.managers,
    isCreatingManager: managerActions.isCreatingManager,
    isDeactivatingManager: managerActions.isDeactivatingManager,
    isLoadingManagers: managerActions.isLoadingManagers,
    refetchManagers: managerActions.refetchManagers,

    // Combined loading state
    isLoading: profileActions.isLoading || managerActions.isLoading,
  };
};
