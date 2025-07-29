import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { UserCircle } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-800 bg-black">
      <div className="container flex h-20 items-center">
        <div className="mr-auto flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Image src="/assets/logo/white-logo.svg" alt="CityZen Logo" width={160} height={40} data-ai-hint="logo" />
          </Link>
        </div>
        <nav className="hidden md:flex items-center space-x-8 text-sm font-medium">
            <Link href="#" className="transition-colors text-primary hover:text-primary/80 font-bold relative">
              Home
              <span className="absolute bottom-[-8px] left-0 w-full h-0.5 bg-primary"></span>
            </Link>
            <Link href="#" className="transition-colors hover:text-white/80 text-white/60">About</Link>
            <DropdownMenu>
              <DropdownMenuTrigger className="transition-colors hover:text-white/80 text-white/60 flex items-center gap-1 outline-none">
                Listing
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>Option 1</DropdownMenuItem>
                <DropdownMenuItem>Option 2</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
             <DropdownMenu>
              <DropdownMenuTrigger className="transition-colors hover:text-white/80 text-white/60 flex items-center gap-1 outline-none">
                Pages
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>Option 1</DropdownMenuItem>
                <DropdownMenuItem>Option 2</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger className="transition-colors hover:text-white/80 text-white/60 flex items-center gap-1 outline-none">
                Blog
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>Option 1</DropdownMenuItem>
                <DropdownMenuItem>Option 2</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Link href="#" className="transition-colors hover:text-white/80 text-white/60">Contact</Link>
          </nav>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <Button variant="ghost" className="hidden md:flex items-center text-white/80 hover:text-white">
            <UserCircle className="h-5 w-5 mr-2" />
            Sign In
          </Button>
          <Button style={{ backgroundColor: 'hsl(var(--accent))', color: 'hsl(var(--accent-foreground))' }} className="hover:opacity-90 rounded-md font-bold">
            Get Quotation
          </Button>
        </div>
      </div>
    </header>
  );
};
