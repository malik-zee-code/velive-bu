
import { Header } from '@/components/landing/header';
import { Footer } from '@/components/landing/footer';
import { AboutHero } from '@/components/about/hero';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import Image from 'next/image';
import { Building, Globe, Target, ShieldCheck, Users, Handshake, CheckCircle } from 'lucide-react';

const teamMembers = [
    { name: 'John Doe', title: 'CEO & Founder', avatar: 'https://placehold.co/128x128.png' },
    { name: 'Jane Smith', title: 'Chief Operating Officer', avatar: 'https://placehold.co/128x128.png' },
    { name: 'Sam Wilson', title: 'Lead Developer', avatar: 'https://placehold.co/128x128.png' },
    { name: 'Emily White', title: 'Marketing Director', avatar: 'https://placehold.co/128x128.png' },
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
      <main>
        <AboutHero />

        <section className="py-20">
            <div className="container mx-auto max-w-7xl">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div>
                        <Image src="https://placehold.co/600x400.png" alt="VE Live Team" width={600} height={400} className="rounded-lg shadow-lg" data-ai-hint="office team collaboration" />
                    </div>
                    <div>
                        <span className="text-primary font-semibold">WHO WE ARE</span>
                        <h2 className="text-3xl md:text-4xl font-bold font-headline mt-2 text-foreground">Exclusive Property Management for LEOS Developments</h2>
                        <p className="mt-4 text-muted-foreground">
                            VE Live is the exclusive property management arm of LEOS Developments. We provide a seamless, end-to-end management experience for property owners, ensuring their investments are protected and profitable. Our deep integration with LEOS allows us to offer unparalleled service and expertise.
                        </p>
                    </div>
                </div>
            </div>
        </section>
        
        <section className="py-20 bg-secondary">
          <div className="container mx-auto text-center max-w-7xl">
            <span className="text-primary font-semibold">OUR ADVANTAGE</span>
            <h2 className="text-3xl md:text-4xl font-bold font-headline mt-2 text-foreground">What Makes Us Different?</h2>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-12">
                {differentiators.map((feature) => (
                    <Card key={feature.title} className="bg-background text-center p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
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

        <section className="py-20 bg-background">
          <div className="container mx-auto text-center max-w-7xl">
            <span className="text-primary font-semibold">OUR TEAM</span>
            <h2 className="text-3xl md:text-4xl font-bold font-headline mt-2 text-foreground">Meet Our Experts</h2>
            <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
              We are a team of passionate individuals dedicated to bringing you the best of your city.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mt-12">
              {teamMembers.map((member) => (
                <Card key={member.name} className="bg-card text-center p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                  <CardContent className="p-0">
                    <Avatar className="w-32 h-32 mx-auto mb-4 border-4 border-primary">
                      <AvatarImage src={member.avatar} alt={member.name} />
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
    </div>
  );
};

export default AboutPage;
