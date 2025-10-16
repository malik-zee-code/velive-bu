// DocumentManager.tsx - Component for managing customer documents
"use client";
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { customerDocumentService, CustomerDocument } from "@/lib/services";
import { useAuth } from "@/contexts/AuthContext";
import { FileText, Upload, Download, Eye, Trash2, Calendar, AlertTriangle } from "lucide-react";
import { format } from "date-fns";

interface DocumentManagerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    userId: string;
    userName: string;
}

const DOCUMENT_TYPES = [
    "ID Proof",
    "Contract",
    "Payment Receipt",
    "Utility Bill",
    "Insurance Document",
    "Other",
];

export const DocumentManager: React.FC<DocumentManagerProps> = ({
    open,
    onOpenChange,
    userId,
    userName,
}) => {
    const { toast } = useToast();
    const { user } = useAuth();
    const [documents, setDocuments] = useState<CustomerDocument[]>([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    // Check if user has admin or manager role, or is the document owner
    const canAccessDocuments = user?.roles?.some((role: any) => {
        const roleName = typeof role === 'string' ? role : role.role || role.name;
        return roleName?.toLowerCase() === 'admin' || roleName?.toLowerCase() === 'manager';
    }) || userId === user?.id || userId === user?._id;

    // Upload form state
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [documentType, setDocumentType] = useState("");
    const [expiryDate, setExpiryDate] = useState("");
    const [notes, setNotes] = useState("");

    useEffect(() => {
        if (open && userId && userId !== "undefined") {
            fetchDocuments();
        }
    }, [open, userId]);

    const fetchDocuments = async () => {
        try {
            setLoading(true);
            const response = await customerDocumentService.getUserDocuments(userId);
            if (response.success) {
                setDocuments(response.data);
            }
        } catch (error) {
            console.error("Error fetching documents:", error);
            toast({
                title: "Error",
                description: "Failed to load documents",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.type !== "application/pdf") {
                toast({
                    title: "Invalid file type",
                    description: "Please upload a PDF file",
                    variant: "destructive",
                });
                return;
            }
            if (file.size > 10 * 1024 * 1024) {
                toast({
                    title: "File too large",
                    description: "File size must be less than 10MB",
                    variant: "destructive",
                });
                return;
            }
            setSelectedFile(file);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile || !documentType) {
            toast({
                title: "Missing information",
                description: "Please select a file and document type",
                variant: "destructive",
            });
            return;
        }

        if (!userId || userId === "undefined") {
            toast({
                title: "Error",
                description: "Invalid user ID. Please try again.",
                variant: "destructive",
            });
            return;
        }

        try {
            setUploading(true);
            const response = await customerDocumentService.uploadDocument(
                {
                    userId,
                    documentType,
                    expiryDate: expiryDate || undefined,
                    notes: notes || undefined,
                },
                selectedFile
            );

            if (response.success) {
                toast({
                    title: "Success",
                    description: "Document uploaded successfully",
                });

                // Reset form
                setSelectedFile(null);
                setDocumentType("");
                setExpiryDate("");
                setNotes("");

                // Refresh documents
                fetchDocuments();
            }
        } catch (error) {
            console.error("Upload error:", error);
            toast({
                title: "Upload failed",
                description: "Failed to upload document",
                variant: "destructive",
            });
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (documentId: string) => {
        try {
            await customerDocumentService.deleteDocument(documentId);
            toast({
                title: "Success",
                description: "Document deleted successfully",
            });
            fetchDocuments();
        } catch (error) {
            console.error("Delete error:", error);
            toast({
                title: "Error",
                description: "Failed to delete document",
                variant: "destructive",
            });
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

    // Check if user has access to view documents
    if (!canAccessDocuments) {
        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Access Denied</DialogTitle>
                    </DialogHeader>
                    <div className="text-center py-8">
                        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                        <p className="text-lg font-medium text-gray-900 mb-2">Access Denied</p>
                        <p className="text-gray-600">
                            You don't have permission to view or manage documents for this user.
                        </p>
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Document Manager - {userName}</DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Upload Section */}
                    <div className="border rounded-lg p-4 space-y-4">
                        <h3 className="font-semibold flex items-center gap-2">
                            <Upload className="w-4 h-4" />
                            Upload New Document
                        </h3>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="file">Select PDF File</Label>
                                <Input
                                    id="file"
                                    type="file"
                                    accept=".pdf"
                                    onChange={handleFileSelect}
                                    disabled={uploading}
                                />
                                {selectedFile && (
                                    <p className="text-sm text-gray-600 mt-1">
                                        Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                                    </p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="documentType">Document Type</Label>
                                <Select value={documentType} onValueChange={setDocumentType} disabled={uploading}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {DOCUMENT_TYPES.map((type) => (
                                            <SelectItem key={type} value={type}>
                                                {type}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            {
                                documentType !== "Payment Receipt" && (
                                    <div>
                                        <Label htmlFor="expiryDate">Expiry Date (Optional)</Label>
                                        <Input
                                            id="expiryDate"
                                            type="date"
                                            value={expiryDate}
                                            onChange={(e) => setExpiryDate(e.target.value)}
                                            disabled={uploading}
                                        />
                                    </div>
                                )
                            }


                            <div>
                                <Label htmlFor="notes">Notes (Optional)</Label>
                                <Textarea
                                    id="notes"
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Add any notes..."
                                    disabled={uploading}
                                    rows={3}
                                />
                            </div>
                        </div>

                        <Button onClick={handleUpload} disabled={uploading || !selectedFile || !documentType}>
                            {uploading ? "Uploading..." : "Upload Document"}
                        </Button>
                    </div>

                    {/* Documents List */}
                    <div>
                        <h3 className="font-semibold mb-4">Uploaded Documents ({documents.length})</h3>

                        {loading ? (
                            <p>Loading documents...</p>
                        ) : documents.length === 0 ? (
                            <p className="text-gray-500 text-center py-8">No documents uploaded yet</p>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Document Type</TableHead>
                                        <TableHead>File Name</TableHead>
                                        <TableHead>Expiry Date</TableHead>
                                        <TableHead>Uploaded</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {documents.map((doc) => (
                                        <TableRow key={doc._id || doc.id}>
                                            <TableCell className="font-medium">{doc.documentType}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <FileText className="w-4 h-4 text-red-500" />
                                                    {doc.fileName}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {doc.expiryDate ? (
                                                    <div className="flex items-center gap-2">
                                                        {isExpired(doc.expiryDate) ? (
                                                            <span className="text-red-600 flex items-center gap-1">
                                                                <AlertTriangle className="w-4 h-4" />
                                                                Expired
                                                            </span>
                                                        ) : isExpiringSoon(doc.expiryDate) ? (
                                                            <span className="text-orange-600 flex items-center gap-1">
                                                                <Calendar className="w-4 h-4" />
                                                                Expiring Soon
                                                            </span>
                                                        ) : (
                                                            <span className="text-gray-600">
                                                                {format(new Date(doc.expiryDate), "dd-MMM-yyyy")}
                                                            </span>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400">No expiry</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {format(new Date(doc.createdAt), "dd-MMM-yyyy")}
                                            </TableCell>
                                            <TableCell className="text-right space-x-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDownload(doc._id || doc.id, doc.fileName)}
                                                >
                                                    <Download className="w-4 h-4" />
                                                </Button>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button variant="ghost" size="icon">
                                                            <Trash2 className="w-4 h-4 text-destructive" />
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Delete Document?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                This will permanently delete this document. This action cannot be undone.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => handleDelete(doc._id || doc.id)}>
                                                                Delete
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
