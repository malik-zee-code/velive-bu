
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, gql } from '@apollo/client';
import type { Listing } from '@/types/listing';
import { Header } from '@/components/landing/header';
import { Hero } from '@/components/landing/hero';
import { Listings } from '@/components/landing/listings';
import { Footer } from '@/components/landing/footer';
import { Testimonials } from './testimonials';
import { nhost } from '@/lib/nhost';
import { WhyVeLive } from './why-ve-live';
import { OurServices } from './our-services';
import dynamic from 'next/dynamic';
import { Skeleton } from '../ui/skeleton';

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

const GET_FEATURED_PROPERTIES = gql`
  query GetFeaturedProperties {
    properties(where: {is_featured: {_eq: true}}, order_by: {created_at: desc}) {
      id
      slug
      title
      tagline
      price
      currency
      bedrooms
      bathrooms
      area_in_feet
      listing_type
      category {
        id
        title
      }
      location {
        id
        name
      }
      properties_images(where: {is_primary: {_eq: true}}, limit: 1) {
        file_id
      }
    }
  }
`;


export function LandingPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [listingType, setListingType] = useState('sale');
  const [isFurnished, setIsFurnished] = useState(false);
  const router = useRouter();

  const { data: categoriesData } = useQuery(GET_CATEGORIES);
  const { data: locationsData } = useQuery(GET_LOCATIONS);
  const { data: featuredPropertiesData, loading: featuredLoading } = useQuery(GET_FEATURED_PROPERTIES);

  const handleSearchClick = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (selectedLocation) params.set('location', selectedLocation);
    if (selectedCategory) params.set('category', selectedCategory);
    if (listingType) params.set('listing_type', listingType);
    if (isFurnished) params.set('is_furnished', 'true');
    router.push(`/listings?${params.toString()}`);
  };
  
  const handleClearClick = () => {
    setSearchQuery('');
    setSelectedLocation('');
    setSelectedCategory('');
    setListingType('sale');
    setIsFurnished(false);
  };

  const handleCategorySelect = (category: string) => {
    const params = new URLSearchParams();
    const categoryObj = categoriesData?.categories.find((c: any) => c.title === category);
    if (categoryObj) {
      params.set('category', categoryObj.id);
    }
    router.push(`/listings?${params.toString()}`);
  };

  const listings: Listing[] = featuredPropertiesData?.properties.map((p: any) => ({
      id: p.id,
      slug: p.slug,
      title: p.title,
      description: p.tagline,
      category: p.category?.title || 'Uncategorized',
      location: p.location?.name || 'Unknown Location',
      image: p.properties_images[0] ? nhost.storage.getPublicUrl({ fileId: p.properties_images[0].file_id }) : 'https://placehold.co/400x250.png',
      rating: 4.5, // Mocked
      reviews: 100, // Mocked
      author: { name: 'VE LIVE', avatar: '/assets/images/testimonial/01.jpg' }, // Mocked
      price: p.price,
      status: 'Open', // Mocked
      date: 'Posted recently', // Mocked
      listing_type: p.listing_type,
      bedrooms: p.bedrooms,
      bathrooms: p.bathrooms,
      area: p.area_in_feet
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
          locations={locationsData?.locations || []}
          categories={categoriesData?.categories || []}
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
