
// src/app/blog/[slug]/page.tsx
'use client';
import { Suspense } from 'react';
import { notFound, useParams } from 'next/navigation';
import { Header } from '@/components/landing/header';
import { Footer } from '@/components/landing/footer';
import Image from 'next/image';
import { Calendar, User } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { gql, useQuery } from '@apollo/client';
import { nhost } from '@/lib/nhost';
import { Skeleton } from '@/components/ui/skeleton';

const GET_BLOG_BY_SLUG = gql`
  query GetBlogBySlug($slug: String!) {
    blogs(where: {slug: {_eq: $slug}}) {
      id
      title
      content
      created_at
      blog_image
      user {
        displayName
      }
    }
  }
`;

const BlogPostPageContent = () => {
    const params = useParams();
    const slug = params.slug as string;

    const { data, loading, error } = useQuery(GET_BLOG_BY_SLUG, {
        variables: { slug },
        skip: !slug,
    });
    
    if (loading) {
        return (
             <div className="flex flex-col min-h-screen bg-background">
                <Header />
                <main>
                    <Skeleton className="h-80 w-full" />
                    <section className="py-20">
                        <div className="container mx-auto max-w-4xl">
                            <Card className="p-8 md:p-12 space-y-4">
                               <Skeleton className="h-8 w-3/4" />
                               <Skeleton className="h-4 w-1/2" />
                               <Skeleton className="h-4 w-full" />
                               <Skeleton className="h-4 w-full" />
                               <Skeleton className="h-4 w-5/6" />
                            </Card>
                        </div>
                    </section>
                </main>
                <Footer />
            </div>
        )
    }

    if (error) {
        return <p>Error: {error.message}</p>;
    }
    
    const post = data?.blogs[0];

    if (!post) {
        return notFound();
    }
    
    const imageUrl = post.blog_image ? nhost.storage.getPublicUrl({ fileId: post.blog_image }) : 'https://placehold.co/1200x600.png';
    const postDate = new Date(post.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });


    return (
         <div className="flex flex-col min-h-screen bg-background">
            <Header />
            <main>
                <section className="relative py-20 md:py-32 bg-card text-card-foreground">
                    <Image
                        src={imageUrl}
                        alt={post.title}
                        layout="fill"
                        objectFit="cover"
                        className="absolute inset-0 z-0"
                        data-ai-hint="blog post image"
                    />
                    <div className="absolute inset-0 bg-black/70" />
                    <div className="container relative mx-auto text-center">
                        <div className="max-w-4xl mx-auto">
                        <h1 className="text-4xl md:text-6xl font-bold font-headline tracking-tight text-white mb-4">
                            {post.title}
                        </h1>
                        <div className="flex items-center justify-center text-sm text-white/80 space-x-4">
                            <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            <span>By {post.user?.displayName || 'Admin'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>{postDate}</span>
                            </div>
                        </div>
                        </div>
                    </div>
                </section>

                <section className="py-20">
                <div className="container mx-auto max-w-4xl">
                    <Card className="p-8 md:p-12">
                        <div 
                            className="prose max-w-none text-card-foreground dark:prose-invert prose-headings:font-headline prose-p:text-muted-foreground prose-h3:text-foreground prose-h4:text-foreground"
                            dangerouslySetInnerHTML={{ __html: post.content }} 
                        />
                    </Card>
                </div>
                </section>
            </main>
            <Footer />
        </div>
    )
}


const BlogPostPage = () => {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <BlogPostPageContent />
        </Suspense>
    )
}

export default BlogPostPage;
