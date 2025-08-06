// src/app/listings/[slug]/page.tsx
'use client';
import React, { Suspense, useMemo, useState, useEffect } from 'react';
import { useQuery, gql } from '@apollo/client';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { Header } from '@/components/landing/header';
import { Footer } from '@/components/landing/footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BedDouble, Bath, Ruler, MapPin, Building, CheckSquare, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { nhost } from '@/lib/nhost';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

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
      properties_images(order_by: {is_primary: desc, created_at: asc}) {
        id
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
  const [activeIndex, setActiveIndex] = useState(0);

  const { data, loading, error } = useQuery(GET_PROPERTY_BY_SLUG, {
    variables: { slug },
    skip: !slug,
  });
  
  const property = data?.properties[0];
  const images = useMemo(() =>
    (property?.properties_images && property.properties_images.length > 0)
        ? property.properties_images.map((img: any) => ({
            url: nhost.storage.getPublicUrl({ fileId: img.file_id }),
          }))
        : [{ url: 'https://placehold.co/800x600.png' }]
    , [property?.properties_images]);

  if (loading) return <div className="container mx-auto py-20 text-center max-w-7xl"><p>Loading property details...</p></div>;
  if (error) return <div className="container mx-auto py-20 text-center max-w-7xl"><p>Error: {error.message}</p></div>;
  if (!property) return <div className="container mx-auto py-20 text-center max-w-7xl"><p>Property not found.</p></div>;


  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleThumbnailClick = (e: React.MouseEvent, index: number) => {
      e.preventDefault();
      e.stopPropagation();
      setActiveIndex(index);
  }

  return (
    <div className="container mx-auto max-w-7xl py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
                 <div className="space-y-2">
                    <div className="relative group">
                        <Image
                            src={images[activeIndex].url}
                            alt={property.title}
                            width={800}
                            height={600}
                            className="w-full h-96 object-cover rounded-md"
                            data-ai-hint="apartment building"
                        />
                        {images.length > 1 && (
                            <>
                                <Button onClick={handlePrev} size="icon" variant="ghost" className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full h-10 w-10 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <ChevronLeft className="h-6 w-6" />
                                </Button>
                                <Button onClick={handleNext} size="icon" variant="ghost" className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full h-10 w-10 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <ChevronRight className="h-6 w-6" />
                                </Button>
                            </>
                        )}
                    </div>
                     {images.length > 1 && (
                        <div className="grid grid-cols-5 gap-2">
                           {images.slice(0, 5).map((image: any, index: number) => (
                                <button key={index} onClick={(e) => handleThumbnailClick(e, index)}>
                                    <Image
                                        src={image.url}
                                        alt={`Thumbnail ${index + 1}`}
                                        width={200}
                                        height={200}
                                        className={cn(
                                            "w-full h-20 object-cover rounded-md cursor-pointer transition-all border-2",
                                            activeIndex === index ? "border-primary" : "border-transparent opacity-60 hover:opacity-100"
                                        )}
                                    />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

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
