
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRouter } from 'next/navigation';
import { isAdmin } from '@/lib/auth';
import { locationService, countryService } from '@/lib/services';
import { Pagination } from '@/components/common/Pagination';
import { usePagination } from '@/hooks/usePagination';

const formSchema = z.object({
  name: z.string().min(1, "Location name is required."),
  country: z.string().min(1, "Country is required."),
});

type Location = {
  id: string;
  name: string;
  country?: {
    id: string;
    name: string;
  }
}

type Country = {
  id: string;
  name: string;
}

const LocationsPage = () => {
  const { toast } = useToast();
  const router = useRouter();
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
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
    data: locations,
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

  const fetchData = async () => {
    try {
      setLoading(true);
      const [locationsRes, countriesRes] = await Promise.all([
        locationService.getAllLocations(),
        countryService.getAllCountries(),
      ]);
      setLocations(locationsRes.data);
      setCountries(countriesRes.data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch data'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddLocation = async (name: string, country: string) => {
    try {
      setAddLoading(true);
      await locationService.createLocation({ name, country });
      toast({ title: "Success!", description: "Location added successfully." });
      form.reset();
      setEditingLocation(null);
      fetchData();
    } catch (err) {
      toast({ title: "Error!", description: "Failed to add location.", variant: "destructive" });
    } finally {
      setAddLoading(false);
    }
  };

  const handleUpdateLocation = async (id: string, name: string, country: string) => {
    try {
      setUpdateLoading(true);
      await locationService.updateLocation(id, { name, country });
      toast({ title: "Success!", description: "Location updated successfully." });
      form.reset();
      setEditingLocation(null);
      fetchData();
    } catch (err) {
      toast({ title: "Error!", description: "Failed to update location.", variant: "destructive" });
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleDeleteLocation = async (id: string) => {
    try {
      await locationService.deleteLocation(id);
      toast({ title: "Success!", description: "Location deleted successfully." });
      fetchData();
    } catch (err) {
      toast({ title: "Error!", description: "Failed to delete location.", variant: "destructive" });
    }
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", country: "" },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (editingLocation) {
      handleUpdateLocation(editingLocation.id, values.name, values.country);
    } else {
      handleAddLocation(values.name, values.country);
    }
  };

  const handleDelete = (id: string) => {
    handleDeleteLocation(id);
  };

  const handleEdit = (location: Location) => {
    setEditingLocation(location);
    form.setValue("name", location.name);
    const country = typeof location.country === 'object' ? location.country?.id : location.country;
    if (country) {
      form.setValue("country", country);
    }
  };

  const handleCancelEdit = () => {
    setEditingLocation(null);
    form.reset();
  };

  const isMutating = addLoading || updateLoading;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-4 md:p-0">
      <div className="md:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>{editingLocation ? 'Edit Location' : 'Add Location'}</CardTitle>
            <CardDescription>
              {editingLocation ? 'Update the location name and country.' : 'Create a new location.'}
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
                      <FormLabel>Location Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Dubai Marina" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a country" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {countries.map((country) => (
                            <SelectItem key={country.id} value={country.id}>
                              {country.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex gap-2">
                  <Button type="submit" disabled={isMutating} className="flex-1">
                    {isMutating ? "Saving..." : (editingLocation ? "Update" : "Add")}
                  </Button>
                  {editingLocation && (
                    <Button type="button" variant="outline" onClick={handleCancelEdit}>
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
            <CardTitle>Locations</CardTitle>
            <CardDescription>Manage application locations</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Loading locations...</p>
            ) : error ? (
              <p className="text-destructive">Error: {error.message}</p>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Country</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedData.map((location: Location) => (
                      <TableRow key={location.id}>
                        <TableCell>{location.name}</TableCell>
                        <TableCell>{location.country?.name || 'N/A'}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(location)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will permanently delete the location.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(location.id)}>
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

export default LocationsPage;