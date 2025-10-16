// transactionService.ts - Transaction API Service
import apiClient, { ApiResponse } from "../api";

export interface Transaction {
    id?: string;
    _id?: string;
    type: "service" | "rent" | "contract";
    fromAccount: any; // Can be populated User object or ID
    toAccount: any; // Can be populated User object or ID
    property: any; // Can be populated Property object or ID
    amount: number;
    currency: string;
    status: "pending" | "completed" | "cancelled" | "failed";
    description?: string;
    transactionDate: string | Date;
    dueDate?: string | Date;
    paidDate?: string | Date;
    paymentMethod?: "cash" | "bank_transfer" | "cheque" | "online" | "card" | "other";
    reference?: string;
    isRecurring: boolean;
    recurringFrequency?: "monthly" | "quarterly" | "semi-annually" | "annually";
    attachmentUrl?: string;
    notes?: string;
    createdBy?: any; // Admin who created it
    createdAt?: string | Date;
    updatedAt?: string | Date;
}

export interface CreateTransactionData {
    type: "service" | "rent" | "contract";
    fromAccount: string;
    toAccount: string;
    property: string;
    amount: number;
    currency?: string;
    status?: "pending" | "completed" | "cancelled" | "failed";
    description?: string;
    transactionDate?: string | Date;
    dueDate?: string | Date;
    paidDate?: string | Date;
    paymentMethod?: "cash" | "bank_transfer" | "cheque" | "online" | "card" | "other";
    reference?: string;
    isRecurring?: boolean;
    recurringFrequency?: "monthly" | "quarterly" | "semi-annually" | "annually";
    attachmentUrl?: string;
    notes?: string;
}

export interface TransactionFilters {
    type?: string;
    status?: string;
    fromAccount?: string;
    toAccount?: string;
    property?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
}

export interface PaginatedTransactionResponse {
    data: Transaction[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export interface TransactionStatistics {
    totalAmount: number;
    totalTransactions: number;
    byType: Record<string, number>;
    byStatus: Record<string, number>;
}

export const transactionService = {
    // Create transaction (Admin only)
    createTransaction: (data: CreateTransactionData): Promise<ApiResponse<Transaction>> => {
        return apiClient.post("/transactions", data);
    },

    // Get all transactions with filters and pagination
    getAllTransactions: (filters?: TransactionFilters): Promise<ApiResponse<PaginatedTransactionResponse>> => {
        const params = new URLSearchParams();
        if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== "") {
                    params.append(key, String(value));
                }
            });
        }
        return apiClient.get(`/transactions?${params.toString()}`);
    },

    // Get transaction by ID
    getTransactionById: (id: string): Promise<ApiResponse<Transaction>> => {
        return apiClient.get(`/transactions/${id}`);
    },

    // Get transactions by property
    getTransactionsByProperty: (
        propertyId: string,
        page: number = 1,
        limit: number = 10
    ): Promise<ApiResponse<PaginatedTransactionResponse>> => {
        return apiClient.get(`/transactions/property/${propertyId}?page=${page}&limit=${limit}`);
    },

    // Get transactions by user
    getTransactionsByUser: (
        userId: string,
        page: number = 1,
        limit: number = 10
    ): Promise<ApiResponse<PaginatedTransactionResponse>> => {
        return apiClient.get(`/transactions/user/${userId}?page=${page}&limit=${limit}`);
    },

    // Get current user's transactions
    getMyTransactions: (
        page: number = 1,
        limit: number = 10
    ): Promise<ApiResponse<PaginatedTransactionResponse>> => {
        return apiClient.get(`/transactions/my-transactions?page=${page}&limit=${limit}`);
    },

    // Update transaction (Admin only)
    updateTransaction: (
        id: string,
        data: Partial<CreateTransactionData>
    ): Promise<ApiResponse<Transaction>> => {
        return apiClient.put(`/transactions/${id}`, data);
    },

    // Mark as completed (Admin only)
    markAsCompleted: (id: string, paidDate?: string): Promise<ApiResponse<Transaction>> => {
        return apiClient.post(`/transactions/${id}/complete`, { paidDate });
    },

    // Mark as cancelled (Admin only)
    markAsCancelled: (id: string): Promise<ApiResponse<Transaction>> => {
        return apiClient.post(`/transactions/${id}/cancel`, {});
    },

    // Delete transaction (Admin only)
    deleteTransaction: (id: string): Promise<ApiResponse<null>> => {
        return apiClient.delete(`/transactions/${id}`);
    },

    // Get statistics
    getStatistics: (filters?: Partial<TransactionFilters>): Promise<ApiResponse<TransactionStatistics>> => {
        const params = new URLSearchParams();
        if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== "") {
                    params.append(key, String(value));
                }
            });
        }
        return apiClient.get(`/transactions/statistics?${params.toString()}`);
    },

    // Get overdue transactions
    getOverdueTransactions: (
        page: number = 1,
        limit: number = 10
    ): Promise<ApiResponse<PaginatedTransactionResponse>> => {
        return apiClient.get(`/transactions/overdue?page=${page}&limit=${limit}`);
    },
};

export default transactionService;

