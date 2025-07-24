'use client';

import type { Dispatch, SetStateAction, ElementType } from 'react';
import { Utensils, Hotel, ShoppingCart, Briefcase, Calendar, Dumbbell } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface CategoriesProps {
  selectedCategory: string;
  setSelectedCategory: Dispatch<SetStateAction<string>>;
}

const categoryItems: { name: string; icon: ElementType }[] = [
  { name: 'Restaurant', icon: Utensils },
  { name: 'Hotel', icon: Hotel },
  { name: 'Shopping', icon: ShoppingCart },
  { name: 'Apartment', icon: Briefcase },
  { name: 'Event', icon: Calendar },
  { name: 'Fitness', icon: Dumbbell },
];

export const Categories = ({ selectedCategory, setSelectedCategory }: CategoriesProps) => {
  return (
    <section className="py-20">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <span className="text-primary font-semibold">Category</span>
          <h2 className="text-3xl md:text-4xl font-bold font-headline mt-2">Most Popular Categories</h2>
          <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
            Browse our most popular categories to find exactly what you're looking for in the city.
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {categoryItems.map(({ name, icon: Icon }) => (
            <button
              key={name}
              onClick={() => setSelectedCategory(name === selectedCategory ? '' : name)}
              className="w-full"
              aria-pressed={name === selectedCategory}
            >
              <Card className={cn(
                "group text-center p-6 transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-2 border-2",
                selectedCategory === name ? 'border-primary bg-primary/10' : 'border-transparent'
              )}>
                <CardContent className="p-0">
                  <div className={cn(
                    "mx-auto h-16 w-16 rounded-full flex items-center justify-center bg-primary/10 transition-colors",
                    selectedCategory === name ? 'bg-primary text-primary-foreground' : 'text-primary group-hover:bg-primary group-hover:text-primary-foreground'
                  )}>
                    <Icon className="h-8 w-8" />
                  </div>
                  <h3 className="mt-4 font-semibold text-lg">{name}</h3>
                </CardContent>
              </Card>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};
