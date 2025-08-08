
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, Briefcase, Handshake, Users } from "lucide-react";

const features = [
    {
        icon: <Award className="w-8 h-8 text-primary" />,
        title: "Developer-Led Advantage",
        description: "Benefit from our deep understanding of property management, backed by developer expertise.",
    },
    {
        icon: <Briefcase className="w-8 h-8 text-primary" />,
        title: "End-to-End Management",
        description: "We handle everything from leasing and maintenance to legal support, all under one roof.",
    },
    {
        icon: <Handshake className="w-8 h-8 text-primary" />,
        title: "Financial Transparency",
        description: "Gain full visibility into your property's financial performance with our clear reporting.",
    },
    {
        icon: <Users className="w-8 h-8 text-primary" />,
        title: "Faster Leasing, Better Tenants",
        description: "Our efficient screening process ensures your property is leased quickly to reliable tenants.",
    },
];

export const WhyVeLive = () => {
    return (
        <section className="py-20 bg-background text-card-foreground">
            <div className="container mx-auto text-center max-w-7xl">
                <h2 className="text-3xl md:text-4xl font-bold font-headline mt-2">Why VE-Live?</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-12">
                    {features.map((feature, index) => (
                        <Card key={index} className="bg-card border-border text-center p-6">
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
