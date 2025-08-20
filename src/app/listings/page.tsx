
'use client';
import React, { Suspense } from 'react';
import { useQuery, gql } from '@apollo/client';
import { useSearchParams } from 'next/navigation';
import { Header } from '@/components/landing/header';
import { Footer } from '@/components/landing/footer';
import { SearchComponent } from '@/components/listings/search';
import { PropertyCard } from '@/components/listings/property-card';

const GET_PROPERTIES = gql`
  query GetProperties($where: properties_bool_exp) {
    properties(where: $where, order_by: {created_at: desc}) {
      id
      title
      slug
      price
      currency
      bedrooms
      bathrooms
      area_in_feet
      tagline
      listing_type
      properties_images(order_by: { is_primary: desc, created_at: asc }) {
        id
        file_id
      }
      category {
        id
        title
      }
      location {
        id
        name
      }
    }
  }
`;

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

const ListingsPageContent = () => {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('q') || '';
  const locationQuery = searchParams.get('location');
  const categoryQuery = searchParams.get('category');
  const listingTypeQuery = searchParams.get('listing_type');

  const createWhereClause = () => {
    const where: any = { _and: [] };
    if (searchQuery) {
        where._and.push({ title: { _ilike: `%${searchQuery}%` } });
    }
    if (locationQuery) {
        where._and.push({ location_id: { _eq: parseInt(locationQuery, 10) } });
    }
    if (categoryQuery) {
        where._and.push({ category_id: { _eq: categoryQuery } });
    }
    if (listingTypeQuery) {
        where._and.push({ listing_type: { _eq: listingTypeQuery } });
    } else {
        // Default to sale if no listing type is provided
        where._and.push({ listing_type: { _eq: 'sale' } });
    }
    return where;
  };

  const { data, loading, error } = useQuery(GET_PROPERTIES, {
      variables: { where: createWhereClause() }
  });
  const { data: categoriesData, loading: categoriesLoading, error: categoriesError } = useQuery(GET_CATEGORIES);
  const { data: locationsData, loading: locationsLoading, error: locationsError } = useQuery(GET_LOCATIONS);


  if (loading || categoriesLoading || locationsLoading) return (
      <div className="container mx-auto py-20 text-center max-w-7xl">
        <p>Loading...</p>
      </div>
  );
  if (error) return (
      <div className="container mx-auto py-20 text-center max-w-7xl">
        <p>Error! {error.message}</p>
      </div>
  );
   if (categoriesError) return (
      <div className="container mx-auto py-20 text-center max-w-7xl">
        <p>Error loading categories! {categoriesError.message}</p>
      </div>
  );
  if (locationsError) return (
      <div className="container mx-auto py-20 text-center max-w-7xl">
        <p>Error loading locations! {locationsError.message}</p>
      </div>
  );

  const filteredProperties = data?.properties || [];

  return (
    <>
      <SearchComponent 
        locations={locationsData?.locations || []}
        categories={categoriesData?.categories || []}
      />
      <div className="container mx-auto max-w-7xl pb-20">
          {filteredProperties && filteredProperties.length > 0 ? (
            <div className="space-y-8">
              {filteredProperties.map((property: any) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <h3 className="text-2xl font-semibold">No Listings Found</h3>
              <p className="text-muted-foreground mt-2">There are currently no properties matching your search.</p>
            </div>
          )}
        </div>
    </>
  );
}


const ListingsPage = () => (
  <div className="flex flex-col min-h-screen">
    <Header />
    <main className="flex-grow bg-background">
      <Suspense fallback={<div className="container mx-auto py-20 text-center max-w-7xl"><p>Loading search...</p></div>}>
        <ListingsPageContent />
      </Suspense>
    </main>
    <Footer />
  </div>
);


export default ListingsPage;
