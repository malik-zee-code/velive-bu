// src/app/portal/blogs/page.tsx
'use client';
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Image from 'next/image';
import { Trash2, Pencil, PlusCircle } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useRouter } from 'next/navigation';
import { isAdmin } from '@/lib/auth';
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
} from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { TinyMceEditor } from '@/components/common/TinyMceEditor';
import { blogService, categoryService } from '@/lib/services';
import { Pagination } from '@/components/common/Pagination';
import { usePagination } from '@/hooks/usePagination';
import { format } from 'date-fns';

const formSchema = z.object({
    title: z.string().min(1, { message: "Title is required." }),
    slug: z.string().optional(),
    content: z.string().optional(),
    category: z.string().min(1, "Category is required."),
    featuredImage: z.string().optional(),
});

const generateSlug = (title: string) => {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
};

type Blog = {
    id: string;
    title: string;
    slug: string;
    content?: string;
    featuredImage?: string;
    category?: { id: string; title: string; };
    createdAt: string;
}

type Category = {
    id: string;
    title: string;
}

const BlogsPage = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [isMutating, setIsMutating] = useState(false);
    const { toast } = useToast();
    const router = useRouter();

    // Pagination
    const {
        currentPage,
        totalPages,
        paginatedData,
        totalItems,
        goToPage,
    } = usePagination({
        data: blogs,
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
            const [blogsRes, categoriesRes] = await Promise.all([
                blogService.getAllBlogs(),
                categoryService.getAllCategories(),
            ]);
            setBlogs(blogsRes.data);
            setCategories(categoriesRes.data);
        } catch (err) {
            console.error('Failed to fetch data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: { title: "", slug: "", content: "", category: "", featuredImage: "" },
    });

    const handleFormSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            setIsMutating(true);
            const slug = (values.slug || generateSlug(values.title)) as string;

            if (editingBlog) {
                await blogService.updateBlog(editingBlog.id, {
                    title: values.title,
                    slug,
                    content: values.content,
                    category: values.category,
                    featuredImage: values.featuredImage,
                });
                toast({ title: "Success!", description: "Blog post updated successfully." });
            } else {
                await blogService.createBlog({
                    title: values.title,
                    slug,
                    content: values.content,
                    category: values.category,
                    featuredImage: values.featuredImage,
                });
                toast({ title: "Success!", description: "Blog post added successfully." });
            }

            form.reset();
            setIsModalOpen(false);
            setEditingBlog(null);
            fetchData();
        } catch (err) {
            console.error(err);
            toast({ title: "Error!", description: "Failed to save blog post.", variant: "destructive" });
        } finally {
            setIsMutating(false);
        }
    };

    const handleEdit = (blog: Blog) => {
        setEditingBlog(blog);
        form.reset({
            title: blog.title,
            slug: blog.slug,
            content: blog.content || '',
            category: (typeof blog.category === 'object' ? blog.category.id : blog.category) || '',
            featuredImage: blog.featuredImage || '',
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        try {
            await blogService.deleteBlog(id);
            toast({ title: "Success!", description: "Blog post deleted successfully." });
            fetchData();
        } catch (err) {
            toast({ title: "Error!", description: "Failed to delete blog post.", variant: "destructive" });
        }
    };

    const handleNewBlog = () => {
        setEditingBlog(null);
        form.reset();
        setIsModalOpen(true);
    };

    console.log(blogs);


    return (
        <div className="p-4 md:p-0">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="font-headline text-2xl">Blog Posts</CardTitle>
                        <CardDescription>Manage your blog content</CardDescription>
                    </div>
                    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                        <DialogTrigger asChild>
                            <Button onClick={handleNewBlog}>
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Add Blog Post
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>{editingBlog ? 'Edit Blog Post' : 'Add New Blog Post'}</DialogTitle>
                            </DialogHeader>
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
                                    <FormField
                                        control={form.control}
                                        name="title"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Title</FormLabel>
                                                <FormControl><Input placeholder="Enter blog title" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="category"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Category</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {categories.map((cat) => (
                                                            <SelectItem key={cat.id} value={cat.id}>{cat.title}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="featuredImage"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Featured Image URL</FormLabel>
                                                <FormControl><Input placeholder="https://example.com/image.jpg" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="content"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Content</FormLabel>
                                                <FormControl>
                                                    <TinyMceEditor
                                                        value={field.value || ''}
                                                        onEditorChange={field.onChange}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <div className="flex justify-end space-x-4">
                                        <DialogClose asChild>
                                            <Button type="button" variant="outline">
                                                Cancel
                                            </Button>
                                        </DialogClose>
                                        <Button type="submit" disabled={isMutating}>
                                            {isMutating ? 'Saving...' : (editingBlog ? "Update Post" : "Add Post")}
                                        </Button>
                                    </div>
                                </form>
                            </Form>
                        </DialogContent>
                    </Dialog>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <p>Loading blogs...</p>
                    ) : (
                        <>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Image</TableHead>
                                        <TableHead>Title</TableHead>
                                        <TableHead>Category</TableHead>
                                        <TableHead>Created</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {paginatedData.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center text-muted-foreground">
                                                No blog posts found.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        paginatedData.map((blog) => (
                                            <TableRow key={blog.id}>
                                                <TableCell>
                                                    {blog.featuredImage && (
                                                        <Image
                                                            src={blog.featuredImage}
                                                            alt={blog.title}
                                                            width={60}
                                                            height={40}
                                                            className="rounded object-cover"
                                                        />
                                                    )}
                                                </TableCell>
                                                <TableCell>{blog.title}</TableCell>
                                                <TableCell>{blog.category?.title || 'Uncategorized'}</TableCell>
                                                <TableCell>{format(new Date(blog.createdAt || new Date()), 'dd-MMM-yyyy')}</TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="ghost" size="icon" onClick={() => handleEdit(blog)}>
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
                                                                    This will permanently delete this blog post.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                <AlertDialogAction onClick={() => handleDelete(blog.id)}>
                                                                    Delete
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
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
    );
};

export default BlogsPage;
