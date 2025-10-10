
export type Listing = {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: any;
  location: any;
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
  listingType: 'sale' | 'rent';
  bedrooms: number;
  bathrooms: number;
  area: number;
};
