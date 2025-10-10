
'use client';
import React, { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Header } from '@/components/landing/header';
import { Footer } from '@/components/landing/footer';
import { SearchComponent } from '@/components/listings/search';
import { PropertyCard } from '@/components/listings/property-card';
import { getSetting } from '@/lib/settings';
import { propertyService, categoryService, locationService, settingsService } from '@/lib/services';

const ListingsPageContent = ({ contactPhone }: { contactPhone: string | null }) => {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('q') || '';
  const locationQuery = searchParams.get('location');
  const categoryQuery = searchParams.get('category');
  const listingTypeQuery = searchParams.get('listingType');
  const isFurnishedQuery = searchParams.get('isFurnished');
  const bedroomsQuery = searchParams.get('bedrooms');

  const [properties, setProperties] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Build search params
        const params: any = {};
        if (searchQuery) params.keyword = searchQuery;
        if (locationQuery) params.location = locationQuery;
        if (categoryQuery) params.category = categoryQuery;
        if (listingTypeQuery) params.listingType = listingTypeQuery;
        if (isFurnishedQuery) params.isFurnished = isFurnishedQuery;
        if (bedroomsQuery && bedroomsQuery !== '5+' && bedroomsQuery !== 'studio') {
          params.bedrooms = parseInt(bedroomsQuery, 10);
        }

        // Fetch data
        const [propertiesRes, categoriesRes, locationsRes] = await Promise.all([
          propertyService.searchProperties(params),
          categoryService.getAllCategories(),
          locationService.getAllLocations(),
        ]);

        setProperties(propertiesRes.data);
        setCategories(categoriesRes.data);
        setLocations(locationsRes.data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch data'));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [searchQuery, locationQuery, categoryQuery, listingTypeQuery, isFurnishedQuery, bedroomsQuery]);


  if (loading) return (
    <div className="container mx-auto py-20 text-center max-w-7xl">
      <p>Loading...</p>
    </div>
  );
  if (error) return (
    <div className="container mx-auto py-20 text-center max-w-7xl">
      <p>Error! {error.message}</p>
    </div>
  );

  return (
    <>
      <SearchComponent
        locations={locations}
        categories={categories}
      />
      <div className="container mx-auto max-w-7xl pb-20">
        {properties && properties.length > 0 ? (
          <div className="space-y-8">
            {properties.map((property: any) => (
              <PropertyCard key={property._id} property={property} contactPhone={contactPhone} />
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


const ListingsPage = () => {
  const [contactPhone, setContactPhone] = useState<string | null>(null);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [settingsError, setSettingsError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setSettingsLoading(true);
        const response = await settingsService.getAllSettings();
        const phone = getSetting(response.data, 'phone_1');
        setContactPhone(phone);
        setSettingsError(null);
      } catch (err) {
        setSettingsError(err instanceof Error ? err : new Error('Failed to fetch settings'));
      } finally {
        setSettingsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow bg-background">
        <Suspense fallback={<div className="container mx-auto py-20 text-center max-w-7xl"><p>Loading search...</p></div>}>
          {settingsLoading ? (
            <div className="container mx-auto py-20 text-center max-w-7xl"><p>Loading...</p></div>
          ) : settingsError ? (
            <div className="container mx-auto py-20 text-center max-w-7xl"><p>Error loading settings...</p></div>
          ) : (
            <ListingsPageContent contactPhone={contactPhone} />
          )}
        </Suspense>
      </main>
      <Footer />
    </div>
  );
};


export default ListingsPage;
