
'use client';

import type { Listing } from '@/types/listing';
import { ListingCard } from '@/components/landing/listing-card';
import { Skeleton } from '../ui/skeleton';
import { Button } from '../ui/button';
import Link from 'next/link';

interface ListingsProps {
  listings: Listing[];
  loading: boolean;
}

export const Listings = ({ listings, loading }: ListingsProps) => {

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold font-headline mt-2 text-foreground">Featured Properties</h2>
          <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
            Explore our curated list of top-rated places and services in the city, reviewed by our community.
          </p>
        </div>
        {loading ? (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex flex-col space-y-3">
                <Skeleton className="h-[225px] w-full rounded-xl" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
              </div>
            ))}
          </div>
        ) : listings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {listings.map(listing => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <h3 className="text-2xl font-semibold">No Featured Listings Found</h3>
            <p className="text-muted-foreground mt-2">Check back later for our featured properties.</p>
          </div>
        )}
        <div className="text-center mt-12">
            <Button asChild size="lg" style={{ backgroundColor: 'hsl(var(--accent))', color: 'hsl(var(--accent-foreground))' }}>
                <Link href="/contact">List Your Unit With Us</Link>
            </Button>
        </div>
      </div>
    </section>
  );
};
