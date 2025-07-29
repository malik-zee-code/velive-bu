import Link from 'next/link';
import Image from 'next/image';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Twitter, Facebook, Linkedin, Youtube } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-black text-white border-t border-gray-800">
      <div className="container py-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Image src="/assets/logo/white-logo.svg" alt="CityZen Logo" width={160} height={40} data-ai-hint="logo" />
            <p className="text-white/60">
              Discover and experience the best your city has to offer.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-white">Company</h4>
            <ul className="space-y-2">
              <li><Link href="#" className="text-white/60 hover:text-primary">About Us</Link></li>
              <li><Link href="#" className="text-white/60 hover:text-primary">Careers</Link></li>
              <li><Link href="#" className="text-white/60 hover:text-primary">Press</Link></li>
              <li><Link href="#" className="text-white/60 hover:text-primary">Blog</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-white">Support</h4>
            <ul className="space-y-2">
              <li><Link href="#" className="text-white/60 hover:text-primary">Contact Us</Link></li>
              <li><Link href="#" className="text-white/60 hover:text-primary">FAQ</Link></li>
              <li><Link href="#" className="text-white/60 hover:text-primary">Terms of Service</Link></li>
              <li><Link href="#" className="text-white/60 hover:text-primary">Privacy Policy</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-white">Stay Connected</h4>
            <p className="text-white/60 mb-4">Subscribe to our newsletter for the latest updates.</p>
            <div className="flex w-full max-w-sm items-center space-x-2">
              <Input type="email" placeholder="Email" className="bg-gray-800 border-gray-700 text-white placeholder:text-white/50"/>
              <Button type="submit" style={{ backgroundColor: 'hsl(var(--accent))', color: 'hsl(var(--accent-foreground))' }}>Subscribe</Button>
            </div>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-gray-800/50 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-sm text-white/60">&copy; {new Date().getFullYear()} CityZen. All rights reserved.</p>
          <div className="flex space-x-4 mt-4 sm:mt-0">
            <Link href="#" className="text-white/60 hover:text-primary"><Twitter className="h-5 w-5" /></Link>
            <Link href="#" className="text-white/60 hover:text-primary"><Facebook className="h-5 w-5" /></Link>
            <Link href="#" className="text-white/60 hover:text-primary"><Linkedin className="h-5 w-5" /></Link>
            <Link href="#" className="text-white/60 hover:text-primary"><Youtube className="h-5 w-5" /></Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
