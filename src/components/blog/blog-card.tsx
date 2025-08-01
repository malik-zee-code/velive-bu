
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, User, Calendar } from 'lucide-react';

interface BlogCardProps {
  post: {
    slug: string;
    image: string;
    category: string;
    title: string;
    author: string;
    date: string;
  };
}

export const BlogCard = ({ post }: BlogCardProps) => {
  return (
    <Card className="overflow-hidden flex flex-col h-full group transition-all duration-300 hover:shadow-xl bg-card text-card-foreground border-border">
      <div className="relative">
        <Link href={`/blog/${post.slug}`}>
          <Image
            src={post.image}
            alt={post.title}
            width={400}
            height={250}
            className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-300"
            data-ai-hint="blog post image"
          />
        </Link>
        <Badge className="absolute top-4 left-4" style={{ backgroundColor: 'hsl(var(--accent))', color: 'hsl(var(--accent-foreground))' }}>{post.category}</Badge>
      </div>
      <CardContent className="p-6 flex-grow flex flex-col">
        <div className="flex-grow">
          <div className="flex items-center text-sm text-muted-foreground mb-4 space-x-4">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>By {post.author}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{post.date}</span>
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
