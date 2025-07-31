'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, gql } from '@apollo/client';
import type { Listing } from '@/types/listing';
import { Header } from '@/components/landing/header';
import { Hero } from '@/components/landing/hero';
import { Listings } from '@/components/landing/listings';
import { Footer } from '@/components/landing/footer';
import { GrowBusiness } from './grow-business';
import { PopularCities } from './popular-cities';
import { Testimonials } from './testimonials';
import { HowItWorks } from './how-it-works';

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


const mockListings: Listing[] = [
  {
    id: 1,
    title: 'Sapori Pane Italian Restaurant',
    description: 'Authentic Italian cuisine in the heart of the city.',
    category: 'Restaurants',
    location: 'New York',
    image: '/assets/images/category/01.jpg',
    rating: 4.8,
    reviews: 120,
    author: { name: 'Lisa Smith', avatar: '/assets/images/testimonial/01.jpg' },
    price: 50,
    status: 'Open',
    date: 'Posted 10 Days Ago'
  },
  {
    id: 2,
    title: 'Ramada Bay Hotel Elite',
    description: 'Luxury hotel with stunning city views.',
    category: 'Hotels',
    location: 'Los Angeles',
    image: '/assets/images/category/02.jpg',
    rating: 4.9,
    reviews: 340,
    author: { name: 'John Doe', avatar: '/assets/images/testimonial/02.jpg' },
    price: 250,
    status: 'Open',
    date: 'Posted 5 Days Ago'
  },
  {
    id: 3,
    title: 'Hentrix Fashion Clothing Store',
    description: 'The latest trends in fashion and apparel.',
    category: 'Shopping',
    location: 'London',
    image: '/assets/images/category/03.jpg',
    rating: 4.7,
    reviews: 88,
    author: { name: 'Jane Roe', avatar: '/assets/images/testimonial/03.jpg' },
    price: 100,
    status: 'Closed',
    date: 'Posted 1 Day Ago'
  },
  {
    id: 4,
    title: 'Feroda Lake View Apartments',
    description: 'Modern apartments with a beautiful lake view.',
    category: 'Apartment',
    location: 'New York',
    image: '/assets/images/category/04.jpg',
    rating: 4.6,
    reviews: 65,
    author: { name: 'Peter Pan', avatar: '/assets/images/testimonial/01.jpg' },
    price: 3000,
    status: 'Open',
    date: 'Posted 2 Weeks Ago'
  },
  {
    id: 5,
    title: 'Leradoc Band in Marquee Club',
    description: 'Live music event featuring the Leradoc Band.',
    category: 'Events',
    location: 'London',
    image: '/assets/images/category/05.jpg',
    rating: 5.0,
    reviews: 210,
    author: { name: 'Mike Johnson', avatar: '/assets/images/testimonial/02.jpg' },
    price: 75,
    status: 'Open',
    date: 'Posted 1 Month Ago'
  },
  {
    id: 6,
    title: 'Alora Premium Fitness Gym',
    description: 'State-of-the-art fitness center with personal trainers.',
    category: 'Fitness',
    location: 'Los Angeles',
    image: '/assets/images/category/06.jpg',
    rating: 4.8,
    reviews: 150,
    author: { name: 'Sarah Chen', avatar: '/assets/images/testimonial/03.jpg' },
    price: 80,
    status: 'Open',
    date: 'Posted 3 Days Ago'
  },
   {
    id: 7,
    title: 'Some Business',
    description: 'A great business to work with.',
    category: 'Business',
    location: 'New York',
    image: '/assets/images/category/07.jpg',
    rating: 4.5,
    reviews: 20,
    author: { name: 'Some Guy', avatar: '/assets/images/testimonial/01.jpg' },
    price: 0,
    status: 'Open',
    date: 'Posted 1 week ago'
  }
];

export function LandingPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const router = useRouter();

  const { data: categoriesData } = useQuery(GET_CATEGORIES);
  const { data: locationsData } = useQuery(GET_LOCATIONS);

  const handleSearchClick = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (selectedLocation) params.set('location', selectedLocation);
    if (selectedCategory) params.set('category', selectedCategory);
    router.push(`/listings?${params.toString()}`);
  };
  
  const handleClearClick = () => {
    setSearchQuery('');
    setSelectedLocation('');
    setSelectedCategory('');
  };

  const handleCategorySelect = (category: string) => {
    const params = new URLSearchParams();
    const categoryObj = categoriesData?.categories.find((c: any) => c.title === category);
    if (categoryObj) {
      params.set('category', categoryObj.id);
    }
    router.push(`/listings?${params.toString()}`);
  };

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
          locations={locationsData?.locations || []}
          categories={categoriesData?.categories || []}
          onSearchClick={handleSearchClick}
          onClearClick={handleClearClick}
          onCategorySelect={handleCategorySelect}
        />
        <div id="listings">
          <Listings
            listings={mockListings}
            searchQuery={searchQuery}
            selectedLocation={selectedLocation}
            selectedCategory={selectedCategory}
          />
        </div>
        <GrowBusiness />
        <PopularCities />
        <Testimonials />
        <HowItWorks />
      </main>
      <Footer />
    </>
  );
}
