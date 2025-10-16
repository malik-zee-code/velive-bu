
'use client';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Twitter, Facebook, Linkedin, Youtube, Phone, MapPin, Mail, Send, ChevronRight, ChevronUp } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';
import { getSetting } from '@/lib/settings';
import { useState, useEffect } from 'react';
import { propertyService, settingsService } from '@/lib/services';

const quickLinks = [
    { href: "/", text: "Home" },
    { href: "/about", text: "About" },
    { href: "/listings", text: "Listing" },
    { href: "/services", text: "Services" },
    { href: "/client-journey", text: "Client Journey" },
    { href: "/blog", text: "Blog" },
    { href: "/contact", text: "Contact Us" },
    { href: "/privacy-policy", text: "Privacy Policy" },
];

const socialLinks = [
    { href: "#", icon: <Facebook className="h-4 w-4" />, label: "Facebook" },
    { href: "#", icon: <Twitter className="h-4 w-4" />, label: "Twitter" },
    { href: "#", icon: <Linkedin className="h-4 w-4" />, label: "Linkedin" },
    { href: "#", icon: <Youtube className="h-4 w-4" />, label: "Youtube" },
]

export const Footer = () => {
    const [properties, setProperties] = useState<any[]>([]);
    const [phone, setPhone] = useState<string | null>(null);
    const [address1, setAddress1] = useState<string | null>(null);
    const [address2, setAddress2] = useState<string | null>(null);
    const [email, setEmail] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const fetchFooterData = async () => {
            try {
                setLoading(true);
                const [propertiesRes, settingsRes] = await Promise.all([
                    propertyService.getFeaturedProperties(),
                    settingsService.getAllSettings(),
                ]);

                // Filter to only show approved and available properties
                const approvedAndAvailableProperties = propertiesRes.data.filter(
                    (property: any) => property.isApproved === true && property.isAvailable === true
                );
                setProperties(approvedAndAvailableProperties.slice(0, 6));
                setPhone(getSetting(settingsRes.data, 'phone_1'));
                setAddress1(getSetting(settingsRes.data, 'address_1'));
                setAddress2(getSetting(settingsRes.data, 'address_2'));
                setEmail(getSetting(settingsRes.data, 'email'));
                setError(null);
            } catch (err) {
                setError(err instanceof Error ? err : new Error('Failed to fetch footer data'));
                console.error('Failed to fetch footer data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchFooterData();
    }, []);

    const hadleyHeightsMapQuery = "Hadley Heights 2 by LEOS";

    const midIndex = Math.ceil(quickLinks.length / 2);
    const firstColumnLinks = quickLinks.slice(0, midIndex);
    const secondColumnLinks = quickLinks.slice(midIndex);

    return (
        <footer className="bg-black text-white/80 relative">
            <div className="absolute inset-0 bg-no-repeat bg-right"></div>
            <div className="container relative py-20 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {/* Column 1: Logo and Contact */}
                    <div className="space-y-6">
                        <Image src="/assets/images/logo/white-logo.svg" alt="VE Live Logo" width={200} height={50} data-ai-hint="logo" />
                        <ul className="space-y-4 text-sm">
                            {loading ? (
                                <>
                                    <li key={Math.random()} className="flex items-center gap-3"><Skeleton className="w-8 h-8 rounded-md" /><Skeleton className="h-4 w-40" /></li>
                                    <li key={Math.random()} className="flex items-center gap-3"><Skeleton className="w-8 h-8 rounded-md" /><Skeleton className="h-4 w-48" /></li>
                                    <li key={Math.random()} className="flex items-center gap-3"><Skeleton className="w-8 h-8 rounded-md" /><Skeleton className="h-4 w-32" /></li>
                                </>
                            ) : (
                                <>
                                    {phone && (
                                        <li key={phone} className="flex items-center gap-3">
                                            <div className="bg-primary/20 text-primary p-2 rounded-md">
                                                <Phone className="w-5 h-5" />
                                            </div>
                                            <a href={`tel:${phone}`} className="hover:text-primary transition-colors">{phone}</a>
                                        </li>
                                    )}
                                    {address1 && (
                                        <li key={address1} className="flex items-start gap-3">
                                            <div className="bg-primary/20 text-primary p-2 rounded-md mt-1">
                                                <MapPin className="w-5 h-5" />
                                            </div>
                                            <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address1)}`} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                                                <span>{address1}</span>
                                            </a>
                                        </li>
                                    )}
                                    {address2 && (
                                        <li key={address2} className="flex items-start gap-3">
                                            <div className="bg-primary/20 text-primary p-2 rounded-md mt-1">
                                                <MapPin className="w-5 h-5" />
                                            </div>
                                            <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hadleyHeightsMapQuery)}`} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                                                <span>{address2}</span>
                                            </a>
                                        </li>
                                    )}
                                    {email && (
                                        <li key={email} className="flex items-center gap-3">
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
                            {properties.map((prop: { _id: string, slug: string, title: string }) => (
                                <li key={prop._id}>
                                    <Link href={`/listings/${prop.slug}`} className="flex items-center gap-2 text-sm hover:text-primary transition-colors">
                                        <ChevronRight className="w-4 h-4 text-primary" />
                                        <span>{prop.title}</span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                        <div className="flex space-x-2 mt-6">
                            {socialLinks.map(link => (
                                <Link key={link.label} href={link.href} aria-label={link.label} className="w-9 h-9 flex items-center justify-center rounded-md bg-white/10 hover:bg-primary hover:text-black transition-colors">
                                    {link.icon}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Column 3: Quick Links (internally split) */}
                    <div>
                        <h4 className="font-bold text-xl mb-6 text-white relative pb-2">
                            Quick Links
                            <span className="absolute bottom-0 left-0 w-8 h-0.5 bg-primary"></span>
                            <span className="absolute bottom-0 left-10 w-4 h-0.5 bg-primary"></span>
                        </h4>
                        <div className="grid grid-cols-2 gap-x-4">
                            <ul className="space-y-3">
                                {firstColumnLinks.map(link => (
                                    <li key={link.text}>
                                        <Link href={link.href} className="flex items-center gap-2 text-sm hover:text-primary transition-colors">
                                            <ChevronRight className="w-4 h-4 text-primary" />
                                            <span>{link.text}</span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                            <ul className="space-y-3">
                                {secondColumnLinks.map(link => (
                                    <li key={link.text} >
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
            </div>
            <div className="border-t border-white/10">
                <div className="container max-w-7xl mx-auto py-6 flex justify-center text-center text-sm">
                    <p>&copy; Copyright {new Date().getFullYear()} <span className="text-primary">VE Live</span> All Rights Reserved.</p>
                </div>
            </div>
        </footer>
    );
};

