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
import { PlusCircle, MessageSquare } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { feedbackService, Feedback, FeedbackType, FeedbackStatus } from "@/lib/services";
import { Badge } from "@/components/ui/badge";

const formSchema = z.object({
  type: z.nativeEnum(FeedbackType),
  subject: z.string().min(1, { message: "Subject is required." }),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
});

const FeedbacksPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const { toast } = useToast();

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      const response = await feedbackService.getMyFeedbacks();
      setFeedbacks(response.data);
    } catch (err) {
      console.error("Failed to fetch feedbacks:", err);
      toast({ title: "Error", description: "Failed to load feedbacks", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: FeedbackType.FEEDBACK,
      subject: "",
      description: "",
      priority: "medium",
    },
  });

  const handleFormSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsMutating(true);
      await feedbackService.createFeedback(values);
      toast({ title: "Success!", description: "Feedback submitted successfully." });
      form.reset();
      setIsModalOpen(false);
      fetchFeedbacks();
    } catch (err) {
      console.error(err);
      toast({ title: "Error!", description: "Failed to submit feedback.", variant: "destructive" });
    } finally {
      setIsMutating(false);
    }
  };

  const getStatusBadge = (status: FeedbackStatus) => {
    const statusConfig = {
      [FeedbackStatus.PENDING]: { label: "Pending", className: "bg-yellow-500" },
      [FeedbackStatus.IN_PROGRESS]: { label: "In Progress", className: "bg-blue-500" },
      [FeedbackStatus.RESOLVED]: { label: "Resolved", className: "bg-green-500" },
      [FeedbackStatus.CLOSED]: { label: "Closed", className: "bg-gray-500" },
    };

    const config = statusConfig[status];
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const getTypeBadge = (type: FeedbackType) => {
    const typeConfig = {
      [FeedbackType.FEEDBACK]: { label: "Feedback", className: "bg-blue-100 text-blue-800" },
      [FeedbackType.COMPLAINT]: { label: "Complaint", className: "bg-red-100 text-red-800" },
      [FeedbackType.SUGGESTION]: {
        label: "Suggestion",
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
            <CardTitle className="font-headline text-2xl">My Feedbacks & Complaints</CardTitle>
            <CardDescription>Submit and track your feedback and complaints</CardDescription>
          </div>
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                New Feedback
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Submit Feedback</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
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
                            <SelectItem value={FeedbackType.FEEDBACK}>Feedback</SelectItem>
                            <SelectItem value={FeedbackType.COMPLAINT}>Complaint</SelectItem>
                            <SelectItem value={FeedbackType.SUGGESTION}>Suggestion</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subject</FormLabel>
                        <FormControl>
                          <Input placeholder="Brief subject of your feedback" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            rows={6}
                            placeholder="Describe your feedback in detail"
                            {...field}
                          />
                        </FormControl>
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
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end space-x-4">
                    <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isMutating}>
                      {isMutating ? "Submitting..." : "Submit Feedback"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading feedbacks...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {feedbacks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      No feedbacks found. Submit your first feedback!
                    </TableCell>
                  </TableRow>
                ) : (
                  feedbacks.map((feedback) => (
                    <TableRow key={feedback.id || feedback._id}>
                      <TableCell>{getTypeBadge(feedback.type)}</TableCell>
                      <TableCell className="font-medium">{feedback.subject}</TableCell>
                      <TableCell>{getStatusBadge(feedback.status)}</TableCell>
                      <TableCell className="capitalize">{feedback.priority}</TableCell>
                      <TableCell>{new Date(feedback.createdAt!).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSelectedFeedback(feedback)}
                        >
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={!!selectedFeedback} onOpenChange={() => setSelectedFeedback(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Feedback Details</DialogTitle>
          </DialogHeader>
          {selectedFeedback && (
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Subject</h4>
                <p>{selectedFeedback.subject}</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Description</h4>
                <p className="text-gray-700">{selectedFeedback.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Type</h4>
                  {getTypeBadge(selectedFeedback.type)}
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Status</h4>
                  {getStatusBadge(selectedFeedback.status)}
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Priority</h4>
                  <p className="capitalize">{selectedFeedback.priority}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Submitted</h4>
                  <p>{new Date(selectedFeedback.createdAt!).toLocaleString()}</p>
                </div>
              </div>
              {selectedFeedback.adminResponse && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2 text-blue-900">Admin Response</h4>
                  <p className="text-blue-800">{selectedFeedback.adminResponse}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FeedbacksPage;
