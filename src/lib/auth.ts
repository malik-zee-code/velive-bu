// auth.ts - Authentication utilities for REST API
import { jwtDecode } from 'jwt-decode';

const ACCESS_TOKEN_KEY = 'velive_access_token';
const REFRESH_TOKEN_KEY = 'velive_refresh_token';
const USER_KEY = 'velive_user';

export interface DecodedToken {
    id: string;
    email: string;
    roles: string[];
    exp: number;
    iat: number;
}

export interface User {
    id: string;
    email: string;
    name: string;
    isActive: boolean;
    roles: string[];
    createdAt: string;
    updatedAt: string;
}

// Token management
export const setTokens = (accessToken: string, refreshToken: string) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
        localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    }
};

export const getAccessToken = (): string | null => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem(ACCESS_TOKEN_KEY);
    }
    return null;
};

export const getRefreshToken = (): string | null => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem(REFRESH_TOKEN_KEY);
    }
    return null;
};

export const removeTokens = () => {
    if (typeof window !== 'undefined') {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
    }
};

// User management
export const setUser = (user: User) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
};

export const getUser = (): User | null => {
    if (typeof window !== 'undefined') {
        const userStr = localStorage.getItem(USER_KEY);
        if (userStr) {
            try {
                return JSON.parse(userStr);
            } catch {
                return null;
            }
        }
    }
    return null;
};

export const removeUser = () => {
    if (typeof window !== 'undefined') {
        localStorage.removeItem(USER_KEY);
    }
};

// Token validation
export const isTokenValid = (token: string): boolean => {
    try {
        const decoded: DecodedToken = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        return decoded.exp > currentTime;
    } catch {
        return false;
    }
};

export const decodeToken = (token: string): DecodedToken | null => {
    try {
        return jwtDecode(token);
    } catch {
        return null;
    }
};

// Authentication state
export const isAuthenticated = (): boolean => {
    const token = getAccessToken();
    return token !== null && isTokenValid(token);
};

export const getUserRole = (): string | null => {
    const user = getUser();
    return user?.roles?.[0] || null;
};

export const hasRole = (role: string): boolean => {
    const user = getUser();
    return user?.roles?.includes(role) || false;
};

export const isAdmin = (): boolean => {
    return hasRole('manager') || hasRole('admin');
};

// Refresh token
export const refreshAccessToken = async (): Promise<boolean> => {
    const oldRefreshToken = getRefreshToken();
    if (!oldRefreshToken) {
        console.log('No refresh token found');
        return false;
    }

    console.log('🔄 Starting token refresh...');
    console.log('Old refresh token (first 20 chars):', oldRefreshToken.substring(0, 20));

    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/users/refresh-token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refreshToken: oldRefreshToken }),
        });

        if (!response.ok) {
            console.error('❌ Token refresh failed with status:', response.status);
            removeTokens();
            removeUser();
            return false;
        }

        const data = await response.json();
        console.log('✅ Token refresh response received');

        if (data.data?.accessToken && data.data?.refreshToken) {
            console.log('New access token (first 20 chars):', data.data.accessToken.substring(0, 20));
            console.log('New refresh token (first 20 chars):', data.data.refreshToken.substring(0, 20));
            console.log('Tokens are different?', oldRefreshToken.substring(0, 20) !== data.data.refreshToken.substring(0, 20));

            setTokens(data.data.accessToken, data.data.refreshToken);
            console.log('✅ New tokens stored successfully');
            return true;
        }

        console.error('❌ Invalid response structure');
        return false;
    } catch (error) {
        console.error('❌ Token refresh failed:', error);
        removeTokens();
        removeUser();
        return false;
    }
};

// Check if token needs refresh (expires in less than 5 minutes)
export const shouldRefreshToken = (): boolean => {
    const token = getAccessToken();
    if (!token) return false;

    try {
        const decoded: DecodedToken = jwtDecode(token); // decode access Token
        const currentTime = Date.now() / 1000; // current time in seconds
        const timeUntilExpiry = decoded.exp - currentTime;
        // Refresh if token expires in less than 5 minutes (300 seconds)
        return timeUntilExpiry < 300 && timeUntilExpiry > 0;
    } catch {
        return false;
    }
};

// Logout
export const logout = () => {
    removeTokens();
    removeUser();
    if (typeof window !== 'undefined') {
        window.location.href = '/auth/signin';
    }
};

export default {
    setTokens,
    getAccessToken,
    getRefreshToken,
    removeTokens,
    setUser,
    getUser,
    removeUser,
    isTokenValid,
    decodeToken,
    isAuthenticated,
    getUserRole,
    hasRole,
    isAdmin,
    refreshAccessToken,
    shouldRefreshToken,
    logout,
};

