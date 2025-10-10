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
    logout,
};

