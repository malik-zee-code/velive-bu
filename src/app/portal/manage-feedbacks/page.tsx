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
import { Edit, MessageSquare, Filter, Search } from "lucide-react";
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
import { useAuth } from "@/contexts/AuthContext";
import { isAdmin } from "@/lib/jwt";

const updateSchema = z.object({
  status: z.nativeEnum(FeedbackStatus),
  adminResponse: z.string().optional(),
});

const FeedbacksManagementPage = () => {
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      const response = await feedbackService.getAllFeedbacks();
      setFeedbacks(response.data);
    } catch (err) {
      console.error("Failed to fetch feedbacks:", err);
      toast({ title: "Error", description: "Failed to load feedbacks", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin()) {
      fetchFeedbacks();
    }
  }, [isAdmin()]);

  const form = useForm<z.infer<typeof updateSchema>>({
    resolver: zodResolver(updateSchema),
    defaultValues: {
      status: FeedbackStatus.PENDING,
      adminResponse: "",
    },
  });

  const handleUpdateSubmit = async (values: z.infer<typeof updateSchema>) => {
    if (!selectedFeedback) return;

    try {
      setIsMutating(true);
      await feedbackService.updateFeedback(selectedFeedback.id || selectedFeedback._id!, {
        status: values.status,
        adminResponse: values.adminResponse,
      });
      toast({ title: "Success!", description: "Feedback updated successfully." });
      form.reset();
      setIsUpdateModalOpen(false);
      setSelectedFeedback(null);
      fetchFeedbacks();
    } catch (err) {
      console.error(err);
      toast({ title: "Error!", description: "Failed to update feedback.", variant: "destructive" });
    } finally {
      setIsMutating(false);
    }
  };

  const handleEditFeedback = (feedback: Feedback) => {
    setSelectedFeedback(feedback);
    form.reset({
      status: feedback.status,
      adminResponse: feedback.adminResponse || "",
    });
    setIsUpdateModalOpen(true);
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

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      low: { label: "Low", className: "bg-green-100 text-green-800" },
      medium: { label: "Medium", className: "bg-yellow-100 text-yellow-800" },
      high: { label: "High", className: "bg-red-100 text-red-800" },
    };

    const config = priorityConfig[priority as keyof typeof priorityConfig];
    return (
      <Badge variant="outline" className={config.className}>
        {config.label}
      </Badge>
    );
  };

  // Filter feedbacks based on search and filters
  const filteredFeedbacks = feedbacks.filter((feedback) => {
    const matchesSearch =
      feedback.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      feedback.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || feedback.status === statusFilter;
    const matchesType = typeFilter === "all" || feedback.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  if (!isAdmin) {
    return (
      <div className="p-4 md:p-0">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h2>
              <p className="text-gray-600">You don't have permission to access this page.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-0">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Manage Feedbacks & Complaints</CardTitle>
          <CardDescription>View and manage all feedback and complaints from users</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="mb-6 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search feedbacks..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value={FeedbackStatus.PENDING}>Pending</SelectItem>
                  <SelectItem value={FeedbackStatus.IN_PROGRESS}>In Progress</SelectItem>
                  <SelectItem value={FeedbackStatus.RESOLVED}>Resolved</SelectItem>
                  <SelectItem value={FeedbackStatus.CLOSED}>Closed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value={FeedbackType.FEEDBACK}>Feedback</SelectItem>
                  <SelectItem value={FeedbackType.COMPLAINT}>Complaint</SelectItem>
                  <SelectItem value={FeedbackType.SUGGESTION}>Suggestion</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

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
                  <TableHead>User</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFeedbacks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      No feedbacks found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredFeedbacks.map((feedback) => (
                    <TableRow key={feedback.id || feedback._id}>
                      <TableCell>{getTypeBadge(feedback.type)}</TableCell>
                      <TableCell className="font-medium">{feedback.subject}</TableCell>
                      <TableCell>{getStatusBadge(feedback.status)}</TableCell>
                      <TableCell>{getPriorityBadge(feedback.priority || "")}</TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {feedback.user.name} ({feedback.user.email})
                      </TableCell>
                      <TableCell>{new Date(feedback.createdAt!).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSelectedFeedback(feedback)}
                          >
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditFeedback(feedback)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
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
      <Dialog
        open={!!selectedFeedback && !isUpdateModalOpen}
        onOpenChange={() => setSelectedFeedback(null)}
      >
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
                  {getPriorityBadge(selectedFeedback.priority || "")}
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

      {/* Update Dialog */}
      <Dialog open={isUpdateModalOpen} onOpenChange={setIsUpdateModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Update Feedback</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleUpdateSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={FeedbackStatus.PENDING}>Pending</SelectItem>
                        <SelectItem value={FeedbackStatus.IN_PROGRESS}>In Progress</SelectItem>
                        <SelectItem value={FeedbackStatus.RESOLVED}>Resolved</SelectItem>
                        <SelectItem value={FeedbackStatus.CLOSED}>Closed</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="adminResponse"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Admin Response</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={4}
                        placeholder="Add your response to the user..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-4">
                <Button type="button" variant="outline" onClick={() => setIsUpdateModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isMutating}>
                  {isMutating ? "Updating..." : "Update Feedback"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FeedbacksManagementPage;
