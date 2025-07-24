import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CityZenLogo } from '@/components/landing/icons';
import { UserCircle, PlusCircle } from 'lucide-react';

export const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <CityZenLogo />
          </Link>
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            <Link href="#" className="transition-colors hover:text-foreground/80 text-foreground/60">Home</Link>
            <Link href="#" className="transition-colors hover:text-foreground/80 text-foreground/60">About</Link>
            <Link href="#" className="transition-colors hover:text-foreground/80 text-foreground/60">Listings</Link>
            <Link href="#" className="transition-colors hover:text-foreground/80 text-foreground/60">Contact</Link>
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <Button variant="ghost" className="hidden md:inline-flex">
            <UserCircle className="h-5 w-5 mr-2" />
            Sign In
          </Button>
          <Button style={{ backgroundColor: 'hsl(var(--accent))', color: 'hsl(var(--accent-foreground))' }} className="hover:opacity-90">
            <PlusCircle className="h-5 w-5 mr-2" />
            Get Quotation
          </Button>
        </div>
      </div>
    </header>
  );
};
