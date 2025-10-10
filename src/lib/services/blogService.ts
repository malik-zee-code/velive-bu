// blogService.ts - Blog API Service
import apiClient, { ApiResponse } from '../api';

export interface Blog {
    id: string;
    title: string;
    slug: string;
    content: string;
    excerpt?: string;
    featuredImage?: string;
    category?: {
        id: string;
        title: string;
        description?: string;
    };
    author?: {
        id: string;
        displayName: string;
        email: string;
    };
    isPublished: boolean;
    publishedAt?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateBlogData {
    title: string;
    slug: string;
    content?: string;
    excerpt?: string;
    featuredImage?: string;
    category?: string;
    isPublished?: boolean;
}

export const blogService = {
    // Get all blogs
    getAllBlogs: (): Promise<ApiResponse<Blog[]>> => {
        return apiClient.get('/blogs');
    },

    // Get blog by ID
    getBlogById: (id: string): Promise<ApiResponse<Blog>> => {
        return apiClient.get(`/blogs/${id}`);
    },

    // Get blog by slug
    getBlogBySlug: (slug: string): Promise<ApiResponse<Blog>> => {
        return apiClient.get(`/blogs/slug/${slug}`);
    },

    // Get blogs by category
    getBlogsByCategory: (categoryId: string): Promise<ApiResponse<Blog[]>> => {
        return apiClient.get(`/blogs/category/${categoryId}`);
    },

    // Create blog
    createBlog: (data: CreateBlogData): Promise<ApiResponse<Blog>> => {
        return apiClient.post('/blogs', data);
    },

    // Update blog
    updateBlog: (id: string, data: Partial<CreateBlogData>): Promise<ApiResponse<Blog>> => {
        return apiClient.put(`/blogs/${id}`, data);
    },

    // Delete blog
    deleteBlog: (id: string): Promise<ApiResponse<null>> => {
        return apiClient.delete(`/blogs/${id}`);
    },
};

export default blogService;

