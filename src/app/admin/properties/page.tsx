
// src/app/admin/properties/page.tsx
'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { useMutation, useQuery, gql } from '@apollo/client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useFileUpload } from '@nhost/nextjs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { nhost } from '@/lib/nhost';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import Image from 'next/image';
import { Trash2, Star, Pencil, PlusCircle } from 'lucide-react';
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
import { Skeleton } from '@/components/ui/skeleton';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

const GET_PROPERTIES = gql`
  query GetPropertiesAdmin {
    properties(order_by: {created_at: desc}) {
      id
      title
      slug
      price
      currency
      listing_type
      is_furnished
      category {
        id
        title
      }
      location {
        id
        name
      }
      properties_images(where: {is_primary: {_eq: true}}, limit: 1) {
        id
        file_id
      }
    }
  }
`;

const GET_PROPERTY_BY_ID = gql`
  query GetPropertyById($id: uuid!) {
    properties_by_pk(id: $id) {
      id
      title
      slug
      price
      area_in_feet
      bathrooms
      bedrooms
      currency
      tagline
      long_description
      location_id
      category_id
      is_featured
      is_available
      is_furnished
      listing_type
      properties_images(order_by: {created_at: asc}) {
        id
        file_id
        is_primary
      }
    }
  }
`;

const GET_LOCATIONS = gql`
  query GetLocations {
    locations(order_by: {name: asc}) {
      id
      name
    }
  }
`;

const GET_CATEGORIES = gql`
  query GetCategories {
    categories(order_by: {title: asc}) {
      id
      title
    }
  }
`;

const INSERT_PROPERTY = gql`
  mutation InsertProperty(
    $title: String!, 
    $slug: String!,
    $price: bigint!, 
    $long_description: String, 
    $tagline: String, 
    $currency: String, 
    $bedrooms: Int, 
    $bathrooms: Int, 
    $area_in_feet: Int, 
    $location_id: bigint!, 
    $category_id: uuid!,
    $is_featured: Boolean,
    $is_available: Boolean,
    $is_furnished: Boolean,
    $listing_type: String,
  ) {
    insert_properties_one(object: {
      title: $title, 
      slug: $slug,
      price: $price, 
      long_description: $long_description, 
      tagline: $tagline, 
      currency: $currency, 
      bedrooms: $bedrooms, 
      bathrooms: $bathrooms, 
      area_in_feet: $area_in_feet, 
      location_id: $location_id, 
      category_id: $category_id,
      is_featured: $is_featured,
      is_available: $is_available,
      is_furnished: $is_furnished,
      listing_type: $listing_type
    }) {
      id
    }
  }
`;

const UPDATE_PROPERTY = gql`
  mutation UpdateProperty($id: uuid!, $data: properties_set_input!) {
    update_properties_by_pk(pk_columns: {id: $id}, _set: $data) {
      id
    }
  }
`;

const DELETE_PROPERTY = gql`
  mutation DeleteProperty($id: uuid!) {
    delete_properties_by_pk(id: $id) {
      id
    }
  }
`;

const INSERT_PROPERTY_IMAGE = gql`
  mutation InsertPropertyImage($property_id: uuid!, $file_id: uuid!, $is_primary: Boolean) {
    insert_properties_images_one(object: {property_id: $property_id, file_id: $file_id, is_primary: $is_primary}) {
      id
    }
  }
`;

const DELETE_PROPERTY_IMAGE = gql`
  mutation DeletePropertyImage($id: bigint!) {
    delete_properties_images_by_pk(id: $id) {
      id
    }
  }
`;

const UNSET_PRIMARY_IMAGE = gql`
  mutation UnsetPrimaryImage($property_id: uuid!) {
    update_properties_images(where: {property_id: {_eq: $property_id}}, _set: {is_primary: false}) {
      affected_rows
    }
  }
`;

const SET_PRIMARY_IMAGE = gql`
  mutation SetPrimaryImage($id: bigint!) {
    update_properties_images_by_pk(pk_columns: {id: $id}, _set: {is_primary: true}) {
      id
    }
  }
`;

const formSchema = z.object({
  title: z.string().min(1, { message: "Title is required." }),
  slug: z.string().optional(),
  price: z.preprocess(
    (a) => (a === '' ? undefined : a),
    z.coerce.number({ required_error: "Price is required." }).positive({ message: "Price must be a positive number." })
  ),
  area_in_feet: z.preprocess(
    (a) => (a === '' ? undefined : a),
    z.coerce.number().positive({ message: "Area must be a positive number." }).optional()
  ),
  bathrooms: z.preprocess(
    (a) => (a === '' ? undefined : a),
    z.coerce.number().int().positive({ message: "Number of bathrooms must be positive." }).optional()
  ),
  bedrooms: z.preprocess(
    (a) => (a === '' ? undefined : a),
    z.coerce.number().int().positive({ message: "Number of bedrooms must be positive." }).optional()
  ),
  currency: z.string().optional(),
  tagline: z.string().optional(),
  long_description: z.string().optional(),
  location_id: z.string().min(1, "Location is required."),
  category_id: z.string().min(1, "Category is required."),
  is_featured: z.boolean().default(false),
  is_available: z.boolean().default(true),
  is_furnished: z.boolean().default(false),
  listing_type: z.enum(['sale', 'rent']).default('sale'),
});

type ImagePreview = {
  file: File;
  previewUrl: string;
  isPrimary: boolean;
};

const generateSlug = (title: string) => {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
}

const PropertyForm = ({
    property,
    locations,
    categories,
    onFormSubmit,
    onCancel,
    isLoading,
    isMutating
}: {
    property?: any;
    locations: any[];
    categories: any[];
    onFormSubmit: (values: z.infer<typeof formSchema>, imageFiles: ImagePreview[], propertyId?: string) => Promise<void>;
    onCancel: () => void;
    isLoading?: boolean;
    isMutating?: boolean;
}) => {
    const { toast } = useToast();
    const [imagePreviews, setImagePreviews] = useState<ImagePreview[]>([]);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: property ? {
            title: property.title || "",
            slug: property.slug || "",
            price: property.price,
            area_in_feet: property.area_in_feet || undefined,
            bathrooms: property.bathrooms || undefined,
            bedrooms: property.bedrooms || undefined,
            currency: property.currency || "AED",
            tagline: property.tagline || "",
            long_description: property.long_description || "",
            location_id: property.location_id?.toString() || "",
            category_id: property.category_id?.toString() || "",
            is_featured: property.is_featured || false,
            is_available: property.is_available ?? true,
            is_furnished: property.is_furnished || false,
            listing_type: property.listing_type || 'sale',
        } : {
            title: "",
            slug: "",
            currency: "AED",
            is_featured: false,
            is_available: true,
            is_furnished: false,
            listing_type: 'sale',
            price: undefined,
            area_in_feet: undefined,
            bathrooms: undefined,
            bedrooms: undefined,
            tagline: "",
            long_description: "",
            location_id: "",
            category_id: "",
        },
    });

    useEffect(() => {
        return () => {
            imagePreviews.forEach(p => URL.revokeObjectURL(p.previewUrl));
        };
    }, [imagePreviews]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files) {
            const newPreviews = Array.from(files).map((file, index) => ({
                file,
                previewUrl: URL.createObjectURL(file),
                isPrimary: imagePreviews.length === 0 && index === 0,
            }));
            setImagePreviews(previews => [...previews, ...newPreviews]);
        }
    };

    const setPreviewAsPrimary = (index: number) => {
        setImagePreviews(previews =>
            previews.map((p, i) => ({ ...p, isPrimary: i === index }))
        );
    };

    const removePreview = (index: number) => {
        setImagePreviews(previews => {
            const newPreviews = previews.filter((_, i) => i !== index);
            if (previews[index].isPrimary && newPreviews.length > 0) {
                newPreviews[0].isPrimary = true;
            }
            return newPreviews;
        });
    };

    const handleSubmit = async (values: z.infer<typeof formSchema>) => {
        await onFormSubmit(values, imagePreviews, property?.id);
        setImagePreviews([]);
    };
    
    if (isLoading) {
        return <p>Loading property data...</p>;
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="listing_type"
                    render={({ field }) => (
                        <FormItem className="space-y-3">
                        <FormLabel>Listing Type</FormLabel>
                        <FormControl>
                            <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex items-center space-x-4"
                            >
                            <FormItem className="flex items-center space-x-2 space-y-0">
                                <FormControl>
                                <RadioGroupItem value="sale" />
                                </FormControl>
                                <FormLabel className="font-normal">For Sale</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-2 space-y-0">
                                <FormControl>
                                <RadioGroupItem value="rent" />
                                </FormControl>
                                <FormLabel className="font-normal">For Rent</FormLabel>
                            </FormItem>
                            </RadioGroup>
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl><Input placeholder="Enter property title" {...field} /></FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control} name="price"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Price</FormLabel>
                        <FormControl><Input type="number" placeholder="Enter price" {...field} value={field.value ?? ''} onChange={field.onChange} /></FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="location_id"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Location</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                            <SelectTrigger><SelectValue placeholder="Select a location" /></SelectTrigger>
                            </FormControl>
                            <SelectContent>
                            {locations.map((loc: any) => (
                                <SelectItem key={loc.id} value={loc.id.toString()}>{loc.name}</SelectItem>
                            ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="category_id"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                            <SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger>
                            </FormControl>
                            <SelectContent>
                            {categories.map((cat: any) => (
                                <SelectItem key={cat.id} value={cat.id}>{cat.title}</SelectItem>
                            ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control} name="area_in_feet"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Area (sqft)</FormLabel>
                        <FormControl><Input type="number" placeholder="e.g., 1200" {...field} value={field.value ?? ''} onChange={field.onChange} /></FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control} name="bathrooms"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Bathrooms</FormLabel>
                        <FormControl><Input type="number" placeholder="e.g., 2" {...field} value={field.value ?? ''} onChange={field.onChange} /></FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control} name="bedrooms"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Bedrooms</FormLabel>
                        <FormControl><Input type="number" placeholder="e.g., 3" {...field} value={field.value ?? ''} onChange={field.onChange} /></FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                control={form.control} name="tagline"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Tagline</FormLabel>
                    <FormControl><Input placeholder="Enter a catchy tagline" {...field} value={field.value ?? ''} /></FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control} name="long_description"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Long Description</FormLabel>
                    <FormControl><Textarea rows={5} placeholder="Describe the property in detail" {...field} value={field.value ?? ''} /></FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                    control={form.control} name="currency"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Currency</FormLabel>
                        <FormControl><Input placeholder="e.g., AED" {...field} value={field.value ?? ''}/></FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormItem>
                    <FormLabel>Upload Images</FormLabel>
                    <FormControl><Input type="file" accept="image/*" multiple onChange={handleFileChange} /></FormControl>
                    <FormMessage />
                </FormItem>
                {imagePreviews.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {imagePreviews.map((preview, index) => (
                            <div key={index} className="relative group">
                                <Image
                                    src={preview.previewUrl}
                                    alt={`Preview ${index + 1}`}
                                    width={200}
                                    height={150}
                                    className="rounded-md object-cover w-full h-32"
                                />
                                {preview.isPrimary && (
                                    <div className="absolute top-2 left-2 bg-primary text-primary-foreground rounded-full p-1 text-xs flex items-center">
                                        <Star className="w-3 h-3 mr-1" />
                                        Primary
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    {!preview.isPrimary && (
                                        <Button size="sm" type="button" onClick={() => setPreviewAsPrimary(index)}>
                                            <Star className="w-4 h-4" />
                                        </Button>
                                    )}
                                    <Button size="sm" type="button" variant="destructive" onClick={() => removePreview(index)}>
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                <div className="flex flex-wrap items-center gap-4">
                    <FormField
                        control={form.control}
                        name="is_featured"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                            <div className="space-y-0.5 mr-4">
                                <FormLabel>Featured</FormLabel>
                                <FormMessage />
                            </div>
                            <FormControl>
                                <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                />
                            </FormControl>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="is_available"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                            <div className="space-y-0.5 mr-4">
                                <FormLabel>Available</FormLabel>
                                <FormMessage />
                            </div>
                            <FormControl>
                                <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                />
                            </FormControl>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="is_furnished"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                            <div className="space-y-0.5 mr-4">
                                <FormLabel>Furnished</FormLabel>
                                <FormMessage />
                            </div>
                            <FormControl>
                                <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                />
                            </FormControl>
                            </FormItem>
                        )}
                    />
                </div>
                <div className="flex justify-end space-x-4">
                   {property && (
                    <Button type="button" variant="outline" onClick={onCancel}>
                        Cancel
                    </Button>
                   )}
                    <Button type="submit" disabled={isMutating} className="w-48">
                    {isMutating ? `Saving...` : (property ? "Update Property" : "Add Property")}
                    </Button>
                </div>
            </form>
        </Form>
    )
}

const PropertyEditForm = ({ propertyId, onCancel, onFormSubmit, locations, categories }: {
    propertyId: string;
    onCancel: () => void;
    onFormSubmit: (values: z.infer<typeof formSchema>, imageFiles: ImagePreview[], propertyId?: string) => Promise<void>;
    locations: any[];
    categories: any[];
}) => {
    const { data, loading, error } = useQuery(GET_PROPERTY_BY_ID, {
        variables: { id: propertyId },
    });

    if (loading) return <p>Loading property data...</p>;
    if (error) return <p>Error loading property: {error.message}</p>;

    return (
        <PropertyForm
            property={data.properties_by_pk}
            locations={locations}
            categories={categories}
            onFormSubmit={onFormSubmit}
            onCancel={onCancel}
            isLoading={loading}
        />
    );
};


const PropertiesPage = () => {
    const [editingPropertyId, setEditingPropertyId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const { toast } = useToast();
    const { upload, isUploading, progress } = useFileUpload();

    const [insertProperty, { loading: insertLoading }] = useMutation(INSERT_PROPERTY);
    const [updateProperty, { loading: updateLoading }] = useMutation(UPDATE_PROPERTY);
    const [deleteProperty] = useMutation(DELETE_PROPERTY);
    const [insertPropertyImage] = useMutation(INSERT_PROPERTY_IMAGE);
    const [deletePropertyImage] = useMutation(DELETE_PROPERTY_IMAGE);
    const [unsetPrimaryImage] = useMutation(UNSET_PRIMARY_IMAGE);
    const [setPrimaryImage] = useMutation(SET_PRIMARY_IMAGE);

    const { data: propertiesData, loading: propertiesLoading, error: propertiesError, refetch: refetchProperties } = useQuery(GET_PROPERTIES);
    const { data: locationsData, loading: locationsLoading } = useQuery(GET_LOCATIONS);
    const { data: categoriesData, loading: categoriesLoading } = useQuery(GET_CATEGORIES);
    
    const { data: propertyData, refetch: refetchProperty } = useQuery(GET_PROPERTY_BY_ID, {
      variables: { id: editingPropertyId },
      skip: !editingPropertyId,
    });

    const filteredProperties = useMemo(() => {
        if (!propertiesData) return [];
        return propertiesData.properties.filter((property: any) => 
            property.title.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [propertiesData, searchTerm]);


    const handleFormSubmit = async (values: z.infer<typeof formSchema>, imageFiles: ImagePreview[], propertyId?: string) => {
        const slug = generateSlug(values.title);
        const submissionData = {
            ...values,
            slug,
            location_id: parseInt(values.location_id, 10),
            category_id: values.category_id,
        };

        try {
            let currentPropertyId = propertyId;

            if (currentPropertyId) {
                await updateProperty({
                    variables: { id: currentPropertyId, data: submissionData },
                });
                toast({ title: "Success!", description: "Property updated successfully." });
            } else {
                const { data } = await insertProperty({ variables: submissionData });
                currentPropertyId = data.insert_properties_one.id;
                toast({ title: "Success!", description: "Property has been added successfully." });
            }
            
            refetchProperties();

            if (imageFiles && imageFiles.length > 0 && currentPropertyId) {
                const newPrimaryImage = imageFiles.find(p => p.isPrimary);
                if (propertyData?.properties_by_pk?.properties_images.length > 0 && newPrimaryImage) {
                    await unsetPrimaryImage({ variables: { property_id: currentPropertyId } });
                }
                
                for (const preview of imageFiles) {
                    const { id, isError, error } = await upload({ file: preview.file });
                    if (isError) throw error;
                    
                    const isFirstImageUpload = !propertyData?.properties_by_pk?.properties_images.length && imageFiles.findIndex(p => p.file === preview.file) === 0;

                    await insertPropertyImage({
                        variables: { 
                            property_id: currentPropertyId, 
                            file_id: id,
                            is_primary: preview.isPrimary || isFirstImageUpload
                        }
                    });
                }
            }
            
            if(currentPropertyId) {
                await refetchProperty({id: currentPropertyId});
            }

            if (!propertyId && currentPropertyId) {
                setEditingPropertyId(currentPropertyId);
            } else if (!propertyId) {
                handleAddNewClick();
            }

        } catch (e) {
            console.error(e);
            const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
            toast({ title: "Error!", description: `Failed to save property. ${errorMessage}`, variant: "destructive" });
        }
    };

    const handleDeleteImage = async (imageId: string) => {
        try {
            await deletePropertyImage({ variables: { id: parseInt(imageId, 10) } });
            toast({ title: "Success!", description: "Image deleted." });
            refetchProperty();
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
            toast({ title: "Error!", description: `Failed to delete image. ${errorMessage}`, variant: "destructive" });
        }
    };

    const handleDeleteProperty = async (propertyId: string) => {
        try {
            await deleteProperty({ variables: { id: propertyId } });
            toast({ title: "Success!", description: "Property deleted." });
            refetchProperties();
            if (editingPropertyId === propertyId) {
                setEditingPropertyId(null);
            }
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
            toast({ title: "Error!", description: `Failed to delete property. ${errorMessage}`, variant: "destructive" });
        }
    };

    const handleSetPrimaryImage = async (imageId: string) => {
        if (!editingPropertyId) return;
        try {
            await unsetPrimaryImage({ variables: { property_id: editingPropertyId } });
            await setPrimaryImage({ variables: { id: parseInt(imageId, 10) } });
            toast({ title: "Success!", description: "Primary image updated." });
            refetchProperty();
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
            toast({ title: "Error!", description: `Failed to set primary image. ${errorMessage}`, variant: "destructive" });
        }
    }

    const handleEditClick = (propertyId: string) => {
        setEditingPropertyId(propertyId);
    };

    const handleAddNewClick = () => {
        setEditingPropertyId(null);
    };

    const isMutating = insertLoading || updateLoading || isUploading;
    const isLoading = locationsLoading || categoriesLoading;

    const propertyImages = propertyData?.properties_by_pk?.properties_images || [];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1 space-y-8">
                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle className="font-headline">{editingPropertyId ? 'Edit Property' : 'Add New Property'}</CardTitle>
                                <CardDescription>{editingPropertyId ? 'Update the details of your property.' : 'Fill out the form below to add a new property listing.'}</CardDescription>
                            </div>
                            {editingPropertyId && (
                                <Button variant="outline" size="sm" onClick={handleAddNewClick}>
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    Add New
                                </Button>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? <p>Loading...</p> : (
                            editingPropertyId ? (
                                <PropertyEditForm
                                    key={editingPropertyId}
                                    propertyId={editingPropertyId}
                                    onCancel={handleAddNewClick}
                                    onFormSubmit={handleFormSubmit}
                                    locations={locationsData?.locations || []}
                                    categories={categoriesData?.categories || []}
                                />
                            ) : (
                                <PropertyForm
                                    locations={locationsData?.locations || []}
                                    categories={categoriesData?.categories || []}
                                    onFormSubmit={handleFormSubmit}
                                    onCancel={handleAddNewClick}
                                    isMutating={isMutating}
                                />
                            )
                        )}
                         {isUploading && <Progress value={progress} className="w-full mt-4" />}
                    </CardContent>
                </Card>

                {editingPropertyId && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Property Images</CardTitle>
                            <CardDescription>Manage the images associated with this property.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {propertyImages.length > 0 ? (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {propertyImages.map((image: any) => (
                                        <div key={image.id} className="relative group">
                                            <Image
                                                src={nhost.storage.getPublicUrl({ fileId: image.file_id })}
                                                alt="Property Image"
                                                width={200}
                                                height={150}
                                                className="rounded-md object-cover w-full h-32"
                                            />
                                            {image.is_primary && (
                                                <div className="absolute top-2 left-2 bg-primary text-primary-foreground rounded-full p-1 text-xs flex items-center">
                                                    <Star className="w-3 h-3 mr-1" />
                                                    Primary
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                {!image.is_primary && (
                                                    <Button size="sm" onClick={() => handleSetPrimaryImage(image.id)}>
                                                        <Star className="w-4 h-4" />
                                                    </Button>
                                                )}
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button size="sm" variant="destructive">
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                This action cannot be undone. This will permanently delete the image.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => handleDeleteImage(image.id)}>
                                                                Delete
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-muted-foreground">No images uploaded for this property yet.</p>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>
            <div className="md:col-span-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Properties</CardTitle>
                        <CardDescription>A list of all your properties.</CardDescription>
                        <div className="mt-4">
                            <Input
                                placeholder="Search by title..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="max-w-sm"
                            />
                        </div>
                    </CardHeader>
                    <CardContent>
                        {propertiesLoading ? (
                            <div className="space-y-2">
                                <Skeleton className="h-12 w-full" />
                                <Skeleton className="h-12 w-full" />
                                <Skeleton className="h-12 w-full" />
                            </div>
                        ) : propertiesError ? (
                            <p className="text-destructive">Error: {propertiesError.message}</p>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Image</TableHead>
                                        <TableHead>Title</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Category</TableHead>
                                        <TableHead>Location</TableHead>
                                        <TableHead>Price</TableHead>
                                        <TableHead>Furnished</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredProperties.map((property: any) => (
                                        <TableRow key={property.id}>
                                            <TableCell>
                                                {property.properties_images && property.properties_images.length > 0 ? (
                                                    <Image
                                                        src={nhost.storage.getPublicUrl({ fileId: property.properties_images[0].file_id })}
                                                        alt={property.title}
                                                        width={64}
                                                        height={64}
                                                        className="rounded-md object-cover w-16 h-16"
                                                    />
                                                ) : (
                                                    <div className="w-16 h-16 bg-muted rounded-md flex items-center justify-center text-xs text-muted-foreground">
                                                        No Image
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell className="font-medium">{property.title}</TableCell>
                                            <TableCell className="capitalize">{property.listing_type}</TableCell>
                                            <TableCell>{property.category?.title}</TableCell>
                                            <TableCell>{property.location?.name}</TableCell>
                                            <TableCell>{property.currency} {new Intl.NumberFormat().format(property.price)}</TableCell>
                                            <TableCell>{property.is_furnished ? 'Yes' : 'No'}</TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="icon" onClick={() => handleEditClick(property.id)}>
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button variant="ghost" size="icon">
                                                            <Trash2 className="h-4 w-4 text-destructive" />
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                This action cannot be undone. This will permanently delete the property and all associated images.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => handleDeleteProperty(property.id)}>
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
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default PropertiesPage;

    

    