'use client';

import type { Dispatch, SetStateAction, ElementType } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, MapPin, Utensils, Hotel, ShoppingCart, Briefcase, Calendar, Dumbbell } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface HeroProps {
  setSearchQuery: Dispatch<SetStateAction<string>>;
  setSelectedLocation: Dispatch<SetStateAction<string>>;
  setSelectedCategory: Dispatch<SetStateAction<string>>;
  locations: string[];
  categories: string[];
}

const categoryItems: { name: string; icon: ElementType }[] = [
  { name: 'Restaurant', icon: Utensils },
  { name: 'Hotel', icon: Hotel },
  { name: 'Shopping', icon: ShoppingCart },
  { name: 'Apartment', icon: Briefcase },
  { name: 'Event', icon: Calendar },
  { name: 'Fitness', icon: Dumbbell },
];

export const Hero = ({ setSearchQuery, setSelectedLocation, setSelectedCategory, locations }: HeroProps) => {
  return (
    <section className="relative py-20 md:py-32 bg-card text-card-foreground" style={{
      backgroundImage: 'url(https://placehold.co/1920x1080/000000/000000)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }}>
      <div className="absolute inset-0 bg-black/60" />
      <div className="container relative mx-auto text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold font-headline tracking-tight text-white mb-4">
            Discover Your <span className="text-primary">Amazing</span> City
          </h1>
          <p className="text-lg md:text-xl text-white/80 mb-8">
            Find great places to stay, eat, shop, or visit from local experts.
          </p>
        </div>
        <div className="max-w-5xl mx-auto mt-8 p-4 bg-background/20 backdrop-blur-sm rounded-xl shadow-lg border border-white/20">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            <div className="md:col-span-5 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="What are you looking for?"
                className="pl-10 h-12 text-base bg-white/90 text-black placeholder:text-gray-500"
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="md:col-span-4 relative">
               <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Select onValueChange={(value) => setSelectedLocation(value === 'all' ? '' : value)}>
                <SelectTrigger className="pl-10 h-12 text-base bg-white/90 text-black">
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {locations.map(loc => <SelectItem key={loc} value={loc}>{loc}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-3">
              <Button size="lg" className="w-full h-12 text-base" style={{ backgroundColor: 'hsl(var(--accent))', color: 'hsl(var(--accent-foreground))' }}>
                <Search className="mr-2 h-5 w-5" />
                Search
              </Button>
            </div>
          </div>
        </div>
        <div className="mt-12">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                {categoryItems.map(({ name, icon: Icon }) => (
                    <button
                    key={name}
                    onClick={() => setSelectedCategory(name)}
                    className="w-full"
                    >
                    <Card className="group text-center p-4 transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1 border-2 border-transparent bg-white/10 hover:bg-white/20">
                        <CardContent className="p-0">
                        <div className="mx-auto h-16 w-16 rounded-full flex items-center justify-center bg-primary/80 text-primary-foreground transition-colors group-hover:bg-primary">
                            <Icon className="h-8 w-8" />
                        </div>
                        <h3 className="mt-4 font-semibold text-lg text-white">{name}</h3>
                        </CardContent>
                    </Card>
                    </button>
                ))}
            </div>
        </div>
      </div>
    </section>
  );
};
