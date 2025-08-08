
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, ShieldCheck, HandCoins, UserCheck, Repeat, FileText } from "lucide-react";

const services = [
    {
        icon: <UserCheck className="w-8 h-8 text-primary" />,
        title: "Leasing & Tenant Screening",
    },
    {
        icon: <ShieldCheck className="w-8 h-8 text-primary" />,
        title: "Marketing & Listing",
    },
    {
        icon: <HandCoins className="w-8 h-8 text-primary" />,
        title: "Maintenance & Repairs",
    },
    {
        icon: <FileText className="w-8 h-8 text-primary" />,
        title: "Financial & Legal Management",
    },
    {
        icon: <Repeat className="w-8 h-8 text-primary" />,
        title: "Renewal & Exit Support",
    },
];

export const OurServices = () => {
    return (
        <section className="py-20 bg-background text-card-foreground">
            <div className="container mx-auto text-center max-w-7xl">
                <h2 className="text-3xl md:text-4xl font-bold font-headline mt-2">Our Services</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 mt-12">
                    {services.map((service, index) => (
                        <Card key={index} className="bg-card border-border text-center p-6 flex flex-col items-center justify-center">
                            <div className="mx-auto bg-primary/10 rounded-full w-20 h-20 flex items-center justify-center mb-4">
                                {service.icon}
                            </div>
                            <CardContent className="p-0">
                                <h3 className="text-lg font-semibold text-foreground h-12">{service.title}</h3>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
};
