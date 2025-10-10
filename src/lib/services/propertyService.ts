// propertyService.ts - Property API Service
import apiClient, { ApiResponse } from '../api';

export interface Property {
    _id: string;
    id: string;  // Backend uses 'id' instead of '_id'
    title: string;
    slug: string;
    description?: string;
    longDescription?: string;
    shortDescription?: string;
    tagline?: string;
    price: number;
    currency?: string;
    bedrooms: number;
    bathrooms: number;
    areaInFeet: number;
    area: number;  // Alias for areaInFeet
    status: 'available' | 'sold' | 'pending' | boolean;
    isFeatured: boolean;
    isAvailable?: boolean;
    isFurnished?: boolean;
    listingType?: 'sale' | 'rent';
    address?: string;
    floorPlan?: string;
    installmentPlan?: string;
    location?: {
        _id?: string;
        id?: string;
        name: string;
        country?: {
            _id?: string;
            id?: string;
            name: string;
        };
    };
    category?: {
        _id?: string;
        id?: string;
        title: string;
    };
    owner?: {
        _id?: string;
        id?: string;
        displayName: string;
        email: string;
    };
    images?: PropertyImage[];
    createdAt: string;
    updatedAt: string;
}

export interface PropertyImage {
    _id: string;
    imageUrl: string;
    caption?: string;
    altText?: string;
    isPrimary: boolean;
    propertyId: string;
    order: number;
    createdAt: string;
    updatedAt: string;
}

export interface CreatePropertyData {
    title: string;
    slug?: string;
    description?: string;
    longDescription?: string;
    shortDescription?: string;
    tagline?: string;
    price: number;
    currency?: string;
    bedrooms?: number;
    bathrooms?: number;
    areaInFeet?: number;
    area?: number;  // Alias
    status?: 'available' | 'sold' | 'pending' | boolean;
    isFeatured?: boolean;
    isAvailable?: boolean;
    isFurnished?: boolean;
    listingType?: 'sale' | 'rent';
    address?: string;
    floorPlan?: string;
    installmentPlan?: string;
    location?: string;  // Changed from locationId - send ObjectId string
    category?: string;  // Changed from categoryId - send ObjectId string
}

export interface PropertyStats {
    totalProperties: number;
    availableProperties: number;
    soldProperties: number;
    featuredProperties: number;
}

export const propertyService = {
    // Get all properties
    getAllProperties: (): Promise<ApiResponse<Property[]>> => {
        return apiClient.get('/properties');
    },

    // Get property by ID
    getPropertyById: (id: string): Promise<ApiResponse<Property>> => {
        return apiClient.get(`/properties/${id}`);
    },

    // Get property by slug
    getPropertyBySlug: (slug: string): Promise<ApiResponse<Property>> => {
        return apiClient.get(`/properties/slug/${slug}`);
    },

    // Get featured properties
    getFeaturedProperties: (): Promise<ApiResponse<Property[]>> => {
        return apiClient.get('/properties/featured');
    },

    // Get available properties
    getAvailableProperties: (): Promise<ApiResponse<Property[]>> => {
        return apiClient.get('/properties/available');
    },

    // Search properties
    searchProperties: (params: {
        keyword?: string;
        location?: string;
        category?: string;
        minPrice?: number;
        maxPrice?: number;
        bedrooms?: number;
        bathrooms?: number;
        status?: string;
        listingType?: string;
        isFurnished?: string;
    }): Promise<ApiResponse<Property[]>> => {
        const queryParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                queryParams.append(key, String(value));
            }
        });
        return apiClient.get(`/properties/search?${queryParams.toString()}`);
    },

    // Get my properties
    getMyProperties: (): Promise<ApiResponse<Property[]>> => {
        return apiClient.get('/properties/my-properties');
    },

    // Create property
    createProperty: (data: CreatePropertyData): Promise<ApiResponse<Property>> => {
        return apiClient.post('/properties', data);
    },

    // Update property
    updateProperty: (id: string, data: Partial<CreatePropertyData>): Promise<ApiResponse<Property>> => {
        return apiClient.put(`/properties/${id}`, data);
    },

    // Delete property
    deleteProperty: (id: string): Promise<ApiResponse<null>> => {
        return apiClient.delete(`/properties/${id}`);
    },
};

export default propertyService;

