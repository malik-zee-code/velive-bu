// ExpiringDocumentsWidget.tsx - Dashboard widget for expiring documents
"use client";
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { customerDocumentService, CustomerDocument } from "@/lib/services";
import { AlertTriangle, Calendar, FileText, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";

export const ExpiringDocumentsWidget: React.FC = () => {
    const { user } = useAuth();
    const [documents, setDocuments] = useState<CustomerDocument[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    // Check if user has admin or manager role
    const canViewDocuments = user?.roles?.some((role: any) => {
        const roleName = typeof role === 'string' ? role : role.role || role.name;
        return roleName?.toLowerCase() === 'admin' || roleName?.toLowerCase() === 'manager';
    }) || false;

    useEffect(() => {
        fetchExpiringDocuments();
    }, []);

    const fetchExpiringDocuments = async () => {
        try {
            setLoading(true);
            const response = await customerDocumentService.getExpiringDocuments(30);
            if (response.success) {
                // Filter documents based on user access
                let filteredDocuments = response.data;

                if (!canViewDocuments) {
                    // If user is not admin/manager, only show their own documents
                    filteredDocuments = response.data.filter((doc: CustomerDocument) => {
                        const docUserId = typeof doc.user === 'string' ? doc.user : doc.user?._id || doc.user?.id;
                        return docUserId === user?.id || docUserId === user?._id;
                    });
                }

                setDocuments(filteredDocuments);
            }
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err : new Error("Failed to fetch expiring documents"));
        } finally {
            setLoading(false);
        }
    };

    const getDaysUntilExpiry = (expiryDate: string) => {
        const expiry = new Date(expiryDate);
        const now = new Date();
        return Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    };

    const isExpired = (expiryDate: string) => {
        return new Date(expiryDate) < new Date();
    };

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-orange-500" />
                        Expiring Documents
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-gray-500">Loading...</p>
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-orange-500" />
                        Expiring Documents
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-red-500">Error loading documents</p>
                </CardContent>
            </Card>
        );
    }

    // Don't render if user doesn't have access to any documents
    if (!canViewDocuments && documents.length === 0) {
        return null;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-orange-500" />
                    Expiring Documents
                </CardTitle>
                <CardDescription>
                    Documents expiring within 30 days
                </CardDescription>
            </CardHeader>
            <CardContent>
                {documents.length === 0 ? (
                    <div className="text-center py-6">
                        <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">No documents expiring soon</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {documents.slice(0, 5).map((doc) => {
                            const daysLeft = getDaysUntilExpiry(doc.expiryDate!);
                            const expired = isExpired(doc.expiryDate!);

                            return (
                                <div
                                    key={doc._id || doc.id}
                                    className={`flex items-start justify-between p-3 rounded-lg border ${expired
                                        ? "bg-red-50 border-red-200"
                                        : daysLeft <= 7
                                            ? "bg-orange-50 border-orange-200"
                                            : "bg-yellow-50 border-yellow-200"
                                        }`}
                                >
                                    <div className="flex items-start gap-3 flex-1">
                                        <FileText className={`h-5 w-5 mt-0.5 ${expired ? "text-red-500" : "text-orange-500"
                                            }`} />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <p className="font-medium text-sm truncate">
                                                    {doc.documentType}
                                                </p>
                                                {expired ? (
                                                    <Badge variant="destructive" className="text-xs">
                                                        Expired
                                                    </Badge>
                                                ) : daysLeft <= 7 ? (
                                                    <Badge variant="destructive" className="text-xs bg-orange-500">
                                                        {daysLeft} days left
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="secondary" className="text-xs">
                                                        {daysLeft} days left
                                                    </Badge>
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-600 truncate">
                                                {doc.user.name} ({doc.user.email})
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                Expires: {format(new Date(doc.expiryDate!), "dd-MMM-yyyy")}
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={async () => {
                                            try {
                                                await customerDocumentService.downloadDocument(
                                                    doc._id || doc.id,
                                                    doc.fileName
                                                );
                                            } catch (error) {
                                                console.error('Download failed:', error);
                                            }
                                        }}
                                    >
                                        <ExternalLink className="h-4 w-4" />
                                    </Button>
                                </div>
                            );
                        })}

                        {documents.length > 5 && (
                            <p className="text-xs text-center text-gray-500 pt-2">
                                +{documents.length - 5} more documents expiring soon
                            </p>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
