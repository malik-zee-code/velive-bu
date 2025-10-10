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
import { Trash2, Pencil, PlusCircle, FileText } from 'lucide-react';
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
import { propertyService, locationService, categoryService, userService, Property } from '@/lib/services';

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
                await propertyService.createProperty(propertyData);
                toast({ title: "Success!", description: "Property added successfully." });
            }

            form.reset();
            setIsModalOpen(false);
            setEditingProperty(null);
            fetchData();
        } catch (err) {
            console.error(err);
            toast({ title: "Error!", description: "Failed to save property.", variant: "destructive" });
        } finally {
            setIsMutating(false);
        }
    };

    const handleEdit = (property: Property) => {
        setEditingProperty(property);

        console.log('=== EDITING PROPERTY ===');
        console.log('Property:', property);
        console.log('Property location:', property.location);
        console.log('Property category:', property.category);
        console.log('Available locations:', locations);
        console.log('Available categories:', categories);

        // Extract IDs more carefully
        let locationId = '';
        let categoryId = '';

        if (property.location) {
            if (typeof property.location === 'object') {
                locationId = property.location._id || property.location.id || '';
            } else {
                locationId = property.location;
            }
        }

        if (property.category) {
            if (typeof property.category === 'object') {
                categoryId = property.category._id || property.category.id || '';
            } else {
                categoryId = property.category;
            }
        }

        console.log('Extracted locationId:', locationId);
        console.log('Extracted categoryId:', categoryId);

        // Use setTimeout to ensure the form is reset after the modal opens
        setTimeout(() => {
            const formData = {
                title: property.title || '',
                slug: property.slug || '',
                price: property.price || 0,
                areaInFeet: property.areaInFeet || 0,
                bedrooms: property.bedrooms || 0,
                bathrooms: property.bathrooms || 0,
                currency: property.currency || 'AED',
                tagline: property.tagline || '',
                longDescription: property.longDescription || '',
                address: property.address || '',
                location: locationId,
                category: categoryId,
                isFeatured: property.isFeatured || false,
                isAvailable: property.isAvailable !== undefined ? property.isAvailable : true,
                isFurnished: property.isFurnished || false,
                listingType: (property.listingType as any) || 'rent',
            };

            console.log('Form data being set:', formData);
            form.reset(formData);
        }, 100);

        setIsModalOpen(true);
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
        form.reset();
        setIsModalOpen(true);
    };

    const getImageUrl = (property: Property) => {
        if (property.images && property.images.length > 0) {
            const primaryImage = property.images.find(img => img.isPrimary);
            return (primaryImage || property.images[0]).imageUrl;
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
                        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>{editingProperty ? 'Edit Property' : 'Add New Property'}</DialogTitle>
                            </DialogHeader>
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="title"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Title</FormLabel>
                                                    <FormControl><Input placeholder="Luxury Villa" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="price"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Price</FormLabel>
                                                    <FormControl><Input type="number" placeholder="500000" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="bedrooms"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Bedrooms</FormLabel>
                                                    <FormControl><Input type="number" placeholder="3" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="bathrooms"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Bathrooms</FormLabel>
                                                    <FormControl><Input type="number" placeholder="2" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="areaInFeet"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Area (sqft)</FormLabel>
                                                    <FormControl><Input type="number" placeholder="2000" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                    </div>
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
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                                                    src={getImageUrl(property)}
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

