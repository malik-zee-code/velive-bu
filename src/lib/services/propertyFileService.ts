// propertyFileService.ts - Service for handling property file uploads (PDFs)
import { apiClient } from '../api';

export interface PropertyFileUploadResponse {
    success: boolean;
    data: {
        filePath: string;
        fileName: string;
        fileSize: number;
        fileType: string;
    };
    message?: string;
}

export interface PropertyFileDeleteResponse {
    success: boolean;
    message?: string;
}

export const propertyFileService = {
    // Upload floor plan PDF
    uploadFloorPlan: async (propertyId: string, file: File): Promise<PropertyFileUploadResponse> => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('propertyId', propertyId);
        formData.append('fileType', 'floorPlan');

        const response = await apiClient.upload<any>(
            `/property-files/upload`,
            formData
        );

        console.log("RESPONSEEEEEEE", response);


        return response;
    },

    // Upload installment plan PDF
    uploadInstallmentPlan: async (propertyId: string, file: File): Promise<PropertyFileUploadResponse> => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('propertyId', propertyId);
        formData.append('fileType', 'installmentPlan');

        const response = await apiClient.upload<any>(
            `/property-files/upload`,
            formData
        );
        return response;
    },

    // Delete floor plan PDF
    deleteFloorPlan: async (propertyId: string): Promise<PropertyFileDeleteResponse> => {
        const response = await apiClient.delete<PropertyFileDeleteResponse>(
            `/property-files/${propertyId}/floorPlan`
        );
        return response.data;
    },

    // Delete installment plan PDF
    deleteInstallmentPlan: async (propertyId: string): Promise<PropertyFileDeleteResponse> => {
        const response = await apiClient.delete<PropertyFileDeleteResponse>(
            `/property-files/${propertyId}/installmentPlan`
        );
        return response.data;
    },

    // Get file URL for display/download
    getFileUrl: (filePath: string): string => {
        if (!filePath) return '';
        // If it's already a full URL, return as is
        if (filePath.startsWith('http')) return filePath;
        // Otherwise, construct the URL
        return `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/uploads/${filePath}`;
    },

    // Download file
    downloadFile: async (filePath: string, fileName: string): Promise<void> => {
        const fileUrl = propertyFileService.getFileUrl(filePath);
        const response = await fetch(fileUrl);
        const blob = await response.blob();

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    }
};
