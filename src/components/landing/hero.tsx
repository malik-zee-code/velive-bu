
'use client';

import type { Dispatch, SetStateAction, ElementType } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, MapPin, ListFilter, Utensils, Hotel, ShoppingBag, Briefcase, Calendar, Dumbbell, X, Download, MessageCircle, Wrench, Home, Sofa, BedDouble } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { ToggleGroup, ToggleGroupItem } from '../ui/toggle-group';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';

interface HeroProps {
  searchQuery: string;
  setSearchQuery: Dispatch<SetStateAction<string>>;
  selectedLocation: string;
  setSelectedLocation: Dispatch<SetStateAction<string>>;
  selectedCategory: string;
  setSelectedCategory: Dispatch<SetStateAction<string>>;
  listingType: string;
  setListingType: Dispatch<SetStateAction<string>>;
  isFurnished: boolean;
  setIsFurnished: Dispatch<SetStateAction<boolean>>;
  bedrooms: string;
  setBedrooms: Dispatch<SetStateAction<string>>;
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
  isFurnished, setIsFurnished,
  bedrooms, setBedrooms,
  locations, categories, onSearchClick, onClearClick, onCategorySelect
}: HeroProps) => {
  
  const handleLocationChange = (value: string) => {
    setSelectedLocation(value === 'all' ? '' : value);
  };
  
  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value === 'all' ? '' : value);
  };
  
  const handleBedroomsChange = (value: string) => {
    setBedrooms(value === 'any' ? '' : value);
  };

  const handleListingTypeChange = (value: string) => {
    if (value) {
      setListingType(value);
    }
  };

  const isFiltered = searchQuery || selectedLocation || selectedCategory || (listingType && listingType !== 'rent') || isFurnished || bedrooms;

  const selectedCategoryName = categories.find(c => c.id === selectedCategory)?.title;

  return (
    <section className="relative flex items-center justify-center text-card-foreground overflow-hidden py-20 md:py-28 md:h-[calc(100vh-5rem)] ">
        <video 
            autoPlay 
            loop 
            muted 
            playsInline
            className="absolute z-0 w-auto min-w-full min-h-full max-w-none pb-[350px]"
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
                <Card className="p-4 bg-white/10 border-white/20 backdrop-blur-md">
                    <CardContent className="p-0">
                        <div className="flex items-center gap-4 mb-4">
                            <ToggleGroup
                                type="single"
                                value={listingType}
                                onValueChange={handleListingTypeChange}
                                className="flex items-center space-x-1 bg-black/20 p-1 rounded-md"
                            >
                                <ToggleGroupItem value="rent" aria-label="Toggle rent" className="px-4 py-2 text-white hover:bg-transparent data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:shadow-sm rounded-md">
                                Rent
                                </ToggleGroupItem>
                                <ToggleGroupItem value="sale" aria-label="Toggle sale" className="px-4 py-2 text-white hover:bg-transparent data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:shadow-sm rounded-md">
                                Sale
                                </ToggleGroupItem>
                            </ToggleGroup>
                            <div className="flex items-center space-x-2">
                                <Switch id="furnished-toggle-hero" checked={isFurnished} onCheckedChange={setIsFurnished} />
                                <Label htmlFor="furnished-toggle-hero" className="text-white">Furnished</Label>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-white p-2 rounded-lg border">
                            <div className="md:col-span-3 relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <Input
                                    type="text"
                                    placeholder="What are you looking for?"
                                    className="pl-10 h-12 text-base bg-transparent border-0 text-black placeholder:text-gray-500 focus-visible:ring-0 focus-visible:ring-offset-0"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && onSearchClick()}
                                />
                            </div>
                            <div className="md:col-span-2 relative">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
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
                             <div className="md:col-span-2 relative">
                                <ListFilter className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
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
                            <div className="md:col-span-3 relative">
                                <BedDouble className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <Select value={bedrooms} onValueChange={handleBedroomsChange}>
                                    <SelectTrigger className="pl-10 h-12 text-base bg-transparent border-0 text-black focus:ring-0 focus:ring-offset-0">
                                        <SelectValue placeholder="Beds" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="any">Any</SelectItem>
                                        <SelectItem value="1">1</SelectItem>
                                        <SelectItem value="2">2</SelectItem>
                                        <SelectItem value="3">3</SelectItem>
                                        <SelectItem value="4">4</SelectItem>
                                        <SelectItem value="5+">5+</SelectItem>
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
                                    className="h-12 w-12 text-muted-foreground hover:bg-black/10"
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
        </div>
    </section>
  );
};
