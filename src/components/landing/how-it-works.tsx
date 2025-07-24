import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Map, CheckCircle } from "lucide-react";

const steps = [
    {
        icon: <Search className="w-8 h-8 text-primary" />,
        title: "Find Your Interest",
        description: "Explore a wide range of categories and listings to find what you're looking for.",
    },
    {
        icon: <Map className="w-8 h-8 text-primary" />,
        title: "Explore the Area",
        description: "Use our maps and guides to discover the best spots in the city.",
    },
    {
        icon: <CheckCircle className="w-8 h-8 text-primary" />,
        title: "Book Your Spot",
        description: "Easily book your visit or make a reservation directly through our platform.",
    },
];

export const HowItWorks = () => {
    return (
        <section className="py-20 bg-background">
            <div className="container mx-auto text-center">
                <span className="text-primary font-semibold">PROCESS</span>
                <h2 className="text-3xl md:text-4xl font-bold font-headline mt-2 text-foreground">How It Works</h2>
                <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
                    A simple three-step process to find and book your perfect experience.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
                    {steps.map((step, index) => (
                        <Card key={index} className="bg-card border-border text-center p-6 relative">
                             <div className="absolute top-4 right-4 text-6xl font-bold text-primary/10 -z-1">0{index + 1}</div>
                            <CardHeader>
                                <div className="mx-auto bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center">
                                    {step.icon}
                                </div>
                            </CardHeader>
                            <CardContent>
                                <CardTitle className="text-xl font-bold text-foreground">{step.title}</CardTitle>
                                <CardDescription className="mt-2 text-muted-foreground">{step.description}</CardDescription>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
};
