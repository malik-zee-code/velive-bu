// customerDocumentService.ts - Customer Document API Service
import apiClient, { ApiResponse } from "../api";

export interface CustomerDocument {
    _id: string;
    id: string;
    user: {
        _id?: string;
        id?: string;
        name: string;
        email: string;
    };
    documentType: string;
    fileName: string;
    filePath: string;
    fileSize: number;
    expiryDate?: string;
    uploadedBy: {
        _id?: string;
        id?: string;
        name: string;
        email: string;
    };
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

export interface UploadDocumentData {
    userId: string;
    documentType: string;
    expiryDate?: string;
    notes?: string;
}

export interface UpdateDocumentData {
    documentType?: string;
    expiryDate?: string;
    notes?: string;
}

export const customerDocumentService = {
    // Upload customer document
    uploadDocument: async (
        data: UploadDocumentData,
        file: File
    ): Promise<ApiResponse<CustomerDocument>> => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("userId", data.userId);
        formData.append("documentType", data.documentType);
        if (data.expiryDate) {
            formData.append("expiryDate", data.expiryDate);
        }
        if (data.notes) {
            formData.append("notes", data.notes);
        }

        return apiClient.upload<CustomerDocument>(
            "/customer-documents/upload",
            formData
        );
    },

    // Get documents for a user
    getUserDocuments: (userId: string): Promise<ApiResponse<CustomerDocument[]>> => {
        return apiClient.get(`/customer-documents/user/${userId}`);
    },

    // Get expiring documents
    getExpiringDocuments: (days: number = 30): Promise<ApiResponse<CustomerDocument[]>> => {
        return apiClient.get(`/customer-documents/expiring?days=${days}`);
    },

    // Get document by ID
    getDocumentById: (id: string): Promise<ApiResponse<CustomerDocument>> => {
        return apiClient.get(`/customer-documents/${id}`);
    },

    // Update document
    updateDocument: (
        id: string,
        data: UpdateDocumentData
    ): Promise<ApiResponse<CustomerDocument>> => {
        return apiClient.put(`/customer-documents/${id}`, data);
    },

    // Delete document
    deleteDocument: (id: string): Promise<ApiResponse<null>> => {
        return apiClient.delete(`/customer-documents/${id}`);
    },

    // Get file URL for display/download
    getFileUrl: (filePath: string): string => {
        if (!filePath) return "";
        if (filePath.startsWith("http")) return filePath;
        return `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/uploads/${filePath}`;
    },

    // Download document
    downloadDocument: async (id: string, fileName: string): Promise<void> => {
        try {
            const response = await apiClient.get(`/customer-documents/${id}/download`);

            // Create blob and download
            const blob = response.data as Blob;
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Download failed:', error);
            throw error;
        }
    },
};
