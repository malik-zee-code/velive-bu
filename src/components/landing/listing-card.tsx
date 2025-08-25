
import Image from 'next/image';
import type { Listing } from '@/types/listing';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Bookmark, Star, MapPin, CalendarDays, ArrowRight, BedDouble, Bath, Ruler } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Separator } from '../ui/separator';

interface ListingCardProps {
  listing: Listing;
}

export const ListingCard = ({ listing }: ListingCardProps) => {
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
          variant="secondary"
          className={cn(
            "absolute top-4 right-4"
          )}
        >
          {listing.category}
        </Badge>
        <Badge
          className={cn(
            "absolute top-4 left-4 capitalize"
          )}
        >
          For {listing.listing_type}
        </Badge>
      </CardHeader>
      <CardContent className="p-4 flex-grow flex flex-col">
        <div className="flex justify-between items-center mb-2">
            <p className="text-2xl font-bold text-primary">
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'AED', minimumFractionDigits: 0 }).format(listing.price)}
            </p>
        </div>
        <h3 className="font-bold font-headline text-xl mb-2 text-foreground truncate h-7">
            <Link href={`/listings/${listing.slug}`} className="hover:text-primary transition-colors">
                {listing.title}
            </Link>
        </h3>
        <p className="flex items-center text-sm text-muted-foreground mb-4">
          <MapPin className="w-4 h-4 mr-2 shrink-0" />
          {listing.location}
        </p>

        <div className="flex-grow" />

        <Separator className="my-4" />

        <div className="flex justify-between items-center text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
                <BedDouble className="w-4 h-4 text-primary" />
                <span>{listing.bedrooms} Beds</span>
            </div>
            <div className="flex items-center gap-2">
                <Bath className="w-4 h-4 text-primary" />
                <span>{listing.bathrooms} Baths</span>
            </div>
             <div className="flex items-center gap-2">
                <Ruler className="w-4 h-4 text-primary" />
                <span>{listing.area} sqft</span>
            </div>
        </div>

        <Separator className="my-4" />
        
        <Button asChild style={{ backgroundColor: 'hsl(var(--accent))', color: 'hsl(var(--accent-foreground))' }} size="sm" className="w-full">
          <Link href={`/listings/${listing.slug}`}>View Details</Link>
        </Button>
      </CardContent>
    </Card>
  );
};
