// apiClient.ts - API client with automatic token refresh
import { getAccessToken, refreshAccessToken, logout, isTokenValid } from './auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface RequestOptions extends RequestInit {
    skipAuth?: boolean;
}

let isRefreshing = false;
let failedQueue: Array<{
    resolve: (value?: any) => void;
    reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any = null, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });

    failedQueue = [];
};

/**
 * Enhanced fetch with automatic token refresh
 */
export const apiClient = async (
    url: string,
    options: RequestOptions = {}
): Promise<Response> => {
    const { skipAuth, ...fetchOptions } = options;

    // Prepare headers
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...fetchOptions.headers,
    };

    // Add authorization header if not skipping auth
    if (!skipAuth) {
        const token = getAccessToken();
        if (token && isTokenValid(token)) {
            headers['Authorization'] = `Bearer ${token}`;
        }
    }

    // Make the request
    const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
    let response = await fetch(fullUrl, {
        ...fetchOptions,
        headers,
    });

    // If unauthorized and we haven't tried to refresh yet
    if (response.status === 401 && !skipAuth) {
        if (isRefreshing) {
            // If already refreshing, queue this request
            return new Promise((resolve, reject) => {
                failedQueue.push({ resolve, reject });
            })
                .then(() => {
                    // Retry with new token
                    const token = getAccessToken();
                    if (token) {
                        headers['Authorization'] = `Bearer ${token}`;
                    }
                    return fetch(fullUrl, { ...fetchOptions, headers });
                })
                .catch((err) => {
                    throw err;
                });
        }

        isRefreshing = true;

        try {
            const refreshed = await refreshAccessToken();

            if (refreshed) {
                processQueue(null, getAccessToken());

                // Retry the original request with new token
                const token = getAccessToken();
                if (token) {
                    headers['Authorization'] = `Bearer ${token}`;
                }
                response = await fetch(fullUrl, { ...fetchOptions, headers });
            } else {
                // Refresh failed, logout user
                processQueue(new Error('Token refresh failed'), null);
                logout();
                throw new Error('Session expired. Please login again.');
            }
        } catch (error) {
            processQueue(error, null);
            throw error;
        } finally {
            isRefreshing = false;
        }
    }

    return response;
};

/**
 * GET request
 */
export const get = async <T = any>(
    url: string,
    options?: RequestOptions
): Promise<T> => {
    const response = await apiClient(url, {
        ...options,
        method: 'GET',
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Request failed' }));
        throw new Error(error.message || 'Request failed');
    }

    return response.json();
};

/**
 * POST request
 */
export const post = async <T = any>(
    url: string,
    data?: any,
    options?: RequestOptions
): Promise<T> => {
    const response = await apiClient(url, {
        ...options,
        method: 'POST',
        body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Request failed' }));
        throw new Error(error.message || 'Request failed');
    }

    return response.json();
};

/**
 * PUT request
 */
export const put = async <T = any>(
    url: string,
    data?: any,
    options?: RequestOptions
): Promise<T> => {
    const response = await apiClient(url, {
        ...options,
        method: 'PUT',
        body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Request failed' }));
        throw new Error(error.message || 'Request failed');
    }

    return response.json();
};

/**
 * DELETE request
 */
export const del = async <T = any>(
    url: string,
    options?: RequestOptions
): Promise<T> => {
    const response = await apiClient(url, {
        ...options,
        method: 'DELETE',
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Request failed' }));
        throw new Error(error.message || 'Request failed');
    }

    return response.json();
};

/**
 * PATCH request
 */
export const patch = async <T = any>(
    url: string,
    data?: any,
    options?: RequestOptions
): Promise<T> => {
    const response = await apiClient(url, {
        ...options,
        method: 'PATCH',
        body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Request failed' }));
        throw new Error(error.message || 'Request failed');
    }

    return response.json();
};

export default {
    apiClient,
    get,
    post,
    put,
    delete: del,
    patch,
};

