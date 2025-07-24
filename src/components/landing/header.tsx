import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/landing/icons';
import { UserCircle } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-20 items-center">
        <div className="mr-auto flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Logo />
          </Link>
        </div>
        <nav className="hidden md:flex items-center space-x-8 text-sm font-medium">
            <Link href="#" className="transition-colors text-primary hover:text-primary/80 font-bold">Home</Link>
            <Link href="#" className="transition-colors hover:text-foreground/80 text-foreground/80">About</Link>
            <DropdownMenu>
              <DropdownMenuTrigger className="transition-colors hover:text-foreground/80 text-foreground/80 flex items-center gap-1 outline-none">
                Listing
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>Option 1</DropdownMenuItem>
                <DropdownMenuItem>Option 2</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
             <DropdownMenu>
              <DropdownMenuTrigger className="transition-colors hover:text-foreground/80 text-foreground/80 flex items-center gap-1 outline-none">
                Pages
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>Option 1</DropdownMenuItem>
                <DropdownMenuItem>Option 2</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Link href="#" className="transition-colors hover:text-foreground/80 text-foreground/80">Blog</Link>
            <Link href="#" className="transition-colors hover:text-foreground/80 text-foreground/80">Contact</Link>
          </nav>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <Button variant="ghost" className="hidden md:flex items-center">
            <UserCircle className="h-5 w-5 mr-2" />
            Sign In
          </Button>
          <Button style={{ backgroundColor: 'hsl(var(--accent))', color: 'hsl(var(--accent-foreground))' }} className="hover:opacity-90 rounded-full font-bold">
            Get Quotation
          </Button>
        </div>
      </div>
    </header>
  );
};
