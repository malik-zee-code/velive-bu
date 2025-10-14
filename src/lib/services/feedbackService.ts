// feedbackService.ts - Feedback API Service
import apiClient, { ApiResponse } from "../api";

export enum FeedbackStatus {
  PENDING = "pending",
  IN_PROGRESS = "in_progress",
  RESOLVED = "resolved",
  CLOSED = "closed",
}

export enum FeedbackType {
  FEEDBACK = "feedback",
  COMPLAINT = "complaint",
  SUGGESTION = "suggestion",
}

export interface Feedback {
  id?: string;
  _id?: string;
  user: any; // User object or ID
  type: FeedbackType;
  subject: string;
  description: string;
  status: FeedbackStatus;
  priority?: "low" | "medium" | "high";
  adminResponse?: string;
  createdAt?: string;
  updatedAt?: string;
  resolvedAt?: string;
}

export interface CreateFeedbackData {
  type: FeedbackType;
  subject: string;
  description: string;
  priority?: "low" | "medium" | "high";
}

export interface FeedbackStats {
  total: number;
  byStatus: Record<FeedbackStatus, number>;
}

export const feedbackService = {
  // Create new feedback
  createFeedback: (data: CreateFeedbackData): Promise<ApiResponse<Feedback>> => {
    return apiClient.post("/feedbacks", data);
  },

  // Get feedback by ID
  getFeedbackById: (id: string): Promise<ApiResponse<Feedback>> => {
    return apiClient.get(`/feedbacks/${id}`);
  },

  // Get current user's feedbacks
  getMyFeedbacks: (page: number = 1, limit: number = 10): Promise<ApiResponse<Feedback[]>> => {
    return apiClient.get(`/feedbacks/my-feedbacks?page=${page}&limit=${limit}`);
  },

  // Get all feedbacks (admin only)
  getAllFeedbacks: (
    page: number = 1,
    limit: number = 10,
    status?: FeedbackStatus
  ): Promise<ApiResponse<Feedback[]>> => {
    const statusParam = status ? `&status=${status}` : "";
    return apiClient.get(`/feedbacks/all?page=${page}&limit=${limit}${statusParam}`);
  },

  // Update feedback (admin only)
  updateFeedback: (id: string, data: Partial<Feedback>): Promise<ApiResponse<Feedback>> => {
    return apiClient.put(`/feedbacks/${id}`, data);
  },

  // Delete feedback (admin only)
  deleteFeedback: (id: string): Promise<ApiResponse<null>> => {
    return apiClient.delete(`/feedbacks/${id}`);
  },

  // Get feedback stats (admin only)
  getFeedbackStats: (): Promise<ApiResponse<FeedbackStats>> => {
    return apiClient.get("/feedbacks/stats");
  },
};

export default feedbackService;
