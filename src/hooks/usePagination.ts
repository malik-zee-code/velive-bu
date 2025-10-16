// usePagination.ts - Custom hook for pagination logic
"use client";
import { useState, useMemo } from "react";

interface UsePaginationProps<T> {
    data: T[];
    itemsPerPage?: number;
    initialPage?: number;
}

interface UsePaginationReturn<T> {
    currentPage: number;
    totalPages: number;
    paginatedData: T[];
    totalItems: number;
    startIndex: number;
    endIndex: number;
    goToPage: (page: number) => void;
    nextPage: () => void;
    prevPage: () => void;
    resetPagination: () => void;
}

export const usePagination = <T>({
    data,
    itemsPerPage = 10,
    initialPage = 1,
}: UsePaginationProps<T>): UsePaginationReturn<T> => {
    const [currentPage, setCurrentPage] = useState(initialPage);

    const totalPages = Math.ceil(data.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    const paginatedData = useMemo(() => {
        return data.slice(startIndex, endIndex);
    }, [data, startIndex, endIndex]);

    const goToPage = (page: number) => {
        const validPage = Math.max(1, Math.min(page, totalPages));
        setCurrentPage(validPage);
    };

    const nextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const prevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const resetPagination = () => {
        setCurrentPage(1);
    };

    return {
        currentPage,
        totalPages,
        paginatedData,
        totalItems: data.length,
        startIndex,
        endIndex,
        goToPage,
        nextPage,
        prevPage,
        resetPagination,
    };
};
