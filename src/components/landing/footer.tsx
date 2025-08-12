
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Twitter, Facebook, Linkedin, Youtube, Phone, MapPin, Mail, Send, ChevronRight, ChevronUp } from 'lucide-react';

const companyLinks = [
    { href: "/about", text: "About Us" },
    { href: "#", text: "Our Team" },
    { href: "/contact", text: "Contact Us" },
    { href: "#", text: "Terms Of Service" },
    { href: "/privacy-policy", text: "Privacy policy" },
    { href: "#", text: "Careers" },
];

const quickLinks = [
    { href: "/about", text: "About Us" },
    { href: "/services", text: "Services" },
    { href: "/contact", text: "Contact" },
    { href: "/privacy-policy", text: "Privacy Policy" },
];

export const Footer = () => {
    return (
        <footer className="bg-black text-white/80 relative">
            <div className="absolute inset-0 bg-no-repeat bg-right"></div>
            <div className="container relative py-20 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* Column 1: Logo and Contact */}
                    <div className="space-y-6">
                        <Image src="/assets/images/logo/white-logo.svg" alt="VE Live Logo" width={200} height={50} data-ai-hint="logo" />
                        <p className="text-sm">
                            We are many variations of passages available but the majority have suffered alteration in some form by injected humour words believable.
                        </p>
                        <ul className="space-y-4 text-sm">
                            <li className="flex items-center gap-3">
                                <div className="bg-primary/20 text-primary p-2 rounded-md">
                                    <Phone className="w-5 h-5" />
                                </div>
                                <span>+971 123 654 7898</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <div className="bg-primary/20 text-primary p-2 rounded-md">
                                    <MapPin className="w-5 h-5" />
                                </div>
                                <span>25/B Milford Road, Dubai, UAE</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <div className="bg-primary/20 text-primary p-2 rounded-md">
                                    <Mail className="w-5 h-5" />
                                </div>
                                <span>info@example.com</span>
                            </li>
                        </ul>
                    </div>

                    {/* Column 2: Company Links */}
                    <div>
                        <h4 className="font-bold text-xl mb-6 text-white relative pb-2">
                            Company
                            <span className="absolute bottom-0 left-0 w-8 h-0.5 bg-primary"></span>
                            <span className="absolute bottom-0 left-10 w-4 h-0.5 bg-primary"></span>
                        </h4>
                        <ul className="space-y-3">
                            {companyLinks.map(link => (
                                <li key={link.text}>
                                    <Link href={link.href} className="flex items-center gap-2 text-sm hover:text-primary transition-colors">
                                        <ChevronRight className="w-4 h-4 text-primary" />
                                        <span>{link.text}</span>
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

                    {/* Column 4: Newsletter */}
                    <div>
                        <h4 className="font-bold text-xl mb-6 text-white relative pb-2">
                            Newsletter
                            <span className="absolute bottom-0 left-0 w-8 h-0.5 bg-primary"></span>
                            <span className="absolute bottom-0 left-10 w-4 h-0.5 bg-primary"></span>
                        </h4>
                        <p className="text-sm mb-4">
                            Subscribe to our newsletter and we will inform you about newset directory and promotions.
                        </p>
                        <div className="relative w-full max-w-sm">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <Input
                                type="email"
                                placeholder="Your Email"
                                className="w-full h-14 pl-12 pr-16 rounded-lg bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                            />
                            <Button type="submit" size="icon" className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-md" style={{ backgroundColor: 'hsl(var(--primary))' }}>
                                <Send className="w-5 h-5 text-black" />
                            </Button>
                        </div>
                        <h4 className="font-bold text-lg mt-8 mb-4 text-white">Language</h4>
                        <Select>
                            <SelectTrigger className="w-[180px] bg-white/10 border-white/20 text-white rounded-lg">
                                <SelectValue placeholder="English" />
                            </SelectTrigger>
                            <SelectContent className="bg-[#2a2a2a] text-white border-gray-600">
                                <SelectItem value="en">English</SelectItem>
                                <SelectItem value="es">Español</SelectItem>
                                <SelectItem value="fr">Français</SelectItem>
                            </SelectContent>
                        </Select>
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
