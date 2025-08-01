
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

const GET_COUNTRIES = gql`
  query GetCountries {
    countries {
      id
      name
    }
  }
`;

const ADD_COUNTRY = gql`
  mutation AddCountry($name: String!) {
    insert_countries_one(object: {name: $name}) {
      id
      name
    }
  }
`;

const UPDATE_COUNTRY = gql`
  mutation UpdateCountry($id: uuid!, $name: String!) {
    update_countries_by_pk(pk_columns: {id: $id}, _set: {name: $name}) {
      id
      name
    }
  }
`;

const DELETE_COUNTRY = gql`
  mutation DeleteCountry($id: uuid!) {
    delete_countries_by_pk(id: $id) {
      id
    }
  }
`;

const formSchema = z.object({
  name: z.string().min(1, "Country name is required."),
});

type Country = {
    id: string;
    name: string;
}

const CountriesPage = () => {
  const { toast } = useToast();
  const [editingCountry, setEditingCountry] = useState<Country | null>(null);

  const { data, loading, error, refetch } = useQuery(GET_COUNTRIES);

  const [addCountry, { loading: addLoading }] = useMutation(ADD_COUNTRY, {
    onCompleted: () => {
        refetch();
        toast({ title: "Success!", description: "Country added successfully." });
        form.reset();
        setEditingCountry(null);
    },
    onError: (error) => {
        toast({ title: "Error!", description: error.message, variant: "destructive" });
    }
  });

  const [updateCountry, { loading: updateLoading }] = useMutation(UPDATE_COUNTRY, {
     onCompleted: () => {
        refetch();
        toast({ title: "Success!", description: "Country updated successfully." });
        form.reset();
        setEditingCountry(null);
    },
    onError: (error) => {
        toast({ title: "Error!", description: error.message, variant: "destructive" });
    }
  });

  const [deleteCountry] = useMutation(DELETE_COUNTRY, {
    onCompleted: () => {
        refetch();
        toast({ title: "Success!", description: "Country deleted successfully." });
    },
    onError: (error) => {
        toast({ title: "Error!", description: error.message, variant: "destructive" });
    }
  });


  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "" },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (editingCountry) {
        updateCountry({ variables: { id: editingCountry.id, name: values.name } });
    } else {
        addCountry({ variables: { name: values.name } });
    }
  };
  
  const handleDelete = (id: string) => {
    deleteCountry({ variables: { id } });
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
                    {loading && <p>Loading...</p>}
                    {error && <p>Error loading countries: {error.message}</p>}
                    {!loading && !error && (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data?.countries.map((country: Country) => (
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
                    )}
                </CardContent>
            </Card>
        </div>
    </div>
  );
};

export default CountriesPage;
