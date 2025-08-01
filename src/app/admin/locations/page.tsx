
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
import { useState } from 'react';
import { gql, useMutation, useQuery } from '@apollo/client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const GET_LOCATIONS = gql`
  query GetLocations {
    locations {
      id
      name
      country {
        id
        name
      }
    }
  }
`;

const GET_COUNTRIES = gql`
  query GetCountries {
    countries {
      id
      name
    }
  }
`;

const ADD_LOCATION = gql`
  mutation AddLocation($name: String!, $country_id: bigint!) {
    insert_locations_one(object: {name: $name, country_id: $country_id}) {
      id
      name
    }
  }
`;

const UPDATE_LOCATION = gql`
  mutation UpdateLocation($id: bigint!, $name: String!, $country_id: bigint!) {
    update_locations_by_pk(pk_columns: {id: $id}, _set: {name: $name, country_id: $country_id}) {
      id
      name
    }
  }
`;

const DELETE_LOCATION = gql`
  mutation DeleteLocation($id: bigint!) {
    delete_locations_by_pk(id: $id) {
      id
    }
  }
`;

const formSchema = z.object({
  name: z.string().min(1, "Location name is required."),
  country_id: z.string().min(1, "Country is required."),
});

type Location = {
    id: string;
    name: string;
    country: {
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
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);

  const { data, loading, error, refetch } = useQuery(GET_LOCATIONS);
  const { data: countriesData, loading: countriesLoading, error: countriesError } = useQuery(GET_COUNTRIES);

  const [addLocation, { loading: addLoading }] = useMutation(ADD_LOCATION, {
    onCompleted: () => {
        refetch();
        toast({ title: "Success!", description: "Location added successfully." });
        form.reset();
        setEditingLocation(null);
    },
    onError: (error) => {
        toast({ title: "Error!", description: error.message, variant: "destructive" });
    }
  });

  const [updateLocation, { loading: updateLoading }] = useMutation(UPDATE_LOCATION, {
     onCompleted: () => {
        refetch();
        toast({ title: "Success!", description: "Location updated successfully." });
        form.reset();
        setEditingLocation(null);
    },
    onError: (error) => {
        toast({ title: "Error!", description: error.message, variant: "destructive" });
    }
  });

  const [deleteLocation] = useMutation(DELETE_LOCATION, {
    onCompleted: () => {
        refetch();
        toast({ title: "Success!", description: "Location deleted successfully." });
    },
    onError: (error) => {
        toast({ title: "Error!", description: error.message, variant: "destructive" });
    }
  });


  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", country_id: "" },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const mutationVariables = {
        name: values.name,
        country_id: parseInt(values.country_id, 10),
    };

    if (editingLocation) {
        updateLocation({ variables: { id: parseInt(editingLocation.id, 10), ...mutationVariables } });
    } else {
        addLocation({ variables: mutationVariables });
    }
  };
  
  const handleDelete = (id: string) => {
    deleteLocation({ variables: { id: parseInt(id, 10) } });
  };

  const handleEdit = (location: Location) => {
    setEditingLocation(location);
    form.setValue("name", location.name);
    form.setValue("country_id", location.country.id);
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
                       {editingLocation ? 'Update the location name and country.' : 'Create a new location for your properties.'}
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
                                name="country_id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Country</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a country" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {countriesLoading && <SelectItem value="loading" disabled>Loading...</SelectItem>}
                                                {countriesData?.countries.map((country: Country) => (
                                                    <SelectItem key={country.id} value={country.id.toString()}>
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
                                <Button type="submit" disabled={isMutating || countriesLoading}>
                                    {isMutating ? 'Saving...' : (editingLocation ? 'Update Location' : 'Add Location')}
                                </Button>
                                {editingLocation && (
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
                    <CardTitle>Existing Locations</CardTitle>
                    <CardDescription>
                        Here is a list of all your current locations.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                     {loading && <p>Loading...</p>}
                     {error && <p>Error loading locations: {error.message}</p>}
                     {countriesError && <p>Error loading countries: {countriesError.message}</p>}
                     {!loading && !error && (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Country</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data?.locations.map((location: Location) => (
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
                                                    <Trash2 className="h-4 w-4 text-destructive" />
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
                     )}
                </CardContent>
            </Card>
        </div>
    </div>
  );
};

export default LocationsPage;
