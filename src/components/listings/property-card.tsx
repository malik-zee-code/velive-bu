
'use client';
import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BedDouble, Bath, Ruler, Phone, MessageSquare, ArrowRight, MapPin, ChevronLeft, ChevronRight, Tag } from 'lucide-react';
import { nhost } from '@/lib/nhost';
import { cn } from '@/lib/utils';
import { Badge } from '../ui/badge';

export const PropertyCard = ({ property, contactPhone }: { property: any, contactPhone: string | null }) => {
    const imageUrls = useMemo(() =>
        (property.properties_images && property.properties_images.length > 0)
            ? property.properties_images.map((img: any) => nhost.storage.getPublicUrl({ fileId: img.file_id }))
            : ['https://placehold.co/800x600.png']
    , [property.properties_images]);
    
    const [activeIndex, setActiveIndex] = useState(0);

    const handleNext = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setActiveIndex((prev) => (prev + 1) % imageUrls.length);
    };

    const handlePrev = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setActiveIndex((prev) => (prev - 1 + imageUrls.length) % imageUrls.length);
    };

    const handleThumbnailClick = (e: React.MouseEvent, index: number) => {
        e.preventDefault();
        e.stopPropagation();
        setActiveIndex(index);
    }
    
    return (
        <Card className="overflow-hidden w-full transition-all duration-300 hover:shadow-xl bg-card text-card-foreground border-border">
            <div className="flex flex-col md:flex-row">
                {/* Image Carousel Section */}
                <div className="w-full md:w-1/2 p-2">
                     <Link href={`/listings/${property.slug}`}>
                        <div className="relative group">
                            <Image
                                src={imageUrls[activeIndex]}
                                alt={property.title}
                                width={800}
                                height={600}
                                className="w-full h-80 object-cover rounded-md"
                                data-ai-hint="apartment building"
                            />
                            {imageUrls.length > 1 && (
                                <>
                                    <Button onClick={handlePrev} size="icon" variant="ghost" className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <ChevronLeft className="h-5 w-5" />
                                    </Button>
                                    <Button onClick={handleNext} size="icon" variant="ghost" className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <ChevronRight className="h-5 w-5" />
                                    </Button>
                                </>
                            )}
                             <Badge variant="default" className="absolute top-4 left-4 capitalize">
                                For {property.listing_type}
                            </Badge>
                        </div>
                    </Link>
                    {imageUrls.length > 1 && (
                        <div className="grid grid-cols-5 gap-2 mt-2">
                           {imageUrls.slice(0, 5).map((url: string, index: number) => (
                                <button key={index} onClick={(e) => handleThumbnailClick(e, index)}>
                                    <Image
                                        src={url}
                                        alt={`Thumbnail ${index + 1}`}
                                        width={200}
                                        height={150}
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

                {/* Details Section */}
                <div className="w-full md:w-1/2 p-6 flex flex-col justify-between">
                    <div>
                        <div className="flex justify-between items-center mb-2">
                             <p className="text-3xl font-bold text-primary">
                                {property.currency} {new Intl.NumberFormat().format(property.price)}
                            </p>
                            <Badge variant="secondary" className="flex items-center gap-1">
                                <Tag className="w-3 h-3"/>
                                {property.category?.title}
                            </Badge>
                        </div>

                        <p className="flex items-center text-muted-foreground mb-4">
                            <MapPin className="w-4 h-4 mr-2" />
                            {property.location?.name}
                        </p>
                        <h3 className="font-bold text-xl mb-2 text-foreground hover:text-primary transition-colors">
                            <Link href={`/listings/${property.slug}`}>{property.title}</Link>
                        </h3>
                        {property.tagline && <p className="text-sm text-muted-foreground mb-4 italic">"{property.tagline}"</p>}
                        
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
                                <Ruler className="w-5 h-5 text-primary" />
                                <span>{property.area_in_feet} sqft</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button asChild variant="outline" className="flex-1">
                            <a href={`tel:${contactPhone}`}>
                                <Phone className="mr-2 h-4 w-4" /> Call
                            </a>
                        </Button>
                        <Button asChild variant="outline" className="flex-1">
                             <a href={`https://wa.me/${contactPhone?.replace(/\s+/g, '')}`} target="_blank" rel="noopener noreferrer">
                                <MessageSquare className="mr-2 h-4 w-4" /> Whatsapp
                            </a>
                        </Button>
                        <Button asChild className="flex-1" style={{ backgroundColor: 'hsl(var(--accent))', color: 'hsl(var(--accent-foreground))' }}>
                            <Link href={`/listings/${property.slug}`}>
                                <ArrowRight className="mr-2 h-4 w-4" /> More
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </Card>
    )
}
