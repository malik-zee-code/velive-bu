// roleService.ts - Role API Service
import apiClient, { ApiResponse } from "../api";

export interface Role {
  _id: string;
  id: string;
  role: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateRoleData {
  role: string;
}

export const roleService = {
  // Get all roles
  getAllRoles: (): Promise<ApiResponse<Role[]>> => {
    return apiClient.get("/roles");
  },

  // Get role by ID
  getRoleById: (id: string): Promise<ApiResponse<Role>> => {
    return apiClient.get(`/roles/${id}`);
  },

  // Create role
  createRole: (data: CreateRoleData): Promise<ApiResponse<Role>> => {
    return apiClient.post("/roles", data);
  },

  // Update role
  updateRole: (id: string, data: Partial<CreateRoleData>): Promise<ApiResponse<Role>> => {
    return apiClient.put(`/roles/${id}`, data);
  },

  // Delete role
  deleteRole: (id: string): Promise<ApiResponse<null>> => {
    return apiClient.delete(`/roles/${id}`);
  },
};

export default roleService;
