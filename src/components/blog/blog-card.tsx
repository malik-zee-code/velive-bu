
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, User, Calendar } from 'lucide-react';

interface BlogCardProps {
  post: {
    id?: string;
    _id?: string;
    slug: string;
    blog_image?: string;
    featuredImage?: string;
    title: string;
    user?: {
      displayName: string;
    }
    created_at?: string;
    createdAt?: string;
  };
}

export const BlogCard = ({ post }: BlogCardProps) => {
  const imageUrl = post.featuredImage || post.blog_image || 'https://placehold.co/400x250.png';

  const postDate = new Date(post.createdAt || post.created_at || Date.now()).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Card className="overflow-hidden flex flex-col h-full group transition-all duration-300 hover:shadow-xl bg-card text-card-foreground border-border">
      <div className="relative">
        <Link href={`/blog/${post.slug}`}>
          <Image
            src={imageUrl}
            alt={post.title}
            width={400}
            height={250}
            className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-300"
            data-ai-hint="blog post image"
          />
        </Link>
      </div>
      <CardContent className="p-6 flex-grow flex flex-col">
        <div className="flex-grow">
          <div className="flex items-center text-sm text-muted-foreground mb-4 space-x-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{postDate}</span>
            </div>
          </div>
          <h3 className="font-bold font-headline text-xl mb-4 text-foreground">
            <Link href={`/blog/${post.slug}`} className="hover:text-primary transition-colors">{post.title}</Link>
          </h3>
        </div>
        <div className="mt-auto">
          <Button asChild variant="link" className="p-0 h-auto text-primary">
            <Link href={`/blog/${post.slug}`}>Read More <ArrowRight className="ml-2 w-4 h-4" /></Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
