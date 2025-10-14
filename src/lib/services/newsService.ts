// newsService.ts - News API Service
import apiClient, { ApiResponse } from "../api";

export enum NewsType {
  NEWS = "news",
  ALERT = "alert",
  ANNOUNCEMENT = "announcement",
}

export enum NewsPriority {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  URGENT = "urgent",
}

export interface News {
  id?: string;
  _id?: string;
  title: string;
  content: string;
  type: NewsType;
  priority: NewsPriority;
  isActive: boolean;
  publishedBy?: any; // User object or ID
  expiresAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateNewsData {
  title: string;
  content: string;
  type: NewsType;
  priority: NewsPriority;
  isActive?: boolean;
  expiresAt?: string;
}

export interface NewsStats {
  total: number;
  active: number;
}

export const newsService = {
  // Create new news (admin only)
  createNews: (data: CreateNewsData): Promise<ApiResponse<News>> => {
    return apiClient.post("/news", data);
  },

  // Get news by ID
  getNewsById: (id: string): Promise<ApiResponse<News>> => {
    return apiClient.get(`/news/${id}`);
  },

  // Get active news (public)
  getActiveNews: (page: number = 1, limit: number = 10): Promise<ApiResponse<News[]>> => {
    return apiClient.get(`/news/active?page=${page}&limit=${limit}`);
  },

  // Get all news (admin only)
  getAllNews: (page: number = 1, limit: number = 10): Promise<ApiResponse<News[]>> => {
    return apiClient.get(`/news?page=${page}&limit=${limit}`);
  },

  // Update news (admin only)
  updateNews: (id: string, data: Partial<News>): Promise<ApiResponse<News>> => {
    return apiClient.put(`/news/${id}`, data);
  },

  // Delete news (admin only)
  deleteNews: (id: string): Promise<ApiResponse<null>> => {
    return apiClient.delete(`/news/${id}`);
  },

  // Get news stats (admin only)
  getNewsStats: (): Promise<ApiResponse<NewsStats>> => {
    return apiClient.get("/news/stats/summary");
  },
};

export default newsService;
