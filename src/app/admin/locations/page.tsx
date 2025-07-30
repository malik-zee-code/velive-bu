'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const LocationsPage = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Locations</CardTitle>
        <CardDescription>
          Here you can add, edit, or delete locations for your properties.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p>CRUD functionality for locations will be implemented here.</p>
      </CardContent>
    </Card>
  );
};

export default LocationsPage;
