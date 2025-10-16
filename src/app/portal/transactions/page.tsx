// src/app/portal/transactions/page.tsx
"use client";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle, Filter, Download } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    transactionService,
    userService,
    propertyService,
    Transaction,
    User,
    Property,
} from "@/lib/services";
import { isAdmin } from "@/lib/auth";
import { TransactionFormFields } from "@/components/portal/TransactionFormFields";
import { TransactionsTable } from "@/components/portal/TransactionsTable";

const formSchema = z.object({
    type: z.enum(["service", "rent", "contract"]),
    fromAccount: z.string().min(1, "From account is required"),
    toAccount: z.string().min(1, "To account is required"),
    property: z.string().min(1, "Property is required"),
    amount: z.coerce.number().positive("Amount must be greater than 0"),
    currency: z.string().default("AED"),
    status: z.enum(["pending", "completed", "cancelled", "failed"]).default("pending"),
    transactionDate: z.string().optional(),
    dueDate: z.string().optional(),
    paymentMethod: z
        .enum(["cash", "bank_transfer", "cheque", "online", "card", "other"])
        .optional(),
    description: z.string().optional(),
    isRecurring: z.boolean().default(false),
    recurringFrequency: z
        .enum(["monthly", "quarterly", "semi-annually", "annually"])
        .optional(),
    notes: z.string().optional(),
});

const TransactionsPage = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);
    const [isMutating, setIsMutating] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [showFilters, setShowFilters] = useState(false);
    const { toast } = useToast();

    // Filter states
    const [filterType, setFilterType] = useState("all");
    const [filterStatus, setFilterStatus] = useState("all");
    const [filterProperty, setFilterProperty] = useState("all");
    const [filterStartDate, setFilterStartDate] = useState("");
    const [filterEndDate, setFilterEndDate] = useState("");

    const [statistics, setStatistics] = useState({
        totalAmount: 0,
        totalTransactions: 0,
        byType: {} as Record<string, number>,
        byStatus: {} as Record<string, number>,
    });

    const fetchData = async () => {
        try {
            setLoading(true);

            const filters: any = {
                page: currentPage,
                limit: 10,
                sortBy: "transactionDate",
                sortOrder: "desc",
            };

            if (filterType && filterType !== "all") filters.type = filterType;
            if (filterStatus && filterStatus !== "all") filters.status = filterStatus;
            if (filterProperty && filterProperty !== "all") filters.property = filterProperty;
            if (filterStartDate) filters.startDate = filterStartDate;
            if (filterEndDate) filters.endDate = filterEndDate;

            const [transactionsRes, usersRes, propertiesRes, statsRes] = await Promise.all([
                isAdmin() ? transactionService.getAllTransactions(filters) : transactionService.getMyTransactions(),
                userService.getAllUsers(),
                propertyService.getAllProperties(),
                transactionService.getStatistics(),
            ]);


            console.log("🔍 Debug - Transactions response:", transactionsRes);
            console.log("🔍 Debug - Statistic data:", statsRes.data);

            setTransactions(transactionsRes.data as any || []);
            setTotalPages(transactionsRes.data.pagination?.totalPages || 1);
            setUsers(usersRes.data || []);
            setProperties(propertiesRes.data || []);
            setStatistics(statsRes.data || { totalAmount: 0, totalTransactions: 0, byType: {}, byStatus: {} });
        } catch (err: any) {
            console.error("Failed to fetch data:", err);
            // Set fallback values
            setTransactions([]);
            setTotalPages(1);
            setUsers([]);
            setProperties([]);
            setStatistics({ totalAmount: 0, totalTransactions: 0, byType: {}, byStatus: {} });
            toast({
                title: "Error",
                description: "Failed to load transactions",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [currentPage, filterType, filterStatus, filterProperty, filterStartDate, filterEndDate]);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            type: "rent",
            fromAccount: "",
            toAccount: "",
            property: "",
            amount: 0,
            currency: "AED",
            status: "pending",
            transactionDate: new Date().toISOString().split("T")[0],
            dueDate: "",
            paymentMethod: undefined,
            description: "",
            isRecurring: false,
            recurringFrequency: undefined,
            notes: "",
        },
    });

    const handleFormSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            setIsMutating(true);

            const transactionData: any = {
                ...values,
                transactionDate: values.transactionDate || new Date().toISOString(),
            };

            if (editingTransaction) {
                await transactionService.updateTransaction(
                    editingTransaction.id || editingTransaction._id!,
                    transactionData
                );
                toast({ title: "Success!", description: "Transaction updated successfully." });
            } else {
                await transactionService.createTransaction(transactionData);
                toast({ title: "Success!", description: "Transaction created successfully." });
            }

            form.reset();
            setIsModalOpen(false);
            setEditingTransaction(null);
            fetchData();
        } catch (err: any) {
            console.error(err);
            toast({
                title: "Error!",
                description: err?.message || "Failed to save transaction.",
                variant: "destructive",
            });
        } finally {
            setIsMutating(false);
        }
    };

    const handleEdit = (transaction: Transaction) => {
        setEditingTransaction(transaction);

        const fromAccountId =
            typeof transaction.fromAccount === "object"
                ? transaction.fromAccount._id || transaction.fromAccount.id
                : transaction.fromAccount;

        const toAccountId =
            typeof transaction.toAccount === "object"
                ? transaction.toAccount._id || transaction.toAccount.id
                : transaction.toAccount;

        const propertyId =
            typeof transaction.property === "object"
                ? transaction.property._id || transaction.property.id
                : transaction.property;

        form.reset({
            type: transaction.type,
            fromAccount: fromAccountId,
            toAccount: toAccountId,
            property: propertyId,
            amount: transaction.amount,
            currency: transaction.currency || "AED",
            status: transaction.status,
            transactionDate: transaction.transactionDate
                ? new Date(transaction.transactionDate).toISOString().split("T")[0]
                : "",
            dueDate: transaction.dueDate
                ? new Date(transaction.dueDate).toISOString().split("T")[0]
                : "",
            paymentMethod: transaction.paymentMethod,
            description: transaction.description || "",
            isRecurring: transaction.isRecurring || false,
            recurringFrequency: transaction.recurringFrequency,
            notes: transaction.notes || "",
        });

        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this transaction?")) return;

        try {
            await transactionService.deleteTransaction(id);
            toast({ title: "Success!", description: "Transaction deleted successfully." });
            fetchData();
        } catch (err) {
            toast({
                title: "Error!",
                description: "Failed to delete transaction.",
                variant: "destructive",
            });
        }
    };

    const handleMarkCompleted = async (id: string) => {
        try {
            await transactionService.markAsCompleted(id, new Date().toISOString());
            toast({ title: "Success!", description: "Transaction marked as completed." });
            fetchData();
        } catch (err) {
            toast({
                title: "Error!",
                description: "Failed to mark as completed.",
                variant: "destructive",
            });
        }
    };

    const handleMarkCancelled = async (id: string) => {
        if (!confirm("Are you sure you want to cancel this transaction?")) return;

        try {
            await transactionService.markAsCancelled(id);
            toast({ title: "Success!", description: "Transaction cancelled successfully." });
            fetchData();
        } catch (err) {
            toast({
                title: "Error!",
                description: "Failed to cancel transaction.",
                variant: "destructive",
            });
        }
    };

    const handleNewTransaction = () => {
        setEditingTransaction(null);
        form.reset({
            type: "rent",
            fromAccount: "",
            toAccount: "",
            property: "",
            amount: 0,
            currency: "AED",
            status: "pending",
            transactionDate: new Date().toISOString().split("T")[0],
            dueDate: "",
            paymentMethod: undefined,
            description: "",
            isRecurring: false,
            recurringFrequency: undefined,
            notes: "",
        });
        setIsModalOpen(true);
    };

    const clearFilters = () => {
        setFilterType("all");
        setFilterStatus("all");
        setFilterProperty("all");
        setFilterStartDate("");
        setFilterEndDate("");
        setCurrentPage(1);
    };

    const adminAccess = isAdmin();

    return (
        <div className="p-2 md:p-0">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-4">
                <Card>
                    <CardHeader className="pb-1 pt-3">
                        <CardTitle className="text-xs font-medium text-gray-600">
                            Total Transactions
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-1">
                        <div className="text-lg font-bold">{statistics.totalTransactions}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-1 pt-3">
                        <CardTitle className="text-xs font-medium text-gray-600">
                            Total Amount
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-1">
                        <div className="text-lg font-bold">
                            AED {statistics.totalAmount.toLocaleString()}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-1 pt-3">
                        <CardTitle className="text-xs font-medium text-gray-600">Pending</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-1">
                        <div className="text-lg font-bold">{statistics.byStatus?.pending || 0}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-1 pt-3">
                        <CardTitle className="text-xs font-medium text-gray-600">
                            Completed
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-1">
                        <div className="text-lg font-bold">{statistics.byStatus?.completed || 0}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Card */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between py-3">
                    <div>
                        <CardTitle className="text-lg font-bold">Transactions</CardTitle>
                        <CardDescription className="text-sm text-gray-600">Manage financial transactions</CardDescription>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
                            <Filter className="mr-2 h-4 w-4" />
                            {showFilters ? "Hide" : "Show"} Filters
                        </Button>
                        {adminAccess && (
                            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                                <DialogTrigger asChild>
                                    <Button onClick={handleNewTransaction}>
                                        <PlusCircle className="mr-2 h-4 w-4" />
                                        Add Transaction
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                                    <DialogHeader>
                                        <DialogTitle>
                                            {editingTransaction ? "Edit Transaction" : "Add New Transaction"}
                                        </DialogTitle>
                                        <p className="text-sm text-gray-600">
                                            {editingTransaction
                                                ? "Update the transaction details."
                                                : "Create a new financial transaction."}
                                        </p>
                                    </DialogHeader>
                                    <Form {...form}>
                                        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
                                            <TransactionFormFields
                                                control={form.control}
                                                users={users}
                                                properties={properties}
                                                editingTransaction={editingTransaction}
                                            />

                                            <div className="flex justify-end space-x-4">
                                                <DialogClose asChild>
                                                    <Button type="button" variant="outline">
                                                        Cancel
                                                    </Button>
                                                </DialogClose>
                                                <Button type="submit" disabled={isMutating}>
                                                    {isMutating
                                                        ? "Saving..."
                                                        : editingTransaction
                                                            ? "Update"
                                                            : "Create Transaction"}
                                                </Button>
                                            </div>
                                        </form>
                                    </Form>
                                </DialogContent>
                            </Dialog>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    {/* Filters */}
                    {showFilters && (
                        <Card className="mb-4 bg-gray-50">
                            <CardContent className="pt-3 pb-3">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <div>
                                        <Label>Type</Label>
                                        <Select value={filterType} onValueChange={setFilterType}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="All types" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Types</SelectItem>
                                                <SelectItem value="service">Service</SelectItem>
                                                <SelectItem value="rent">Rent</SelectItem>
                                                <SelectItem value="contract">Contract</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <Label>Status</Label>
                                        <Select value={filterStatus} onValueChange={setFilterStatus}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="All statuses" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Statuses</SelectItem>
                                                <SelectItem value="pending">Pending</SelectItem>
                                                <SelectItem value="completed">Completed</SelectItem>
                                                <SelectItem value="cancelled">Cancelled</SelectItem>
                                                <SelectItem value="failed">Failed</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <Label>Property</Label>
                                        <Select value={filterProperty} onValueChange={setFilterProperty}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="All properties" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Properties</SelectItem>
                                                {properties.map((property) => (
                                                    <SelectItem
                                                        key={property._id || property.id}
                                                        value={property._id || property.id}
                                                    >
                                                        {property.title}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <Label>Start Date</Label>
                                        <Input
                                            type="date"
                                            value={filterStartDate}
                                            onChange={(e) => setFilterStartDate(e.target.value)}
                                        />
                                    </div>

                                    <div>
                                        <Label>End Date</Label>
                                        <Input
                                            type="date"
                                            value={filterEndDate}
                                            onChange={(e) => setFilterEndDate(e.target.value)}
                                        />
                                    </div>

                                    <div className="flex items-end">
                                        <Button variant="outline" onClick={clearFilters} className="w-full">
                                            Clear Filters
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Transactions Table */}
                    <TransactionsTable
                        transactions={transactions}
                        loading={loading}
                        onEdit={adminAccess ? handleEdit : undefined}
                        onDelete={adminAccess ? handleDelete : undefined}
                        onMarkCompleted={adminAccess ? handleMarkCompleted : undefined}
                        onMarkCancelled={adminAccess ? handleMarkCancelled : undefined}
                        page={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />
                </CardContent>
            </Card>
        </div>
    );
};

export default TransactionsPage;

