// settingsService.ts - Settings API Service
import apiClient, { ApiResponse } from '../api';

export interface Setting {
    _id: string;
    title: string;
    value: string;
    description?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateSettingData {
    title: string;
    value: string;
    description?: string;
}

export const settingsService = {
    // Get all settings
    getAllSettings: (): Promise<ApiResponse<Setting[]>> => {
        return apiClient.get('/settings');
    },

    // Get setting by ID
    getSettingById: (id: string): Promise<ApiResponse<Setting>> => {
        return apiClient.get(`/settings/${id}`);
    },

    // Get setting by title
    getSettingByTitle: (title: string): Promise<ApiResponse<Setting>> => {
        return apiClient.get(`/settings/title/${title}`);
    },

    // Create setting
    createSetting: (data: CreateSettingData): Promise<ApiResponse<Setting>> => {
        return apiClient.post('/settings', data);
    },

    // Update setting
    updateSetting: (id: string, data: Partial<CreateSettingData>): Promise<ApiResponse<Setting>> => {
        return apiClient.put(`/settings/${id}`, data);
    },

    // Delete setting
    deleteSetting: (id: string): Promise<ApiResponse<null>> => {
        return apiClient.delete(`/settings/${id}`);
    },

    // Upsert setting
    upsertSetting: (data: CreateSettingData): Promise<ApiResponse<Setting>> => {
        return apiClient.post('/settings/upsert', data);
    },

    // Bulk upsert settings
    bulkUpsertSettings: (settings: CreateSettingData[]): Promise<ApiResponse<Setting[]>> => {
        return apiClient.post('/settings/bulk-upsert', { settings });
    },
};

export default settingsService;

