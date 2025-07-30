
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

const mockCategoriesData = [
    { id: '1', name: 'Restaurants' },
    { id: '2', name: 'Hotels' },
    { id: '3', name: 'Shopping' },
    { id: '4', name: 'Business' },
];

const formSchema = z.object({
  name: z.string().min(1, "Category name is required."),
});

const CategoriesPage = () => {
  const { toast } = useToast();
  const [categories, setCategories] = useState(mockCategoriesData);
  const [editingCategory, setEditingCategory] = useState<any>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "" },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (editingCategory) {
        setCategories(categories.map(c => c.id === editingCategory.id ? { ...c, name: values.name } : c));
        toast({ title: "Success!", description: "Category updated successfully." });
    } else {
        const newCategory = { id: (categories.length + 1).toString(), name: values.name };
        setCategories([...categories, newCategory]);
        toast({ title: "Success!", description: "Category added successfully." });
    }
    form.reset();
    setEditingCategory(null);
  };
  
  const handleDelete = (id: string) => {
    setCategories(categories.filter(c => c.id !== id));
    toast({ title: "Success!", description: "Category deleted successfully." });
  };

  const handleEdit = (category: any) => {
    setEditingCategory(category);
    form.setValue("name", category.name);
  };
  
  const handleCancelEdit = () => {
    setEditingCategory(null);
    form.reset();
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
            <Card>
                <CardHeader>
                    <CardTitle>{editingCategory ? 'Edit Category' : 'Add Category'}</CardTitle>
                    <CardDescription>
                        {editingCategory ? 'Update the category name.' : 'Create a new category for your properties.'}
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
                                <FormLabel>Category Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g., Apartments" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                            />
                            <div className="flex gap-2">
                                <Button type="submit">
                                    {editingCategory ? 'Update' : 'Add'} Category
                                </Button>
                                {editingCategory && (
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
                    <CardTitle>Existing Categories</CardTitle>
                    <CardDescription>
                        Here is a list of all your current categories.
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
                            {categories.map((category: any) => (
                            <TableRow key={category.id}>
                                <TableCell>{category.name}</TableCell>
                                <TableCell className="text-right">
                                <Button variant="ghost" size="icon" onClick={() => handleEdit(category)}>
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
                                                This action cannot be undone. This will permanently delete the category.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleDelete(category.id)}>
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

export default CategoriesPage;
