// src/app/listings/page.tsx
'use client';
import { useQuery, gql } from '@apollo/client';
import Image from 'next/image';
import { Header } from '@/components/landing/header';
import { Footer } from '@/components/landing/footer';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { BedDouble, Bath, Ruler, Phone, MessageSquare, Info } from 'lucide-react';

const GET_PROPERTIES = gql`
  query GetProperties {
    properties {
      id
      area
      bathrooms
      bedrooms
      created_at
      currency
      images
      location
      price
      tagline
      title
      updated_at
    }
  }
`;

const ListingsPage = () => {
  const { data, loading, error } = useQuery(GET_PROPERTIES);

  if (loading) return (
    <div className="flex-grow bg-background">
      <Header />
      <div className="container mx-auto py-20 text-center max-w-7xl">
        <p>Loading...</p>
      </div>
      <Footer />
    </div>
  );
  if (error) return (
    <div className="flex-grow bg-background">
      <Header />
      <div className="container mx-auto py-20 text-center max-w-7xl">
        <p>Error! {error.message}</p>
      </div>
      <Footer />
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow py-20 bg-background">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold font-headline mt-2 text-foreground">Our Properties</h2>
            <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
              Explore our curated list of top-rated properties in the city.
            </p>
          </div>
          {data.properties.length > 0 ? (
            <div className="space-y-8">
              {data.properties.map((property: any) => {
                 const images = Array.isArray(property.images) ? property.images.filter(img => typeof img === 'string' && img.startsWith('http')) : [];
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
                        <h3 className="font-bold font-headline text-2xl mb-2 text-foreground">{property.title}</h3>
                        <p className="text-muted-foreground mb-4">{property.location}</p>
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
                                <span>{property.area} sqft</span>
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
              <p className="text-muted-foreground mt-2">There are currently no properties available.</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ListingsPage;
