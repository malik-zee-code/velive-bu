"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { customerDocumentService, CustomerDocument } from "@/lib/services";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Download, Eye, FileText, Calendar, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { Pagination } from "@/components/common/Pagination";
import { usePagination } from "@/hooks/usePagination";

export default function MyDocumentsPage() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [documents, setDocuments] = useState<CustomerDocument[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    // Pagination
    const {
        currentPage,
        totalPages,
        paginatedData: paginatedDocuments,
        totalItems,
        goToPage,
    } = usePagination({
        data: documents,
        itemsPerPage: 10,
    });

    // Check if user is admin or manager
    const isAdminOrManager = user?.roles?.some((role: any) => {
        const roleName = typeof role === 'string' ? role : role.role || role.name;
        return roleName?.toLowerCase() === 'admin' || roleName?.toLowerCase() === 'manager';
    }) || false;

    useEffect(() => {
        if (!isAdminOrManager) {
            fetchMyDocuments();
        }
    }, [isAdminOrManager]);

    const fetchMyDocuments = async () => {
        try {
            setLoading(true);
            const userId = user?.id || user?._id;
            if (!userId) {
                throw new Error("User ID not found");
            }
            const response = await customerDocumentService.getUserDocuments(userId);
            if (response.success) {
                setDocuments(response.data);
            }
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err : new Error("Failed to fetch documents"));
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async (documentId: string, fileName: string) => {
        try {
            await customerDocumentService.downloadDocument(documentId, fileName);
        } catch (error) {
            console.error('Download failed:', error);
            toast({
                title: "Download failed",
                description: "Failed to download document. Please try again.",
                variant: "destructive",
            });
        }
    };

    const isExpiringSoon = (expiryDate?: string) => {
        if (!expiryDate) return false;
        const expiry = new Date(expiryDate);
        const now = new Date();
        const daysUntilExpiry = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return daysUntilExpiry > 0 && daysUntilExpiry <= 30;
    };

    const isExpired = (expiryDate?: string) => {
        if (!expiryDate) return false;
        return new Date(expiryDate) < new Date();
    };

    const getStatusBadge = (expiryDate?: string) => {
        if (!expiryDate) {
            return <Badge variant="secondary">No Expiry</Badge>;
        }

        if (isExpired(expiryDate)) {
            return <Badge variant="destructive">Expired</Badge>;
        }

        if (isExpiringSoon(expiryDate)) {
            return <Badge variant="outline" className="border-orange-500 text-orange-500">Expiring Soon</Badge>;
        }

        return <Badge variant="default">Valid</Badge>;
    };

    // Redirect admin/manager users
    if (isAdminOrManager) {
        return (
            <div className="p-4 md:p-0">
                <Card>
                    <CardHeader>
                        <CardTitle>Access Denied</CardTitle>
                        <CardDescription>
                            This page is only available for regular users. Admin and Manager users should use the Customers page to manage documents.
                        </CardDescription>
                    </CardHeader>
                </Card>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="p-4 md:p-0">
                <Card>
                    <CardHeader>
                        <CardTitle>My Documents</CardTitle>
                        <CardDescription>Loading your documents...</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 md:p-0">
                <Card>
                    <CardHeader>
                        <CardTitle>My Documents</CardTitle>
                        <CardDescription>Error loading documents</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-center py-8">
                            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                            <p className="text-lg font-medium text-gray-900 mb-2">Error Loading Documents</p>
                            <p className="text-gray-600 mb-4">{error.message}</p>
                            <Button onClick={fetchMyDocuments}>Try Again</Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-0">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        My Documents
                    </CardTitle>
                    <CardDescription>
                        View and download your documents. You have {documents.length} document(s) total.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {documents.length === 0 ? (
                        <div className="text-center py-8">
                            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                            <p className="text-lg font-medium text-gray-900 mb-2">No Documents Found</p>
                            <p className="text-gray-600">
                                You don't have any documents uploaded yet.
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Document Name</TableHead>
                                            <TableHead>Type</TableHead>
                                            <TableHead>Upload Date</TableHead>
                                            <TableHead>Expiry Date</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>File Size</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {paginatedDocuments.map((document: CustomerDocument) => (
                                            <TableRow key={document._id || document.id}>
                                                <TableCell className="font-medium">
                                                    <div className="flex items-center gap-2">
                                                        <FileText className="h-4 w-4 text-gray-500" />
                                                        {document.fileName}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">
                                                        {document.documentType}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    {document.createdAt ? format(new Date(document.createdAt), 'dd-MMM-yyyy') : 'N/A'}
                                                </TableCell>
                                                <TableCell>
                                                    {document.expiryDate ? (
                                                        <div className="flex items-center gap-1">
                                                            <Calendar className="h-4 w-4 text-gray-500" />
                                                            {format(new Date(document.expiryDate), 'dd-MMM-yyyy')}
                                                        </div>
                                                    ) : (
                                                        'No Expiry'
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {getStatusBadge(document.expiryDate)}
                                                </TableCell>
                                                <TableCell>
                                                    {document.fileSize ? `${(document.fileSize / 1024 / 1024).toFixed(2)} MB` : 'N/A'}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleDownload(document._id || document.id, document.fileName)}
                                                        >
                                                            <Download className="h-4 w-4 mr-1" />
                                                            Download
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>

                            {totalPages > 1 && (
                                <div className="mt-6">
                                    <Pagination
                                        currentPage={currentPage}
                                        totalPages={totalPages}
                                        onPageChange={goToPage}
                                        itemsPerPage={10}
                                        totalItems={totalItems}
                                    />
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
