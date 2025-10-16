// TransactionFormFields.tsx - Form fields for transaction creation/editing
"use client";
import React from "react";
import { Control } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { User, Property } from "@/lib/services";

interface TransactionFormFieldsProps {
    control: Control<any>;
    users: User[];
    properties: Property[];
    editingTransaction?: any;
}

export const TransactionFormFields: React.FC<TransactionFormFieldsProps> = ({
    control,
    users,
    properties,
    editingTransaction,
}) => {
    return (
        <div className="space-y-6">
            {/* Transaction Type */}
            <FormField
                control={control}
                name="type"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Transaction Type *</FormLabel>
                        <FormControl>
                            <RadioGroup
                                onValueChange={field.onChange}
                                value={field.value}
                                className="flex gap-4"
                            >
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="service" id="service" />
                                    <Label htmlFor="service">Service</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="rent" id="rent" />
                                    <Label htmlFor="rent">Rent</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="contract" id="contract" />
                                    <Label htmlFor="contract">Contract</Label>
                                </div>
                            </RadioGroup>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            {/* From Account */}
            <FormField
                control={control}
                name="fromAccount"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>From Account (Payer) *</FormLabel>
                        <Select
                            onValueChange={field.onChange}
                            value={field.value}
                            defaultValue={field.value}
                        >
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select payer" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {users.map((user) => (
                                    <SelectItem key={user._id || user.id} value={user._id || user.id}>
                                        {user.name} ({user.email})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )}
            />

            {/* To Account */}
            <FormField
                control={control}
                name="toAccount"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>To Account (Receiver) *</FormLabel>
                        <Select
                            onValueChange={field.onChange}
                            value={field.value}
                            defaultValue={field.value}
                        >
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select receiver" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {users.map((user) => (
                                    <SelectItem key={user._id || user.id} value={user._id || user.id}>
                                        {user.name} ({user.email})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )}
            />

            {/* Property */}
            <FormField
                control={control}
                name="property"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Property *</FormLabel>
                        <Select
                            onValueChange={field.onChange}
                            value={field.value}
                            defaultValue={field.value}
                        >
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select property" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
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
                        <FormMessage />
                    </FormItem>
                )}
            />

            {/* Amount */}
            <FormField
                control={control}
                name="amount"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Amount *</FormLabel>
                        <FormControl>
                            <Input type="number" step="0.01" placeholder="0.00" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            {/* Currency */}
            <FormField
                control={control}
                name="currency"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Currency</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select currency" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="AED">AED</SelectItem>
                                <SelectItem value="USD">USD</SelectItem>
                                <SelectItem value="EUR">EUR</SelectItem>
                                <SelectItem value="GBP">GBP</SelectItem>
                                <SelectItem value="INR">INR</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )}
            />

            {/* Status */}
            <FormField
                control={control}
                name="status"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                                <SelectItem value="failed">Failed</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )}
            />

            {/* Transaction Date */}
            <FormField
                control={control}
                name="transactionDate"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Transaction Date</FormLabel>
                        <FormControl>
                            <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            {/* Due Date */}
            <FormField
                control={control}
                name="dueDate"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Due Date (Optional)</FormLabel>
                        <FormControl>
                            <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            {/* Payment Method */}
            <FormField
                control={control}
                name="paymentMethod"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Payment Method (Optional)</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select payment method" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="cash">Cash</SelectItem>
                                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                                <SelectItem value="cheque">Cheque</SelectItem>
                                <SelectItem value="online">Online Payment</SelectItem>
                                <SelectItem value="card">Card</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )}
            />

            {/* Description */}
            <FormField
                control={control}
                name="description"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Description (Optional)</FormLabel>
                        <FormControl>
                            <Textarea rows={3} placeholder="Transaction description" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            {/* Recurring Transaction */}
            <FormField
                control={control}
                name="isRecurring"
                render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-4">
                        <div>
                            <FormLabel>Recurring Transaction</FormLabel>
                            <FormDescription className="text-xs">
                                Is this a recurring payment?
                            </FormDescription>
                        </div>
                        <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                    </FormItem>
                )}
            />

            {/* Recurring Frequency (conditional) */}
            <FormField
                control={control}
                name="recurringFrequency"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Recurring Frequency</FormLabel>
                        <Select
                            onValueChange={field.onChange}
                            value={field.value}
                            defaultValue={field.value}
                            disabled={!control._formValues.isRecurring}
                        >
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select frequency" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="monthly">Monthly</SelectItem>
                                <SelectItem value="quarterly">Quarterly</SelectItem>
                                <SelectItem value="semi-annually">Semi-Annually</SelectItem>
                                <SelectItem value="annually">Annually</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormDescription className="text-xs">
                            Required if recurring is enabled
                        </FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />

            {/* Notes */}
            <FormField
                control={control}
                name="notes"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Notes (Optional)</FormLabel>
                        <FormControl>
                            <Textarea rows={3} placeholder="Additional notes" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </div>
    );
};

