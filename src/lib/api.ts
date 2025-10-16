// api.ts - REST API Client Configuration
import { getAccessToken, refreshAccessToken, removeTokens, removeUser } from './auth';

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
    private isRefreshing = false;
    private failedQueue: Array<{
        resolve: (value?: unknown) => void;
        reject: (reason?: any) => void;
    }> = [];

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

    private processQueue(error: any = null) {
        this.failedQueue.forEach(prom => {
            if (error) {
                prom.reject(error);
            } else {
                prom.resolve();
            }
        });
        this.failedQueue = [];
    }

    private async handleRequest<T>(
        requestFn: () => Promise<Response>,
        isRetry: boolean = false
    ): Promise<ApiResponse<T>> {
        try {
            const response = await requestFn();

            // If request succeeds, return the response
            if (response.ok) {
                // Check if response is a blob
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('application/pdf')) {
                    return {
                        success: true,
                        status: 'success',
                        statusCode: 200,
                        data: await response.blob() as any,
                        message: 'Download successful'
                    };
                }
                return response.json();
            }

            // If it's a 401 error and not a retry, try to refresh the token
            if (response.status === 401 && !isRetry) {
                // Check if already refreshing
                if (this.isRefreshing) {
                    // Wait for the refresh to complete
                    return new Promise((resolve, reject) => {
                        this.failedQueue.push({ resolve, reject });
                    }).then(() => {
                        // Retry with new token
                        return this.handleRequest<T>(requestFn, true);
                    });
                }

                // Start refreshing
                this.isRefreshing = true;
                console.log('🔄 Token expired, attempting to refresh...');

                try {
                    const refreshed = await refreshAccessToken();

                    if (refreshed) {
                        console.log('✅ Token refreshed successfully, retrying request...');
                        this.isRefreshing = false;
                        this.processQueue();

                        // Retry the original request with new token
                        return this.handleRequest<T>(requestFn, true);
                    } else {
                        console.log('❌ Token refresh failed, logging out...');
                        this.isRefreshing = false;
                        this.processQueue(new Error('Token refresh failed'));

                        // Redirect to login
                        removeTokens();
                        removeUser();
                        if (typeof window !== 'undefined') {
                            window.location.href = '/auth/signin';
                        }
                        throw new Error('Session expired. Please login again.');
                    }
                } catch (refreshError) {
                    console.error('❌ Error during token refresh:', refreshError);
                    this.isRefreshing = false;
                    this.processQueue(refreshError);

                    removeTokens();
                    removeUser();
                    if (typeof window !== 'undefined') {
                        window.location.href = '/auth/signin';
                    }
                    throw new Error('Session expired. Please login again.');
                }
            }

            // For other errors, throw them
            const error: ApiError = await response.json();
            throw error;
        } catch (error) {
            // If it's already an ApiError, rethrow it
            if (error && typeof error === 'object' && 'statusCode' in error) {
                throw error;
            }
            // Otherwise, wrap it
            throw error;
        }
    }

    async get<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
        return this.handleRequest<T>(async () => {
            const headers = await this.getAuthHeaders();
            return fetch(`${this.baseURL}${endpoint}`, {
                method: 'GET',
                headers,
                ...options,
            });
        });
    }

    async post<T>(endpoint: string, data?: any, options?: RequestInit): Promise<ApiResponse<T>> {
        return this.handleRequest<T>(async () => {
            const headers = await this.getAuthHeaders();
            return fetch(`${this.baseURL}${endpoint}`, {
                method: 'POST',
                headers,
                body: JSON.stringify(data),
                ...options,
            });
        });
    }

    async put<T>(endpoint: string, data?: any, options?: RequestInit): Promise<ApiResponse<T>> {
        return this.handleRequest<T>(async () => {
            const headers = await this.getAuthHeaders();
            return fetch(`${this.baseURL}${endpoint}`, {
                method: 'PUT',
                headers,
                body: JSON.stringify(data),
                ...options,
            });
        });
    }

    async delete<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
        return this.handleRequest<T>(async () => {
            const headers = await this.getAuthHeaders();
            return fetch(`${this.baseURL}${endpoint}`, {
                method: 'DELETE',
                headers,
                ...options,
            });
        });
    }

    async upload<T>(endpoint: string, formData: FormData, options?: RequestInit): Promise<ApiResponse<T>> {
        return this.handleRequest<T>(async () => {
            const accessToken = getAccessToken();

            const headers: HeadersInit = {};
            if (accessToken) {
                headers['Authorization'] = `Bearer ${accessToken}`;
            }

            return fetch(`${this.baseURL}${endpoint}`, {
                method: 'POST',
                headers,
                body: formData,
                ...options,
            });
        });
    }
}

export const apiClient = new ApiClient(API_BASE_URL);
export default apiClient;

