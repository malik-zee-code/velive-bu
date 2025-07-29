// src/app/listings/page.tsx
'use client';
import { useQuery, gql } from '@apollo/client';
import { Header } from '@/components/landing/header';
import { Footer } from '@/components/landing/footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const GET_PROPERTIES = gql`
  query GetProperties {
    properties {
      price
      location
      title
      created_at
      updated_at
      id
      description
      category
      image
      rating
      reviews
      author
      status
      date
    }
  }
`;

const ListingsPage = () => {
  const { data, loading, error } = useQuery(GET_PROPERTIES);

  if (loading) return (
    <div className="flex-grow bg-background">
      <Header />
      <div className="container mx-auto py-20 text-center max-w-7xl">
        <p>Loading...</p>
      </div>
      <Footer />
    </div>
  );
  if (error) return (
    <div className="flex-grow bg-background">
      <Header />
      <div className="container mx-auto py-20 text-center max-w-7xl">
        <p>Error! {error.message}</p>
      </div>
      <Footer />
    </div>
  );
  
  return (
    <div className="flex flex-col min-h-screen">
       <Header />
        <main className="flex-grow py-20 bg-background">
            <div className="container mx-auto max-w-7xl">
                 <div className="text-center mb-12">
                    <span className="text-primary font-semibold">Directory</span>
                    <h2 className="text-3xl md:text-4xl font-bold font-headline mt-2 text-foreground">Our Featured Directory</h2>
                    <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
                        Explore our curated list of top-rated places and services in the city, reviewed by our community.
                    </p>
                </div>
                {data.properties.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {data.properties.map((property: any) => (
                           <Card key={property.id} className="overflow-hidden flex flex-col h-full group transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-card text-card-foreground border-border">
                             <CardHeader>
                               <CardTitle className="font-bold font-headline text-xl mb-2 text-foreground truncate">{property.title}</CardTitle>
                             </CardHeader>
                             <CardContent>
                               <p className="text-lg font-semibold text-primary">${property.price}</p>
                             </CardContent>
                           </Card>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <h3 className="text-2xl font-semibold">No Listings Found</h3>
                        <p className="text-muted-foreground mt-2">Try adjusting your search filters.</p>
                    </div>
                )}
            </div>
        </main>
      <Footer />
    </div>
  );
};

export default ListingsPage;
