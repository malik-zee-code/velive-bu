
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
import { isAdmin } from '@/lib/jwt';
import { categoryService } from '@/lib/services';


const formSchema = z.object({
  title: z.string().min(1, "Category title is required."),
});

type Category = {
  id: string;
  title: string;
}

const CategoriesPage = () => {
  const { toast } = useToast();
  const router = useRouter();
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [addLoading, setAddLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);

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

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await categoryService.getAllCategories();
      setCategories(response.data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch categories'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAddCategory = async (title: string) => {
    try {
      setAddLoading(true);
      await categoryService.createCategory({ title });
      toast({ title: "Success!", description: "Category added successfully." });
      form.reset();
      setEditingCategory(null);
      fetchCategories();
    } catch (err) {
      toast({ title: "Error!", description: "Failed to add category.", variant: "destructive" });
    } finally {
      setAddLoading(false);
    }
  };

  const handleUpdateCategory = async (id: string, title: string) => {
    try {
      setUpdateLoading(true);
      await categoryService.updateCategory(id, { title });
      toast({ title: "Success!", description: "Category updated successfully." });
      form.reset();
      setEditingCategory(null);
      fetchCategories();
    } catch (err) {
      toast({ title: "Error!", description: "Failed to update category.", variant: "destructive" });
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      await categoryService.deleteCategory(id);
      toast({ title: "Success!", description: "Category deleted successfully." });
      fetchCategories();
    } catch (err) {
      toast({ title: "Error!", description: "Failed to delete category.", variant: "destructive" });
    }
  };


  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { title: "" },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (editingCategory) {
      handleUpdateCategory(editingCategory.id, values.title);
    } else {
      handleAddCategory(values.title);
    }
  };

  const handleDelete = (id: string) => {
    handleDeleteCategory(id);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    form.setValue("title", category.title);
  };

  const handleCancelEdit = () => {
    setEditingCategory(null);
    form.reset();
  };

  const isMutating = addLoading || updateLoading;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-4 md:p-0">
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
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Apartments" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex gap-2">
                  <Button type="submit" disabled={isMutating}>
                    {isMutating ? 'Saving...' : (editingCategory ? 'Update Category' : 'Add Category')}
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
            {loading && <p>Loading...</p>}
            {error && <p>Error loading categories: {error.message}</p>}
            {!loading && !error && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((category: Category) => (
                    <TableRow key={category.id}>
                      <TableCell>{category.title}</TableCell>
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
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CategoriesPage;
