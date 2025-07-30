'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const CategoriesPage = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Categories</CardTitle>
        <CardDescription>
          Here you can add, edit, or delete categories for your properties.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p>CRUD functionality for categories will be implemented here.</p>
      </CardContent>
    </Card>
  );
};

export default CategoriesPage;
