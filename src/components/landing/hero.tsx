'use client';

import type { Dispatch, SetStateAction } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, MapPin, LayoutGrid } from 'lucide-react';

interface HeroProps {
  setSearchQuery: Dispatch<SetStateAction<string>>;
  setSelectedLocation: Dispatch<SetStateAction<string>>;
  setSelectedCategory: Dispatch<SetStateAction<string>>;
  locations: string[];
  categories: string[];
}

export const Hero = ({ setSearchQuery, setSelectedLocation, setSelectedCategory, locations, categories }: HeroProps) => {
  return (
    <section className="relative py-20 md:py-32 bg-gradient-to-b from-primary/10 to-background">
      <div className="container mx-auto text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold font-headline tracking-tight text-foreground mb-4">
            Discover Your <span className="text-primary">Amazing</span> City
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8">
            Find great places to stay, eat, shop, or visit from local experts.
          </p>
        </div>
        <div className="max-w-5xl mx-auto mt-8 p-4 bg-card/80 backdrop-blur-sm rounded-xl shadow-lg border">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            <div className="md:col-span-4 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="What are you looking for?"
                className="pl-10 h-12 text-base"
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="md:col-span-3 relative">
               <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Select onValueChange={(value) => setSelectedLocation(value === 'all' ? '' : value)}>
                <SelectTrigger className="pl-10 h-12 text-base">
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {locations.map(loc => <SelectItem key={loc} value={loc}>{loc}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-3 relative">
               <LayoutGrid className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Select onValueChange={(value) => setSelectedCategory(value === 'all' ? '' : value)}>
                <SelectTrigger className="pl-10 h-12 text-base">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2">
              <Button size="lg" className="w-full h-12 text-base" style={{ backgroundColor: 'hsl(var(--accent))', color: 'hsl(var(--accent-foreground))' }}>
                <Search className="mr-2 h-5 w-5" />
                Search
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
