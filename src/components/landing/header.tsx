
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Shield, LogOut, Menu, Phone } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { getSetting } from '@/lib/settings';
import { Skeleton } from '../ui/skeleton';
import { settingsService } from '@/lib/services';
import { useAuth } from '@/contexts/AuthContext';

export const Header = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authIsLoading, logout: authLogout } = useAuth();
  const [isClient, setIsClient] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [phone, setPhone] = useState<string | null>(null);
  const [settingsLoading, setSettingsLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setSettingsLoading(true);
        const response = await settingsService.getAllSettings();
        const phoneValue = getSetting(response.data, 'phone_1');
        setPhone(phoneValue);
      } catch (err) {
        console.error('Failed to fetch settings:', err);
      } finally {
        setSettingsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleSignOut = async () => {
    authLogout();
    router.push('/');
  };

  const navLinks = [
    { href: '/', text: 'Home' },
    { href: '/about', text: 'About' },
    { href: '/listings', text: 'Listing' },
    { href: '/services', text: 'Services' },
    { href: '/client-journey', text: 'Client Journey' },
    { href: '/blog', text: 'Blog' },
  ];

  const isAdmin = user?.roles?.includes('admin') || user?.roles?.includes('manager');

  const isLoading = authIsLoading || !isClient || settingsLoading;

  const handleLinkClick = () => {
    setIsSheetOpen(false);
  };

  const renderNavLinks = (isMobile: boolean) => (
    <nav className={cn(isMobile ? "flex flex-col space-y-4" : "hidden md:flex items-center space-x-8 text-sm font-medium")}>
      {navLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          onClick={handleLinkClick}
          className={cn("transition-colors relative",
            pathname === link.href
              ? "text-primary font-bold"
              : isMobile ? "text-foreground" : "text-white/60 hover:text-white/80"
          )}
        >
          {link.text}
          {!isMobile && pathname === link.href && (
            <span className="absolute bottom-[-8px] left-0 w-full h-0.5 bg-primary"></span>
          )}
        </Link>
      ))}
    </nav>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-800 bg-black">
      <div className="container flex h-20 items-center max-w-7xl mx-auto">
        <div className="flex items-center">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Image src="/assets/images/logo/white-logo.svg" alt="VE LIVE Logo" width={160} height={40} data-ai-hint="logo" />
          </Link>
        </div>

        <div className="hidden md:flex flex-grow items-center justify-center">
          {renderNavLinks(false)}
        </div>

        <div className="hidden md:flex items-center justify-end space-x-4 ml-auto">
          {isLoading ? (
            <div className="flex items-center space-x-4">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-9 w-24 rounded-md" />
            </div>
          ) : (
            <>
              {phone && (
                <a href={`tel:${phone}`} className="flex items-center gap-2 text-white/80 hover:text-white transition-colors text-sm">
                  <Phone className="h-4 w-4 text-primary" />
                  <span>{phone}</span>
                </a>
              )}
              {isAuthenticated && isAdmin && (
                <Button asChild variant="ghost" className="text-white/80 hover:text-white">
                  <Link href="/portal">
                    <Shield className="h-5 w-5 mr-2" />
                    Admin
                  </Link>
                </Button>
              )}
            </>
          )}
          <Button asChild style={{ backgroundColor: 'hsl(var(--accent))', color: 'hsl(var(--accent-foreground))' }} className="hover:opacity-90 rounded-md font-bold">
            <Link href="/contact">Contact Us</Link>
          </Button>
        </div>

        <div className="flex md:hidden items-center ml-auto">
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white hover:text-white">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="bg-background text-foreground w-3/4">
              <SheetTitle className="sr-only">Mobile Menu</SheetTitle>
              <div className="p-6">
                <Link href="/" onClick={handleLinkClick} className="flex items-center space-x-2 mb-8">
                  <Image src="/assets/images/logo/black-logo.svg" alt="VE LIVE Logo" width={160} height={40} data-ai-hint="logo" />
                </Link>
                {renderNavLinks(true)}

                <div className="mt-8 pt-4 border-t">
                  {isLoading ? (
                    <div className="h-9 w-full rounded-md animate-pulse bg-gray-200" />
                  ) : (
                    <>
                      {phone && (
                        <Button asChild variant="outline" className="w-full justify-start mb-2" onClick={handleLinkClick}>
                          <a href={`tel:${phone}`}>
                            <Phone className="h-4 w-4 mr-2" /> {phone}
                          </a>
                        </Button>
                      )}
                      {isAuthenticated && isAdmin && (
                        <Button asChild variant="ghost" className="w-full justify-start mb-2" onClick={handleLinkClick}>
                          <Link href="/portal">
                            <Shield className="h-4 w-4 mr-2" /> Admin
                          </Link>
                        </Button>
                      )}
                    </>
                  )}
                  <Button asChild style={{ backgroundColor: 'hsl(var(--accent))', color: 'hsl(var(--accent-foreground))' }} className="hover:opacity-90 rounded-md font-bold w-full mt-4" onClick={handleLinkClick}>
                    <Link href="/contact">Contact Us</Link>
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};
