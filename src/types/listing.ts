
export type Listing = {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: 'Restaurants' | 'Hotels' | 'Shopping' | 'Business' | 'Events' | 'Fitness' | 'Apartment';
  location: string;
  image: string;
  rating: number;
  reviews: number;
  author: {
    name: string;
    avatar: string;
  };
  price: number;
  status: 'Open' | 'Closed';
  date: string;
  listing_type: 'sale' | 'rent';
  bedrooms: number;
  bathrooms: number;
  area: number;
};
