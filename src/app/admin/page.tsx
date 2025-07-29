// src/app/admin/page.tsx
'use client';
import { useMutation, gql } from '@apollo/client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useFileUpload } from '@nhost/react';
import { Header } from '@/components/landing/header';
import { Footer } from '@/components/landing/footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { nhost } from '@/lib/nhost';

const INSERT_PROPERTIES_MUTATION = gql`
  mutation InsertProperties(
    $title: String!, 
    $location: String!, 
    $price: bigint!, 
    $area: Int!, 
    $bathrooms: Int!, 
    $bedrooms: Int!, 
    $currency: String!, 
    $tagline: String!, 
    $images: jsonb!
  ) {
    insert_properties(objects: {
      title: $title, 
      location: $location, 
      price: $price, 
      area: $area, 
      bathrooms: $bathrooms, 
      bedrooms: $bedrooms, 
      currency: $currency, 
      tagline: $tagline, 
      images: $images
    }) {
      affected_rows
      returning {
        id
        title
        location
        price
        area
        bathrooms
        bedrooms
        currency
        tagline
        images
        created_at
        updated_at
      }
    }
  }
`;

const formSchema = z.object({
  title: z.string().min(1, { message: "Title is required." }),
  location: z.string().min(1, { message: "Location is required." }),
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
  imageFile: z.instanceof(FileList).refine(files => files?.length > 0, 'File is required.'),
});

const AdminPage = () => {
  const { toast } = useToast();
  const { upload, isUploading, progress, isError: isUploadError, error: uploadError } = useFileUpload();
  const [insertProperty, { data, loading, error }] = useMutation(INSERT_PROPERTIES_MUTATION, {
    refetchQueries: ['GetProperties'],
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      location: "",
      price: 0,
      area: 0,
      bathrooms: 0,
      bedrooms: 0,
      currency: "AED",
      tagline: "",
    },
  });

  const imageFileRef = form.register("imageFile");

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const { imageFile, ...propertyData } = values;
    const file = imageFile[0];

    if (!file) {
        toast({
            title: "Error!",
            description: "Please select an image to upload.",
            variant: "destructive",
        });
        return;
    }

    try {
      const { id, isError, error } = await upload({ file });

      if (isError || error) {
        throw error || new Error('File upload failed');
      }
      
      const publicUrl = nhost.storage.getPublicUrl({ fileId: id });

      const submissionValues = {
        ...propertyData,
        images: [publicUrl], // Nhost storage URL
      };
      await insertProperty({ variables: submissionValues });
      toast({
        title: "Success!",
        description: "Property has been added successfully.",
      });
      form.reset();
    } catch (e) {
      console.error(e);
      const errorMessage = e instanceof Error ? e.message : (uploadError?.message || 'An unknown error occurred.');
      toast({
        title: "Error!",
        description: `Failed to add property. ${errorMessage}`,
        variant: "destructive",
      });
    }
  };

  const isMutating = loading || isUploading;

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow py-20 bg-background">
        <div className="container mx-auto max-w-7xl">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="font-headline">Add New Property</CardTitle>
              <CardDescription>Fill out the form below to add a new property listing.</CardDescription>
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
                        <FormControl>
                          <Input placeholder="Enter property title" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter location" {...field} />
                        </FormControl>
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
                        <FormControl>
                          <Input type="number" placeholder="Enter price" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <FormField
                    control={form.control}
                    name="area"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Area (sqft)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="Enter property area" {...field} />
                        </FormControl>
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
                        <FormControl>
                          <Input type="number" placeholder="Enter number of bathrooms" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <FormField
                    control={form.control}
                    name="bedrooms"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bedrooms</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="Enter number of bedrooms" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="currency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Currency</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter currency (e.g., AED)" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="tagline"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tagline</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter a catchy tagline" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="imageFile"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Image</FormLabel>
                        <FormControl>
                          <Input type="file" accept="image/*" {...imageFileRef} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   {isUploading && (
                    <Progress value={progress} className="w-full" />
                  )}
                  <Button type="submit" disabled={isMutating} className="w-full">
                    {isMutating ? `Uploading... ${progress}%` : "Add Property"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminPage;
