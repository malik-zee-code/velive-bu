
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Phone, Mail, MapPin, Send, Briefcase, Download, MessageSquare } from 'lucide-react';
import { gql, useQuery } from '@apollo/client';
import { Skeleton } from '../ui/skeleton';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { getSetting } from '@/lib/settings';

const GET_SETTINGS = gql`
  query GetSettings {
    settings {
      id
      title
      value
    }
  }
`;

export const ContactDetails = () => {
  const { data, loading, error } = useQuery(GET_SETTINGS);

  const settings = data?.settings || [];
  const address1 = getSetting(settings, 'address_1');
  const address2 = getSetting(settings, 'address_2');
  const email = getSetting(settings, 'email');
  const phone1 = getSetting(settings, 'phone_1');
  const phone2 = getSetting(settings, 'phone_2');

  const baySquareAddress = "Office 206, Building 7, Bay Square, Business Bay, Dubai, United Arab Emirates";
  const hadleyHeightsAddress = "Retail No. 1, Hadley Heights, District 11, Jumeirah Village Circle (JVC), Dubai, United Arab Emirates (Coming Soon)";
  
  const contactInfo = [
    { 
        icon: <MapPin className="w-5 h-5 text-primary" />, 
        title: "Bay Square", 
        value: baySquareAddress,
        href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(baySquareAddress)}`
    },
    { 
        icon: <MapPin className="w-5 h-5 text-primary" />, 
        title: "Hadley Heights", 
        value: hadleyHeightsAddress,
        href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hadleyHeightsAddress)}`
    },
    { 
        icon: <Mail className="w-5 h-5 text-primary" />, 
        title: "Email Address", 
        value: "info@velive.co.uk",
        href: "mailto:info@velive.co.uk"
    },
    { 
        icon: <Phone className="w-5 h-5 text-primary" />, 
        title: "Phone Number 1", 
        value: "+971 4 873 7122",
        tel: "tel:+97148737122",
        whatsapp: "https://wa.me/97148737122"
    },
    { 
        icon: <Phone className="w-5 h-5 text-primary" />, 
        title: "Phone Number 2", 
        value: "+971 50 305 8531",
        tel: "tel:+971503058531",
        whatsapp: "https://wa.me/971503058531"
    },
  ];


  return (
    <section className="py-20">
      <div className="container mx-auto max-w-7xl">
        <div className="grid md:grid-cols-2 gap-12">
            <div>
                <Card>
                    <CardHeader>
                        <CardTitle>Get In Touch</CardTitle>
                        <CardDescription>Fill out the form below and we will get back to you as soon as possible.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form
                            action={process.env.NEXT_PUBLIC_FORMSPREE_URL}
                            method="POST"
                            className="space-y-6"
                        >
                            <div className="space-y-2">
                                <Label htmlFor="name">Your Name</Label>
                                <Input id="name" name="name" placeholder="John Doe" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Your Email</Label>
                                <Input id="email" type="email" name="email" placeholder="john@example.com" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone</Label>
                                <Input id="phone" type="tel" name="phone" placeholder="+1 234 567 890" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="unitType">Unit Type</Label>
                                <Input id="unitType" name="unitType" placeholder="e.g., 2 Bedroom Apartment" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="message">Message</Label>
                                <Textarea id="message" name="message" placeholder="Type your message here..." rows={5} required />
                            </div>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Button type="submit" size="lg" className="flex-1" style={{ backgroundColor: 'hsl(var(--accent))', color: 'hsl(var(--accent-foreground))' }}>
                                    <Briefcase className="mr-2 h-5 w-5"/>
                                    Book Free Consultation
                                </Button>
                                <Button asChild size="lg" className="flex-1" variant="outline">
                                    <a href="/assets/images/download/brochure.pdf" download>
                                        <Download className="mr-2 h-5 w-5" />
                                        Download Brochure
                                    </a>
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
            <div className="space-y-8">
                <div>
                    <h2 className="text-3xl font-bold font-headline text-foreground">Contact Information</h2>
                    <p className="mt-2 text-muted-foreground">Find us at the following address and contact details.</p>
                </div>
                <div className="space-y-4">
                    {loading && (
                      <div className="space-y-6">
                        {[...Array(5)].map((_, i) => (
                           <div key={i} className="flex items-start gap-4">
                              <Skeleton className="w-12 h-12 rounded-lg" />
                              <div className="space-y-2">
                                <Skeleton className="h-5 w-48" />
                                <Skeleton className="h-4 w-64" />
                              </div>
                           </div>
                        ))}
                      </div>
                    )}
                    {error && <p className="text-destructive">Failed to load contact information.</p>}
                    {!loading && !error && contactInfo.map((info) => (
                        <div key={info.title} className="flex items-start gap-4">
                            <div className="bg-primary/10 p-2 rounded-lg">
                                {info.icon}
                            </div>
                            <div className='-mt-1'>
                                <h3 className="font-semibold text-lg text-foreground">{info.title}</h3>
                                {info.href ? (
                                    <a href={info.href} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">{info.value}</a>
                                ) : (
                                    <p className="text-muted-foreground">{info.value}</p>
                                )}
                                {info.tel && info.whatsapp && (
                                    <div className="flex items-center space-x-2 mt-2">
                                        <Button asChild size="sm" variant="outline">
                                            <a href={info.tel}>
                                                <Phone className="mr-2 h-4 w-4" /> Call
                                            </a>
                                        </Button>
                                         <Button asChild size="sm" variant="outline" className="bg-green-50 hover:bg-green-100">
                                            <a href={info.whatsapp} target="_blank" rel="noopener noreferrer">
                                                <MessageSquare className="mr-2 h-4 w-4" /> WhatsApp
                                            </a>
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
                 <div className="mt-8">
                    <iframe
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3610.459039335689!2d55.26049231500947!3d25.18781988390029!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e5f6905b8e9a269%3A0x28f2445100657573!2sBay%20Square%2C%20Dubai!5e0!3m2!1sen!2sae!4v1626260838385!5m2!1sen!2sae"
                        width="600"
                        height="400"
                        style={{ border: 0 }}
                        allowFullScreen={false}
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        className="rounded-lg shadow-lg w-full"
                    ></iframe>
                </div>
            </div>
        </div>
      </div>
    </section>
  );
};
