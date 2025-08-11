
import { Header } from '@/components/landing/header';
import { Footer } from '@/components/landing/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, HandCoins, FileText, Repeat, ShieldCheck, UserCheck, Megaphone, Wrench } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const services = [
    {
        icon: <UserCheck className="w-10 h-10 text-primary" />,
        title: "Tenant Screening & Leasing",
        description: "Our rigorous tenant screening process ensures you get reliable and trustworthy tenants for your property. We handle the entire leasing process from start to finish."
    },
    {
        icon: <Megaphone className="w-10 h-10 text-primary" />,
        title: "Property Marketing",
        description: "We create compelling listings and market your property across multiple channels to attract the right tenants quickly, minimizing vacancy periods."
    },
    {
        icon: <Wrench className="w-10 h-10 text-primary" />,
        title: "Maintenance & Repairs",
        description: "Our dedicated team handles all maintenance requests and coordinates repairs promptly, ensuring your property remains in excellent condition."
    },
    {
        icon: <FileText className="w-10 h-10 text-primary" />,
        title: "Legal Formalities",
        description: "We navigate the complexities of property law, managing all legal documentation and ensuring full compliance with local regulations."
    },
    {
        icon: <HandCoins className="w-10 h-10 text-primary" />,
        title: "Financial Management",
        description: "From rent collection to detailed financial reporting, we provide transparent and efficient financial management for your investment."
    },
    {
        icon: <Repeat className="w-10 h-10 text-primary" />,
        title: "Renewals & Exit",
        description: "We manage lease renewals to retain good tenants and handle the end-of-lease process smoothly, including inspections and deposit returns."
    },
];

const ServicesPage = () => {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main>
        <section className="relative py-20 md:py-32 bg-card text-card-foreground" style={{
          backgroundImage: 'url(/assets/images/city/02.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}>
          <div className="absolute inset-0 bg-black/70" />
          <div className="container relative mx-auto text-center">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-4xl md:text-6xl font-bold font-headline tracking-tight text-white mb-4">
                Our <span className="text-primary">Services</span>
              </h1>
              <p className="text-lg md:text-xl text-white/80">
                Comprehensive property management solutions tailored to your needs.
              </p>
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="container mx-auto max-w-7xl">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.map((service) => (
                <Card key={service.title} className="bg-card text-center p-6 flex flex-col items-center transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                     <div className="bg-primary/10 text-primary p-4 rounded-full mb-6">
                        {service.icon}
                    </div>
                    <CardHeader className="p-0">
                        <CardTitle className="font-bold text-xl text-foreground mb-2">{service.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 flex-grow">
                        <p className="text-muted-foreground">{service.description}</p>
                    </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 bg-secondary">
            <div className="container mx-auto max-w-7xl">
                 <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div>
                        <span className="text-primary font-semibold">GET IN TOUCH</span>
                        <h2 className="text-3xl md:text-4xl font-bold font-headline mt-2 text-foreground">Ready to Maximize Your Investment?</h2>
                        <p className="mt-4 text-muted-foreground">
                           Let us handle the complexities of property management so you can enjoy the returns. Contact us today for a free consultation and discover how VE-Live can help you achieve your property goals.
                        </p>
                        <Button asChild size="lg" className="mt-8">
                           <Link href="/contact">Contact Us</Link>
                        </Button>
                    </div>
                    <div>
                        <Image src="/assets/images/blog/02.jpg" alt="Consultation" width={600} height={400} className="rounded-lg shadow-lg" data-ai-hint="team meeting" />
                    </div>
                </div>
            </div>
        </section>

      </main>
      <Footer />
    </div>
  );
};

export default ServicesPage;
