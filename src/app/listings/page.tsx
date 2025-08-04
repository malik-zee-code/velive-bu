// src/app/listings/page.tsx
'use client';
import React, { Suspense } from 'react';
import { useQuery, gql, useMutation } from '@apollo/client';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Header } from '@/components/landing/header';
import { Footer } from '@/components/landing/footer';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { BedDouble, Bath, Ruler, Phone, MessageSquare, Info, MapPin, Pencil, Trash2 } from 'lucide-react';
import { useUserData } from '@nhost/react';
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
import { useToast } from '@/hooks/use-toast';
import { SearchComponent } from '@/components/listings/search';
import { nhost } from '@/lib/nhost';
import { Badge } from '@/components/ui/badge';

const GET_PROPERTIES = gql`
  query GetProperties {
    properties {
      area_in_feet
      bathrooms
      bedrooms
      category_id
      currency
      created_at
      id
      is_available
      is_featured
      location_id
      long_description
      price
      short_description
      slug
      tagline
      title
      updated_at
      properties_images(where: {is_primary: {_eq: true}}, limit: 1) {
        created_at
        file_id
        id
        is_primary
      }
      category {
        title
        created_at
        id
      }
      location {
        id
        name
        created_at
      }
    }
  }
`;

const GET_CATEGORIES = gql`
  query GetCategories {
    categories {
      id
      title
    }
  }
`;

const GET_LOCATIONS = gql`
  query GetLocations {
    locations {
      id
      name
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

const ListingsPageContent = () => {
  const { data, loading, error, refetch } = useQuery(GET_PROPERTIES);
  const { data: categoriesData, loading: categoriesLoading, error: categoriesError } = useQuery(GET_CATEGORIES);
  const { data: locationsData, loading: locationsLoading, error: locationsError } = useQuery(GET_LOCATIONS);

  const [deleteProperty] = useMutation(DELETE_PROPERTY);
  const userData = useUserData();
  const { toast } = useToast();
  const isAdminOrManager = userData?.roles.includes('admin') || userData?.roles.includes('manager');

  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('q') || '';
  const locationQuery = searchParams.get('location');
  const categoryQuery = searchParams.get('category');

  const handleDelete = async (id: string) => {
    try {
      await deleteProperty({ variables: { id } });
      toast({ title: "Success!", description: "Property deleted successfully." });
      refetch();
    } catch (e) {
      console.error(e);
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      toast({ title: "Error!", description: `Failed to delete property. ${errorMessage}`, variant: "destructive" });
    }
  };
  
  const filteredProperties = data?.properties.filter((property: any) => {
    const matchesSearch = property.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLocation = locationQuery ? property.location?.id === parseInt(locationQuery, 10) : true;
    const matchesCategory = categoryQuery ? property.category?.id === categoryQuery : true;
    return matchesSearch && matchesLocation && matchesCategory;
  });

  if (loading || categoriesLoading || locationsLoading) return (
      <div className="container mx-auto py-20 text-center max-w-7xl">
        <p>Loading...</p>
      </div>
  );
  if (error) return (
      <div className="container mx-auto py-20 text-center max-w-7xl">
        <p>Error! {error.message}</p>
      </div>
  );
   if (categoriesError) return (
      <div className="container mx-auto py-20 text-center max-w-7xl">
        <p>Error loading categories! {categoriesError.message}</p>
      </div>
  );
  if (locationsError) return (
      <div className="container mx-auto py-20 text-center max-w-7xl">
        <p>Error loading locations! {locationsError.message}</p>
      </div>
  );

  return (
    <>
      <SearchComponent 
        locations={locationsData?.locations || []}
        categories={categoriesData?.categories || []}
      />
      <div className="container mx-auto max-w-7xl pb-20">
          {filteredProperties && filteredProperties.length > 0 ? (
            <div className="space-y-8">
              {filteredProperties.map((property: any) => {
                 const imageUrl = property.properties_images && property.properties_images.length > 0
                    ? nhost.storage.getPublicUrl({ fileId: property.properties_images[0].file_id })
                    : 'https://placehold.co/600x400.png';

                return (
                  <Card key={property.id} className="overflow-hidden w- flex flex-col md:flex-row group transition-all duration-300 hover:shadow-xl bg-card text-card-foreground border-border">
                    <div className="w-full md:w-2/5 relative h-64 md:h-auto">
                       <Image 
                        src={imageUrl} 
                        alt={property.title} 
                        width={600} 
                        height={400} 
                        className="w-full h-full object-cover" 
                        data-ai-hint="apartment building" 
                      />
                    </div>
                    <div className="w-full md:w-3/5 p-6 flex flex-col justify-between">
                      <div>
                        <div className='flex justify-between items-start'>
                          <div>
                            <Badge variant="secondary" className="mb-2">{property.category.title}</Badge>
                            <h3 className="font-bold font-headline text-2xl mb-2 text-foreground">{property.title}</h3>
                          </div>
                           {isAdminOrManager && (
                              <div className="flex items-center space-x-1">
                                <Button variant="ghost" size="icon" asChild>
                                  <Link href={`/admin/properties?id=${property.id}`}>
                                    <Pencil className="h-4 w-4" />
                                  </Link>
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
                                        This action cannot be undone. This will permanently delete the property.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => handleDelete(property.id)}>
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            )}
                        </div>
                        <p className="flex items-center text-muted-foreground mb-4"><MapPin className="w-4 h-4 mr-2" />{property.location?.name}</p>
                        <p className="text-lg font-semibold text-primary mb-4">{property.currency} {new Intl.NumberFormat().format(property.price)}</p>
                        <p className="text-muted-foreground mb-4 italic">"{property.tagline}"</p>
                        <Separator className="my-4" />
                        <div className="flex items-center space-x-6 text-muted-foreground mb-6">
                            <div className="flex items-center space-x-2">
                                <BedDouble className="w-5 h-5" />
                                <span>{property.bedrooms} Beds</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Bath className="w-5 h-5" />
                                <span>{property.bathrooms} Baths</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Ruler className="w-5 h-5" />
                                <span>{property.area_in_feet} sqft</span>
                            </div>
                        </div>
                      </div>
                       <div className="flex items-center space-x-2">
                          <Button variant="outline"><Phone className="mr-2 h-4 w-4" /> Call</Button>
                          <Button variant="outline"><MessageSquare className="mr-2 h-4 w-4" /> Whatsapp</Button>
                          <Button asChild style={{ backgroundColor: 'hsl(var(--accent))', color: 'hsl(var(--accent-foreground))' }}><Link href={`/listings/${property.slug}`}><Info className="mr-2 h-4 w-4" /> More Info</Link></Button>
                       </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-16">
              <h3 className="text-2xl font-semibold">No Listings Found</h3>
              <p className="text-muted-foreground mt-2">There are currently no properties matching your search.</p>
            </div>
          )}
        </div>
    </>
  );
}


const ListingsPage = () => (
  <div className="flex flex-col min-h-screen">
    <Header />
    <main className="flex-grow bg-background">
      <Suspense fallback={<div className="container mx-auto py-20 text-center max-w-7xl"><p>Loading search...</p></div>}>
        <ListingsPageContent />
      </Suspense>
    </main>
    <Footer />
  </div>
);


export default ListingsPage;
