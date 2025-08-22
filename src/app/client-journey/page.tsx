
import { Header } from '@/components/landing/header';
import { Footer } from '@/components/landing/footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { KeyRound, Search, Brush, Megaphone, UserCheck, FilePen, LogIn, ClipboardCheck, Banknote, RefreshCcw } from 'lucide-react';
import Image from 'next/image';

const journeySteps = [
    { icon: <KeyRound className="w-10 h-10 text-primary" />, title: "Key Handover", description: "The journey begins when you entrust us with your keys, marking the start of our partnership." },
    { icon: <Search className="w-10 h-10 text-primary" />, title: "Unit Inspection & Setup", description: "We conduct a thorough inspection and prepare your unit to meet market standards." },
    { icon: <Brush className="w-10 h-10 text-primary" />, title: "Furnishing & Fit-Out", description: "Our team handles professional furnishing and fit-out to maximize tenant appeal and rental value." },
    { icon: <Megaphone className="w-10 h-10 text-primary" />, title: "Property Listing & Marketing", description: "Your property is listed across top portals with professional photos to attract qualified tenants." },
    { icon: <UserCheck className="w-10 h-10 text-primary" />, title: "Tenant Screening", description: "We perform rigorous background and financial checks to find reliable and trustworthy tenants." },
    { icon: <FilePen className="w-10 h-10 text-primary" />, title: "Lease Signing & Ejari", description: "All legal paperwork, including lease agreements and Ejari registration, is handled by us." },
    { icon: <LogIn className="w-10 h-10 text-primary" />, title: "Tenant Move-In", description: "We coordinate a smooth move-in process, ensuring a seamless transition for your new tenant." },
    { icon: <ClipboardCheck className="w-10 h-10 text-primary" />, title: "Routine Inspections", description: "We conduct regular inspections to ensure your property remains in excellent condition." },
    { icon: <Banknote className="w-10 h-10 text-primary" />, title: "Rent Collection & Reporting", description: "Timely rent collection and detailed financial statements are provided for your convenience." },
    { icon: <RefreshCcw className="w-10 h-10 text-primary" />, title: "Renewal or Exit Management", description: "We manage lease renewals and handle the end-of-lease process efficiently and professionally." },
];

const ClientJourneyPage = () => {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main>
        <section className="relative h-screen flex items-center bg-card text-card-foreground" style={{
          backgroundImage: 'url(/assets/images/banners/client_journey.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}>
          <div className="absolute inset-0 bg-black/70" />
          <div className="container relative mx-auto text-center">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-4xl md:text-6xl font-bold font-headline tracking-tight text-white mb-4">
                The VE-Live <span className="text-primary">Client Journey</span>
              </h1>
              <p className="text-lg md:text-xl text-white/80">
                A seamless, transparent, and rewarding property management experience from start to finish.
              </p>
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="container mx-auto max-w-7xl">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {journeySteps.map((step, index) => (
                <Card key={step.title} className="bg-card text-center p-6 flex flex-col items-center transition-all duration-300 hover:shadow-xl hover:-translate-y-1 relative">
                    <div className="absolute top-4 right-4 bg-primary/10 text-primary font-bold text-lg rounded-full h-12 w-12 flex items-center justify-center">
                        {index + 1}
                    </div>
                     <div className="bg-primary/10 text-primary p-4 rounded-full mb-6 mt-8">
                        {step.icon}
                    </div>
                    <CardHeader className="p-0">
                        <CardTitle className="font-bold text-xl text-foreground mb-2 h-12 flex items-center">{step.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 flex-grow">
                        <p className="text-muted-foreground">{step.description}</p>
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

export default ClientJourneyPage;
