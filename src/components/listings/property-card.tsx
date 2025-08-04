'use client';
import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BedDouble, Bath, RulerSquare, Phone, MessageSquare, ArrowRight, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import { nhost } from '@/lib/nhost';
import { cn } from '@/lib/utils';

export const PropertyCard = ({ property }: { property: any }) => {
    const imageUrls = useMemo(() =>
        (property.properties_images && property.properties_images.length > 0)
            ? property.properties_images.map((img: any) => nhost.storage.getPublicUrl({ fileId: img.file_id }))
            : ['https://placehold.co/800x600.png']
    , [property.properties_images]);
    
    const [activeIndex, setActiveIndex] = useState(0);

    const handleNext = () => {
        setActiveIndex((prev) => (prev + 1) % imageUrls.length);
    };

    const handlePrev = () => {
        setActiveIndex((prev) => (prev - 1 + imageUrls.length) % imageUrls.length);
    };
    
    return (
        <Card className="overflow-hidden w-full transition-all duration-300 hover:shadow-xl bg-card text-card-foreground border-border">
            <div className="flex flex-col md:flex-row">
                {/* Image Carousel Section */}
                <div className="w-full md:w-3/5 p-2">
                    <div className="relative">
                        <Image
                            src={imageUrls[activeIndex]}
                            alt={property.title}
                            width={800}
                            height={600}
                            className="w-full h-96 object-cover rounded-md"
                            data-ai-hint="apartment building"
                        />
                        {imageUrls.length > 1 && (
                            <>
                                <Button onClick={handlePrev} size="icon" variant="ghost" className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full h-8 w-8">
                                    <ChevronLeft className="h-5 w-5" />
                                </Button>
                                <Button onClick={handleNext} size="icon" variant="ghost" className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full h-8 w-8">
                                    <ChevronRight className="h-5 w-5" />
                                </Button>
                            </>
                        )}
                    </div>
                    {imageUrls.length > 1 && (
                        <div className="grid grid-cols-5 gap-2 mt-2">
                           {imageUrls.slice(0, 5).map((url: string, index: number) => (
                                <button key={index} onClick={() => setActiveIndex(index)}>
                                    <Image
                                        src={url}
                                        alt={`Thumbnail ${index + 1}`}
                                        width={200}
                                        height={150}
                                        className={cn(
                                            "w-full h-24 object-cover rounded-md cursor-pointer transition-all border-2",
                                            activeIndex === index ? "border-primary" : "border-transparent opacity-60 hover:opacity-100"
                                        )}
                                    />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Details Section */}
                <div className="w-full md:w-2/5 p-6 flex flex-col justify-between">
                    <div>
                        <p className="text-3xl font-bold text-primary mb-2">
                            {property.currency} {new Intl.NumberFormat().format(property.price)}
                        </p>
                        <p className="flex items-center text-muted-foreground mb-4">
                            <MapPin className="w-4 h-4 mr-2" />
                            {property.location?.name}
                        </p>
                        <h3 className="font-bold text-xl mb-4 text-foreground">{property.tagline || property.title}</h3>
                        
                        <div className="flex items-center space-x-6 text-muted-foreground mb-8">
                            <div className="flex items-center space-x-2">
                                <BedDouble className="w-5 h-5 text-primary" />
                                <span>{property.bedrooms} Beds</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Bath className="w-5 h-5 text-primary" />
                                <span>{property.bathrooms} Baths</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RulerSquare className="w-5 h-5 text-primary" />
                                <span>{property.area_in_feet} sqft</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button variant="outline" className="flex-1"><Phone className="mr-2 h-4 w-4" /> Call</Button>
                        <Button variant="outline" className="flex-1"><MessageSquare className="mr-2 h-4 w-4" /> Whatsapp</Button>
                        <Button asChild className="flex-1" style={{ backgroundColor: 'hsl(var(--accent))', color: 'hsl(var(--accent-foreground))' }}>
                            <Link href={`/listings/${property.slug}`}>
                                <ArrowRight className="mr-2 h-4 w-4" /> More Info
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </Card>
    )
}
