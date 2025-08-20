import Image from 'next/image';
import type { Listing } from '@/types/listing';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Bookmark, Star, MapPin, CalendarDays, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface ListingCardProps {
  listing: Listing;
}

export const ListingCard = ({ listing }: ListingCardProps) => {
  const getCategoryIcon = (category: Listing['category']) => {
    const icons: { [key: string]: string } = {
      'Restaurants': '🍽️',
      'Hotels': '🏨',
      'Shopping': '🛍️',
      'Apartment': '🏢',
      'Events': '🎉',
      'Fitness': '💪',
      'Business': '💼'
    };
    return icons[category] || '❓';
  };

  return (
    <Card className="overflow-hidden flex flex-col h-full group transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-card text-card-foreground border-border">
      <CardHeader className="p-0 relative">
        <Link href={`/listings/${listing.slug}`}>
            <Image
              src={listing.image}
              alt={listing.title}
              width={400}
              height={250}
              className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-300"
              data-ai-hint="cityscape building"
            />
        </Link>
        <Badge
          className={cn(
            "absolute top-4 left-4 bg-primary text-primary-foreground"
          )}
        >
          {getCategoryIcon(listing.category)}
        </Badge>
        <Button variant="ghost" size="icon" className="absolute top-4 right-4 bg-card/70 hover:bg-card rounded-full">
          <Bookmark className="h-5 w-5" />
        </Button>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <div className="flex justify-between items-start mb-2">
          <span className="text-sm text-muted-foreground">{listing.category}</span>
          <div className="flex items-center gap-1 text-sm text-amber-500">
            <Star className="w-4 h-4 fill-current" />
            <span className="font-bold">{listing.rating.toFixed(1)}</span>
            <span className="text-muted-foreground">({listing.reviews})</span>
          </div>
        </div>
        <h3 className="font-bold font-headline text-xl mb-2 text-foreground truncate">
            <Link href={`/listings/${listing.slug}`} className="hover:text-primary transition-colors">
                {listing.title}
            </Link>
        </h3>
        <p className="flex items-center text-sm text-muted-foreground mb-4">
          <MapPin className="w-4 h-4 mr-2 shrink-0" />
          {listing.location}
        </p>
      </CardContent>
      <CardFooter className="p-4 border-t flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={listing.author.avatar} alt={listing.author.name} />
            <AvatarFallback>{listing.author.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium text-muted-foreground">{listing.author.name}</span>
        </div>
        <Button asChild style={{ backgroundColor: 'hsl(var(--accent))', color: 'hsl(var(--accent-foreground))' }} size="sm" >
          <Link href={`/listings/${listing.slug}`}>Details</Link>
        </Button>
      </CardFooter>
    </Card>
  );
};
