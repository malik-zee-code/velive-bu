'use client';

import { useState } from 'react';
import type { Listing } from '@/types/listing';
import { Header } from '@/components/landing/header';
import { Hero } from '@/components/landing/hero';
import { Listings } from '@/components/landing/listings';
import { Footer } from '@/components/landing/footer';
import { GrowBusiness } from './grow-business';
import { PopularCities } from './popular-cities';
import { Testimonials } from './testimonials';
import { HowItWorks } from './how-it-works';

const mockListings: Listing[] = [
  {
    id: 1,
    title: 'Sapori Pane Italian Restaurant',
    description: 'Authentic Italian cuisine in the heart of the city.',
    category: 'Restaurants',
    location: 'New York',
    image: 'https://placehold.co/400x250.png',
    rating: 4.8,
    reviews: 120,
    author: { name: 'Lisa Smith', avatar: '/assets/images/listing/author.jpg' },
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
    image: 'https://placehold.co/400x250.png',
    rating: 4.9,
    reviews: 340,
    author: { name: 'John Doe', avatar: '/assets/images/listing/author.jpg' },
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
    image: 'https://placehold.co/400x250.png',
    rating: 4.7,
    reviews: 88,
    author: { name: 'Jane Roe', avatar: '/assets/images/listing/author.jpg' },
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
    image: 'https://placehold.co/400x250.png',
    rating: 4.6,
    reviews: 65,
    author: { name: 'Peter Pan', avatar: '/assets/images/listing/author.jpg' },
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
    image: 'https://placehold.co/400x250.png',
    rating: 5.0,
    reviews: 210,
    author: { name: 'Mike Johnson', avatar: '/assets/images/listing/author.jpg' },
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
    image: 'https://placehold.co/400x250.png',
    rating: 4.8,
    reviews: 150,
    author: { name: 'Sarah Chen', avatar: '/assets/images/listing/author.jpg' },
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
    image: 'https://placehold.co/400x250.png',
    rating: 4.5,
    reviews: 20,
    author: { name: 'Some Guy', avatar: '/assets/images/listing/author.jpg' },
    price: 0,
    status: 'Open',
    date: 'Posted 1 week ago'
  }
];

const locations = [...new Set(mockListings.map(l => l.location))];
const categories = [...new Set(mockListings.map(l => l.category))];

export function LandingPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  return (
    <>
      <Header />
      <main>
        <Hero
          setSearchQuery={setSearchQuery}
          setSelectedLocation={setSelectedLocation}
          setSelectedCategory={setSelectedCategory}
          locations={locations}
          categories={categories}
        />
        <Listings
          listings={mockListings}
          searchQuery={searchQuery}
          selectedLocation={selectedLocation}
          selectedCategory={selectedCategory}
        />
        <GrowBusiness />
        <PopularCities />
        <Testimonials />
        <HowItWorks />
      </main>
      <Footer />
    </>
  );
}
