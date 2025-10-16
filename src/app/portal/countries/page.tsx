
'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Pencil, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isAdmin } from '@/lib/auth';
import { countryService } from '@/lib/services';
import { Pagination } from '@/components/common/Pagination';
import { usePagination } from '@/hooks/usePagination';

const formSchema = z.object({
  name: z.string().min(1, "Country name is required."),
});

type Country = {
  id: string;
  name: string;
}

const CountriesPage = () => {
  const { toast } = useToast();
  const router = useRouter();
  const [editingCountry, setEditingCountry] = useState<Country | null>(null);
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [addLoading, setAddLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);

  // Pagination
  const {
    currentPage,
    totalPages,
    paginatedData,
    totalItems,
    goToPage,
  } = usePagination({
    data: countries,
    itemsPerPage: 10,
  });

  // Redirect non-admin users
  useEffect(() => {
    if (!isAdmin()) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access this page.",
        variant: "destructive",
      });
      router.push('/portal/dashboard');
    }
  }, [router, toast]);

  const fetchCountries = async () => {
    try {
      setLoading(true);
      const response = await countryService.getAllCountries();
      setCountries(response.data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch countries'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCountries();
  }, []);

  const handleAddCountry = async (name: string) => {
    try {
      setAddLoading(true);
      await countryService.createCountry({ name });
      toast({ title: "Success!", description: "Country added successfully." });
      form.reset();
      setEditingCountry(null);
      fetchCountries();
    } catch (err) {
      toast({ title: "Error!", description: "Failed to add country.", variant: "destructive" });
    } finally {
      setAddLoading(false);
    }
  };

  const handleUpdateCountry = async (id: string, name: string) => {
    try {
      setUpdateLoading(true);
      await countryService.updateCountry(id, { name });
      toast({ title: "Success!", description: "Country updated successfully." });
      form.reset();
      setEditingCountry(null);
      fetchCountries();
    } catch (err) {
      toast({ title: "Error!", description: "Failed to update country.", variant: "destructive" });
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleDeleteCountry = async (id: string) => {
    try {
      await countryService.deleteCountry(id);
      toast({ title: "Success!", description: "Country deleted successfully." });
      fetchCountries();
    } catch (err) {
      toast({ title: "Error!", description: "Failed to delete country.", variant: "destructive" });
    }
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "" },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (editingCountry) {
      handleUpdateCountry(editingCountry.id, values.name);
    } else {
      handleAddCountry(values.name);
    }
  };

  const handleDelete = (id: string) => {
    handleDeleteCountry(id);
  };

  const handleEdit = (country: Country) => {
    setEditingCountry(country);
    form.setValue("name", country.name);
  };

  const handleCancelEdit = () => {
    setEditingCountry(null);
    form.reset();
  };

  const isMutating = addLoading || updateLoading;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-4 md:p-0">
      <div className="md:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>{editingCountry ? 'Edit Country' : 'Add Country'}</CardTitle>
            <CardDescription>
              {editingCountry ? 'Update the country name.' : 'Create a new country.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., United Arab Emirates" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex gap-2">
                  <Button type="submit" disabled={isMutating}>
                    {isMutating ? 'Saving...' : (editingCountry ? 'Update Country' : 'Add Country')}
                  </Button>
                  {editingCountry && (
                    <Button variant="outline" onClick={handleCancelEdit}>
                      Cancel
                    </Button>
                  )}
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
      <div className="md:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Existing Countries</CardTitle>
            <CardDescription>
              Here is a list of all your current countries.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Loading...</p>
            ) : error ? (
              <p>Error loading countries: {error.message}</p>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedData.map((country: Country) => (
                      <TableRow key={country.id}>
                        <TableCell>{country.name}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(country)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will permanently delete the country.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(country.id)}>
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={totalItems}
                  itemsPerPage={10}
                  onPageChange={goToPage}
                />
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CountriesPage;
