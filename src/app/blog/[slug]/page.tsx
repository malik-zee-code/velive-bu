
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Header } from '@/components/landing/header';
import { Footer } from '@/components/landing/footer';
import { blogPosts } from '@/lib/blog-data';
import Image from 'next/image';
import { Calendar, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

type Props = {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = blogPosts.find((p) => p.slug === params.slug);

  if (!post) {
    return {
      title: 'Post Not Found',
    }
  }

  return {
    title: post.title,
    description: post.content.substring(0, 160),
  }
}

export async function generateStaticParams() {
  return blogPosts.map((post) => ({
    slug: post.slug,
  }));
}

const BlogPostPage = ({ params }: Props) => {
  const post = blogPosts.find((p) => p.slug === params.slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main>
        <section className="relative py-20 md:py-32 bg-card text-card-foreground">
            <Image
                src={post.image}
                alt={post.title}
                layout="fill"
                objectFit="cover"
                className="absolute inset-0 z-0"
                data-ai-hint="blog post image"
            />
            <div className="absolute inset-0 bg-black/70" />
            <div className="container relative mx-auto text-center">
                <div className="max-w-4xl mx-auto">
                <Badge style={{ backgroundColor: 'hsl(var(--accent))', color: 'hsl(var(--accent-foreground))' }} className="mb-4">{post.category}</Badge>
                <h1 className="text-4xl md:text-6xl font-bold font-headline tracking-tight text-white mb-4">
                    {post.title}
                </h1>
                <div className="flex items-center justify-center text-sm text-white/80 space-x-4">
                    <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>By {post.author}</span>
                    </div>
                    <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{post.date}</span>
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
  );
};

export default BlogPostPage;
