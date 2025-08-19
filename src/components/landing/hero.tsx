'use client';

import type { Dispatch, SetStateAction, ElementType } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, MapPin, ListFilter, Utensils, Hotel, ShoppingBag, Briefcase, Calendar, Dumbbell, X, Download, MessageCircle, Wrench, Home } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Label } from '../ui/label';

interface HeroProps {
  searchQuery: string;
  setSearchQuery: Dispatch<SetStateAction<string>>;
  selectedLocation: string;
  setSelectedLocation: Dispatch<SetStateAction<string>>;
  selectedCategory: string;
  setSelectedCategory: Dispatch<SetStateAction<string>>;
  listingType: string;
  setListingType: Dispatch<SetStateAction<string>>;
  locations: { id: string; name: string }[];
  categories: { id: string; title: string }[];
  onSearchClick: () => void;
  onClearClick: () => void;
  onCategorySelect: (category: string) => void;
}

const categoryIconMap: { [key: string]: ElementType } = {
  'Restaurants': Utensils,
  'Hotels': Hotel,
  'Shopping': ShoppingBag,
  'Business': Briefcase,
  'Events': Calendar,
  'Fitness': Dumbbell,
  'Apartment': Briefcase, // Example, adjust as needed
};

export const Hero = ({ 
  searchQuery, setSearchQuery, 
  selectedLocation, setSelectedLocation, 
  selectedCategory, setSelectedCategory, 
  listingType, setListingType,
  locations, categories, onSearchClick, onClearClick, onCategorySelect
}: HeroProps) => {
  
  const handleLocationChange = (value: string) => {
    setSelectedLocation(value === 'all' ? '' : value);
  };
  
  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value === 'all' ? '' : value);
  };

  const isFiltered = searchQuery || selectedLocation || selectedCategory || (listingType && listingType !== 'all');

  const selectedCategoryName = categories.find(c => c.id === selectedCategory)?.title;

  return (
    <section className="relative flex items-center justify-center text-card-foreground overflow-hidden py-20 md:py-28">
        <video 
            autoPlay 
            loop 
            muted 
            playsInline
            className="absolute z-0 w-auto min-w-full min-h-full max-w-none"
        >
            <source src="/assets/images/hero/hadley-heights1.mp4" type="video/mp4" />
            Your browser does not support the video tag.
        </video>
        <div className="absolute inset-0 bg-black/70 z-10" />
        <div className="container relative z-20 mx-auto text-center">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-4xl md:text-6xl font-bold font-headline tracking-tight text-white mb-4">
                    Developer-Led Property Management<br />
                    <span className="text-primary">Built for Trust</span>
                </h1>
                <p className="text-lg md:text-xl text-white/80 mb-8">
                    Exclusively managing LEOS developments with full-service leasing, maintenance, legal support & more — all under one roof.
                </p>
            </div>
            <div className="max-w-7xl mx-auto mt-8">
            <Card className="p-4">
              <CardContent className="p-0">
                  <div className="flex items-center gap-4 mb-4">
                     <RadioGroup
                        value={listingType}
                        onValueChange={setListingType}
                        className="flex items-center space-x-4"
                      >
                        <Label
                          htmlFor="buy-option"
                          className={cn(
                            "cursor-pointer rounded-lg px-4 py-2 transition-colors",
                            listingType === 'sale' ? 'bg-primary/20 text-primary' : 'text-foreground'
                          )}
                        >
                          <RadioGroupItem value="sale" id="buy-option" className="sr-only" />
                          Buy
                        </Label>
                         <Label
                          htmlFor="rent-option"
                          className={cn(
                            "cursor-pointer rounded-lg px-4 py-2 transition-colors",
                            listingType === 'rent' ? 'bg-primary/20 text-primary' : 'text-foreground'
                          )}
                        >
                          <RadioGroupItem value="rent" id="rent-option" className="sr-only" />
                          Rent
                        </Label>
                      </RadioGroup>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-white p-2 rounded-lg border">
                      <div className="md:col-span-4 relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                          <Input
                              type="text"
                              placeholder="What are you looking for?"
                              className="pl-10 h-12 text-base bg-transparent border-0 text-black placeholder:text-gray-500 focus-visible:ring-0 focus-visible:ring-offset-0"
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && onSearchClick()}
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
                              {locations.map(loc => <SelectItem key={loc.id} value={loc.id}>{loc.name}</SelectItem>)}
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
                                  {categories.map(cat => <SelectItem key={cat.id} value={cat.id}>{cat.title}</SelectItem>)}
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
              </CardContent>
            </Card>
            </div>
            <div className="mt-12 max-w-7xl mx-auto">
                <p className="text-white mb-6">Or Browse Featured Categories</p>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mx-auto">
                    {categories.slice(0, 6).map((category) => {
                        const Icon = categoryIconMap[category.title] || Briefcase; // Default icon
                        return (
                            <button
                            key={category.id}
                            onClick={() => onCategorySelect(category.title)}
                            className="w-full"
                            >
                            <Card className={cn("group text-center p-4 transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1 border-2 bg-white hover:bg-gray-100 rounded-lg", {
                                "border-primary": selectedCategoryName === category.title,
                                "border-transparent": selectedCategoryName !== category.title
                            })}>
                                <CardContent className="p-0">
                                <div className="mx-auto h-16 w-16 rounded-lg flex items-center justify-center bg-primary/20 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                                    <Icon className="h-8 w-8" />
                                </div>
                                <h3 className="mt-4 font-semibold text-lg text-foreground">{category.title}</h3>
                                </CardContent>
                            </Card>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    </section>
  );
};
