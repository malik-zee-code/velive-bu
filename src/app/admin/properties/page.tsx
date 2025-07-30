
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
import { useSearchParams } from 'next/navigation';

const mockLocationsData = [
    { id: 'New York', name: 'New York' },
    { id: 'Los Angeles', name: 'Los Angeles' },
    { id: 'London', name: 'London' },
];

const GET_PROPERTY_BY_ID = gql`
  query GetPropertyById($id: uuid!) {
    properties_by_pk(id: $id) {
      id
      title
      price
      area
      bathrooms
      bedrooms
      currency
      tagline
      images
      location
    }
  }
`;

const INSERT_PROPERTIES_MUTATION = gql`
  mutation InsertProperties(
    $title: String!, 
    $price: bigint!, 
    $area: Int!, 
    $bathrooms: Int!, 
    $bedrooms: Int!, 
    $currency: String!, 
    $tagline: String!, 
    $images: jsonb!,
    $location: String!
  ) {
    insert_properties_one(object: {
      title: $title, 
      price: $price, 
      area: $area, 
      bathrooms: $bathrooms, 
      bedrooms: $bedrooms, 
      currency: $currency, 
      tagline: $tagline, 
      images: $images,
      location: $location
    }) {
      id
    }
  }
`;

const UPDATE_PROPERTY_MUTATION = gql`
  mutation UpdateProperty($id: uuid!, $data: properties_set_input!) {
    update_properties_by_pk(pk_columns: {id: $id}, _set: $data) {
      id
    }
  }
`;


const formSchema = z.object({
  title: z.string().min(1, { message: "Title is required." }),
  price: z.preprocess(
    (a) => parseInt(z.string().parse(a), 10),
    z.number().positive({ message: "Price must be a positive number." })
  ),
  area: z.preprocess(
    (a) => parseInt(z.string().parse(a), 10),
    z.number().positive({ message: "Area must be a positive number." })
  ),
  bathrooms: z.preprocess(
    (a) => parseInt(z.string().parse(a), 10),
    z.number().positive({ message: "Number of bathrooms must be positive." })
  ),
  bedrooms: z.preprocess(
    (a) => parseInt(z.string().parse(a), 10),
    z.number().positive({ message: "Number of bedrooms must be positive." })
  ),
  currency: z.string().min(1, { message: "Currency is required." }),
  tagline: z.string().min(1, { message: "Tagline is required." }),
  imageFile: z.any().optional(),
  location: z.string().min(1, { message: "Please select a location." }),
});

const PropertiesForm = () => {
  const searchParams = useSearchParams();
  const propertyId = searchParams.get('id');
  const isEditMode = !!propertyId;
  
  const { toast } = useToast();
  const { upload, isUploading, progress } = useFileUpload();
  
  const [insertProperty, { loading: insertLoading }] = useMutation(INSERT_PROPERTIES_MUTATION, {
    refetchQueries: ['GetProperties'],
  });

  const [updateProperty, { loading: updateLoading }] = useMutation(UPDATE_PROPERTY_MUTATION, {
    refetchQueries: ['GetProperties', 'GetPropertyById'],
  });

  const { data: propertyData, loading: queryLoading } = useQuery(GET_PROPERTY_BY_ID, {
    variables: { id: propertyId },
    skip: !isEditMode,
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "", price: 0, area: 0,
      bathrooms: 0, bedrooms: 0, currency: "AED",
      tagline: "", location: ""
    },
  });

  useEffect(() => {
    if (isEditMode && propertyData?.properties_by_pk) {
      const p = propertyData.properties_by_pk;
      form.reset({
        title: p.title,
        price: p.price,
        area: p.area,
        bathrooms: p.bathrooms,
        bedrooms: p.bedrooms,
        currency: p.currency,
        tagline: p.tagline,
        location: p.location,
      });
    }
  }, [propertyData, isEditMode, form]);

  const imageFileRef = form.register("imageFile");

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const { imageFile, ...propertyDataValues } = values;
    let imageUrls = isEditMode && propertyData?.properties_by_pk?.images ? propertyData.properties_by_pk.images : [];

    try {
      if (imageFile && imageFile.length > 0) {
        const file = imageFile[0];
        const { id, isError, error } = await upload({ file });
        if (isError) throw error;
        const publicUrl = nhost.storage.getPublicUrl({ fileId: id });
        imageUrls = [publicUrl];
      }

      if (isEditMode) {
        await updateProperty({
          variables: {
            id: propertyId,
            data: { ...propertyDataValues, images: imageUrls },
          },
        });
        toast({ title: "Success!", description: "Property updated successfully." });
      } else {
        if (!imageUrls.length) {
          toast({ title: "Error!", description: "Please select an image to upload.", variant: "destructive" });
          return;
        }
        await insertProperty({ variables: { ...propertyDataValues, images: imageUrls } });
        toast({ title: "Success!", description: "Property has been added successfully." });
        form.reset();
      }
    } catch (e) {
      console.error(e);
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      toast({ title: "Error!", description: `Failed to save property. ${errorMessage}`, variant: "destructive" });
    }
  };

  const isMutating = insertLoading || updateLoading || isUploading;

  if (queryLoading) return <p>Loading property data...</p>;

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="font-headline">{isEditMode ? 'Edit Property' : 'Add New Property'}</CardTitle>
        <CardDescription>{isEditMode ? 'Update the details of your property.' : 'Fill out the form below to add a new property listing.'}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Select a location" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                           {mockLocationsData.map((loc: any) => (
                            <SelectItem key={loc.id} value={loc.id}>{loc.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </div>
            <FormField
              control={form.control} name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price</FormLabel>
                  <FormControl><Input type="number" placeholder="Enter price" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control} name="area"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Area (sqft)</FormLabel>
                  <FormControl><Input type="number" placeholder="Enter property area" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control} name="bathrooms"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bathrooms</FormLabel>
                  <FormControl><Input type="number" placeholder="Enter number of bathrooms" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control} name="bedrooms"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bedrooms</FormLabel>
                  <FormControl><Input type="number" placeholder="Enter number of bedrooms" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control} name="currency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Currency</FormLabel>
                  <FormControl><Input placeholder="Enter currency (e.g., AED)" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control} name="tagline"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tagline</FormLabel>
                  <FormControl><Input placeholder="Enter a catchy tagline" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="imageFile"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image {isEditMode && "(Optional: only to replace)"}</FormLabel>
                  <FormControl><Input type="file" accept="image/*" {...imageFileRef} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             {isUploading && <Progress value={progress} className="w-full" />}
            <Button type="submit" disabled={isMutating} className="w-full">
              {isMutating ? `Uploading... ${progress}%` : (isEditMode ? "Update Property" : "Add Property")}
            </Button>
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
