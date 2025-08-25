// src/app/admin/blogs/page.tsx
'use client';
import React, { useState, useEffect } from 'react';
import { useMutation, useQuery, gql } from '@apollo/client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useFileUpload } from '@nhost/nextjs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { nhost } from '@/lib/nhost';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Image from 'next/image';
import { Trash2, Pencil, PlusCircle } from 'lucide-react';
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
} from "@/components/ui/alert-dialog";
import { Skeleton } from '@/components/ui/skeleton';

const GET_BLOGS = gql`
  query GetBlogsAdmin {
    blogs(order_by: {created_at: desc}) {
      id
      title
      slug
      category_id
      blog_image
    }
  }
`;

const GET_BLOG_BY_ID = gql`
  query GetBlogById($id: bigint!) {
    blogs_by_pk(id: $id) {
      id
      title
      slug
      content
      category_id
      blog_image
    }
  }
`;

const GET_CATEGORIES = gql`
  query GetCategories {
    categories(order_by: {title: asc}) {
      id
      title
    }
  }
`;

const INSERT_BLOG = gql`
  mutation InsertBlog(
    $title: String!, 
    $slug: String!,
    $content: String, 
    $category_id: uuid!,
    $blog_image: uuid,
  ) {
    insert_blogs_one(object: {
      title: $title, 
      slug: $slug,
      content: $content, 
      category_id: $category_id,
      blog_image: $blog_image
    }) {
      id
    }
  }
`;

const UPDATE_BLOG = gql`
  mutation UpdateBlog($id: bigint!, $data: blogs_set_input!) {
    update_blogs_by_pk(pk_columns: {id: $id}, _set: $data) {
      id
    }
  }
`;

const DELETE_BLOG = gql`
  mutation DeleteBlog($id: bigint!) {
    delete_blogs_by_pk(id: $id) {
      id
    }
  }
`;

const formSchema = z.object({
  title: z.string().min(1, { message: "Title is required." }),
  slug: z.string().optional(),
  content: z.string().optional(),
  category_id: z.string().min(1, "Category is required."),
  blog_image: z.any().optional(),
});

type ImagePreview = {
  file: File;
  previewUrl: string;
};

const generateSlug = (title: string) => {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
}

const BlogForm = ({
    blog,
    categories,
    onFormSubmit,
    onCancel,
    isLoading,
    isMutating
}: {
    blog?: any;
    categories: any[];
    onFormSubmit: (values: z.infer<typeof formSchema>, imageFile?: File) => Promise<void>;
    onCancel: () => void;
    isLoading?: boolean;
    isMutating?: boolean;
}) => {
    const [imagePreview, setImagePreview] = useState<ImagePreview | null>(null);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: blog ? {
            title: blog.title || "",
            slug: blog.slug || "",
            content: blog.content || "",
            category_id: blog.category_id?.toString() || "",
        } : {
            title: "",
            slug: "",
            content: "",
            category_id: "",
        },
    });

    useEffect(() => {
        if (blog?.blog_image) {
            const imageUrl = nhost.storage.getPublicUrl({ fileId: blog.blog_image });
            if (imageUrl) {
                 setImagePreview({ file: new File([], ""), previewUrl: imageUrl });
            }
        }
    }, [blog]);

    useEffect(() => {
        return () => {
            if (imagePreview) {
                URL.revokeObjectURL(imagePreview.previewUrl);
            }
        };
    }, [imagePreview]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (imagePreview) {
                URL.revokeObjectURL(imagePreview.previewUrl);
            }
            setImagePreview({
                file,
                previewUrl: URL.createObjectURL(file),
            });
        }
    };

    const handleSubmit = async (values: z.infer<typeof formSchema>) => {
        await onFormSubmit(values, imagePreview?.file);
    };

    if (isLoading) {
        return <p>Loading blog data...</p>;
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
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
                    name="category_id"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Category</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                    <SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {categories.map((cat: any) => (
                                        <SelectItem key={cat.id} value={cat.id}>{cat.title}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control} name="content"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Content</FormLabel>
                            <FormControl><Textarea rows={10} placeholder="Write your blog content here..." {...field} value={field.value ?? ''} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormItem>
                    <FormLabel>Featured Image</FormLabel>
                    <FormControl><Input type="file" accept="image/*" onChange={handleFileChange} /></FormControl>
                    <FormMessage />
                </FormItem>
                {imagePreview && (
                    <div className="relative group">
                        <Image
                            src={imagePreview.previewUrl}
                            alt="Image Preview"
                            width={200}
                            height={150}
                            className="rounded-md object-cover w-full h-48"
                        />
                    </div>
                )}
                <div className="flex justify-end space-x-4">
                   {blog && (
                    <Button type="button" variant="outline" onClick={onCancel}>
                        Cancel
                    </Button>
                   )}
                    <Button type="submit" disabled={isMutating} className="w-48">
                        {isMutating ? 'Saving...' : (blog ? "Update Post" : "Add Post")}
                    </Button>
                </div>
            </form>
        </Form>
    )
}

const BlogEditForm = ({ blogId, onCancel, onFormSubmit, categories }: {
    blogId: string;
    onCancel: () => void;
    onFormSubmit: (values: z.infer<typeof formSchema>, imageFile?: File) => Promise<void>;
    categories: any[];
}) => {
    const { data, loading, error } = useQuery(GET_BLOG_BY_ID, {
        variables: { id: blogId },
    });

    if (loading) return <p>Loading post data...</p>;
    if (error) return <p>Error loading post: {error.message}</p>;

    return (
        <BlogForm
            blog={data.blogs_by_pk}
            categories={categories}
            onFormSubmit={onFormSubmit}
            onCancel={onCancel}
            isLoading={loading}
        />
    );
};

const BlogsPage = () => {
    const [editingBlogId, setEditingBlogId] = useState<string | null>(null);
    const { toast } = useToast();
    const { upload, isUploading, progress } = useFileUpload();

    const [insertBlog, { loading: insertLoading }] = useMutation(INSERT_BLOG);
    const [updateBlog, { loading: updateLoading }] = useMutation(UPDATE_BLOG);
    const [deleteBlog] = useMutation(DELETE_BLOG);

    const { data: blogsData, loading: blogsLoading, error: blogsError, refetch: refetchBlogs } = useQuery(GET_BLOGS);
    const { data: categoriesData, loading: categoriesLoading } = useQuery(GET_CATEGORIES);

    const handleFormSubmit = async (values: z.infer<typeof formSchema>, imageFile?: File) => {
        const slug = generateSlug(values.title);
        const submissionData: any = {
            ...values,
            slug,
            category_id: values.category_id,
        };
        delete submissionData.blog_image;

        try {
            if (imageFile && imageFile.size > 0) {
                 const { id, isError, error } = await upload({ file: imageFile });
                 if (isError) throw error;
                 submissionData.blog_image = id;
            }

            let currentBlogId = editingBlogId;

            if (currentBlogId) {
                await updateBlog({
                    variables: { id: currentBlogId, data: submissionData },
                });
                toast({ title: "Success!", description: "Blog post updated successfully." });
            } else {
                const { data } = await insertBlog({ variables: submissionData });
                currentBlogId = data.insert_blogs_one.id;
                toast({ title: "Success!", description: "Blog post has been added successfully." });
            }
            
            refetchBlogs();

            if (!editingBlogId && currentBlogId) {
                setEditingBlogId(currentBlogId);
            } else if (!editingBlogId) {
                handleAddNewClick(); 
            }

        } catch (e) {
            console.error(e);
            const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
            toast({ title: "Error!", description: `Failed to save post. ${errorMessage}`, variant: "destructive" });
        }
    };

    const handleDeleteBlog = async (blogId: string) => {
        try {
            await deleteBlog({ variables: { id: blogId } });
            toast({ title: "Success!", description: "Blog post deleted." });
            refetchBlogs();
            if (editingBlogId === blogId) {
                setEditingBlogId(null);
            }
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
            toast({ title: "Error!", description: `Failed to delete post. ${errorMessage}`, variant: "destructive" });
        }
    };

    const handleEditClick = (blogId: string) => {
        setEditingBlogId(blogId);
    };

    const handleAddNewClick = () => {
        setEditingBlogId(null);
    };
    
    const getCategoryTitle = (categoryId: string) => {
        if (!categoriesData) return '...';
        const category = categoriesData.categories.find((c: any) => c.id === categoryId);
        return category ? category.title : 'Uncategorized';
    };


    const isMutating = insertLoading || updateLoading || isUploading;
    const isLoading = categoriesLoading;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1 space-y-8">
                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle className="font-headline">{editingBlogId ? 'Edit Blog Post' : 'Add New Post'}</CardTitle>
                                <CardDescription>{editingBlogId ? 'Update the details of your blog post.' : 'Fill out the form to create a new post.'}</CardDescription>
                            </div>
                            {editingBlogId && (
                                <Button variant="outline" size="sm" onClick={handleAddNewClick}>
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    Add New
                                </Button>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? <p>Loading...</p> : (
                            editingBlogId ? (
                                <BlogEditForm
                                    key={editingBlogId}
                                    blogId={editingBlogId}
                                    onCancel={handleAddNewClick}
                                    onFormSubmit={handleFormSubmit}
                                    categories={categoriesData?.categories || []}
                                />
                            ) : (
                                <BlogForm
                                    categories={categoriesData?.categories || []}
                                    onFormSubmit={handleFormSubmit}
                                    onCancel={handleAddNewClick}
                                    isMutating={isMutating}
                                />
                            )
                        )}
                         {isUploading && <Progress value={progress} className="w-full mt-4" />}
                    </CardContent>
                </Card>
            </div>
            <div className="md:col-span-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Blog Posts</CardTitle>
                        <CardDescription>A list of all your blog posts.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {blogsLoading || categoriesLoading ? (
                            <div className="space-y-2">
                                <Skeleton className="h-12 w-full" />
                                <Skeleton className="h-12 w-full" />
                                <Skeleton className="h-12 w-full" />
                            </div>
                        ) : blogsError ? (
                            <p className="text-destructive">Error: {blogsError.message}</p>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Image</TableHead>
                                        <TableHead>Title</TableHead>
                                        <TableHead>Category</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {blogsData?.blogs.map((blog: any) => (
                                        <TableRow key={blog.id}>
                                            <TableCell>
                                                {blog.blog_image ? (
                                                    <Image
                                                        src={nhost.storage.getPublicUrl({ fileId: blog.blog_image })}
                                                        alt={blog.title}
                                                        width={64}
                                                        height={64}
                                                        className="rounded-md object-cover w-16 h-16"
                                                    />
                                                ) : (
                                                    <div className="w-16 h-16 bg-muted rounded-md flex items-center justify-center text-xs text-muted-foreground">
                                                        No Image
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell className="font-medium">{blog.title}</TableCell>
                                            <TableCell>{getCategoryTitle(blog.category_id)}</TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="icon" onClick={() => handleEditClick(blog.id)}>
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
                                                                This action cannot be undone. This will permanently delete the blog post.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => handleDeleteBlog(blog.id)}>
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

export default BlogsPage;
