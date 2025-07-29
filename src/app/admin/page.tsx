// src/app/admin/page.tsx
'use client';
import { useMutation, gql } from '@apollo/client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Header } from '@/components/landing/header';
import { Footer } from '@/components/landing/footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';

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
  images: z.string().refine((val) => {
    try {
      const parsed = JSON.parse(val);
      return Array.isArray(parsed) && parsed.every(item => typeof item === 'string');
    } catch (e) {
      return false;
    }
  }, { message: "Must be a valid JSON array of strings." }),
});

const AdminPage = () => {
  const { toast } = useToast();
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
      images: '[]',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const submissionValues = {
        ...values,
        images: JSON.parse(values.images),
      };
      await insertProperty({ variables: submissionValues });
      toast({
        title: "Success!",
        description: "Property has been added successfully.",
      });
      form.reset();
    } catch (e) {
      console.error(e);
      toast({
        title: "Error!",
        description: "Failed to add property. " + (e as Error).message,
        variant: "destructive",
      });
    }
  };

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
                    name="images"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Images (JSON Array)</FormLabel>
                        <FormControl>
                          <Textarea placeholder='e.g., ["/path/to/image1.jpg", "/path/to/image2.jpg"]' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={loading} className="w-full">
                    {loading ? "Adding..." : "Add Property"}
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