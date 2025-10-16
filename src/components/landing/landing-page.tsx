
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { Listing } from '@/types/listing';
import { Header } from '@/components/landing/header';
import { Hero } from '@/components/landing/hero';
import { Listings } from '@/components/landing/listings';
import { Footer } from '@/components/landing/footer';
import { Testimonials } from './testimonials';
import { WhyVeLive } from './why-ve-live';
import { OurServices } from './our-services';
import dynamic from 'next/dynamic';
import { Skeleton } from '../ui/skeleton';
import { categoryService, locationService, propertyService } from '@/lib/services';

const PdfViewer = dynamic(() => import('../common/PdfViewer').then(mod => mod.PdfViewer), {
  ssr: false,
  loading: () => (
    <div className="bg-background py-20">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold font-headline mt-2 text-foreground">Our Company Brochure</h2>
          <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
            Discover more about our services, mission, and the value we bring to your property investment.
          </p>
        </div>
        <div className="flex justify-center items-center h-[50vh] bg-secondary rounded-lg">
          <Skeleton className="w-full h-full" />
        </div>
      </div>
    </div>
  )
});


export function LandingPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [listingType, setListingType] = useState('rent');
  const [isFurnished, setIsFurnished] = useState(false);
  const [bedrooms, setBedrooms] = useState('');
  const router = useRouter();

  const [categories, setCategories] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [featuredProperties, setFeaturedProperties] = useState<any[]>([]);
  const [featuredLoading, setFeaturedLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setFeaturedLoading(true);
        const [categoriesRes, locationsRes, propertiesRes] = await Promise.all([
          categoryService.getAllCategories(),
          locationService.getAllLocations(),
          propertyService.getFeaturedProperties(),
        ]);

        setCategories(categoriesRes.data);
        setLocations(locationsRes.data);

        // Filter to only show approved and available properties
        const approvedAndAvailableProperties = propertiesRes.data.filter(
          (property: any) => property.isApproved === true && property.isAvailable === true
        );
        setFeaturedProperties(approvedAndAvailableProperties);
      } catch (err) {
        console.error('Failed to fetch landing page data:', err);
      } finally {
        setFeaturedLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSearchClick = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (selectedLocation) params.set('location', selectedLocation);
    if (selectedCategory) params.set('category', selectedCategory);
    if (listingType) params.set('listingType', listingType);
    if (isFurnished) params.set('isFurnished', 'true');
    if (bedrooms) params.set('bedrooms', bedrooms);
    router.push(`/listings?${params.toString()}`);
  };

  const handleClearClick = () => {
    setSearchQuery('');
    setSelectedLocation('');
    setSelectedCategory('');
    setListingType('rent');
    setIsFurnished(false);
    setBedrooms('');
  };

  const handleCategorySelect = (category: string) => {
    const params = new URLSearchParams();
    const categoryObj = categories.find((c: any) => c.title === category);
    if (categoryObj) {
      params.set('category', categoryObj._id);
    }
    router.push(`/listings?${params.toString()}`);
  };

  const listings: Listing[] = featuredProperties.map((p: any) => ({
    id: p.id || p._id,
    slug: p.slug,
    title: p.title,
    description: p.tagline || p.description,
    category: p.category?.title || 'Uncategorized',
    location: p.location?.name || 'Unknown Location',
    image: p.images?.[0]?.imageUrl || 'https://placehold.co/400x250.png',
    rating: 4.5, // Mocked
    reviews: 100, // Mocked
    author: { name: 'VE LIVE', avatar: '/assets/images/testimonial/01.jpg' }, // Mocked
    price: p.price,
    status: 'Open', // Mocked
    date: 'Posted recently', // Mocked
    listingType: p.listingType || p.status,
    bedrooms: p.bedrooms,
    bathrooms: p.bathrooms,
    area: p.areaInFeet || p.area
  })) || [];

  return (
    <>
      <Header />
      <main>
        <Hero
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedLocation={selectedLocation}
          setSelectedLocation={setSelectedLocation}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          listingType={listingType}
          setListingType={setListingType}
          isFurnished={isFurnished}
          setIsFurnished={setIsFurnished}
          bedrooms={bedrooms}
          setBedrooms={setBedrooms}
          locations={locations}
          categories={categories}
          onSearchClick={handleSearchClick}
          onClearClick={handleClearClick}
          onCategorySelect={handleCategorySelect}
        />
        <WhyVeLive />
        <PdfViewer file="/assets/images/download/brochure.pdf" />
        <OurServices />
        <div id="listings">
          <Listings
            listings={listings}
            loading={featuredLoading}
          />
        </div>
        {/* <PopularCities /> */}
        <Testimonials />
      </main>
      <Footer />
    </>
  );
}
