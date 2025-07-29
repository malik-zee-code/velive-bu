'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { UserCircle, Shield } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from '@/lib/utils';

export const Header = () => {
  const pathname = usePathname();

  const navLinks = [
    { href: '/', text: 'Home' },
    { href: '/about', text: 'About' },
    { href: '/listings', text: 'Listing' },
    { href: '#', text: 'Pages', isDropdown: true, options: ['Option 1', 'Option 2'] },
    { href: '#', text: 'Blog', isDropdown: true, options: ['Option 1', 'Option 2'] },
    { href: '/contact', text: 'Contact' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-800 bg-black">
      <div className="container flex h-20 items-center max-w-7xl mx-auto">
        <div className="flex items-center">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Image src="/assets/images/logo/white-logo.svg" alt="CityZen Logo" width={160} height={40} data-ai-hint="logo" />
          </Link>
        </div>
        <nav className="hidden md:flex items-center space-x-8 text-sm font-medium ml-auto">
          {navLinks.map((link) => (
            link.isDropdown ? (
              <DropdownMenu key={link.text}>
                <DropdownMenuTrigger className="transition-colors hover:text-white/80 text-white/60 flex items-center gap-1 outline-none">
                  {link.text}
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {link.options?.map(opt => <DropdownMenuItem key={opt}>{opt}</DropdownMenuItem>)}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link
                key={link.href}
                href={link.href}
                className={cn("transition-colors relative", 
                  pathname === link.href 
                    ? "text-primary font-bold" 
                    : "text-white/60 hover:text-white/80"
                )}
              >
                {link.text}
                {pathname === link.href && (
                  <span className="absolute bottom-[-8px] left-0 w-full h-0.5 bg-primary"></span>
                )}
              </Link>
            )
          ))}
        </nav>
        <div className="flex items-center justify-end space-x-2 ml-auto">
          <Button asChild variant="ghost" className="hidden md:flex items-center text-white/80 hover:text-white">
            <Link href="/admin">
              <Shield className="h-5 w-5 mr-2" />
              Admin
            </Link>
          </Button>
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
