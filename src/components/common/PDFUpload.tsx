// PDFUpload.tsx - Component for uploading PDF files
"use client";
import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Upload, X, Download, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { propertyFileService } from "@/lib/services/propertyFileService";

interface PDFUploadProps {
    label: string;
    value?: string; // File path
    onChange: (filePath: string | null) => void;
    propertyId?: string;
    fileType: 'floorPlan' | 'installmentPlan';
    disabled?: boolean;
    onFileSelect?: (file: File) => void; // Callback for file selection during creation
    onMarkForDeletion?: (shouldDelete: boolean) => void; // Callback to mark for deletion
}

export const PDFUpload: React.FC<PDFUploadProps> = ({
    label,
    value,
    onChange,
    propertyId,
    fileType,
    disabled = false,
    onFileSelect,
    onMarkForDeletion,
}) => {
    const [uploading, setUploading] = useState(false);
    const [dragOver, setDragOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();

    const handleFileSelect = async (file: File) => {
        if (file.type !== 'application/pdf') {
            toast({
                title: "Invalid file type",
                description: "Please upload a PDF file",
                variant: "destructive",
            });
            return;
        }

        if (file.size > 10 * 1024 * 1024) { // 10MB limit
            toast({
                title: "File too large",
                description: "File size must be less than 10MB",
                variant: "destructive",
            });
            return;
        }

        // Store the file for later upload (both create and edit mode)
        if (onFileSelect) {
            onFileSelect(file);
        }

        // Unmark for deletion if it was marked
        if (onMarkForDeletion) {
            onMarkForDeletion(false);
        }

        const filePath = URL.createObjectURL(file);
        onChange(filePath);
        toast({
            title: "File selected",
            description: `File will be uploaded when you ${propertyId ? 'update' : 'save'} the property`,
        });
    };

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFileSelect(file);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);

        const file = e.dataTransfer.files[0];
        if (file) {
            handleFileSelect(file);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
    };

    const handleRemoveFile = async () => {
        if (!value) return;

        if (propertyId && onMarkForDeletion) {
            // Edit mode: mark for deletion instead of immediately deleting
            onMarkForDeletion(true);
            onChange("");
            toast({
                title: "File marked for deletion",
                description: `${label} will be removed when you click Update`,
            });
        } else {
            // New property mode or no callback: just clear the value
            onChange(null);
            toast({
                title: "File removed",
                description: `${label} removed`,
            });
        }
    };

    const handleDownload = () => {
        if (!value) return;
        const fileName = `${fileType}_${propertyId}.pdf`;
        propertyFileService.downloadFile(value, fileName);
    };

    const handleView = () => {
        if (!value) return;
        const fileUrl = propertyFileService.getFileUrl(value);
        window.open(fileUrl, '_blank');
    };

    const getFileName = () => {
        if (!value) return '';
        const parts = value.split('/');
        return parts[parts.length - 1] || value;
    };

    return (
        <div className="space-y-2">
            <Label htmlFor={`${fileType}-upload`}>{label}</Label>

            {value ? (
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <FileText className="h-5 w-5 text-red-500" />
                                <div>
                                    <p className="text-sm font-medium">{getFileName()}</p>
                                    <p className="text-xs text-gray-500">PDF Document</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={handleView}
                                    disabled={disabled}
                                >
                                    <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={handleDownload}
                                    disabled={disabled}
                                >
                                    <Download className="h-4 w-4" />
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={handleRemoveFile}
                                    disabled={disabled}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div
                    className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${dragOver
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onClick={() => !disabled && fileInputRef.current?.click()}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf"
                        onChange={handleFileInputChange}
                        className="hidden"
                        disabled={disabled}
                    />

                    {uploading ? (
                        <div className="flex flex-col items-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-2"></div>
                            <p className="text-blue-600 font-medium">Uploading...</p>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center">
                            <Upload className="h-8 w-8 text-gray-400 mb-2" />
                            <p className="text-gray-600 font-medium mb-1">
                                {dragOver ? 'Drop PDF here' : 'Upload PDF'}
                            </p>
                            <p className="text-sm text-gray-500">
                                Drag and drop or click to browse
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                                Max file size: 10MB
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
