"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, MapPin, Tag, PlusCircle } from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { isAdmin } from "@/lib/auth";
import { propertyService, locationService, categoryService } from "@/lib/services";
import { useAuth } from "@/contexts/AuthContext";
import { ExpiringDocumentsWidget } from "@/components/portal/ExpiringDocumentsWidget";
import { FeaturedNewsWidget } from "@/components/portal/FeaturedNewsWidget";

const StatCard = ({
  title,
  value,
  icon: Icon,
  loading,
}: {
  title: string;
  value: number;
  icon: React.ElementType;
  loading: boolean;
}) => (
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
  const [userIsAdmin, setUserIsAdmin] = useState(false);
  const [propertiesCount, setPropertiesCount] = useState(0);
  const [locationsCount, setLocationsCount] = useState(0);
  const [categoriesCount, setCategoriesCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const { user } = useAuth();
  useEffect(() => {
    document.title = "Dashboard | VE LIVE";
    setUserIsAdmin(isAdmin());
  }, []);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        console.log("🔄 Dashboard loaded - fetching fresh data...");

        // Fetch properties for all users

        // Fetch admin stats only if user is admin
        if (isAdmin()) {
          const propertiesRes = await propertyService.getAllProperties();
          setPropertiesCount(propertiesRes.data.length);
          const [locationsRes, categoriesRes] = await Promise.all([
            locationService.getAllLocations(),
            categoryService.getAllCategories(),
          ]);
          setLocationsCount(locationsRes.data.length);
          setCategoriesCount(categoriesRes.data.length);
        } else {
          const propertiesRes = await propertyService.getPropertiesByOwner();
          setPropertiesCount(propertiesRes.data.length);
        }

        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to fetch dashboard data"));
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [userIsAdmin]);

  if (error) {
    return <p>Error loading dashboard data: {error.message}</p>;
  }

  // Define all stats
  const allStats = [
    { title: "Total Properties", value: propertiesCount, icon: Building2 },
    { title: "Total Locations", value: locationsCount, icon: MapPin },
    { title: "Total Categories", value: categoriesCount, icon: Tag },
  ];

  // Filter stats based on user role - only show properties for regular users
  const stats = userIsAdmin ? allStats : [allStats[0]]; // Only show properties for non-admin

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard</h1>
      </div>

      <div className={`grid gap-4 ${userIsAdmin ? "md:grid-cols-3" : "md:grid-cols-1"}`}>
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} loading={loading} />
        ))}
      </div>

      {/* Widgets - For admins, managers, and users with documents */}
      <div className="grid gap-4 md:grid-cols-2">
        <ExpiringDocumentsWidget />
        <FeaturedNewsWidget />
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-4">
          <Button asChild>
            <Link href="/portal/properties">
              <PlusCircle className="mr-2 h-4 w-4" /> Add Property
            </Link>
          </Button>
          {userIsAdmin && (
            <>
              <Button asChild variant="secondary">
                <Link href="/portal/locations">
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Location
                </Link>
              </Button>
              <Button asChild variant="secondary">
                <Link href="/portal/categories">
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Category
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
