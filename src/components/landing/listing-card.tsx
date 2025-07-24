import Image from 'next/image';
import type { Listing } from '@/types/listing';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Bookmark, Star, MapPin, CalendarDays, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ListingCardProps {
  listing: Listing;
}

export const ListingCard = ({ listing }: ListingCardProps) => {
  const getCategoryIcon = (category: Listing['category']) => {
    const icons = {
      Restaurant: '🍽️',
      Hotel: '🏨',
      Shopping: '🛍️',
      Apartment: '🏢',
      Event: '🎉',
      Fitness: '💪',
    };
    return icons[category];
  };

  return (
    <Card className="overflow-hidden flex flex-col h-full group transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <CardHeader className="p-0 relative">
        <Image
          src={listing.image}
          alt={listing.title}
          width={400}
          height={250}
          className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-300"
          data-ai-hint="cityscape building"
        />
        <Badge
          className={cn(
            "absolute top-4 left-4",
            listing.status === 'Open' ? 'bg-green-500/80 text-white' : 'bg-red-500/80 text-white'
          )}
        >
          {listing.status} Now
        </Badge>
        <Button variant="ghost" size="icon" className="absolute top-4 right-4 bg-card/70 hover:bg-card rounded-full">
          <Bookmark className="h-5 w-5" />
        </Button>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-2">
            <div className="text-2xl">{getCategoryIcon(listing.category)}</div>
            <span className="text-sm text-muted-foreground">{listing.category}</span>
          </div>
          <div className="flex items-center gap-1 text-sm text-amber-500">
            <Star className="w-4 h-4 fill-current" />
            <span className="font-bold">{listing.rating.toFixed(1)}</span>
            <span className="text-muted-foreground">({listing.reviews})</span>
          </div>
        </div>
        <h3 className="font-bold font-headline text-xl mb-2 text-foreground truncate">{listing.title}</h3>
        <p className="flex items-center text-sm text-muted-foreground mb-4">
          <MapPin className="w-4 h-4 mr-2 shrink-0" />
          {listing.location}
        </p>
        <div className="flex justify-between items-center text-xs text-muted-foreground">
            <div className="flex items-center"><CalendarDays className="w-3 h-3 mr-1.5" />{listing.date}</div>
            <div>Starts from <span className="font-bold text-lg text-primary">${listing.price}</span></div>
        </div>
      </CardContent>
      <CardFooter className="p-4 border-t flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={listing.author.avatar} alt={listing.author.name} />
            <AvatarFallback>{listing.author.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium">{listing.author.name}</span>
        </div>
        <Button variant="ghost" size="sm" className="text-primary hover:text-primary">
          View Details <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </CardFooter>
    </Card>
  );
};
