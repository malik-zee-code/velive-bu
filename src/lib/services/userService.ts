// userService.ts - User API Service
import apiClient, { ApiResponse } from "../api";
import {
  setTokens,
  setUser as setAuthUser,
  removeTokens,
  removeUser,
  getRefreshToken as getStoredRefreshToken,
} from "../auth";
import { storeUserRole } from "../jwt";

export interface User {
  id: string;
  _id?: string; // Support both formats
  email: string;
  name: string;
  displayName?: string; // Alias for name
  phoneNumber?: string;
  avatarUrl?: string;
  isActive: boolean;
  roles: string[];
  createdAt: string;
  updatedAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  displayName?: string; // Alias
  roles?: string[];
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export const userService = {
  // Auth endpoints
  register: async (data: RegisterData): Promise<ApiResponse<AuthResponse>> => {
    const response = await apiClient.post<AuthResponse>("/users/register", {
      email: data.email,
      password: data.password,
      name: data.name || data.displayName,
      roles: data.roles || ["user"],
    });

    // Store tokens and user data
    if (response.data.accessToken) {
      setTokens(response.data.accessToken, response.data.refreshToken);
      setAuthUser(response.data.user);
    }

    return response;
  },

  login: async (credentials: LoginCredentials): Promise<ApiResponse<AuthResponse>> => {
    const response = await apiClient.post<AuthResponse>("/users/login", credentials);

    // Store tokens and user data
    if (response.data.accessToken) {
      setTokens(response.data.accessToken, response.data.refreshToken);
      setAuthUser(response.data.user);
      storeUserRole(response.data.user.roles);
    }

    return response;
  },

  logout: async (): Promise<ApiResponse<null>> => {
    const response = await apiClient.post<null>("/users/logout");
    removeTokens();
    removeUser();
    return response;
  },

  logoutAll: async (): Promise<ApiResponse<null>> => {
    const response = await apiClient.post<null>("/users/logout-all");
    removeTokens();
    removeUser();
    return response;
  },

  refreshToken: async (): Promise<ApiResponse<AuthResponse>> => {
    const refreshToken = getStoredRefreshToken();
    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    const response = await apiClient.post<AuthResponse>("/users/refresh-token", { refreshToken });

    // Update tokens
    if (response.data.accessToken) {
      setTokens(response.data.accessToken, response.data.refreshToken);
    }

    return response;
  },

  // User endpoints
  getProfile: (): Promise<ApiResponse<User>> => {
    return apiClient.get("/users/profile");
  },

  getAllUsers: (): Promise<ApiResponse<User[]>> => {
    return apiClient.get("/users/all");
  },

  updateProfile: (data: Partial<User>): Promise<ApiResponse<User>> => {
    return apiClient.put("/users/profile", data);
  },

  updateUser: (
    userId: string,
    data: Partial<User> & { roles?: string[] }
  ): Promise<ApiResponse<User>> => {
    return apiClient.put(`/users/${userId}`, data);
  },

  changePassword: (data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<ApiResponse<null>> => {
    return apiClient.put("/users/change-password", data);
  },
};

export default userService;
