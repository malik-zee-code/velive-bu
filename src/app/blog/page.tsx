
import { Header } from '@/components/landing/header';
import { Footer } from '@/components/landing/footer';
import { BlogHero } from '@/components/blog/hero';
import { BlogCard } from '@/components/blog/blog-card';
import { blogPosts } from '@/lib/blog-data';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog',
};

const BlogPage = () => {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main>
        <BlogHero />
        <section className="py-20">
          <div className="container mx-auto max-w-7xl">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogPosts.map((post) => (
                <BlogCard key={post.slug} post={post} />
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default BlogPage;
