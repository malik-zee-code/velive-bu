import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, CheckCircle, Target } from "lucide-react";

const features = [
    {
        icon: <Target className="w-8 h-8 text-primary" />,
        title: "Reach Your Target",
        description: "Connect with a targeted audience actively searching for local businesses and services.",
    },
    {
        icon: <BarChart className="w-8 h-8 text-primary" />,
        title: "Boost Your Sales",
        description: "Increase your visibility and drive more customers to your door with our promotional tools.",
    },
    {
        icon: <CheckCircle className="w-8 h-8 text-primary" />,
        title: "Get Verified",
        description: "Build trust and credibility with a verified badge that showcases your authenticity.",
    },
];

export const GrowBusiness = () => {
    return (
        <section className="py-20 bg-card text-card-foreground">
            <div className="container mx-auto text-center">
                <span className="text-primary font-semibold">FEATURES</span>
                <h2 className="text-3xl md:text-4xl font-bold font-headline mt-2">Grow Your Business With Us</h2>
                <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
                    We provide the tools and support you need to expand your reach and increase your sales.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
                    {features.map((feature, index) => (
                        <Card key={index} className="bg-background/50 border-border/20 text-center p-6">
                            <CardHeader>
                                <div className="mx-auto bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center">
                                    {feature.icon}
                                </div>
                            </CardHeader>
                            <CardContent>
                                <CardTitle className="text-xl font-bold text-foreground">{feature.title}</CardTitle>
                                <CardDescription className="mt-2 text-muted-foreground">{feature.description}</CardDescription>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
};
