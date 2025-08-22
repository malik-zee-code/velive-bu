
'use client';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Twitter, Facebook, Linkedin, Youtube, Phone, MapPin, Mail, Send, ChevronRight, ChevronUp } from 'lucide-react';
import { gql, useQuery } from '@apollo/client';
import { Skeleton } from '../ui/skeleton';

const GET_FOOTER_DATA = gql`
  query GetFooterData {
    properties(where: {is_featured: {_eq: true}}, order_by: {created_at: desc}, limit: 6) {
      id
      title
      slug
    }
    settings(where: {title: {_in: ["address_1", "email", "phone_1"]}}) {
      title
      value
    }
  }
`;

const quickLinks = [
    { href: "/", text: "Home" },
    { href: "/about", text: "About Us" },
    { href: "/services", text: "Services" },
    { href: "/listings", text: "Listing" },
    { href: "/blog", text: "Blog" },
    { href: "/contact", text: "Contact" },
    { href: "/privacy-policy", text: "Privacy Policy" },
];

export const Footer = () => {
    const { data, loading, error } = useQuery(GET_FOOTER_DATA);

    const getSetting = (title: string) => data?.settings.find((s: any) => s.title === title)?.value;

    const phone = getSetting('phone_1');
    const address = getSetting('address_1');
    const email = getSetting('email');

    return (
        <footer className="bg-black text-white/80 relative">
            <div className="absolute inset-0 bg-no-repeat bg-right"></div>
            <div className="container relative py-20 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {/* Column 1: Logo and Contact */}
                    <div className="space-y-6">
                        <Image src="/assets/images/logo/white-logo.svg" alt="VE Live Logo" width={200} height={50} data-ai-hint="logo" />
                        <p className="text-sm">
                            We are many variations of passages available but the majority have suffered alteration in some form by injected humour words believable.
                        </p>
                         <ul className="space-y-4 text-sm">
                            {loading ? (
                                <>
                                    <li className="flex items-center gap-3"><Skeleton className="w-8 h-8 rounded-md" /><Skeleton className="h-4 w-40" /></li>
                                    <li className="flex items-center gap-3"><Skeleton className="w-8 h-8 rounded-md" /><Skeleton className="h-4 w-48" /></li>
                                    <li className="flex items-center gap-3"><Skeleton className="w-8 h-8 rounded-md" /><Skeleton className="h-4 w-32" /></li>
                                </>
                            ) : (
                                <>
                                    {phone && (
                                        <li className="flex items-center gap-3">
                                            <div className="bg-primary/20 text-primary p-2 rounded-md">
                                                <Phone className="w-5 h-5" />
                                            </div>
                                            <a href={`tel:${phone}`} className="hover:text-primary transition-colors">{phone}</a>
                                        </li>
                                    )}
                                    {address && (
                                        <li className="flex items-center gap-3">
                                            <div className="bg-primary/20 text-primary p-2 rounded-md">
                                                <MapPin className="w-5 h-5" />
                                            </div>
                                            <span>{address}</span>
                                        </li>
                                    )}
                                    {email && (
                                         <li className="flex items-center gap-3">
                                            <div className="bg-primary/20 text-primary p-2 rounded-md">
                                                <Mail className="w-5 h-5" />
                                            </div>
                                            <a href={`mailto:${email}`} className="hover:text-primary transition-colors">{email}</a>
                                        </li>
                                    )}
                                </>
                            )}
                        </ul>
                    </div>

                    {/* Column 2: Featured Properties */}
                    <div>
                        <h4 className="font-bold text-xl mb-6 text-white relative pb-2">
                            Featured
                            <span className="absolute bottom-0 left-0 w-8 h-0.5 bg-primary"></span>
                            <span className="absolute bottom-0 left-10 w-4 h-0.5 bg-primary"></span>
                        </h4>
                        <ul className="space-y-3">
                            {loading && (
                                <>
                                {[...Array(5)].map((_, i) => (
                                    <li key={i}><Skeleton className="h-4 w-3/4" /></li>
                                ))}
                                </>
                            )}
                            {error && <li><p className="text-destructive">Could not load properties.</p></li>}
                            {data?.properties.map((prop: { id: string, slug: string, title: string }) => (
                                <li key={prop.id}>
                                    <Link href={`/listings/${prop.slug}`} className="flex items-center gap-2 text-sm hover:text-primary transition-colors">
                                        <ChevronRight className="w-4 h-4 text-primary" />
                                        <span>{prop.title}</span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Column 3: Quick Links */}
                    <div>
                        <h4 className="font-bold text-xl mb-6 text-white relative pb-2">
                            Quick Links
                            <span className="absolute bottom-0 left-0 w-8 h-0.5 bg-primary"></span>
                            <span className="absolute bottom-0 left-10 w-4 h-0.5 bg-primary"></span>
                        </h4>
                        <ul className="space-y-3">
                            {quickLinks.map(link => (
                                <li key={link.text}>
                                    <Link href={link.href} className="flex items-center gap-2 text-sm hover:text-primary transition-colors">
                                        <ChevronRight className="w-4 h-4 text-primary" />
                                        <span>{link.text}</span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
            <div className="border-t border-white/10">
                <div className="container max-w-7xl mx-auto py-6 flex flex-col sm:flex-row justify-between items-center text-sm">
                    <p>&copy; Copyright {new Date().getFullYear()} <span className="text-primary">VE Live</span> All Rights Reserved.</p>
                    <div className="flex items-center gap-2 mt-4 sm:mt-0">
                        <div className="flex space-x-2">
                            <Link href="#" className="w-9 h-9 flex items-center justify-center rounded-md bg-white/10 hover:bg-primary hover:text-black transition-colors"><Facebook className="h-4 w-4" /></Link>
                            <Link href="#" className="w-9 h-9 flex items-center justify-center rounded-md bg-white/10 hover:bg-primary hover:text-black transition-colors"><Twitter className="h-4 w-4" /></Link>
                            <Link href="#" className="w-9 h-9 flex items-center justify-center rounded-md bg-white/10 hover:bg-primary hover:text-black transition-colors"><Linkedin className="h-4 w-4" /></Link>
                            <Link href="#" className="w-9 h-9 flex items-center justify-center rounded-md bg-white/10 hover:bg-primary hover:text-black transition-colors"><Youtube className="h-4 w-4" /></Link>
                        </div>
                        <Link href="#" className="w-9 h-9 ml-4 flex items-center justify-center rounded-md bg-primary text-black">
                            <ChevronUp className="h-5 w-5" />
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};
