
// src/app/blog/page.tsx
'use client';
import { Header } from '@/components/landing/header';
import { Footer } from '@/components/landing/footer';
import { BlogHero } from '@/components/blog/hero';
import { BlogCard } from '@/components/blog/blog-card';
import { Skeleton } from '@/components/ui/skeleton';
import { useState, useEffect } from 'react';
import { blogService } from '@/lib/services';
import type { Metadata } from 'next';

// Since this is now a client component, we can set the title via useEffect
// export const metadata: Metadata = {
//   title: 'Blog',
// };

const BlogPage = () => {
    const [blogs, setBlogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const fetchBlogs = async () => {
            try {
                setLoading(true);
                const response = await blogService.getAllBlogs();
                setBlogs(response.data);
                setError(null);
            } catch (err) {
                setError(err instanceof Error ? err : new Error('Failed to fetch blogs'));
            } finally {
                setLoading(false);
            }
        };

        fetchBlogs();
    }, []);

    return (
        <div className="flex flex-col min-h-screen bg-background">
            <Header />
            <main>
                <BlogHero />
                <section className="py-20">
                    <div className="container mx-auto max-w-7xl">
                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {[...Array(3)].map((_, i) => (
                                    <div key={i} className="flex flex-col space-y-3">
                                        <Skeleton className="h-[225px] w-full rounded-xl" />
                                        <div className="space-y-2">
                                            <Skeleton className="h-4 w-[250px]" />
                                            <Skeleton className="h-4 w-[200px]" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : error ? (
                            <p className="text-center text-destructive">Error loading blog posts: {error.message}</p>
                        ) : blogs.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {blogs.map((post: any) => (
                                    <BlogCard key={post._id} post={post} />
                                ))}
                            </div>
                        ) : (
                            <p className="text-center text-muted-foreground">No blog posts found.</p>
                        )}
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
};

export default BlogPage;
