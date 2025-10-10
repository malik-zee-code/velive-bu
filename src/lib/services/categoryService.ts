// categoryService.ts - Category API Service
import apiClient, { ApiResponse } from '../api';

export interface Category {
    id: string;
    title: string;
    slug?: string;
    description?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateCategoryData {
    title: string;
    slug?: string;
    description?: string;
}

export const categoryService = {
    // Get all categories
    getAllCategories: (): Promise<ApiResponse<Category[]>> => {
        return apiClient.get('/categories');
    },

    // Get category by ID
    getCategoryById: (id: string): Promise<ApiResponse<Category>> => {
        return apiClient.get(`/categories/${id}`);
    },

    // Create category
    createCategory: (data: CreateCategoryData): Promise<ApiResponse<Category>> => {
        return apiClient.post('/categories', data);
    },

    // Update category
    updateCategory: (id: string, data: Partial<CreateCategoryData>): Promise<ApiResponse<Category>> => {
        return apiClient.put(`/categories/${id}`, data);
    },

    // Delete category
    deleteCategory: (id: string): Promise<ApiResponse<null>> => {
        return apiClient.delete(`/categories/${id}`);
    },
};

export default categoryService;

