// src/app/listings/page.tsx
'use client';
import React, { Suspense } from 'react';
import { useQuery, gql } from '@apollo/client';
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

const GET_PROPERTIES = gql`
  query GetProperties {
    properties {
      id
      title
      price
      long_description
      area_in_feet
      bathrooms
      bedrooms
      currency
      is_available
      is_featured
      created_at
      updated_at
      category {
        id
        title
      }
      location {
        id
        name
      }
      properties_images {
        id
        file_id
        is_primary
      }
    }
  }
`;

const ListingsPageContent = () => {
  const { data, loading, error } = useQuery(GET_PROPERTIES);
  const userData = useUserData();
  const { toast } = useToast();
  const isAdminOrManager = userData?.roles.includes('admin') || userData?.roles.includes('manager');

  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('q') || '';
  const locationQuery = searchParams.get('location') || '';
  const categoryQuery = searchParams.get('category') || '';

  const handleDelete = (id: string) => {
    // Placeholder for delete mutation
    console.log("Deleting property with id:", id);
    toast({ title: "Success!", description: "Property deleted successfully. (Mock)" });
  };
  
  const filteredProperties = data?.properties.filter((property: any) => {
    const matchesSearch = property.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLocation = locationQuery ? property.location?.name === locationQuery : true;
    const matchesCategory = categoryQuery ? property.category?.title === categoryQuery : true;
    return matchesSearch && matchesLocation && matchesCategory;
  });

  if (loading) return (
      <div className="container mx-auto py-20 text-center max-w-7xl">
        <p>Loading...</p>
      </div>
  );
  if (error) return (
      <div className="container mx-auto py-20 text-center max-w-7xl">
        <p>Error! {error.message}</p>
      </div>
  );
  
  const allLocations = data?.properties ? [...new Set(data.properties.map((p: any) => p.location?.name).filter(Boolean))] : [];
  const allCategories = data?.properties ? [...new Set(data.properties.map((p: any) => p.category?.title).filter(Boolean))] : [];

  return (
    <>
      <SearchComponent 
        locations={allLocations}
        categories={allCategories}
      />
      <div className="container mx-auto max-w-7xl pb-20">
          {filteredProperties && filteredProperties.length > 0 ? (
            <div className="space-y-8">
              {filteredProperties.map((property: any) => {
                 const images = property.properties_images.map((img: any) => nhost.storage.getPublicUrl({ fileId: img.file_id })).filter(Boolean);
                return (
                  <Card key={property.id} className="overflow-hidden flex flex-col md:flex-row h-full group transition-all duration-300 hover:shadow-xl bg-card text-card-foreground border-border">
                    <div className="w-full md:w-2/5">
                       <Carousel className="relative w-full h-full">
                          <CarouselContent>
                           {images.length > 0 ? images.map((img: string, index: number) => (
                             <CarouselItem key={index}>
                               <Image src={img} alt={property.title} width={600} height={400} className="w-full h-64 object-cover" data-ai-hint="apartment building" />
                             </CarouselItem>
                           )) : (
                             <CarouselItem>
                               <Image src='https://placehold.co/600x400.png' alt='Placeholder' width={600} height={400} className="w-full h-64 object-cover" data-ai-hint="placeholder image" />
                             </CarouselItem>
                           )}
                          </CarouselContent>
                          {images.length > 1 && (
                            <>
                              <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2" />
                              <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2" />
                            </>
                          )}
                       </Carousel>
                    </div>
                    <div className="w-full md:w-3/5 p-6 flex flex-col justify-between">
                      <div>
                        <div className='flex justify-between items-start'>
                           <h3 className="font-bold font-headline text-2xl mb-2 text-foreground">{property.title}</h3>
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
                        <p className="text-muted-foreground mb-4 italic">"{property.long_description}"</p>
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
                          <Button style={{ backgroundColor: 'hsl(var(--accent))', color: 'hsl(var(--accent-foreground))' }}><Info className="mr-2 h-4 w-4" /> More Info</Button>
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
