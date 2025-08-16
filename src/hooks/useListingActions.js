/**
 * Custom hook for listing actions following backend API specifications
 * Integrates with the updated apiSlice that matches api-endpoints.md
 */

import { useState } from 'react';
import { toast } from 'react-toastify';
import {
  useCreateListingMutation,
  useUpdateListingMutation,
  useDeleteListingMutation,
} from '../store/slices/apiSlice';
import {
  createListingFormData,
  updateListingFormData,
  validateListingImages,
} from '../utils/listingFormData';

/**
 * Hook for creating listings with image upload
 */
export const useCreateListing = () => {
  const [createListingMutation, { isLoading, error }] =
    useCreateListingMutation();
  const [imageFiles, setImageFiles] = useState([]);

  const createListing = async (listingData) => {
    try {
      // Validate images if provided
      if (imageFiles.length > 0) {
        const validation = validateListingImages(imageFiles);
        if (!validation.isValid) {
          validation.errors.forEach((error) => toast.error(error));
          return { success: false, errors: validation.errors };
        }
      }

      // Create FormData according to backend API specs
      const formData = createListingFormData(listingData, imageFiles);

      const result = await createListingMutation(formData).unwrap();

      if (result.success) {
        toast.success('Listing created successfully');
        setImageFiles([]); // Clear selected images
        return { success: true, data: result.data };
      }

      return { success: false, message: result.message };
    } catch (error) {
      const message = error?.data?.message || 'Failed to create listing';
      toast.error(message);
      return { success: false, message };
    }
  };

  const selectImages = (files) => {
    const validation = validateListingImages(files);

    if (!validation.isValid) {
      validation.errors.forEach((error) => toast.error(error));
      return false;
    }

    setImageFiles(validation.validFiles);
    return true;
  };

  const clearImages = () => {
    setImageFiles([]);
  };

  return {
    createListing,
    selectImages,
    clearImages,
    selectedImages: imageFiles,
    isLoading,
    error,
  };
};

/**
 * Hook for updating listings with image upload
 */
export const useUpdateListing = () => {
  const [updateListingMutation, { isLoading, error }] =
    useUpdateListingMutation();
  const [imageFiles, setImageFiles] = useState([]);

  const updateListing = async (listingId, listingData) => {
    try {
      // Validate images if provided
      if (imageFiles.length > 0) {
        const validation = validateListingImages(imageFiles);
        if (!validation.isValid) {
          validation.errors.forEach((error) => toast.error(error));
          return { success: false, errors: validation.errors };
        }
      }

      // Create FormData according to backend API specs
      const formData = updateListingFormData(listingData, imageFiles);

      const result = await updateListingMutation({
        id: listingId,
        formData, // Pass the FormData as a property
      }).unwrap();

      if (result.success) {
        toast.success('Listing updated successfully');
        setImageFiles([]); // Clear selected images
        return { success: true, data: result.data };
      }

      return { success: false, message: result.message };
    } catch (error) {
      const message = error?.data?.message || 'Failed to update listing';
      toast.error(message);
      return { success: false, message };
    }
  };

  const selectImages = (files) => {
    const validation = validateListingImages(files);

    if (!validation.isValid) {
      validation.errors.forEach((error) => toast.error(error));
      return false;
    }

    setImageFiles(validation.validFiles);
    return true;
  };

  const clearImages = () => {
    setImageFiles([]);
  };

  return {
    updateListing,
    selectImages,
    clearImages,
    selectedImages: imageFiles,
    isLoading,
    error,
  };
};

/**
 * Hook for deleting listings
 */
export const useDeleteListing = () => {
  const [deleteListingMutation, { isLoading, error }] =
    useDeleteListingMutation();

  const deleteListing = async (listingId) => {
    try {
      const result = await deleteListingMutation(listingId).unwrap();

      if (result.success) {
        toast.success('Listing deleted successfully');
        return { success: true };
      }

      return { success: false, message: result.message };
    } catch (error) {
      const message = error?.data?.message || 'Failed to delete listing';

      // Handle specific error for listings with active orders
      if (message.includes('active orders')) {
        toast.error('Cannot delete listing with active orders');
      } else {
        toast.error(message);
      }

      return { success: false, message };
    }
  };

  return {
    deleteListing,
    isLoading,
    error,
  };
};

/**
 * Combined hook for all listing actions
 */
export const useListingActions = () => {
  const createActions = useCreateListing();
  const updateActions = useUpdateListing();
  const deleteActions = useDeleteListing();

  return {
    // Create listing
    createListing: createActions.createListing,
    selectCreateImages: createActions.selectImages,
    clearCreateImages: createActions.clearImages,
    selectedCreateImages: createActions.selectedImages,
    isCreating: createActions.isLoading,

    // Update listing
    updateListing: updateActions.updateListing,
    selectUpdateImages: updateActions.selectImages,
    clearUpdateImages: updateActions.clearImages,
    selectedUpdateImages: updateActions.selectedImages,
    isUpdating: updateActions.isLoading,

    // Delete listing
    deleteListing: deleteActions.deleteListing,
    isDeleting: deleteActions.isLoading,

    // Combined loading state
    isLoading:
      createActions.isLoading ||
      updateActions.isLoading ||
      deleteActions.isLoading,
  };
};
