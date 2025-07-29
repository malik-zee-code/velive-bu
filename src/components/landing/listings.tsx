'use client';

import type { Listing } from '@/types/listing';
import { ListingCard } from '@/components/landing/listing-card';

interface ListingsProps {
  listings: Listing[];
  searchQuery: string;
  selectedLocation: string;
  selectedCategory: string;
}

export const Listings = ({ listings, searchQuery, selectedLocation, selectedCategory }: ListingsProps) => {
  const filteredListings = listings.filter(listing => {
    const matchesSearch = listing.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLocation = selectedLocation ? listing.location === selectedLocation : true;
    const matchesCategory = selectedCategory ? listing.category === selectedCategory : true;
    return matchesSearch && matchesLocation && matchesCategory;
  });

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-12">
          <span className="text-primary font-semibold">Directory</span>
          <h2 className="text-3xl md:text-4xl font-bold font-headline mt-2 text-foreground">Our Featured Directory</h2>
          <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
            Explore our curated list of top-rated places and services in the city, reviewed by our community.
          </p>
        </div>
        {filteredListings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredListings.map(listing => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <h3 className="text-2xl font-semibold">No Listings Found</h3>
            <p className="text-muted-foreground mt-2">Try adjusting your search filters.</p>
          </div>
        )}
      </div>
    </section>
  );
};
