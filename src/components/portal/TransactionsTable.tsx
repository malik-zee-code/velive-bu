// TransactionsTable.tsx - Table component for displaying transactions
"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, CheckCircle, XCircle, FileText } from "lucide-react";
import { Transaction } from "@/lib/services";
import { isAdmin } from "@/lib/auth";
import { format } from "date-fns";

interface TransactionsTableProps {
    transactions: Transaction[];
    loading: boolean;
    onEdit?: (transaction: Transaction) => void;
    onDelete?: (id: string) => void;
    onMarkCompleted?: (id: string) => void;
    onMarkCancelled?: (id: string) => void;
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export const TransactionsTable: React.FC<TransactionsTableProps> = ({
    transactions,
    loading,
    onEdit,
    onDelete,
    onMarkCompleted,
    onMarkCancelled,
    page,
    totalPages,
    onPageChange,
}) => {
    const adminAccess = isAdmin();

    const getStatusBadge = (status: string) => {
        const statusConfig: Record<string, { variant: any; label: string }> = {
            pending: { variant: "secondary", label: "Pending" },
            completed: { variant: "default", label: "Completed" },
            cancelled: { variant: "destructive", label: "Cancelled" },
            failed: { variant: "destructive", label: "Failed" },
        };

        const config = statusConfig[status] || statusConfig.pending;
        return <Badge variant={config.variant}>{config.label}</Badge>;
    };

    const getTypeBadge = (type: string) => {
        const typeConfig: Record<string, { color: string; label: string }> = {
            service: { color: "bg-blue-100 text-blue-800", label: "Service" },
            rent: { color: "bg-green-100 text-green-800", label: "Rent" },
            contract: { color: "bg-purple-100 text-purple-800", label: "Contract" },
        };

        const config = typeConfig[type] || typeConfig.service;
        return (
            <Badge className={config.color} variant="outline">
                {config.label}
            </Badge>
        );
    };

    const formatDate = (date: string | Date | undefined) => {
        if (!date) return "-";
        return new Date(date).toLocaleDateString();
    };

    const formatCurrency = (amount: number, currency: string = "AED") => {
        return `${currency} ${amount.toLocaleString()}`;
    };

    const getUserDisplay = (user: any) => {
        if (!user) return "-";
        if (typeof user === "object") {
            return user.name || user.email || user.id || user._id;
        }
        return user;
    };

    const getPropertyDisplay = (property: any) => {
        if (!property) return "-";
        if (typeof property === "object") {
            return property.title || property.slug || property.id || property._id;
        }
        return property;
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!transactions || transactions.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p>No transactions found</p>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            <div className="rounded-md border overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow className="h-8">
                            <TableHead className="text-xs font-medium">Reference</TableHead>
                            <TableHead className="text-xs font-medium">Type</TableHead>
                            <TableHead className="text-xs font-medium">From</TableHead>
                            <TableHead className="text-xs font-medium">To</TableHead>
                            <TableHead className="text-xs font-medium">Property</TableHead>
                            <TableHead className="text-xs font-medium">Amount</TableHead>
                            <TableHead className="text-xs font-medium">Status</TableHead>
                            <TableHead className="text-xs font-medium">Date</TableHead>
                            <TableHead className="text-xs font-medium">Due Date</TableHead>
                            {adminAccess && <TableHead className="text-right text-xs font-medium">Actions</TableHead>}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {transactions.map((transaction) => (
                            <TableRow key={transaction.id || transaction._id} className="h-10">
                                <TableCell className="font-medium text-sm py-2">
                                    {transaction.reference || "-"}
                                </TableCell>
                                <TableCell className="text-sm py-2">{getTypeBadge(transaction.type)}</TableCell>
                                <TableCell className="text-sm py-2">{getUserDisplay(transaction.fromAccount)}</TableCell>
                                <TableCell className="text-sm py-2">{getUserDisplay(transaction.toAccount)}</TableCell>
                                <TableCell className="max-w-[150px] truncate text-sm py-2">
                                    {getPropertyDisplay(transaction.property)}
                                </TableCell>
                                <TableCell className="font-semibold text-sm py-2">
                                    {formatCurrency(transaction.amount, transaction.currency)}
                                </TableCell>
                                <TableCell className="text-sm py-2">{getStatusBadge(transaction.status)}</TableCell>
                                <TableCell className="text-sm py-2">{format(new Date(transaction.transactionDate), 'dd-MMM-yyyy')}</TableCell>
                                <TableCell className="text-sm py-2">
                                    {transaction.dueDate ? (
                                        <span
                                            className={
                                                transaction.status === "pending" &&
                                                    new Date(transaction.dueDate) < new Date()
                                                    ? "text-red-600 font-medium"
                                                    : ""
                                            }
                                        >
                                            {formatDate(transaction.dueDate)}
                                        </span>
                                    ) : (
                                        "-"
                                    )}
                                </TableCell>
                                {adminAccess && (
                                    <TableCell className="text-right text-sm py-2">
                                        <div className="flex justify-end gap-1">
                                            {transaction.status === "pending" && onMarkCompleted && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-6 w-6 p-0"
                                                    onClick={() =>
                                                        onMarkCompleted(transaction.id || transaction._id!)
                                                    }
                                                    title="Mark as Completed"
                                                >
                                                    <CheckCircle className="h-3 w-3 text-green-600" />
                                                </Button>
                                            )}
                                            {transaction.status === "pending" && onMarkCancelled && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-6 w-6 p-0"
                                                    onClick={() =>
                                                        onMarkCancelled(transaction.id || transaction._id!)
                                                    }
                                                    title="Mark as Cancelled"
                                                >
                                                    <XCircle className="h-3 w-3 text-orange-600" />
                                                </Button>
                                            )}
                                            {onEdit && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-6 w-6 p-0"
                                                    onClick={() => onEdit(transaction)}
                                                >
                                                    <Edit className="h-3 w-3" />
                                                </Button>
                                            )}
                                            {onDelete && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-6 w-6 p-0"
                                                    onClick={() => onDelete(transaction.id || transaction._id!)}
                                                >
                                                    <Trash2 className="h-3 w-3 text-red-600" />
                                                </Button>
                                            )}
                                        </div>
                                    </TableCell>
                                )}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between py-2">
                <div className="text-xs text-gray-600">
                    Page {page} of {totalPages}
                </div>
                <div className="flex gap-1">
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-7 px-2 text-xs"
                        onClick={() => onPageChange(page - 1)}
                        disabled={page <= 1}
                    >
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-7 px-2 text-xs"
                        onClick={() => onPageChange(page + 1)}
                        disabled={page >= totalPages}
                    >
                        Next
                    </Button>
                </div>
            </div>
        </div>
    );
};

