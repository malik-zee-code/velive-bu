// src/app/portal/properties/page.tsx
'use client';
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import Image from 'next/image';
import { Trash2, Pencil, PlusCircle, FileText, Star, X, XIcon } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { propertyService, locationService, categoryService, userService, Property, propertyImageService, PropertyImage } from '@/lib/services';
import { StaticImport } from 'next/dist/shared/lib/get-img-props';

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
    isFeatured: z.boolean().default(false),
    isAvailable: z.boolean().default(true),
    isFurnished: z.boolean().default(false),
    listingType: z.enum(["sale", "rent"]).default("rent"),
});

const generateSlug = (title: string) => {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
};

// Using Property type from service

type Category = {
    id: string;
    title: string;
}

type Location = {
    id: string;
    name: string;
}

type User = {
    _id: string;
    email: string;
    name: string;
}

const PropertiesPage = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProperty, setEditingProperty] = useState<Property | null>(null);
    const [properties, setProperties] = useState<Property[]>([]);
    const [locations, setLocations] = useState<Location[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [isMutating, setIsMutating] = useState(false);
    const [pendingImages, setPendingImages] = useState<File[]>([]);
    const { toast } = useToast();

    const fetchData = async () => {
        try {
            setLoading(true);
            const [propertiesRes, locationsRes, categoriesRes] = await Promise.all([
                propertyService.getAllProperties(),
                locationService.getAllLocations(),
                categoryService.getAllCategories(),
            ]);
            setProperties(propertiesRes.data);
            setLocations(locationsRes.data);
            setCategories(categoriesRes.data);
        } catch (err) {
            console.error('Failed to fetch data:', err);
            toast({ title: "Error", description: "Failed to load data", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Force re-render when editing property changes
    useEffect(() => {
        if (editingProperty && isModalOpen) {
            console.log('Modal opened, editing property:', editingProperty);
            console.log('Current form values:', form.getValues());
        }
    }, [editingProperty, isModalOpen]);

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
            isFeatured: false,
            isAvailable: true,
            isFurnished: false,
            listingType: "rent",
        },
    });

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
                isFeatured: values.isFeatured,
                isAvailable: values.isAvailable,
                isFurnished: values.isFurnished,
                listingType: values.listingType,
            };

            if (editingProperty) {
                await propertyService.updateProperty(editingProperty.id || editingProperty._id, propertyData);
                toast({ title: "Success!", description: "Property updated successfully." });
            } else {
                const newProperty = await propertyService.createProperty(propertyData);

                // Upload pending images for new property
                if (pendingImages.length > 0 && newProperty.data) {
                    try {
                        const formData = new FormData();
                        pendingImages.forEach(file => {
                            formData.append('images', file);
                        });

                        await propertyImageService.uploadMultipleImages(newProperty.data.id || newProperty.data._id, formData);
                        toast({ title: "Success!", description: "Property and images added successfully." });
                    } catch (imageError) {
                        console.error('Failed to upload images:', imageError);
                        toast({ title: "Warning!", description: "Property created but some images failed to upload.", variant: "destructive" });
                    }
                } else {
                    toast({ title: "Success!", description: "Property added successfully." });
                }
            }

            form.reset();
            setIsModalOpen(false);
            setEditingProperty(null);
            setPendingImages([]);
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
            // Fetch the property with images
            const propertyRes = await propertyService.getPropertyById(property.id || property._id);
            const propertyWithImages = propertyRes.data;
            setEditingProperty(propertyWithImages);

            console.log('=== EDITING PROPERTY ===');
            console.log('Property:', propertyWithImages);
            console.log('Property images:', propertyWithImages.images);
            console.log('Property location:', propertyWithImages.location);
            console.log('Property category:', propertyWithImages.category);
            console.log('Available locations:', locations);
            console.log('Available categories:', categories);

            // Extract IDs more carefully
            let locationId = '';
            let categoryId = '';

            if (propertyWithImages.location) {
                if (typeof propertyWithImages.location === 'object') {
                    locationId = propertyWithImages.location._id || propertyWithImages.location.id || '';
                } else {
                    locationId = propertyWithImages.location;
                }
            }

            if (propertyWithImages.category) {
                if (typeof propertyWithImages.category === 'object') {
                    categoryId = propertyWithImages.category._id || propertyWithImages.category.id || '';
                } else {
                    categoryId = propertyWithImages.category;
                }
            }

            console.log('Extracted locationId:', locationId);
            console.log('Extracted categoryId:', categoryId);

            // Use setTimeout to ensure the form is reset after the modal opens
            setTimeout(() => {
                const formData = {
                    title: propertyWithImages.title || '',
                    slug: propertyWithImages.slug || '',
                    price: propertyWithImages.price || 0,
                    areaInFeet: propertyWithImages.areaInFeet || 0,
                    bedrooms: propertyWithImages.bedrooms || 0,
                    bathrooms: propertyWithImages.bathrooms || 0,
                    currency: propertyWithImages.currency || 'AED',
                    tagline: propertyWithImages.tagline || '',
                    longDescription: propertyWithImages.longDescription || '',
                    address: propertyWithImages.address || '',
                    location: locationId,
                    category: categoryId,
                    isFeatured: propertyWithImages.isFeatured || false,
                    isAvailable: propertyWithImages.isAvailable !== undefined ? propertyWithImages.isAvailable : true,
                    isFurnished: propertyWithImages.isFurnished || false,
                    listingType: (propertyWithImages.listingType as any) || 'rent',
                };

                console.log('Form data being set:', formData);
                form.reset(formData);
            }, 100);

            setIsModalOpen(true);
        } catch (error) {
            console.error('Error fetching property for editing:', error);
            toast({
                title: "Error",
                description: "Failed to load property details for editing",
                variant: "destructive"
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
        setPendingImages([]);
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
            isFeatured: false,
            isAvailable: true,
            isFurnished: false,
            listingType: "rent",
        });
        setIsModalOpen(true);
    };

    const getImageUrl = (property: Property) => {
        if (property.images && property.images.length > 0) {
            const primaryImage = property.images.find(img => img.isPrimary);

            console.log('Primary image:', primaryImage);

            return (primaryImage?.fileUrl);
        }
        return 'https://placehold.co/100x100.png';
    };

    return (
        <div className="p-4 md:p-0">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="font-headline text-2xl">Properties</CardTitle>
                        <CardDescription>Manage your property listings</CardDescription>
                    </div>
                    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                        <DialogTrigger asChild>
                            <Button onClick={handleNewProperty}>
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Add Property
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>{editingProperty ? 'Edit Property' : 'Add New Property'}</DialogTitle>
                                <p className="text-sm text-gray-600">{editingProperty ? 'Update the details of your property.' : 'Add a new property to your listings.'}</p>
                            </DialogHeader>
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                        {/* Left Column - Property Details */}
                                        <div className="space-y-6">
                                            {/* Listing Type */}
                                            <FormField
                                                control={form.control}
                                                name="listingType"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Listing Type</FormLabel>
                                                        <FormControl>
                                                            <RadioGroup onValueChange={field.onChange} value={field.value} className="flex gap-4">
                                                                <div className="flex items-center space-x-2">
                                                                    <RadioGroupItem value="rent" id="rent" />
                                                                    <Label htmlFor="rent">For Rent</Label>
                                                                </div>
                                                                <div className="flex items-center space-x-2">
                                                                    <RadioGroupItem value="sale" id="sale" />
                                                                    <Label htmlFor="sale">For Sale</Label>
                                                                </div>
                                                            </RadioGroup>
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            {/* Title */}
                                            <FormField
                                                control={form.control}
                                                name="title"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Title</FormLabel>
                                                        <FormControl><Input placeholder="Property title" {...field} /></FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            {/* Price */}
                                            <FormField
                                                control={form.control}
                                                name="price"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Price</FormLabel>
                                                        <FormControl><Input type="number" placeholder="0" {...field} /></FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            {/* Location */}
                                            <FormField
                                                control={form.control}
                                                name="location"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Location</FormLabel>
                                                        <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value} key={`location-${field.value}`}>
                                                            <FormControl>
                                                                <SelectTrigger><SelectValue placeholder="Select location" /></SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                {locations.map((loc) => (
                                                                    <SelectItem key={loc.id} value={loc.id}>{loc.name}</SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            {/* Category */}
                                            <FormField
                                                control={form.control}
                                                name="category"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Category</FormLabel>
                                                        <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value} key={`category-${field.value}`}>
                                                            <FormControl>
                                                                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                {categories.map((cat) => (
                                                                    <SelectItem key={cat.id} value={cat.id}>{cat.title}</SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            {/* Area */}
                                            <FormField
                                                control={form.control}
                                                name="areaInFeet"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Area (sqft)</FormLabel>
                                                        <FormControl><Input type="number" placeholder="0" {...field} /></FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            {/* Bedrooms */}
                                            <FormField
                                                control={form.control}
                                                name="bedrooms"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Bedrooms</FormLabel>
                                                        <FormControl><Input type="number" placeholder="0" {...field} /></FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            {/* Bathrooms */}
                                            <FormField
                                                control={form.control}
                                                name="bathrooms"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Bathrooms</FormLabel>
                                                        <FormControl><Input type="number" placeholder="0" {...field} /></FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            {/* Tagline */}
                                            <FormField
                                                control={form.control}
                                                name="tagline"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Tagline</FormLabel>
                                                        <FormControl><Input placeholder="Short description" {...field} /></FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            {/* Description */}
                                            <FormField
                                                control={form.control}
                                                name="longDescription"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Description</FormLabel>
                                                        <FormControl><Textarea rows={4} placeholder="Property description" {...field} /></FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            {/* Feature Toggles */}
                                            <div className="space-y-4">
                                                <FormField
                                                    control={form.control}
                                                    name="isFeatured"
                                                    render={({ field }) => (
                                                        <FormItem className="flex items-center justify-between rounded-lg border p-4">
                                                            <div>
                                                                <FormLabel>Featured</FormLabel>
                                                            </div>
                                                            <FormControl>
                                                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                                                            </FormControl>
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="isAvailable"
                                                    render={({ field }) => (
                                                        <FormItem className="flex items-center justify-between rounded-lg border p-4">
                                                            <div>
                                                                <FormLabel>Available</FormLabel>
                                                            </div>
                                                            <FormControl>
                                                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                                                            </FormControl>
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="isFurnished"
                                                    render={({ field }) => (
                                                        <FormItem className="flex items-center justify-between rounded-lg border p-4">
                                                            <div>
                                                                <FormLabel>Furnished</FormLabel>
                                                            </div>
                                                            <FormControl>
                                                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                                                            </FormControl>
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                        </div>

                                        {/* Property Images Section */}
                                        <div className="space-y-4">
                                            <div>
                                                <h3 className="text-lg font-medium">Property Images</h3>
                                                <p className="text-sm text-gray-600">Manage the images associated with this property.</p>
                                            </div>

                                            {editingProperty && editingProperty.images && editingProperty.images.length > 0 ? (
                                                <div className="space-y-4">
                                                    <div className="flex justify-between items-center">
                                                        <h4 className="text-sm font-medium">Property Images</h4>
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => {
                                                                const input = document.createElement('input');
                                                                input.type = 'file';
                                                                input.accept = 'image/*';
                                                                input.multiple = true;
                                                                input.onchange = async (e) => {
                                                                    const files = (e.target as HTMLInputElement).files;
                                                                    if (files && files.length > 0 && editingProperty) {
                                                                        const formData = new FormData();
                                                                        Array.from(files).forEach(file => {
                                                                            formData.append('images', file);
                                                                        });
                                                                        try {
                                                                            const response = await propertyImageService.uploadMultipleImages(editingProperty.id, formData);

                                                                            if (response.success && response.data) {
                                                                                setEditingProperty((prev: any) => {
                                                                                    if (!prev) return prev;
                                                                                    return {
                                                                                        ...prev,
                                                                                        images: [
                                                                                            ...(prev.images?.map((img: PropertyImage) => ({
                                                                                                ...img,
                                                                                                isPrimary: false
                                                                                            })) || []),
                                                                                            ...(response.data || [])
                                                                                        ]
                                                                                    };
                                                                                });
                                                                                toast({
                                                                                    title: "Success",
                                                                                    description: `${files.length} image(s) uploaded successfully`,
                                                                                });
                                                                            }
                                                                        } catch (error) {
                                                                            toast({
                                                                                title: "Error",
                                                                                description: "Failed to upload images",
                                                                                variant: "destructive",
                                                                            });
                                                                        }
                                                                    }
                                                                };
                                                                input.click();
                                                            }}
                                                        >
                                                            <PlusCircle className="w-4 h-4 mr-2" />
                                                            Add More Images
                                                        </Button>
                                                    </div>
                                                    <div className="grid grid-cols-3 gap-4">
                                                        {editingProperty.images.map((image, index) => (
                                                            <div key={image._id || index} className="relative group transition-all duration-300 ">
                                                                <div className="aspect-square rounded-lg overflow-hidden border">
                                                                    <Image
                                                                        src={image.fileUrl}
                                                                        alt={image.altText || `Property image ${index + 1}`}
                                                                        width={200}
                                                                        height={300}
                                                                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                                    />
                                                                    <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-40 transition-opacity duration-300" />
                                                                </div>
                                                                {image.isPrimary && (
                                                                    <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
                                                                        <span>★</span>
                                                                        Primary
                                                                    </div>
                                                                )}
                                                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2 z-10">

                                                                    <Button
                                                                        type="button"
                                                                        size="sm"
                                                                        variant={image.isPrimary ? "secondary" : "default"}
                                                                        onClick={() => {
                                                                            if (editingProperty && editingProperty.images) {


                                                                                propertyImageService.setPrimaryPropertyImage(image.id);


                                                                                const updatedImages = editingProperty.images.map(img => ({
                                                                                    ...img,
                                                                                    isPrimary: img.id === image.id
                                                                                }));
                                                                                setEditingProperty({
                                                                                    ...editingProperty,
                                                                                    images: updatedImages
                                                                                });
                                                                            }
                                                                        }}
                                                                        disabled={image.isPrimary}
                                                                    >
                                                                        <Star className="w-4 h-4" />
                                                                    </Button>
                                                                    <Button
                                                                        type="button"
                                                                        size="sm"
                                                                        variant="destructive"
                                                                        onClick={() => {
                                                                            if (editingProperty && editingProperty.images) {
                                                                                propertyImageService.deletePropertyImage(image.id);
                                                                                const updatedImages = editingProperty.images.filter(img => img.id !== image.id);
                                                                                setEditingProperty({
                                                                                    ...editingProperty,
                                                                                    images: updatedImages
                                                                                });
                                                                            }
                                                                        }}
                                                                    >
                                                                        <Trash2 className="w-4 h-4" />
                                                                    </Button>


                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                                                    {pendingImages.length > 0 ? (
                                                        <div className="space-y-4">
                                                            <div className="grid grid-cols-3 gap-2">
                                                                {pendingImages.map((file, index) => (
                                                                    <div key={index} className="aspect-square relative bg-gray-100 rounded-lg flex items-center justify-center">
                                                                        <Image
                                                                            src={URL.createObjectURL(file)}
                                                                            alt={`Pending image ${index + 1}`}
                                                                            width={60}
                                                                            height={60}
                                                                            className="object-cover rounded w-full h-full ring-2"
                                                                        />

                                                                        <Button
                                                                            type="button"
                                                                            size="sm"
                                                                            variant="link"
                                                                            className='absolute top-0 right-0 gap-2 '
                                                                            onClick={() => {
                                                                                setPendingImages(prev => prev.filter(img => img !== file));
                                                                            }}
                                                                        >
                                                                            <XIcon className="w-4 h-4" />
                                                                        </Button>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                            <p className="text-sm text-gray-600">
                                                                {pendingImages.length} image(s) ready to upload
                                                            </p>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <Image
                                                                src="/assets/images/placeholder-image.svg"
                                                                alt="No images"
                                                                width={64}
                                                                height={64}
                                                                className="mx-auto mb-4 opacity-50"
                                                            />
                                                            <p className="text-gray-500 mb-2">No images uploaded yet</p>
                                                        </>
                                                    )}
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => {
                                                            const input = document.createElement('input');
                                                            input.type = 'file';
                                                            input.accept = 'image/*';
                                                            input.multiple = true;
                                                            input.onchange = async (e) => {
                                                                const files = (e.target as HTMLInputElement).files;
                                                                if (files && files.length > 0) {
                                                                    if (editingProperty) {
                                                                        // Edit mode: upload immediately
                                                                        const formData = new FormData();
                                                                        Array.from(files).forEach(file => {
                                                                            formData.append('images', file);
                                                                        });

                                                                        try {
                                                                            const response = await propertyImageService.uploadMultipleImages(editingProperty._id, formData);
                                                                            if (response.success && response.data) {
                                                                                setEditingProperty((prev: any) => {
                                                                                    return {
                                                                                        ...prev,
                                                                                        images: [...(prev.images || []), ...(response.data || [])]
                                                                                    }
                                                                                });
                                                                                toast({
                                                                                    title: "Success",
                                                                                    description: `${files.length} image(s) uploaded successfully`,
                                                                                });
                                                                            }
                                                                        } catch (error) {
                                                                            toast({
                                                                                title: "Error",
                                                                                description: "Failed to upload images",
                                                                                variant: "destructive",
                                                                            });
                                                                        }
                                                                    } else {
                                                                        // New property mode: store files for later upload
                                                                        setPendingImages(prev => [...prev, ...Array.from(files)]);
                                                                        toast({
                                                                            title: "Images Selected",
                                                                            description: `${files.length} image(s) will be uploaded when you save the property`,
                                                                        });
                                                                    }
                                                                }
                                                            };
                                                            input.click();
                                                        }}
                                                    >
                                                        <PlusCircle className="w-4 h-4 mr-2" />
                                                        Upload Images
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex justify-end space-x-4">
                                        <DialogClose asChild>
                                            <Button type="button" variant="outline">Cancel</Button>
                                        </DialogClose>
                                        <Button type="submit" disabled={isMutating}>
                                            {isMutating ? 'Saving...' : (editingProperty ? "Update" : "Add Property")}
                                        </Button>
                                    </div>
                                </form>
                            </Form>
                        </DialogContent>
                    </Dialog>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <p>Loading properties...</p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Image</TableHead>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Price</TableHead>
                                    <TableHead>Location</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {properties.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center text-muted-foreground">
                                            No properties found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    properties.map((property) => (
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
                                            <TableCell>{property.currency} {property.price.toLocaleString()}</TableCell>
                                            <TableCell>{property.location?.name || 'N/A'}</TableCell>
                                            <TableCell>{property.category?.title || 'N/A'}</TableCell>
                                            <TableCell className="capitalize">{property.listingType}</TableCell>
                                            <TableCell className="text-right space-x-2">
                                                <Link href={`/listings/${property.slug}`} target="_blank">
                                                    <Button variant="ghost" size="icon">
                                                        <FileText className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                <Button variant="ghost" size="icon" onClick={() => handleEdit(property)}>
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
                                                            <AlertDialogAction onClick={() => handleDelete(property.id || property._id)}>
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
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default PropertiesPage;

