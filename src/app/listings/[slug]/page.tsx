
// src/app/listings/[slug]/page.tsx
'use client';
import React, { useMemo, useState, Suspense, useEffect } from 'react'
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { Header } from '@/components/landing/header';
import { Footer } from '@/components/landing/footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BedDouble, Bath, Ruler, MapPin, Building, CheckSquare, Star, ChevronLeft, ChevronRight, Phone, Sofa, MessageSquare, Download, FileText, ExternalLink } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import { propertyService, settingsService } from '@/lib/services';

const EmbeddedPdfViewer = dynamic(() => import('@/components/common/EmbeddedPdfViewer').then(mod => mod.EmbeddedPdfViewer), {
    ssr: false,
    loading: () => <Skeleton className="w-full h-[400px]" />
});

const mockAmenities = [
    "Swimming Pool", "Gymnasium", "Security", "Parking", "Elevator", "Air Conditioning"
];

const PropertyDetailPageContent = () => {
    const params = useParams();
    const slug = params.slug as string;
    const [activeIndex, setActiveIndex] = useState(0);
    const [property, setProperty] = useState<any>(null);
    const [contactPhone, setContactPhone] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!slug) return;

            try {
                setLoading(true);
                const [propertyRes, settingsRes] = await Promise.all([
                    propertyService.getPropertyBySlug(slug),
                    settingsService.getAllSettings(),
                ]);

                setProperty(propertyRes.data);
                const phone = settingsRes.data.find((s: any) => s.title === 'contact_phone')?.value || null;
                setContactPhone(phone);

                if (propertyRes.data?.title) {
                    document.title = `${propertyRes.data.title} | VE LIVE`;
                }
            } catch (err) {
                setError(err instanceof Error ? err : new Error('Failed to fetch property'));
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [slug]);
    const images = useMemo(() =>
        (property?.images && property.images.length > 0)
            ? property.images.map((img: any) => img.fileUrl)
            : ['https://placehold.co/800x600.png']
        , [property?.images]);

    if (loading) return <div className="container mx-auto py-20 text-center max-w-7xl"><p>Loading property details...</p></div>;
    if (error) return <div className="container mx-auto py-20 text-center max-w-7xl"><p>Error: {error.message}</p></div>;
    if (!property) return <div className="container mx-auto py-20 text-center max-w-7xl"><p>Property not found.</p></div>;

    const floorPlanUrl = null; // TODO: Handle floor plan from REST API
    const installmentPlanUrl = null; // TODO: Handle installment plan from REST API


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
                                src={images[activeIndex]}
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
                                            src={image}
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
                            <CardTitle className="font-headline">Description</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="prose max-w-none text-muted-foreground" dangerouslySetInnerHTML={{ __html: property.longDescription || property.description || '<p>No description available.</p>' }} />
                        </CardContent>
                    </Card>

                    <Card className="mt-8">
                        <CardHeader>
                            <CardTitle className="font-headline">Amenities</CardTitle>
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                        {floorPlanUrl && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="font-headline">Floor Plan</CardTitle>
                                    <CardDescription>View the property layout.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <EmbeddedPdfViewer file={floorPlanUrl}>
                                        <Button asChild>
                                            <a href={floorPlanUrl} target="_blank" rel="noopener noreferrer">
                                                <ExternalLink className="mr-2 h-5 w-5" />
                                                View
                                            </a>
                                        </Button>
                                    </EmbeddedPdfViewer>
                                </CardContent>
                            </Card>
                        )}
                        {installmentPlanUrl && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="font-headline">Installment Plan</CardTitle>
                                    <CardDescription>View the payment schedule.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <EmbeddedPdfViewer file={installmentPlanUrl}>
                                        <Button asChild>
                                            <a href={installmentPlanUrl} target="_blank" rel="noopener noreferrer">
                                                <ExternalLink className="mr-2 h-5 w-5" />
                                                View
                                            </a>
                                        </Button>
                                    </EmbeddedPdfViewer>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>

                <div className="lg:col-span-1 space-y-8">
                    <Card>
                        <CardHeader>
                            <Badge variant="secondary" className="w-fit">{property.category?.title || 'Uncategorized'}</Badge>
                            <h1 className="text-3xl font-bold font-headline text-foreground mt-2">{property.title}</h1>
                            <p className="flex items-center text-muted-foreground"><MapPin className="w-4 h-4 mr-2" />{property.location?.name || 'Unknown Location'}</p>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold text-primary mb-4">{property.currency} {new Intl.NumberFormat().format(property.price)}</p>
                            <Separator className="my-4" />
                            <div className="space-y-4">
                                {property.category?.name !== 'Studio' && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground flex items-center gap-2"><BedDouble className="w-5 h-5" /> Bedrooms</span>
                                        <span className="font-semibold text-foreground">{property.bedrooms}</span>
                                    </div>
                                )}
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground flex items-center gap-2"><Bath className="w-5 h-5" /> Bathrooms</span>
                                    <span className="font-semibold text-foreground">{property.bathrooms}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground flex items-center gap-2"><Ruler className="w-5 h-5" /> Size</span>
                                    <span className="font-semibold text-foreground">{property.areaInFeet || property.area} sqft</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground flex items-center gap-2"><Building className="w-5 h-5" /> Type</span>
                                    <span className="font-semibold text-foreground">{property.category?.title || 'N/A'}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground flex items-center gap-2"><Sofa className="w-5 h-5" /> Furnished</span>
                                    <span className="font-semibold text-foreground">{property.isFurnished ? 'Yes' : 'No'}</span>
                                </div>
                            </div>
                            <Separator className="my-4" />
                            <p className="text-sm text-muted-foreground italic">"{property.tagline}"</p>
                        </CardContent>
                    </Card>

                    <Card className="sticky top-28">
                        <CardHeader>
                            <CardTitle className="font-headline">Interested? Arrange a Viewing</CardTitle>
                            <CardDescription>Contact us to schedule a visit or for more details.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {contactPhone ? (
                                <div className="flex items-center space-x-2">
                                    <Button asChild variant="outline" className="flex-1">
                                        <a href={`tel:${contactPhone}`}>
                                            <Phone className="mr-2 h-4 w-4" /> Call
                                        </a>
                                    </Button>
                                    <Button asChild className="flex-1" style={{ backgroundColor: 'hsl(var(--accent))', color: 'hsl(var(--accent-foreground))' }}>
                                        <a href={`https://wa.me/${contactPhone.replace(/\s+/g, '')}`} target="_blank" rel="noopener noreferrer">
                                            <MessageSquare className="mr-2 h-4 w-4" /> Whatsapp
                                        </a>
                                    </Button>
                                </div>
                            ) : (
                                <p className="text-muted-foreground">Contact information not available.</p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

const PropertyDetailPage = () => (
    <div className="flex flex-col min-h-screen">
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
