// src/app/portal/properties/page.tsx
"use client";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose,
} from "@/components/ui/dialog";
import {
    propertyService,
    locationService,
    categoryService,
    userService,
    Property,
    propertyImageService,
    User,
} from "@/lib/services";
import { propertyFileService } from "@/lib/services/propertyFileService";
import { isAdmin } from "@/lib/auth";
import { PropertyFormFields } from "@/components/portal/PropertyFormFields";
import { PropertyImageManager } from "@/components/portal/PropertyImageManager";
import { PropertiesTable } from "@/components/portal/PropertiesTable";

const formSchema = z.object({
    title: z.string().min(1, { message: "Title is required." }),
    slug: z.string().optional(),
    price: z.coerce.number({ required_error: "Price is required." }).positive(),
    areaInFeet: z.coerce.number().optional(),
    bedrooms: z.coerce.number().optional(),
    bathrooms: z.coerce.number().optional(),
    currency: z.string().optional(),
    tagline: z.string().optional(),
    longDescription: z.string().optional(),
    address: z.string().optional(),
    location: z.string().min(1, "Location is required."),
    category: z.string().min(1, "Category is required."),
    owner: z.any().optional(),
    rentee: z.any().optional(),
    isFeatured: z.boolean().default(false),
    isAvailable: z.boolean().default(true),
    isApproved: z.boolean().default(false),
    isFurnished: z.boolean().default(false),
    listingType: z.enum(["sale", "rent"]).default("rent"),
    floorPlan: z.string().optional(),
    installmentPlan: z.string().optional(),
    reference: z.string().optional(),
});

const generateSlug = (title: string) => {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
};

type Category = {
    id: string;
    title: string;
};

type Location = {
    id: string;
    name: string;
};

const PropertiesPage = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProperty, setEditingProperty] = useState<Property | null>(null);
    const [properties, setProperties] = useState<Property[]>([]);
    const [locations, setLocations] = useState<Location[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [owners, setOwners] = useState<User[]>([]);
    const [rentees, setRentees] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [isMutating, setIsMutating] = useState(false);
    const [pendingImages, setPendingImages] = useState<File[]>([]);
    const [pendingFloorPlanFile, setPendingFloorPlanFile] = useState<File | null>(null);
    const [pendingInstallmentPlanFile, setPendingInstallmentPlanFile] = useState<File | null>(null);
    const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);
    const [deleteFloorPlan, setDeleteFloorPlan] = useState(false);
    const [deleteInstallmentPlan, setDeleteInstallmentPlan] = useState(false);
    const [originalEditingProperty, setOriginalEditingProperty] = useState<Property | null>(null);
    const { toast } = useToast();

    const fetchData = async () => {
        try {
            setLoading(true);
            const [propertiesRes, locationsRes, categoriesRes, usersRes] = await Promise.all([
                isAdmin() ? propertyService.getAllProperties() : propertyService.getPropertiesByOwner(),
                locationService.getAllLocations(),
                categoryService.getAllCategories(),
                userService.getAllUsers(),
            ]);
            setProperties(propertiesRes.data);
            setLocations(locationsRes.data);
            setCategories(categoriesRes.data);

            // Filter users by roles
            const ownersData = usersRes.data.filter(
                (user: any) =>
                    user.roles &&
                    user.roles.some(
                        (role: any) => (typeof role === "string" ? role : role.role)?.toLowerCase() === "owner"
                    )
            );
            setOwners(ownersData);

            const renteesData = usersRes.data.filter(
                (user: any) =>
                    user.roles &&
                    user.roles.some(
                        (role: any) => (typeof role === "string" ? role : role.role)?.toLowerCase() === "rentee"
                    )
            );
            setRentees(renteesData);
        } catch (err) {
            console.error("Failed to fetch data:", err);
            toast({ title: "Error", description: "Failed to load data", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            slug: "",
            price: 0,
            areaInFeet: 0,
            bedrooms: 0,
            bathrooms: 0,
            currency: "AED",
            tagline: "",
            longDescription: "",
            address: "",
            location: "",
            category: "",
            owner: {},
            rentee: {},
            isFeatured: false,
            isAvailable: true,
            isApproved: false,
            isFurnished: false,
            listingType: "rent",
            floorPlan: "",
            installmentPlan: "",
            reference: "",
        },
    });

    const handleFloorPlanFileSelect = (file: File) => {
        setPendingFloorPlanFile(file);
    };

    const handleInstallmentPlanFileSelect = (file: File) => {
        setPendingInstallmentPlanFile(file);
    };

    const handleFormSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            setIsMutating(true);
            const slug = values.slug || generateSlug(values.title);

            const propertyData = {
                title: values.title,
                slug,
                price: values.price,
                areaInFeet: values.areaInFeet,
                bedrooms: values.bedrooms,
                bathrooms: values.bathrooms,
                currency: values.currency,
                tagline: values.tagline,
                longDescription: values.longDescription,
                address: values.address,
                location: values.location,
                category: values.category,
                owner: values.owner && values.owner !== "" ? values.owner : undefined,
                rentee: values.rentee === "none" || values.rentee === "" ? undefined : values.rentee,
                isFeatured: values.isFeatured,
                isAvailable: values.isAvailable,
                isApproved: values.isApproved,
                isFurnished: values.isFurnished,
                listingType: values.listingType,
                floorPlan: values.floorPlan,
                installmentPlan: values.installmentPlan,
                reference: values.reference,
            };

            if (editingProperty) {
                const propertyId = editingProperty.id || editingProperty._id;

                // Delete marked images
                if (imagesToDelete.length > 0) {
                    try {
                        await Promise.all(
                            imagesToDelete.map(imageId =>
                                propertyImageService.deletePropertyImage(imageId)
                            )
                        );
                    } catch (error) {
                        console.error("Failed to delete some images:", error);
                    }
                }

                // Upload pending images for existing property
                if (pendingImages.length > 0) {
                    try {
                        const formData = new FormData();
                        pendingImages.forEach((file) => {
                            formData.append("images", file);
                        });

                        await propertyImageService.uploadMultipleImages(propertyId, formData);
                    } catch (imageError) {
                        console.error("Failed to upload images:", imageError);
                        toast({
                            title: "Warning!",
                            description: "Property updated but some images failed to upload.",
                            variant: "destructive",
                        });
                    }
                }

                // Upload pending floor plan if exists
                if (pendingFloorPlanFile) {
                    try {
                        await propertyFileService.uploadFloorPlan(propertyId, pendingFloorPlanFile);
                    } catch (error) {
                        console.error("Failed to upload floor plan:", error);
                        toast({
                            title: "Warning!",
                            description: "Property updated but floor plan upload failed.",
                            variant: "destructive",
                        });
                    }
                }

                // Upload pending installment plan if exists
                if (pendingInstallmentPlanFile) {
                    try {
                        await propertyFileService.uploadInstallmentPlan(propertyId, pendingInstallmentPlanFile);
                    } catch (error) {
                        console.error("Failed to upload installment plan:", error);
                        toast({
                            title: "Warning!",
                            description: "Property updated but installment plan upload failed.",
                            variant: "destructive",
                        });
                    }
                }

                // Delete floor plan if marked
                if (deleteFloorPlan) {
                    try {
                        await propertyFileService.deleteFloorPlan(propertyId);
                    } catch (error) {
                        console.error("Failed to delete floor plan:", error);
                    }
                }

                // Delete installment plan if marked
                if (deleteInstallmentPlan) {
                    try {
                        await propertyFileService.deleteInstallmentPlan(propertyId);
                    } catch (error) {
                        console.error("Failed to delete installment plan:", error);
                    }
                }

                await propertyService.updateProperty(propertyId, propertyData);
                toast({ title: "Success!", description: "Property updated successfully." });
            } else {
                const newProperty = await propertyService.createProperty(propertyData);

                // Upload pending images for new property
                if (pendingImages.length > 0 && newProperty.data) {
                    try {
                        const formData = new FormData();
                        pendingImages.forEach((file) => {
                            formData.append("images", file);
                        });

                        await propertyImageService.uploadMultipleImages(
                            newProperty.data.id || newProperty.data._id,
                            formData
                        );
                        toast({ title: "Success!", description: "Property and images added successfully." });
                    } catch (imageError) {
                        console.error("Failed to upload images:", imageError);
                        toast({
                            title: "Warning!",
                            description: "Property created but some images failed to upload.",
                            variant: "destructive",
                        });
                    }
                } else {
                    toast({ title: "Success!", description: "Property added successfully." });
                }

                // Upload PDF files for new property
                if (newProperty.data) {
                    const propertyId = newProperty.data.id || newProperty.data._id;

                    // Upload floor plan if selected
                    if (pendingFloorPlanFile) {
                        try {
                            await propertyFileService.uploadFloorPlan(propertyId, pendingFloorPlanFile);
                        } catch (error) {
                            console.error("Failed to upload floor plan:", error);
                            toast({
                                title: "Warning!",
                                description: "Property created but floor plan upload failed.",
                                variant: "destructive",
                            });
                        }
                    }

                    // Upload installment plan if selected
                    if (pendingInstallmentPlanFile) {
                        try {
                            await propertyFileService.uploadInstallmentPlan(propertyId, pendingInstallmentPlanFile);
                        } catch (error) {
                            console.error("Failed to upload installment plan:", error);
                            toast({
                                title: "Warning!",
                                description: "Property created but installment plan upload failed.",
                                variant: "destructive",
                            });
                        }
                    }
                }
            }

            form.reset();
            setIsModalOpen(false);
            setEditingProperty(null);
            setOriginalEditingProperty(null);
            setPendingImages([]);
            setPendingFloorPlanFile(null);
            setPendingInstallmentPlanFile(null);
            setImagesToDelete([]);
            setDeleteFloorPlan(false);
            setDeleteInstallmentPlan(false);
            fetchData();
        } catch (err) {
            console.error(err);
            toast({ title: "Error!", description: "Failed to save property.", variant: "destructive" });
        } finally {
            setIsMutating(false);
        }
    };

    const handleEdit = async (property: Property) => {
        try {
            // Clear any pending files from previous operations
            setPendingImages([]);
            setPendingFloorPlanFile(null);
            setPendingInstallmentPlanFile(null);
            setImagesToDelete([]);
            setDeleteFloorPlan(false);
            setDeleteInstallmentPlan(false);

            console.log("Fetching property for editing:", property.id || property._id);
            const propertyRes = await propertyService.getPropertyById(property.id || property._id);
            console.log("Property API response:", propertyRes);

            const propertyWithImages = propertyRes.data;
            console.log("Property with images:", propertyWithImages);

            // Check if property data exists
            if (!propertyWithImages) {
                throw new Error("Property not found");
            }

            // Ensure ID fields are properly set
            if (!propertyWithImages.id && propertyWithImages._id) {
                propertyWithImages.id = propertyWithImages._id;
            }
            if (!propertyWithImages._id && propertyWithImages.id) {
                propertyWithImages._id = propertyWithImages.id;
            }

            setEditingProperty(propertyWithImages);
            // Keep a copy of the original for restoring on cancel
            setOriginalEditingProperty(JSON.parse(JSON.stringify(propertyWithImages)));

            // Extract IDs with null checks
            const locationId = propertyWithImages.location && typeof propertyWithImages.location === "object"
                ? propertyWithImages.location._id || propertyWithImages.location.id || ""
                : propertyWithImages.location || "";

            const categoryId = propertyWithImages.category && typeof propertyWithImages.category === "object"
                ? propertyWithImages.category._id || propertyWithImages.category.id || ""
                : propertyWithImages.category || "";

            const ownerId = propertyWithImages.owner && typeof propertyWithImages.owner === "object"
                ? propertyWithImages.owner._id || propertyWithImages.owner.id || ""
                : propertyWithImages.owner || "";

            const renteeId = propertyWithImages.rentee
                ? typeof propertyWithImages.rentee === "object"
                    ? propertyWithImages.rentee._id || propertyWithImages.rentee.id || "none"
                    : propertyWithImages.rentee || "none"
                : "none";

            setTimeout(() => {
                form.reset({
                    title: propertyWithImages.title || "",
                    slug: propertyWithImages.slug || "",
                    price: propertyWithImages.price || 0,
                    areaInFeet: propertyWithImages.areaInFeet || 0,
                    bedrooms: propertyWithImages.bedrooms || 0,
                    bathrooms: propertyWithImages.bathrooms || 0,
                    currency: propertyWithImages.currency || "AED",
                    tagline: propertyWithImages.tagline || "",
                    longDescription: propertyWithImages.longDescription || "",
                    address: propertyWithImages.address || "",
                    location: locationId,
                    category: categoryId,
                    owner: ownerId,
                    rentee: renteeId,
                    isFeatured: propertyWithImages.isFeatured || false,
                    isAvailable: propertyWithImages.isAvailable !== undefined ? propertyWithImages.isAvailable : true,
                    isApproved: propertyWithImages.isApproved !== undefined ? propertyWithImages.isApproved : false,
                    isFurnished: propertyWithImages.isFurnished || false,
                    listingType: (propertyWithImages.listingType as any) || "rent",
                    floorPlan: propertyWithImages.floorPlan || "",
                    installmentPlan: propertyWithImages.installmentPlan || "",
                    reference: propertyWithImages.reference || "",
                });
            }, 100);

            setIsModalOpen(true);
        } catch (error) {
            console.error("Error fetching property for editing:", error);
            console.error("Property ID that failed:", property.id || property._id);
            console.error("Property object:", property);
            toast({
                title: "Error",
                description: `Failed to load property details for editing: ${error instanceof Error ? error.message : 'Unknown error'}`,
                variant: "destructive",
            });
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await propertyService.deleteProperty(id);
            toast({ title: "Success!", description: "Property deleted successfully." });
            fetchData();
        } catch (err) {
            toast({ title: "Error!", description: "Failed to delete property.", variant: "destructive" });
        }
    };

    const handleNewProperty = () => {
        setEditingProperty(null);
        setOriginalEditingProperty(null);
        setPendingImages([]);
        setImagesToDelete([]);
        setDeleteFloorPlan(false);
        setDeleteInstallmentPlan(false);
        form.reset({
            title: "",
            slug: "",
            price: 0,
            areaInFeet: 0,
            bedrooms: 0,
            bathrooms: 0,
            currency: "AED",
            tagline: "",
            longDescription: "",
            address: "",
            location: "",
            category: "",
            owner: "",
            rentee: "none",
            isFeatured: false,
            isAvailable: true,
            isApproved: false,
            isFurnished: false,
            listingType: "rent",
        });
        setIsModalOpen(true);
    };

    const getImageUrl = (property: Property): string => {
        if (property.images && property.images.length > 0) {
            const primaryImage = property.images.find((img) => img.isPrimary);
            return primaryImage?.fileUrl || "https://placehold.co/100x100.png";
        }
        return "https://placehold.co/100x100.png";
    };

    return (
        <div className="p-4 md:p-0">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="font-headline text-2xl">Properties</CardTitle>
                        <CardDescription>Manage your property listings</CardDescription>
                    </div>
                    <Dialog open={isModalOpen} onOpenChange={(open) => {
                        setIsModalOpen(open);
                        // Reset deletion states and restore original data when closing the modal
                        if (!open) {
                            setImagesToDelete([]);
                            setDeleteFloorPlan(false);
                            setDeleteInstallmentPlan(false);
                            setPendingImages([]);
                            setPendingFloorPlanFile(null);
                            setPendingInstallmentPlanFile(null);
                            // Restore original property data if it was being edited (Cancel clicked)
                            if (originalEditingProperty) {
                                setEditingProperty(originalEditingProperty);
                                setOriginalEditingProperty(null);
                            }
                        }
                    }}>
                        <DialogTrigger asChild>
                            <Button onClick={handleNewProperty}>
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Add Property
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>{editingProperty ? "Edit Property" : "Add New Property"}</DialogTitle>
                                <p className="text-sm text-gray-600">
                                    {editingProperty
                                        ? "Update the details of your property."
                                        : "Add a new property to your listings."}
                                </p>
                            </DialogHeader>
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                        {/* Left Column - Property Details */}
                                        <PropertyFormFields
                                            control={form.control}
                                            locations={locations}
                                            categories={categories}
                                            owners={owners}
                                            rentees={rentees}
                                            editingProperty={editingProperty}
                                            onFloorPlanFileSelect={handleFloorPlanFileSelect}
                                            onInstallmentPlanFileSelect={handleInstallmentPlanFileSelect}
                                            deleteFloorPlan={deleteFloorPlan}
                                            setDeleteFloorPlan={setDeleteFloorPlan}
                                            deleteInstallmentPlan={deleteInstallmentPlan}
                                            setDeleteInstallmentPlan={setDeleteInstallmentPlan}
                                        />

                                        {/* Right Column - Property Images */}
                                        <PropertyImageManager
                                            editingProperty={editingProperty}
                                            setEditingProperty={setEditingProperty}
                                            pendingImages={pendingImages}
                                            setPendingImages={setPendingImages}
                                            imagesToDelete={imagesToDelete}
                                            setImagesToDelete={setImagesToDelete}
                                        />
                                    </div>

                                    <div className="flex justify-end space-x-4">
                                        <DialogClose asChild>
                                            <Button type="button" variant="outline">
                                                Cancel
                                            </Button>
                                        </DialogClose>
                                        <Button type="submit" disabled={isMutating}>
                                            {isMutating ? "Saving..." : editingProperty ? "Update" : "Add Property"}
                                        </Button>
                                    </div>
                                </form>
                            </Form>
                        </DialogContent>
                    </Dialog>
                </CardHeader>
                <CardContent>
                    <PropertiesTable
                        properties={properties}
                        loading={loading}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        getImageUrl={getImageUrl}
                        itemsPerPage={10}
                    />
                </CardContent>
            </Card>
        </div>
    );
};

export default PropertiesPage;

