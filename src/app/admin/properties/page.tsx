
// src/app/admin/properties/page.tsx
'use client';
import React, { useEffect, Suspense, useState } from 'react';
import { useMutation, useQuery, gql } from '@apollo/client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useFileUpload } from '@nhost/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { nhost } from '@/lib/nhost';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSearchParams, useRouter } from 'next/navigation';
import { Switch } from '@/components/ui/switch';
import Image from 'next/image';
import { Trash2, Star, X } from 'lucide-react';
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
} from "@/components/ui/alert-dialog"

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
      is_available: $is_available
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

const INSERT_PROPERTY_IMAGE = gql`
  mutation InsertPropertyImage($property_id: uuid!, $file_id: uuid!, $is_primary: Boolean) {
    insert_properties_images_one(object: {property_id: $property_id, file_id: $file_id, is_primary: $is_primary}) {
      id
    }
  }
`;

const DELETE_PROPERTY_IMAGE = gql`
  mutation DeletePropertyImage($id: uuid!) {
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
  mutation SetPrimaryImage($id: uuid!) {
    update_properties_images_by_pk(pk_columns: {id: $id}, _set: {is_primary: true}) {
      id
    }
  }
`;

const formSchema = z.object({
  title: z.string().min(1, { message: "Title is required." }),
  slug: z.string().optional(),
  price: z.preprocess(
    (a) => {
        if (typeof a === 'string' && a.trim() === '') return null;
        const parsed = parseInt(z.string().parse(a), 10);
        return isNaN(parsed) ? null : parsed;
    },
    z.number({ required_error: "Price is required." }).positive({ message: "Price must be a positive number." })
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
  imageFiles: z.any().optional(),
  location_id: z.string().min(1, "Location is required."),
  category_id: z.string().min(1, "Category is required."),
  is_featured: z.boolean().default(false),
  is_available: z.boolean().default(true),
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

const PropertiesForm = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const propertyId = searchParams.get('id');
  const isEditMode = !!propertyId;
  
  const { toast } = useToast();
  const { upload, isUploading, progress } = useFileUpload();
  
  const [insertProperty, { loading: insertLoading }] = useMutation(INSERT_PROPERTY);
  const [updateProperty, { loading: updateLoading }] = useMutation(UPDATE_PROPERTY);
  const [insertPropertyImage] = useMutation(INSERT_PROPERTY_IMAGE);
  const [deletePropertyImage] = useMutation(DELETE_PROPERTY_IMAGE);
  const [unsetPrimaryImage] = useMutation(UNSET_PRIMARY_IMAGE);
  const [setPrimaryImage] = useMutation(SET_PRIMARY_IMAGE);
  
  const [imagePreviews, setImagePreviews] = useState<ImagePreview[]>([]);


  const { data: propertyData, loading: queryLoading, refetch: refetchProperty } = useQuery(GET_PROPERTY_BY_ID, {
    variables: { id: propertyId },
    skip: !isEditMode,
  });
  const { data: locationsData, loading: locationsLoading } = useQuery(GET_LOCATIONS);
  const { data: categoriesData, loading: categoriesLoading } = useQuery(GET_CATEGORIES);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      slug: "",
      currency: "AED",
      is_featured: false,
      is_available: true,
    },
  });

  useEffect(() => {
    if (isEditMode && propertyData?.properties_by_pk) {
      const p = propertyData.properties_by_pk;
      form.reset({
        title: p.title,
        slug: p.slug,
        price: p.price,
        area_in_feet: p.area_in_feet || undefined,
        bathrooms: p.bathrooms || undefined,
        bedrooms: p.bedrooms || undefined,
        currency: p.currency || undefined,
        tagline: p.tagline || undefined,
        long_description: p.long_description || undefined,
        location_id: p.location_id?.toString() || undefined,
        category_id: p.category_id?.toString() || undefined,
        is_featured: p.is_featured || false,
        is_available: p.is_available ?? true,
      });
    }
  }, [propertyData, isEditMode, form]);
  
  useEffect(() => {
    // Clean up preview URLs
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
        isPrimary: imagePreviews.length === 0 && index === 0, // Make the first image primary by default if no other images exist
      }));
      setImagePreviews(previews => [...previews, ...newPreviews]);
    }
  };

  const setPreviewAsPrimary = (index: number) => {
    setImagePreviews(previews => 
      previews.map((p, i) => ({
        ...p,
        isPrimary: i === index,
      }))
    );
  };
  
  const removePreview = (index: number) => {
    setImagePreviews(previews => {
        const newPreviews = previews.filter((_, i) => i !== index);
        // If the removed image was primary, make the new first image primary
        if (previews[index].isPrimary && newPreviews.length > 0) {
            newPreviews[0].isPrimary = true;
        }
        return newPreviews;
    });
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    // We handle images from state, so remove from form values
    const { imageFiles, ...propertyDataValues } = values;
    
    const slug = generateSlug(values.title);

    const submissionData = {
        ...propertyDataValues,
        slug,
        location_id: parseInt(values.location_id, 10),
        category_id: values.category_id,
    };

    try {
      let currentPropertyId = propertyId;

      if (isEditMode) {
        await updateProperty({
          variables: {
            id: propertyId,
            data: submissionData,
          },
        });
        toast({ title: "Success!", description: "Property updated successfully." });
      } else {
        const { data } = await insertProperty({ variables: submissionData });
        currentPropertyId = data.insert_properties_one.id;
        toast({ title: "Success!", description: "Property has been added successfully." });
        // Don't reset form, but navigate to edit page
        router.push(`/admin/properties?id=${currentPropertyId}`);
      }

       if (imagePreviews.length > 0 && currentPropertyId) {
        const hasExistingImages = propertyData?.properties_by_pk?.properties_images.length > 0;
        const newPrimaryImage = imagePreviews.find(p => p.isPrimary);

        if (hasExistingImages && newPrimaryImage) {
            await unsetPrimaryImage({ variables: { property_id: currentPropertyId } });
        }
        
        for (const preview of imagePreviews) {
            const { id, isError, error } = await upload({ file: preview.file });
            if (isError) throw error;
            
            // First image uploaded is primary if none is set
            const isFirstImageUpload = !hasExistingImages && imagePreviews.length > 0 && imagePreviews.findIndex(p => p.file === preview.file) === 0;

            await insertPropertyImage({
                variables: { 
                    property_id: currentPropertyId, 
                    file_id: id,
                    is_primary: preview.isPrimary || isFirstImageUpload
                }
            });
        }
        setImagePreviews([]);
      }
      
      if(currentPropertyId) {
        refetchProperty({id: currentPropertyId});
      }


    } catch (e) {
      console.error(e);
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      toast({ title: "Error!", description: `Failed to save property. ${errorMessage}`, variant: "destructive" });
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    try {
        await deletePropertyImage({ variables: { id: imageId }});
        toast({ title: "Success!", description: "Image deleted." });
        refetchProperty();
    } catch(e) {
        console.error(e);
        const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
        toast({ title: "Error!", description: `Failed to delete image. ${errorMessage}`, variant: "destructive" });
    }
  };

  const handleSetPrimaryImage = async (imageId: string) => {
    try {
      await unsetPrimaryImage({ variables: { property_id: propertyId }});
      await setPrimaryImage({ variables: { id: imageId }});
      toast({ title: "Success!", description: "Primary image updated." });
      refetchProperty();
    } catch(e) {
      console.error(e);
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      toast({ title: "Error!", description: `Failed to set primary image. ${errorMessage}`, variant: "destructive" });
    }
  }

  const isMutating = insertLoading || updateLoading || isUploading;
  const isLoading = queryLoading || locationsLoading || categoriesLoading;

  const propertyImages = propertyData?.properties_by_pk?.properties_images || [];

  return (
    <div className="space-y-8">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="font-headline">{isEditMode ? 'Edit Property' : 'Add New Property'}</CardTitle>
          <CardDescription>{isEditMode ? 'Update the details of your property.' : 'Fill out the form below to add a new property listing.'}</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? <p>Loading property data...</p> : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                          <FormControl><Input type="number" placeholder="Enter price" {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.value)} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="location_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value || ""}>
                            <FormControl>
                              <SelectTrigger><SelectValue placeholder="Select a location" /></SelectTrigger>
                            </FormControl>
                            <SelectContent>
                               {locationsData?.locations.map((loc: any) => (
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
                          <Select onValueChange={field.onChange} value={field.value || ""}>
                            <FormControl>
                              <SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger>
                            </FormControl>
                            <SelectContent>
                               {categoriesData?.categories.map((cat: any) => (
                                <SelectItem key={cat.id} value={cat.id}>{cat.title}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                     <FormField
                      control={form.control} name="area_in_feet"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Area (sqft)</FormLabel>
                          <FormControl><Input type="number" placeholder="e.g., 1200" {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.value)} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                     <FormField
                      control={form.control} name="bathrooms"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bathrooms</FormLabel>
                          <FormControl><Input type="number" placeholder="e.g., 2" {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.value)} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                     <FormField
                      control={form.control} name="bedrooms"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bedrooms</FormLabel>
                          <FormControl><Input type="number" placeholder="e.g., 3" {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.value)} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                </div>

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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                </div>

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
                
                <div className="flex items-center space-x-4">
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
                </div>

                
                {isUploading && <Progress value={progress} className="w-full" />}

                <div className="flex justify-end space-x-4">
                    <Button type="button" variant="outline" onClick={() => router.push('/listings')}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isMutating} className="w-48">
                      {isMutating ? `Saving... ${progress ? `${progress}%` : ''}`.trim() : (isEditMode ? "Update Property" : "Add Property")}
                    </Button>
                </div>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>

      {isEditMode && (
        <Card className="max-w-4xl mx-auto">
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
  );
};

const PropertiesPage = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <PropertiesForm />
  </Suspense>
);


export default PropertiesPage;
