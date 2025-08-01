'use client';

import React from 'react';
import { useQuery, gql } from '@apollo/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, MapPin, Tag, PlusCircle } from 'lucide-react';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';

const GET_DASHBOARD_STATS = gql`
  query GetDashboardStats {
    properties_aggregate {
      aggregate {
        count
      }
    }
    locations_aggregate {
      aggregate {
        count
      }
    }
    categories_aggregate {
      aggregate {
        count
      }
    }
  }
`;

const StatCard = ({ title, value, icon: Icon, loading }: { title: string; value: number; icon: React.ElementType; loading: boolean }) => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
            {loading ? (
                <Skeleton className="h-8 w-1/4" />
            ) : (
                <div className="text-2xl font-bold">{value}</div>
            )}
        </CardContent>
    </Card>
);

const DashboardPage = () => {
    const { data, loading, error } = useQuery(GET_DASHBOARD_STATS);

    if (error) {
        return <p>Error loading dashboard data: {error.message}</p>;
    }

    const stats = [
        { title: 'Total Properties', value: data?.properties_aggregate.aggregate.count, icon: Building2, loading },
        { title: 'Total Locations', value: data?.locations_aggregate.aggregate.count, icon: MapPin, loading },
        { title: 'Total Categories', value: data?.categories_aggregate.aggregate.count, icon: Tag, loading },
    ];

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Dashboard</h1>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                {stats.map(stat => (
                    <StatCard key={stat.title} {...stat} />
                ))}
            </div>

            <div>
                <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
                <div className="flex flex-wrap gap-4">
                    <Button asChild>
                        <Link href="/admin/properties">
                            <PlusCircle className="mr-2 h-4 w-4" /> Add Property
                        </Link>
                    </Button>
                    <Button asChild variant="secondary">
                        <Link href="/admin/locations">
                            <PlusCircle className="mr-2 h-4 w-4" /> Add Location
                        </Link>
                    </Button>
                    <Button asChild variant="secondary">
                        <Link href="/admin/categories">
                            <PlusCircle className="mr-2 h-4 w-4" /> Add Category
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
