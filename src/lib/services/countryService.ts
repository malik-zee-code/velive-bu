// countryService.ts - Country API Service
import apiClient, { ApiResponse } from '../api';

export interface Country {
    id: string;
    name: string;
    code?: string;
    flag?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateCountryData {
    name: string;
    code?: string;
    flag?: string;
}

export const countryService = {
    // Get all countries
    getAllCountries: (): Promise<ApiResponse<Country[]>> => {
        return apiClient.get('/countries');
    },

    // Get country by ID
    getCountryById: (id: string): Promise<ApiResponse<Country>> => {
        return apiClient.get(`/countries/${id}`);
    },

    // Create country
    createCountry: (data: CreateCountryData): Promise<ApiResponse<Country>> => {
        return apiClient.post('/countries', data);
    },

    // Update country
    updateCountry: (id: string, data: Partial<CreateCountryData>): Promise<ApiResponse<Country>> => {
        return apiClient.put(`/countries/${id}`, data);
    },

    // Delete country
    deleteCountry: (id: string): Promise<ApiResponse<null>> => {
        return apiClient.delete(`/countries/${id}`);
    },
};

export default countryService;

