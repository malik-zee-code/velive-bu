
import { Header } from '@/components/landing/header';
import { Footer } from '@/components/landing/footer';
import { HowItWorks } from '@/components/landing/how-it-works';
import { AboutHero } from '@/components/about/hero';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import Image from 'next/image';
import { Building, Globe, Target } from 'lucide-react';

const teamMembers = [
    { name: 'John Doe', title: 'CEO & Founder', avatar: '/assets/images/testimonial/01.jpg' },
    { name: 'Jane Smith', title: 'Chief Operating Officer', avatar: '/assets/images/testimonial/02.jpg' },
    { name: 'Sam Wilson', title: 'Lead Developer', avatar: '/assets/images/testimonial/03.jpg' },
    { name: 'Emily White', title: 'Marketing Director', avatar: '/assets/images/category/01.jpg' },
];

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
                        <Image src="/assets/images/blog/01.jpg" alt="Our Mission" width={600} height={400} className="rounded-lg shadow-lg" data-ai-hint="office team" />
                    </div>
                    <div>
                        <span className="text-primary font-semibold">OUR STORY</span>
                        <h2 className="text-3xl md:text-4xl font-bold font-headline mt-2 text-foreground">Our Mission is to Connect You With Your City</h2>
                        <p className="mt-4 text-muted-foreground">
                            At CityZen, we believe that the best experiences are local. Our platform was born from a desire to bridge the gap between residents, visitors, and the incredible businesses that make each city unique. We're passionate about helping people discover hidden gems and supporting local economies.
                        </p>
                        <div className="mt-8 space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="bg-primary/10 text-primary p-3 rounded-full">
                                    <Target className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg text-foreground">Our Goal</h3>
                                    <p className="text-muted-foreground">To be the most trusted and comprehensive guide for discovering local businesses and services, fostering a vibrant community for all.</p>
                                </div>
                            </div>
                             <div className="flex items-start gap-4">
                                <div className="bg-primary/10 text-primary p-3 rounded-full">
                                    <Globe className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg text-foreground">Our Vision</h3>
                                    <p className="text-muted-foreground">To empower local businesses to thrive and to help people create lasting memories by exploring the world around them.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
        
        <HowItWorks />

        <section className="py-20 bg-secondary">
          <div className="container mx-auto text-center max-w-7xl">
            <span className="text-primary font-semibold">OUR TEAM</span>
            <h2 className="text-3xl md:text-4xl font-bold font-headline mt-2 text-foreground">Meet Our Experts</h2>
            <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
              We are a team of passionate individuals dedicated to bringing you the best of your city.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mt-12">
              {teamMembers.map((member) => (
                <Card key={member.name} className="bg-background text-center p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
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
      <Footer />
    </div>
  );
};

export default AboutPage;
