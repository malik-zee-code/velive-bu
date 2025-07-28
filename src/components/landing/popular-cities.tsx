import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "../ui/button";

const cities = [
    { name: "New York", image: "https://placehold.co/400x500.png", listings: 12 },
    { name: "Los Angeles", image: "https://placehold.co/400x500.png", listings: 8 },
    { name: "London", image: "https://placehold.co/400x500.png", listings: 15 },
    { name: "Paris", image: "https://placehold.co/400x500.png", listings: 10 },
];

export const PopularCities = () => {
    return (
        <section className="py-20 bg-background">
            <div className="container mx-auto text-center">
                <span className="text-primary font-semibold">CITIES</span>
                <h2 className="text-3xl md:text-4xl font-bold font-headline mt-2 text-foreground">Most Popular Cities</h2>
                <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
                    Discover the best of what our most popular cities have to offer.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mt-12">
                    {cities.map((city) => (
                        <Card key={city.name} className="relative overflow-hidden group">
                            <Image src={city.image} alt={city.name} width={400} height={500} className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-110" data-ai-hint="city night" />
                            <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white p-4">
                                <h3 className="text-2xl font-bold">{city.name}</h3>
                                <p>{city.listings} Listings</p>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
};
