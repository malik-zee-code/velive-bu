
'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Download } from 'lucide-react';

export const AboutHero = () => {
  return (
    <section className="relative py-20 md:py-32 bg-card text-card-foreground" style={{
      backgroundImage: 'url(/assets/images/banners/about_us.jpg)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }}>
      <div className="absolute inset-0 bg-black/70" />
      <div className="container relative mx-auto text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold font-headline tracking-tight text-white mb-4">
            About <span className="text-primary">VE LIVE</span>
          </h1>
          <p className="text-lg md:text-xl text-white/80 mb-8">
            We are a passionate team dedicated to helping you find the best places and experiences your city has to offer.
          </p>
           <div className="flex justify-center gap-4">
              <Button asChild size="lg" style={{ backgroundColor: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))' }} className="hover:opacity-90">
                <Link href="/listings">Explore Listings</Link>
              </Button>
              <Button asChild size="lg" style={{ backgroundColor: 'hsl(var(--accent))', color: 'hsl(var(--accent-foreground))' }} className="hover:opacity-90">
                 <a href="/assets/images/download/brochure.pdf" download>
                    <Download className="mr-2 h-5 w-5" />
                    Download Brochure
                </a>
              </Button>
              <Button asChild size="lg" variant="outline" className="bg-white text-black hover:bg-white/90">
                <Link href="/contact">Contact Us</Link>
              </Button>
            </div>
        </div>
      </div>
    </section>
  );
};
