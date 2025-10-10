// locationService.ts - Location API Service
import apiClient, { ApiResponse } from '../api';

export interface Location {
    id: string;
    name: string;
    slug?: string;
    description?: string;
    country?: {
        id: string;
        name: string;
    };
    createdAt: string;
    updatedAt: string;
}

export interface CreateLocationData {
    name: string;
    slug?: string;
    description?: string;
    country?: string;
}

export const locationService = {
    // Get all locations
    getAllLocations: (): Promise<ApiResponse<Location[]>> => {
        return apiClient.get('/locations');
    },

    // Get location by ID
    getLocationById: (id: string): Promise<ApiResponse<Location>> => {
        return apiClient.get(`/locations/${id}`);
    },

    // Get locations by country
    getLocationsByCountry: (country: string): Promise<ApiResponse<Location[]>> => {
        return apiClient.get(`/locations/country/${country}`);
    },

    // Create location
    createLocation: (data: CreateLocationData): Promise<ApiResponse<Location>> => {
        return apiClient.post('/locations', data);
    },

    // Update location
    updateLocation: (id: string, data: Partial<CreateLocationData>): Promise<ApiResponse<Location>> => {
        return apiClient.put(`/locations/${id}`, data);
    },

    // Delete location
    deleteLocation: (id: string): Promise<ApiResponse<null>> => {
        return apiClient.delete(`/locations/${id}`);
    },
};

export default locationService;

