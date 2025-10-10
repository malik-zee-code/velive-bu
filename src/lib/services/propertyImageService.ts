// propertyImageService.ts - Property Image API Service
import apiClient, { ApiResponse } from '../api';

export interface PropertyImage {
    _id: string;
    imageUrl: string;
    caption?: string;
    altText?: string;
    isPrimary: boolean;
    propertyId: string;
    order: number;
    createdAt: string;
    updatedAt: string;
}

export interface UpdatePropertyImageData {
    caption?: string;
    altText?: string;
    order?: number;
}

export const propertyImageService = {
    // Get images for a property
    getPropertyImages: (propertyId: string): Promise<ApiResponse<PropertyImage[]>> => {
        return apiClient.get(`/property-images/property/${propertyId}`);
    },

    // Get primary image for a property
    getPrimaryPropertyImage: (propertyId: string): Promise<ApiResponse<PropertyImage>> => {
        return apiClient.get(`/property-images/property/${propertyId}/primary`);
    },

    // Get image by ID
    getPropertyImageById: (id: string): Promise<ApiResponse<PropertyImage>> => {
        return apiClient.get(`/property-images/${id}`);
    },

    // Upload single image
    uploadSingleImage: (propertyId: string, formData: FormData): Promise<ApiResponse<PropertyImage>> => {
        return apiClient.upload(`/property-images/property/${propertyId}/upload`, formData);
    },

    // Upload multiple images
    uploadMultipleImages: (propertyId: string, formData: FormData): Promise<ApiResponse<PropertyImage[]>> => {
        return apiClient.upload(`/property-images/property/${propertyId}/upload-multiple`, formData);
    },

    // Update property image
    updatePropertyImage: (id: string, data: UpdatePropertyImageData): Promise<ApiResponse<PropertyImage>> => {
        return apiClient.put(`/property-images/${id}`, data);
    },

    // Set as primary image
    setPrimaryPropertyImage: (id: string): Promise<ApiResponse<PropertyImage>> => {
        return apiClient.put(`/property-images/${id}/set-primary`, {});
    },

    // Delete property image
    deletePropertyImage: (id: string): Promise<ApiResponse<null>> => {
        return apiClient.delete(`/property-images/${id}`);
    },

    // Delete all images for a property
    deletePropertyImages: (propertyId: string): Promise<ApiResponse<null>> => {
        return apiClient.delete(`/property-images/property/${propertyId}`);
    },
};

export default propertyImageService;

