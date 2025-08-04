
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

const GET_CATEGORIES = gql`
  query GetCategories {
    categories {
      id
      title
    }
  }
`;

const ADD_CATEGORY = gql`
  mutation AddCategory($title: String!) {
    insert_categories_one(object: {title: $title}) {
      id
      title
    }
  }
`;

const UPDATE_CATEGORY = gql`
  mutation UpdateCategory($id: uuid!, $title: String!) {
    update_categories_by_pk(pk_columns: {id: $id}, _set: {title: $title}) {
      id
      title
    }
  }
`;

const DELETE_CATEGORY = gql`
  mutation DeleteCategory($id: uuid!) {
    delete_categories_by_pk(id: $id) {
      id
    }
  }
`;


const formSchema = z.object({
  title: z.string().min(1, "Category name is required."),
});

type Category = {
    id: string;
    title: string;
}

const CategoriesPage = () => {
  const { toast } = useToast();
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const { data, loading, error, refetch } = useQuery(GET_CATEGORIES);

  const [addCategory, { loading: addLoading }] = useMutation(ADD_CATEGORY, {
    onCompleted: () => {
        refetch();
        toast({ title: "Success!", description: "Category added successfully." });
        form.reset();
        setEditingCategory(null);
    },
    onError: (error) => {
        toast({ title: "Error!", description: error.message, variant: "destructive" });
    }
  });

  const [updateCategory, { loading: updateLoading }] = useMutation(UPDATE_CATEGORY, {
     onCompleted: () => {
        refetch();
        toast({ title: "Success!", description: "Category updated successfully." });
        form.reset();
        setEditingCategory(null);
    },
    onError: (error) => {
        toast({ title: "Error!", description: error.message, variant: "destructive" });
    }
  });

  const [deleteCategory] = useMutation(DELETE_CATEGORY, {
    onCompleted: () => {
        refetch();
        toast({ title: "Success!", description: "Category deleted successfully." });
    },
    onError: (error) => {
        toast({ title: "Error!", description: error.message, variant: "destructive" });
    }
  });


  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { title: "" },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (editingCategory) {
        updateCategory({ variables: { id: editingCategory.id, title: values.title } });
    } else {
        addCategory({ variables: { title: values.title } });
    }
  };
  
  const handleDelete = (id: string) => {
    deleteCategory({ variables: { id } });
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
                                <FormLabel>Category Name</FormLabel>
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
                                {data?.categories.map((category: Category) => (
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
