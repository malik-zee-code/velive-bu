// src/app/listings/[slug]/page.tsx
'use client';
import React, { Suspense } from 'react';
import { useQuery, gql } from '@apollo/client';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { Header } from '@/components/landing/header';
import { Footer } from '@/components/landing/footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { BedDouble, Bath, Ruler, MapPin, Building, CheckSquare, Star } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { nhost } from '@/lib/nhost';

const GET_PROPERTY_BY_SLUG = gql`
  query GetPropertyBySlug($slug: String!) {
    properties(where: {slug: {_eq: $slug}}) {
      id
      title
      tagline
      price
      currency
      bedrooms
      bathrooms
      area_in_feet
      long_description
      properties_images(order_by: {is_primary: desc}) {
        file_id
        is_primary
      }
      location {
        name
      }
      category {
        title
      }
    }
  }
`;

const mockAmenities = [
    "Swimming Pool", "Gymnasium", "Security", "Parking", "Elevator", "Air Conditioning"
];

const PropertyDetailPageContent = () => {
  const params = useParams();
  const slug = params.slug as string;

  const { data, loading, error } = useQuery(GET_PROPERTY_BY_SLUG, {
    variables: { slug },
    skip: !slug,
  });

  if (loading) return <div className="container mx-auto py-20 text-center max-w-7xl"><p>Loading property details...</p></div>;
  if (error) return <div className="container mx-auto py-20 text-center max-w-7xl"><p>Error: {error.message}</p></div>;
  if (!data || data.properties.length === 0) return <div className="container mx-auto py-20 text-center max-w-7xl"><p>Property not found.</p></div>;

  const property = data.properties[0];
  const images = (property.properties_images || []).map((img: { file_id: string }) => nhost.storage.getPublicUrl({ fileId: img.file_id }));

  return (
    <div className="container mx-auto max-w-7xl py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
                 <Card className="overflow-hidden">
                    <CardContent className="p-0">
                        <Carousel className="w-full">
                            <CarouselContent>
                                {images.length > 0 ? images.map((img: string, index: number) => (
                                <CarouselItem key={index}>
                                    <Image src={img} alt={property.title} width={800} height={500} className="w-full h-[500px] object-cover" data-ai-hint="apartment building interior" />
                                </CarouselItem>
                                )) : (
                                <CarouselItem>
                                    <Image src='https://placehold.co/800x500.png' alt='Placeholder' width={800} height={500} className="w-full h-auto object-cover" data-ai-hint="placeholder image" />
                                </CarouselItem>
                                )}
                            </CarouselContent>
                             {images.length > 1 && (
                                <>
                                <CarouselPrevious />
                                <CarouselNext />
                                </>
                            )}
                        </Carousel>
                    </CardContent>
                </Card>

                <Card className="mt-8">
                    <CardHeader>
                        <CardTitle>Description</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="prose max-w-none text-muted-foreground" dangerouslySetInnerHTML={{ __html: property.long_description || '<p>No description available.</p>' }} />
                    </CardContent>
                </Card>

                <Card className="mt-8">
                    <CardHeader>
                        <CardTitle>Amenities</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {mockAmenities.map(amenity => (
                                <div key={amenity} className="flex items-center gap-2">
                                    <CheckSquare className="w-5 h-5 text-primary" />
                                    <span className="text-muted-foreground">{amenity}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="lg:col-span-1">
                <Card>
                    <CardHeader>
                        <Badge variant="secondary" className="w-fit">{property.category.title}</Badge>
                        <h1 className="text-3xl font-bold font-headline text-foreground mt-2">{property.title}</h1>
                        <p className="flex items-center text-muted-foreground"><MapPin className="w-4 h-4 mr-2" />{property.location.name}</p>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold text-primary mb-4">{property.currency} {new Intl.NumberFormat().format(property.price)}</p>
                        <Separator className="my-4" />
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground flex items-center gap-2"><BedDouble className="w-5 h-5"/> Bedrooms</span>
                                <span className="font-semibold text-foreground">{property.bedrooms}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground flex items-center gap-2"><Bath className="w-5 h-5"/> Bathrooms</span>
                                <span className="font-semibold text-foreground">{property.bathrooms}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground flex items-center gap-2"><Ruler className="w-5 h-5"/> Area</span>
                                <span className="font-semibold text-foreground">{property.area_in_feet} sqft</span>
                            </div>
                             <div className="flex items-center justify-between">
                                <span className="text-muted-foreground flex items-center gap-2"><Building className="w-5 h-5"/> Type</span>
                                <span className="font-semibold text-foreground">{property.category.title}</span>
                            </div>
                        </div>
                         <Separator className="my-4" />
                         <p className="text-sm text-muted-foreground italic">"{property.tagline}"</p>
                    </CardContent>
                </Card>

                 <Card className="mt-8">
                    <CardHeader>
                        <CardTitle>Contact Agent</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-4">
                           <Image src="https://placehold.co/100x100.png" alt="Agent" width={80} height={80} className="rounded-full" data-ai-hint="person portrait" />
                           <div>
                                <h4 className="font-semibold text-foreground">Johnathan Doe</h4>
                                <p className="text-sm text-muted-foreground">Listing Agent</p>
                                <div className="flex items-center gap-0.5 mt-1">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                                    ))}
                                </div>
                           </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    </div>
  );
};

const PropertyDetailPage = () => (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow">
        <Suspense fallback={<div className="container mx-auto py-20 text-center max-w-7xl"><p>Loading...</p></div>}>
          <PropertyDetailPageContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
  
export default PropertyDetailPage;
