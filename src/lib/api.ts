// api.ts - REST API Client Configuration
import { getAccessToken } from './auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export interface ApiResponse<T = any> {
    success: boolean;
    status: string;
    statusCode: number;
    message: string;
    data: T;
}

export interface ApiError {
    success: false;
    status: string;
    statusCode: number;
    message: string;
    errors?: any[];
}

class ApiClient {
    private baseURL: string;

    constructor(baseURL: string) {
        this.baseURL = baseURL;
    }

    private async getAuthHeaders(): Promise<HeadersInit> {
        const accessToken = getAccessToken();

        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };

        if (accessToken) {
            headers['Authorization'] = `Bearer ${accessToken}`;
        }

        return headers;
    }

    async get<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
        const headers = await this.getAuthHeaders();
        const response = await fetch(`${this.baseURL}${endpoint}`, {
            method: 'GET',
            headers,
            ...options,
        });

        if (!response.ok) {
            const error: ApiError = await response.json();
            throw error;
        }

        return response.json();
    }

    async post<T>(endpoint: string, data?: any, options?: RequestInit): Promise<ApiResponse<T>> {
        const headers = await this.getAuthHeaders();
        const response = await fetch(`${this.baseURL}${endpoint}`, {
            method: 'POST',
            headers,
            body: JSON.stringify(data),
            ...options,
        });

        if (!response.ok) {
            const error: ApiError = await response.json();
            throw error;
        }

        return response.json();
    }

    async put<T>(endpoint: string, data?: any, options?: RequestInit): Promise<ApiResponse<T>> {
        const headers = await this.getAuthHeaders();
        const response = await fetch(`${this.baseURL}${endpoint}`, {
            method: 'PUT',
            headers,
            body: JSON.stringify(data),
            ...options,
        });

        if (!response.ok) {
            const error: ApiError = await response.json();
            throw error;
        }

        return response.json();
    }

    async delete<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
        const headers = await this.getAuthHeaders();
        const response = await fetch(`${this.baseURL}${endpoint}`, {
            method: 'DELETE',
            headers,
            ...options,
        });

        if (!response.ok) {
            const error: ApiError = await response.json();
            throw error;
        }

        return response.json();
    }

    async upload<T>(endpoint: string, formData: FormData, options?: RequestInit): Promise<ApiResponse<T>> {
        const accessToken = getAccessToken();

        const headers: HeadersInit = {};
        if (accessToken) {
            headers['Authorization'] = `Bearer ${accessToken}`;
        }

        const response = await fetch(`${this.baseURL}${endpoint}`, {
            method: 'POST',
            headers,
            body: formData,
            ...options,
        });

        if (!response.ok) {
            const error: ApiError = await response.json();
            throw error;
        }

        return response.json();
    }
}

export const apiClient = new ApiClient(API_BASE_URL);
export default apiClient;

