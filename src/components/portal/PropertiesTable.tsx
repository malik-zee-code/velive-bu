// PropertiesTable.tsx - Property listing table with tabs
"use client";
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Trash2, Pencil, FileText } from "lucide-react";
import { Pagination } from "@/components/common/Pagination";
import { usePagination } from "@/hooks/usePagination";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Property } from "@/lib/services";
import { StaticImport } from "next/dist/shared/lib/get-img-props";

interface PropertiesTableProps {
    properties: Property[];
    loading: boolean;
    onEdit: (property: Property) => void;
    onDelete: (id: string) => void;
    getImageUrl: (property: Property) => string | undefined;
    itemsPerPage?: number;
}

export const PropertiesTable: React.FC<PropertiesTableProps> = ({
    properties,
    loading,
    onEdit,
    onDelete,
    getImageUrl,
    itemsPerPage = 10,
}) => {
    const [activeTab, setActiveTab] = useState("approved");

    const approvedProperties = properties.filter(p => p.isApproved === true);
    const pendingProperties = properties.filter(p => p.isApproved === false || p.isApproved === undefined);

    // Get current properties based on active tab
    const getCurrentProperties = () => {
        switch (activeTab) {
            case "approved":
                return approvedProperties;
            case "pending":
                return pendingProperties;
            default:
                return properties;
        }
    };

    const currentProperties = getCurrentProperties();

    // Use pagination hook
    const {
        currentPage,
        totalPages,
        paginatedData,
        totalItems,
        goToPage,
        resetPagination,
    } = usePagination({
        data: currentProperties,
        itemsPerPage,
    });

    // Reset pagination when tab changes
    const handleTabChange = (value: string) => {
        setActiveTab(value);
        resetPagination();
    };

    if (loading) {
        return <p>Loading properties...</p>;
    }

    const renderTableContent = (propertiesToShow: Property[], showStatus: boolean = false) => (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Image</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Type</TableHead>
                    {showStatus && <TableHead>Status</TableHead>}
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {propertiesToShow.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={showStatus ? 8 : 7} className="text-center text-muted-foreground">
                            No properties found.
                        </TableCell>
                    </TableRow>
                ) : (
                    propertiesToShow.map((property) => (
                        <TableRow key={property.id || property._id}>
                            <TableCell>
                                <Image
                                    src={getImageUrl(property) as string | StaticImport}
                                    alt={property.title}
                                    width={60}
                                    height={40}
                                    className="rounded object-cover"
                                />
                            </TableCell>
                            <TableCell className="font-medium">{property.title}</TableCell>
                            <TableCell>
                                {property.currency} {property.price.toLocaleString()}
                            </TableCell>
                            <TableCell>{property.location?.name || "N/A"}</TableCell>
                            <TableCell>{property.category?.title || "N/A"}</TableCell>
                            <TableCell className="capitalize">{property.listingType}</TableCell>
                            {showStatus && (
                                <TableCell>
                                    {property.isApproved ? (
                                        <Badge variant="default" className="bg-green-500">
                                            Approved
                                        </Badge>
                                    ) : (
                                        <Badge variant="default" className="bg-yellow-500">
                                            Pending
                                        </Badge>
                                    )}
                                </TableCell>
                            )}
                            <TableCell className="text-right space-x-2">
                                <Link href={`/listings/${property.slug}`} target="_blank">
                                    <Button variant="ghost" size="icon">
                                        <FileText className="h-4 w-4" />
                                    </Button>
                                </Link>
                                <Button variant="ghost" size="icon" onClick={() => onEdit(property)}>
                                    <Pencil className="h-4 w-4" />
                                </Button>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="ghost" size="icon">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This will permanently delete this property and all its images.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction
                                                onClick={() => onDelete(property.id || property._id)}
                                            >
                                                Delete
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </TableCell>
                        </TableRow>
                    ))
                )}
            </TableBody>
        </Table>
    );

    return (
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-4">
                <TabsTrigger value="all">
                    All Properties
                    <Badge variant="secondary" className="ml-2">
                        {properties.length}
                    </Badge>
                </TabsTrigger>
                <TabsTrigger value="approved">
                    Approved
                    <Badge variant="default" className="ml-2 bg-green-500">
                        {approvedProperties.length}
                    </Badge>
                </TabsTrigger>
                <TabsTrigger value="pending">
                    Pending Approval
                    <Badge variant="default" className="ml-2 bg-yellow-500">
                        {pendingProperties.length}
                    </Badge>
                </TabsTrigger>
            </TabsList>

            <TabsContent value="all">
                {renderTableContent(paginatedData, true)}
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={totalItems}
                    itemsPerPage={itemsPerPage}
                    onPageChange={goToPage}
                />
            </TabsContent>

            <TabsContent value="approved">
                {renderTableContent(paginatedData, false)}
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={totalItems}
                    itemsPerPage={itemsPerPage}
                    onPageChange={goToPage}
                />
            </TabsContent>

            <TabsContent value="pending">
                {renderTableContent(paginatedData, false)}
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={totalItems}
                    itemsPerPage={itemsPerPage}
                    onPageChange={goToPage}
                />
            </TabsContent>
        </Tabs>
    );
};

