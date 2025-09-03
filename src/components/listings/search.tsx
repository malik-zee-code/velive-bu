
'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, MapPin, X, ListFilter, Home, Sofa, BedDouble } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { cn } from '@/lib/utils';
import { ToggleGroup, ToggleGroupItem } from '../ui/toggle-group';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';

interface SearchComponentProps {
  locations: { id: string; name: string }[];
  categories: { id: string; title: string }[];
}

export const SearchComponent = ({ locations, categories }: SearchComponentProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedLocation, setSelectedLocation] = useState(searchParams.get('location') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [listingType, setListingType] = useState(searchParams.get('listing_type') || 'rent');
  const [isFurnished, setIsFurnished] = useState(searchParams.get('is_furnished') === 'true');
  const [bedrooms, setBedrooms] = useState(searchParams.get('bedrooms') || '');
  
  useEffect(() => {
    setSearchQuery(searchParams.get('q') || '');
    setSelectedLocation(searchParams.get('location') || '');
    setSelectedCategory(searchParams.get('category') || '');
    setListingType(searchParams.get('listing_type') || 'rent');
    setIsFurnished(searchParams.get('is_furnished') === 'true');
    setBedrooms(searchParams.get('bedrooms') || '');
  }, [searchParams]);

  const handleSearch = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (searchQuery) {
      params.set('q', searchQuery);
    } else {
      params.delete('q');
    }
    if (selectedLocation) {
      params.set('location', selectedLocation);
    } else {
      params.delete('location');
    }
    if (selectedCategory) {
        params.set('category', selectedCategory);
    } else {
        params.delete('category');
    }
    if (listingType && listingType !== 'all') {
      params.set('listing_type', listingType);
    } else {
      params.delete('listing_type');
    }
     if (isFurnished) {
      params.set('is_furnished', 'true');
    } else {
      params.delete('is_furnished');
    }
    if (bedrooms) {
      params.set('bedrooms', bedrooms);
    } else {
      params.delete('bedrooms');
    }
    router.push(`/listings?${params.toString()}`);
  };

  const handleClear = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('q');
    params.delete('location');
    params.delete('category');
    params.delete('listing_type');
    params.delete('is_furnished');
    params.delete('bedrooms');
    setSearchQuery('');
    setSelectedLocation('');
    setSelectedCategory('');
    setListingType('rent');
    setIsFurnished(false);
    setBedrooms('');
    router.push(`/listings?${params.toString()}`);
  };

  const handleListingTypeChange = (value: string) => {
    if (value) {
      setListingType(value);
    }
  };

  const handleBedroomsChange = (value: string) => {
    setBedrooms(value === 'any' ? '' : value);
  };


  const isFiltered = !!searchQuery || !!selectedLocation || !!selectedCategory || (!!listingType && listingType !== 'rent') || isFurnished || !!bedrooms;

  return (
    <div className="bg-secondary py-8 mb-12">
        <div className="container mx-auto max-w-7xl">
            <Card className="p-4">
              <CardContent className="p-0">
                  <div className="flex items-center gap-4 mb-4">
                      <ToggleGroup
                        type="single"
                        value={listingType}
                        onValueChange={handleListingTypeChange}
                        className="flex items-center space-x-1 bg-muted p-1 rounded-md"
                      >
                        <ToggleGroupItem value="rent" aria-label="Toggle rent" className="px-4 py-2 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:shadow-sm rounded-md">
                          Rent
                        </ToggleGroupItem>
                        <ToggleGroupItem value="sale" aria-label="Toggle sale" className="px-4 py-2 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:shadow-sm rounded-md">
                          Sale
                        </ToggleGroupItem>
                      </ToggleGroup>
                       <div className="flex items-center space-x-2">
                          <Switch id="furnished-toggle-listing" checked={isFurnished} onCheckedChange={setIsFurnished} />
                          <Label htmlFor="furnished-toggle-listing">Furnished</Label>
                      </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-white p-2 rounded-lg border">
                      <div className="md:col-span-3 relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                          <Input
                              type="text"
                              placeholder="Search by property title..."
                              className="pl-10 h-12 text-base bg-transparent border-0 text-black placeholder:text-gray-500 focus-visible:ring-0 focus-visible:ring-offset-0"
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                          />
                      </div>
                      <div className="md:col-span-2 relative">
                          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                          <Select value={selectedLocation} onValueChange={(value) => setSelectedLocation(value === 'all' ? '' : value)}>
                              <SelectTrigger className="pl-10 h-12 text-base bg-transparent border-0 text-black focus:ring-0 focus:ring-offset-0">
                                  <SelectValue placeholder="All Locations" />
                              </SelectTrigger>
                              <SelectContent>
                                  <SelectItem value="all">All Locations</SelectItem>
                                  {locations.map(loc => <SelectItem key={loc.id} value={loc.id.toString()}>{loc.name}</SelectItem>)}
                              </SelectContent>
                          </Select>
                      </div>
                      <div className="md:col-span-2 relative">
                          <ListFilter className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                          <Select value={selectedCategory} onValueChange={(value) => setSelectedCategory(value === 'all' ? '' : value)}>
                              <SelectTrigger className="pl-10 h-12 text-base bg-transparent border-0 text-black focus:ring-0 focus:ring-offset-0">
                                  <SelectValue placeholder="All Categories" />
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
                                  <SelectValue placeholder="Beds (Any)" />
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
                              className="w-full h-12 text-base rounded-lg"
                              onClick={handleSearch}
                          >
                              <Search className="mr-2 h-5 w-5" />
                              Search
                          </Button>
                          {isFiltered && (
                              <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-12 w-12 text-muted-foreground"
                                  onClick={handleClear}
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
  );
};
