// PropertyFormFields.tsx - Form fields for property creation/editing
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
import { isAdmin } from "@/lib/auth";
import { User } from "@/lib/services";
import { useAuth } from "@/contexts/AuthContext";
import { PDFUpload } from "@/components/common/PDFUpload";

interface PropertyFormFieldsProps {
    control: Control<any>;
    locations: Array<{ id: string; name: string }>;
    categories: Array<{ id: string; title: string }>;
    owners: User[];
    rentees: User[];
    editingProperty?: any; // For property ID in edit mode
    onFloorPlanFileSelect?: (file: File) => void;
    onInstallmentPlanFileSelect?: (file: File) => void;
    deleteFloorPlan?: boolean;
    setDeleteFloorPlan?: (value: boolean) => void;
    deleteInstallmentPlan?: boolean;
    setDeleteInstallmentPlan?: (value: boolean) => void;
}

export const PropertyFormFields: React.FC<PropertyFormFieldsProps> = ({
    control,
    locations,
    categories,
    owners,
    rentees,
    editingProperty,
    onFloorPlanFileSelect,
    onInstallmentPlanFileSelect,
    deleteFloorPlan,
    setDeleteFloorPlan,
    deleteInstallmentPlan,
    setDeleteInstallmentPlan,
}) => {
    const { user } = useAuth();

    // Check if user has admin or manager role
    const canManageOwners = user?.roles?.some((role: any) => {
        const roleName = typeof role === 'string' ? role : role.role || role.name;
        return roleName?.toLowerCase() === 'admin' || roleName?.toLowerCase() === 'manager';
    }) || false;
    return (
        <div className="space-y-6">
            {/* Listing Type */}
            <FormField
                control={control}
                name="listingType"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Listing Type</FormLabel>
                        <FormControl>
                            <RadioGroup
                                onValueChange={field.onChange}
                                value={field.value}
                                className="flex gap-4"
                            >
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="rent" id="rent" />
                                    <Label htmlFor="rent">For Rent</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="sale" id="sale" />
                                    <Label htmlFor="sale">For Sale</Label>
                                </div>
                            </RadioGroup>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            {/* Title */}
            <FormField
                control={control}
                name="title"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                            <Input placeholder="Property title" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            {/* Price */}
            <FormField
                control={control}
                name="price"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Price</FormLabel>
                        <FormControl>
                            <Input type="number" placeholder="0" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            {/* Location */}
            <FormField
                control={control}
                name="location"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Location</FormLabel>
                        <Select
                            onValueChange={field.onChange}
                            value={field.value}
                            defaultValue={field.value}
                            key={`location-${field.value}`}
                        >
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select location" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {locations.map((loc) => (
                                    <SelectItem key={loc.id} value={loc.id}>
                                        {loc.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )}
            />

            {/* Category */}
            <FormField
                control={control}
                name="category"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select
                            onValueChange={field.onChange}
                            value={field.value}
                            defaultValue={field.value}
                            key={`category-${field.value}`}
                        >
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {categories.map((cat) => (
                                    <SelectItem key={cat.id} value={cat.id}>
                                        {cat.title}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )}
            />

            {/* Owner - Only visible to Admin and Manager */}
            {canManageOwners && (
                <FormField
                    control={control}
                    name="owner"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Owner</FormLabel>
                            <Select
                                onValueChange={field.onChange}
                                value={field.value}
                                defaultValue={field.value}
                                key={`owner-${field.value}`}
                            >
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select owner" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {owners.map((owner: User) => (
                                        <SelectItem
                                            key={owner._id || owner.id}
                                            value={owner._id || owner.id}
                                        >
                                            {owner.name} ({owner.email})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            )}

            {/* Rentee - Only visible to Admin and Manager */}
            {canManageOwners && (
                <FormField
                    control={control}
                    name="rentee"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Rentee (Optional)</FormLabel>
                            <Select
                                onValueChange={field.onChange}
                                value={field.value}
                                defaultValue={field.value}
                                key={`rentee-${field.value}`}
                            >
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select rentee" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="none">None</SelectItem>
                                    {rentees.map((rentee: User) => (
                                        <SelectItem
                                            key={rentee._id || rentee.id}
                                            value={rentee._id || rentee.id}
                                        >
                                            {rentee.name} ({rentee.email})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            )}

            {/* Area */}
            <FormField
                control={control}
                name="areaInFeet"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Area (sqft)</FormLabel>
                        <FormControl>
                            <Input type="number" placeholder="0" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            {/* Bedrooms */}
            <FormField
                control={control}
                name="bedrooms"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Bedrooms</FormLabel>
                        <FormControl>
                            <Input type="number" placeholder="0" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            {/* Bathrooms */}
            <FormField
                control={control}
                name="bathrooms"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Bathrooms</FormLabel>
                        <FormControl>
                            <Input type="number" placeholder="0" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            {/* Tagline */}
            <FormField
                control={control}
                name="tagline"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Tagline</FormLabel>
                        <FormControl>
                            <Input placeholder="Short description" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            {/* Description */}
            <FormField
                control={control}
                name="longDescription"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                            <Textarea rows={4} placeholder="Property description" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            {/* Feature Toggles */}
            <div className="space-y-4">
                <FormField
                    control={control}
                    name="isFeatured"
                    render={({ field }) => (
                        <FormItem className="flex items-center justify-between rounded-lg border p-4">
                            <div>
                                <FormLabel>Featured</FormLabel>
                            </div>
                            <FormControl>
                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                        </FormItem>
                    )}
                />
                {/* Available toggle */}
                <FormField
                    control={control}
                    name="isAvailable"
                    render={({ field }) => (
                        <FormItem className="flex items-center justify-between rounded-lg border p-4">
                            <div>
                                <FormLabel>Available</FormLabel>
                            </div>
                            <FormControl>
                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                        </FormItem>
                    )}
                />
                {/* Approved toggle - only for admin/manager */}
                {isAdmin() && (
                    <FormField
                        control={control}
                        name="isApproved"
                        render={({ field }) => (
                            <FormItem className="flex items-center justify-between rounded-lg border p-4">
                                <div>
                                    <FormLabel>Approved</FormLabel>
                                    <p className="text-xs text-gray-500">
                                        Approve property for listing
                                    </p>
                                </div>
                                <FormControl>
                                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                )}
                <FormField
                    control={control}
                    name="isFurnished"
                    render={({ field }) => (
                        <FormItem className="flex items-center justify-between rounded-lg border p-4">
                            <div>
                                <FormLabel>Furnished</FormLabel>
                            </div>
                            <FormControl>
                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                        </FormItem>
                    )}
                />
            </div>

            {/* Reference Field */}
            <FormField
                control={control}
                name="reference"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Reference (Optional)</FormLabel>
                        <FormControl>
                            <Input
                                placeholder="Enter property reference number"
                                {...field}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            {/* PDF Upload Fields */}
            <div className="space-y-4">
                <h3 className="text-lg font-medium">Property Documents</h3>

                {/* Floor Plan PDF */}
                <FormField
                    control={control}
                    name="floorPlan"
                    render={({ field }) => (
                        <FormItem>
                            <PDFUpload
                                label="Floor Plan (PDF)"
                                value={field.value}
                                onChange={field.onChange}
                                propertyId={editingProperty?.id || editingProperty?._id}
                                fileType="floorPlan"
                                disabled={false} // Allow upload in both create and edit mode
                                onFileSelect={onFloorPlanFileSelect}
                                onMarkForDeletion={setDeleteFloorPlan}
                            />
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Installment Plan PDF */}
                <FormField
                    control={control}
                    name="installmentPlan"
                    render={({ field }) => (
                        <FormItem>
                            <PDFUpload
                                label="Installment Plan (PDF)"
                                value={field.value}
                                onChange={field.onChange}
                                propertyId={editingProperty?.id || editingProperty?._id}
                                fileType="installmentPlan"
                                disabled={false} // Allow upload in both create and edit mode
                                onFileSelect={onInstallmentPlanFileSelect}
                                onMarkForDeletion={setDeleteInstallmentPlan}
                            />
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
        </div>
    );
};

