'use client';

import type { Dispatch, SetStateAction, ElementType } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, MapPin, ListFilter, Utensils, Hotel, ShoppingBag, Briefcase, Calendar, Dumbbell, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface HeroProps {
  searchQuery: string;
  setSearchQuery: Dispatch<SetStateAction<string>>;
  selectedLocation: string;
  setSelectedLocation: Dispatch<SetStateAction<string>>;
  selectedCategory: string;
  setSelectedCategory: Dispatch<SetStateAction<string>>;
  locations: string[];
  categories: string[];
  onSearchClick: () => void;
  onClearClick: () => void;
}

const categoryItems: { name: string; icon: ElementType }[] = [
  { name: 'Restaurants', icon: Utensils },
  { name: 'Hotels', icon: Hotel },
  { name: 'Shopping', icon: ShoppingBag },
  { name: 'Business', icon: Briefcase },
  { name: 'Events', icon: Calendar },
  { name: 'Fitness', icon: Dumbbell },
];

export const Hero = ({ 
  searchQuery, setSearchQuery, 
  selectedLocation, setSelectedLocation, 
  selectedCategory, setSelectedCategory, 
  locations, categories, onSearchClick, onClearClick 
}: HeroProps) => {
  
  const handleLocationChange = (value: string) => {
    setSelectedLocation(value === 'all' ? '' : value);
  };
  
  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value === 'all' ? '' : value);
  };

  const isFiltered = searchQuery || selectedLocation || selectedCategory;

  return (
    <section className="relative py-20 md:py-32 bg-card text-card-foreground" style={{
      backgroundImage: 'url(/assets/images/blog/01.jpg)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }}>
      <div className="absolute inset-0 bg-black/70" />
      <div className="container relative mx-auto text-center">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold font-headline tracking-tight text-white mb-4">
            Discover Your <span className="text-primary">Amazing</span> City
          </h1>
          <p className="text-lg md:text-xl text-white/80 mb-8">
            Find Great Places To Stay, Eat, Shop, Or Visit From Local Experts.
          </p>
        </div>
        <div className="max-w-7xl mx-auto mt-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-white p-2 rounded-lg">
            <div className="md:col-span-4 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="What are you looking for?"
                className="pl-10 h-12 text-base bg-transparent border-0 text-black placeholder:text-gray-500 focus-visible:ring-0 focus-visible:ring-offset-0"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="md:col-span-3 relative">
               <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Select value={selectedLocation} onValueChange={handleLocationChange}>
                <SelectTrigger className="pl-10 h-12 text-base bg-transparent border-0 text-black focus:ring-0 focus:ring-offset-0">
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {locations.map(loc => <SelectItem key={loc} value={loc}>{loc}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-3 relative">
              <ListFilter className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                  <SelectTrigger className="pl-10 h-12 text-base bg-transparent border-0 text-black focus:ring-0 focus:ring-offset-0">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                  </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2 flex items-center gap-2">
              <Button 
                size="lg" 
                className="w-full h-12 text-base rounded-lg transition-colors duration-300 ease-in-out hover:opacity-90"
                style={{ backgroundColor: 'hsl(var(--accent))', color: 'hsl(var(--accent-foreground))' }}
                onClick={onSearchClick}
                >
                <Search className="mr-2 h-5 w-5" />
                Search
              </Button>
              {isFiltered && (
                <Button 
                  size="icon"
                  variant="ghost"
                  className="h-12 w-12 text-muted-foreground"
                  onClick={onClearClick}
                  >
                  <X className="h-5 w-5" />
                </Button>
              )}
            </div>
          </div>
        </div>
        <div className="mt-12 max-w-7xl mx-auto">
            <p className="text-white mb-6">Or Browse Featured Categories</p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mx-auto">
                {categoryItems.map(({ name, icon: Icon }) => (
                    <button
                    key={name}
                    onClick={() => {
                      setSelectedCategory(name);
                      onSearchClick();
                    }}
                    className="w-full"
                    >
                    <Card className={cn("group text-center p-4 transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1 border-2 bg-white hover:bg-gray-100 rounded-lg", {
                        "border-primary": selectedCategory === name,
                        "border-transparent": selectedCategory !== name
                    })}>
                        <CardContent className="p-0">
                        <div className="mx-auto h-16 w-16 rounded-lg flex items-center justify-center bg-primary/20 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                            <Icon className="h-8 w-8" />
                        </div>
                        <h3 className="mt-4 font-semibold text-lg text-foreground">{name}</h3>
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
