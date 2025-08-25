
import { Header } from '@/components/landing/header';
import { Footer } from '@/components/landing/footer';
import { AboutHero } from '@/components/about/hero';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import Image from 'next/image';
import { Building, Globe, Target, ShieldCheck, Users, Handshake, CheckCircle } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us',
};


const teamMembers = [
  { name: 'Mohamed Gharib', title: 'CEO & Founder', avatar: 'https://placehold.co/128x128.png' },
  { name: 'Sam Jacobs', title: 'Chief Operating Officer', avatar: 'https://placehold.co/128x128.png' },
  { name: 'Yousra Ammi', title: 'Lead Developer', avatar: 'https://placehold.co/128x128.png' },
];

const differentiators = [
    {
        icon: <Users className="w-8 h-8 text-primary" />,
        title: "Aligned with the Developer",
        description: "Our goals are perfectly aligned with the developer's, ensuring quality and long-term value."
    },
    {
        icon: <ShieldCheck className="w-8 h-8 text-primary" />,
        title: "UK-Tested Standards for UAE",
        description: "We bring rigorous, UK-proven property management standards adapted for the UAE market."
    },
    {
        icon: <Handshake className="w-8 h-8 text-primary" />,
        title: "Trusted by LEOS Owners",
        description: "As the official partner, we have the trust and confidence of all LEOS property owners."
    },
    {
        icon: <CheckCircle className="w-8 h-8 text-primary" />,
        title: "Transparent Full-Service Delivery",
        description: "From leasing to legal, we offer a complete, transparent management solution under one roof."
    }
]

const AboutPage = () => {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main>
        <AboutHero />

        <section className="py-20">
            <div className="container mx-auto max-w-7xl">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div>
                        <Image src="/assets/images/about/about-us-01.jpg" alt="VE Live Team" width={600} height={400} className="rounded-lg shadow-lg" data-ai-hint="office team collaboration" />
                    </div>
                    <div>
                        <span className="text-primary font-semibold">OUR STORY</span>
                        <h2 className="text-3xl md:text-4xl font-bold font-headline mt-2 text-foreground">Every Great Property Deserves Great Care</h2>
                        <p className="mt-4 text-muted-foreground">
                           VE Live Property Management was born from a simple idea — that LEOS property owners should have a trusted partner who treats their investment as if it were their own. Backed by the strength and expertise of LEOS Developments, we set out to create a service that goes far beyond traditional property management.
                        </p>
                        <p className="mt-4 text-muted-foreground">
                            From the moment you receive your keys, we’re by your side — handling every detail, from professional marketing and tenant screening to rent collection, maintenance coordination, and even the little follow-ups that make a big difference. Our mission is to take the stress out of ownership, so you can enjoy the returns without the headaches.
                        </p>
                    </div>
                </div>
            </div>
        </section>

        <section className="py-20 bg-secondary">
            <div className="container mx-auto max-w-7xl">
                 <div className="grid md:grid-cols-2 gap-12 items-center">
                     <div className="order-2 md:order-1">
                        <span className="text-primary font-semibold">WHY WE'RE HERE</span>
                        <h2 className="text-3xl md:text-4xl font-bold font-headline mt-2 text-foreground">Your Eyes, Ears, and Hands on the Ground</h2>
                        <p className="mt-4 text-muted-foreground">
                           For many owners, especially those living abroad, managing a property in Dubai can be challenging. That’s why we built VE Live to be more than a management company — we’re your eyes, ears, and hands on the ground, ensuring your property stays in prime condition and delivers the best possible income.
                        </p>
                    </div>
                    <div className="order-1 md:order-2">
                        <Image src="/assets/images/about/about-us-02.jpg" alt="Property Management" width={600} height={400} className="rounded-lg shadow-lg" data-ai-hint="dubai skyline" />
                    </div>
                </div>
            </div>
        </section>
        
        <section className="py-20 bg-background">
          <div className="container mx-auto text-center max-w-7xl">
            <span className="text-primary font-semibold">OUR ADVANTAGE</span>
            <h2 className="text-3xl md:text-4xl font-bold font-headline mt-2 text-foreground">What Makes Us Different?</h2>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-12">
                {differentiators.map((feature) => (
                    <Card key={feature.title} className="bg-card text-center p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                        <CardContent className="p-0 flex flex-col items-center">
                             <div className="bg-primary/10 text-primary p-4 rounded-full mb-4">
                                {feature.icon}
                            </div>
                            <h3 className="font-bold text-xl text-foreground mb-2">{feature.title}</h3>
                            <p className="text-muted-foreground text-sm">{feature.description}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>
          </div>
        </section>

        <section className="py-20 bg-secondary">
          <div className="container mx-auto text-center max-w-7xl">
            <span className="text-primary font-semibold">OUR TEAM</span>
            <h2 className="text-3xl md:text-4xl font-bold font-headline mt-2 text-foreground">Meet Our Experts</h2>
            <p className="text-muted-foreground mt-4 max-w-3xl mx-auto">
              Our people are our strength. We’re a team of passionate leasing professionals, creative marketers, meticulous property coordinators, and client service experts — all united by one goal: to protect and grow your investment. With local market knowledge, international standards, and an on-site presence at Hadley Heights, we ensure your property gets the attention it deserves.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 mt-12">
              {teamMembers.map((member) => (
                <Card key={member.name} className="bg-card text-center p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                  <CardContent className="p-0">
                    <Avatar className="w-32 h-32 mx-auto mb-4 border-4 border-primary">
                      <AvatarImage src={member.avatar} alt={member.name} data-ai-hint="professional headshot" />
                      <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <h3 className="font-bold text-xl text-foreground">{member.name}</h3>
                    <p className="text-primary">{member.title}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
};

export default AboutPage;
