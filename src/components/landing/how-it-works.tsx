
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
    return null;
};
