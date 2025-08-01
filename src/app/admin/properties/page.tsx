
// src/app/admin/properties/page.tsx
'use client';
import React, { useEffect, Suspense } from 'react';
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
      properties_images(limit: 1, order_by: {created_at: asc}) {
        file_id
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
  mutation InsertPropertyImage($property_id: uuid!, $file_id: uuid!) {
    insert_properties_images_one(object: {property_id: $property_id, file_id: $file_id}) {
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
  imageFile: z.any().optional(),
  location_id: z.string().min(1, "Location is required."),
  category_id: z.string().min(1, "Category is required."),
  is_featured: z.boolean().default(false),
  is_available: z.boolean().default(true),
});

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

  const imageFileRef = form.register("imageFile");

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const { imageFile, ...propertyDataValues } = values;
    
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
        form.reset();
        router.push(`/admin/properties?id=${currentPropertyId}`);
      }

       if (imageFile && imageFile.length > 0 && currentPropertyId) {
        const file = imageFile[0];
        const { id, isError, error } = await upload({ file });
        if (isError) throw error;
        
        await insertPropertyImage({
            variables: { property_id: currentPropertyId, file_id: id }
        });
      }
      
      refetchProperty();

    } catch (e) {
      console.error(e);
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      toast({ title: "Error!", description: `Failed to save property. ${errorMessage}`, variant: "destructive" });
    }
  };

  const isMutating = insertLoading || updateLoading || isUploading;
  const isLoading = queryLoading || locationsLoading || categoriesLoading;

  if (isLoading) return <p>Loading property data...</p>;

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="font-headline">{isEditMode ? 'Edit Property' : 'Add New Property'}</CardTitle>
        <CardDescription>{isEditMode ? 'Update the details of your property.' : 'Fill out the form below to add a new property listing.'}</CardDescription>
      </CardHeader>
      <CardContent>
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
                <FormField
                control={form.control}
                name="imageFile"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Primary Image</FormLabel>
                    <FormControl><Input type="file" accept="image/*" {...imageFileRef} /></FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>
            
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
      </CardContent>
    </Card>
  );
};

const PropertiesPage = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <PropertiesForm />
  </Suspense>
);


export default PropertiesPage;

    