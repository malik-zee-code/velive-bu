export type Listing = {
  id: number;
  title: string;
  description: string;
  category: 'Restaurant' | 'Hotel' | 'Shopping' | 'Apartment' | 'Event' | 'Fitness';
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
};
