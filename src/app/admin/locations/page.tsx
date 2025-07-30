
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

const mockLocationsData = [
    { id: '1', name: 'New York' },
    { id: '2', name: 'Los Angeles' },
    { id: '3', name: 'London' },
];

const formSchema = z.object({
  name: z.string().min(1, "Location name is required."),
});

const LocationsPage = () => {
  const { toast } = useToast();
  const [locations, setLocations] = useState(mockLocationsData);
  const [editingLocation, setEditingLocation] = useState<any>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "" },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (editingLocation) {
        setLocations(locations.map(l => l.id === editingLocation.id ? { ...l, name: values.name } : l));
        toast({ title: "Success!", description: "Location updated successfully." });
    } else {
        const newLocation = { id: (locations.length + 1).toString(), name: values.name };
        setLocations([...locations, newLocation]);
        toast({ title: "Success!", description: "Location added successfully." });
    }
    form.reset();
    setEditingLocation(null);
  };
  
  const handleDelete = (id: string) => {
    setLocations(locations.filter(l => l.id !== id));
    toast({ title: "Success!", description: "Location deleted successfully." });
  };
  
  const handleEdit = (location: any) => {
    setEditingLocation(location);
    form.setValue("name", location.name);
  };

  const handleCancelEdit = () => {
    setEditingLocation(null);
    form.reset();
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
            <Card>
                <CardHeader>
                    <CardTitle>{editingLocation ? 'Edit Location' : 'Add Location'}</CardTitle>
                    <CardDescription>
                       {editingLocation ? 'Update the location name.' : 'Create a new location for your properties.'}
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
                             <div className="flex gap-2">
                                <Button type="submit">
                                    {editingLocation ? 'Update' : 'Add'} Location
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
                    <Table>
                        <TableHeader>
                            <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {locations.map((location: any) => (
                            <TableRow key={location.id}>
                                <TableCell>{location.name}</TableCell>
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
                </CardContent>
            </Card>
        </div>
    </div>
  );
};

export default LocationsPage;
