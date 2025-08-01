
import { Header } from '@/components/landing/header';
import { Footer } from '@/components/landing/footer';
import { BlogHero } from '@/components/blog/hero';
import { BlogCard } from '@/components/blog/blog-card';

const mockPosts = [
    {
        slug: 'how-to-find-the-perfect-place',
        image: '/assets/images/blog/01.jpg',
        category: 'Travel',
        title: 'How to Find the Perfect Place to Live in a New City',
        author: 'Admin',
        date: 'June 8, 2024',
    },
    {
        slug: 'top-10-restaurants-to-visit',
        image: '/assets/images/blog/02.jpg',
        category: 'Food',
        title: 'Top 10 Restaurants to Visit in Your City This Summer',
        author: 'Admin',
        date: 'June 15, 2024',
    },
    {
        slug: 'exploring-hidden-gems-in-your-city',
        image: '/assets/images/blog/03.jpg',
        category: 'Discovery',
        title: 'Exploring Hidden Gems: A Guide to Local Secrets',
        author: 'Admin',
        date: 'June 22, 2024',
    },
     {
        slug: 'how-to-find-the-perfect-place-4',
        image: '/assets/images/blog/01.jpg',
        category: 'Travel',
        title: 'How to Find the Perfect Place to Live in a New City',
        author: 'Admin',
        date: 'June 8, 2024',
    },
    {
        slug: 'top-10-restaurants-to-visit-5',
        image: '/assets/images/blog/02.jpg',
        category: 'Food',
        title: 'Top 10 Restaurants to Visit in Your City This Summer',
        author: 'Admin',
        date: 'June 15, 2024',
    },
    {
        slug: 'exploring-hidden-gems-in-your-city-6',
        image: '/assets/images/blog/03.jpg',
        category: 'Discovery',
        title: 'Exploring Hidden Gems: A Guide to Local Secrets',
        author: 'Admin',
        date: 'June 22, 2024',
    },
];

const BlogPage = () => {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main>
        <BlogHero />
        <section className="py-20">
          <div className="container mx-auto max-w-7xl">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {mockPosts.map((post) => (
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
