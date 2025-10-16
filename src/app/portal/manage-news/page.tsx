"use client";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Trash2, Pencil, PlusCircle } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { newsService, News, NewsType, NewsPriority } from "@/lib/services";
import { Badge } from "@/components/ui/badge";

const formSchema = z.object({
  title: z.string().min(1, { message: "Title is required." }),
  content: z.string().min(10, { message: "Content must be at least 10 characters." }),
  type: z.nativeEnum(NewsType),
  priority: z.nativeEnum(NewsPriority),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  expiresAt: z.string().optional(),
});

const ManageNewsPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNews, setEditingNews] = useState<News | null>(null);
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);
  const { toast } = useToast();

  const fetchNews = async () => {
    try {
      setLoading(true);
      const response = await newsService.getAllNews(1, 100);
      setNews(response.data);
    } catch (err) {
      console.error("Failed to fetch news:", err);
      toast({ title: "Error", description: "Failed to load news", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      content: "",
      type: NewsType.NEWS,
      priority: NewsPriority.MEDIUM,
      isActive: true,
      isFeatured: false,
      expiresAt: "",
    },
  });

  const handleFormSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsMutating(true);
      const newsData = {
        ...values,
        expiresAt: values.expiresAt || undefined,
      };

      if (editingNews) {
        await newsService.updateNews(editingNews.id || editingNews._id || '', newsData);
        toast({ title: "Success!", description: "News updated successfully." });
      } else {
        await newsService.createNews(newsData);
        toast({ title: "Success!", description: "News created successfully." });
      }

      form.reset();
      setIsModalOpen(false);
      setEditingNews(null);
      fetchNews();
    } catch (err) {
      console.error(err);
      toast({ title: "Error!", description: "Failed to save news.", variant: "destructive" });
    } finally {
      setIsMutating(false);
    }
  };

  const handleEdit = (newsItem: News) => {
    setEditingNews(newsItem);
    form.reset({
      title: newsItem.title,
      content: newsItem.content,
      type: newsItem.type,
      priority: newsItem.priority,
      isActive: newsItem.isActive,
      isFeatured: newsItem.isFeatured,
      expiresAt: newsItem.expiresAt ? newsItem.expiresAt.split("T")[0] : "",
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await newsService.deleteNews(id);
      toast({ title: "Success!", description: "News deleted successfully." });
      fetchNews();
    } catch (err) {
      toast({ title: "Error!", description: "Failed to delete news.", variant: "destructive" });
    }
  };

  const handleNewNews = () => {
    setEditingNews(null);
    form.reset({
      title: "",
      content: "",
      type: NewsType.NEWS,
      priority: NewsPriority.MEDIUM,
      isActive: true,
      expiresAt: "",
    });
    setIsModalOpen(true);
  };

  const getTypeBadge = (type: NewsType) => {
    const typeConfig = {
      [NewsType.NEWS]: { label: "News", className: "bg-blue-100 text-blue-800" },
      [NewsType.ALERT]: { label: "Alert", className: "bg-red-100 text-red-800" },
      [NewsType.ANNOUNCEMENT]: {
        label: "Announcement",
        className: "bg-purple-100 text-purple-800",
      },
    };

    const config = typeConfig[type];
    return (
      <Badge variant="outline" className={config.className}>
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="p-4 md:p-0">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="font-headline text-2xl">Manage News & Alerts</CardTitle>
            <CardDescription>Create and manage news and alerts for users</CardDescription>
          </div>
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleNewNews}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add News
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingNews ? "Edit News" : "Add New News"}</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input placeholder="News title" {...field} />
                        </FormControl>
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
                          <Textarea rows={6} placeholder="News content" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Type</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value={NewsType.NEWS}>News</SelectItem>
                              <SelectItem value={NewsType.ALERT}>Alert</SelectItem>
                              <SelectItem value={NewsType.ANNOUNCEMENT}>Announcement</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="priority"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Priority</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select priority" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value={NewsPriority.LOW}>Low</SelectItem>
                              <SelectItem value={NewsPriority.MEDIUM}>Medium</SelectItem>
                              <SelectItem value={NewsPriority.HIGH}>High</SelectItem>
                              <SelectItem value={NewsPriority.URGENT}>Urgent</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="expiresAt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Expires At (Optional)</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-4">
                        <div>
                          <FormLabel>Active</FormLabel>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="isFeatured"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-4">
                        <div>
                          <FormLabel>Featured</FormLabel>
                          <p className="text-sm text-gray-500">Show on dashboard</p>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
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
                      {isMutating ? "Saving..." : editingNews ? "Update" : "Create"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading news...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Featured</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {news.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      No news found.
                    </TableCell>
                  </TableRow>
                ) : (
                  news.map((item) => (
                    <TableRow key={item.id || item._id}>
                      <TableCell className="font-medium">{item.title}</TableCell>
                      <TableCell>{getTypeBadge(item.type)}</TableCell>
                      <TableCell className="capitalize">{item.priority}</TableCell>
                      <TableCell>
                        <Badge variant={item.isActive ? "default" : "secondary"}>
                          {item.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={item.isFeatured ? "default" : "outline"}>
                          {item.isFeatured ? "Featured" : "Normal"}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(item.createdAt!).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}>
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
                                This will permanently delete this news item.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(item.id || item._id || '')}>
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
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ManageNewsPage;
