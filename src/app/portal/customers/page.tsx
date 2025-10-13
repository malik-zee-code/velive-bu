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
  DialogClose,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Pencil, PlusCircle, Mail, User, Copy, Check } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MultiSelect } from "@/components/ui/multi-select";
import { userService, roleService, type Role } from "@/lib/services";

const editFormSchema = z.object({
  name: z.string().optional(),
  disabled: z.boolean().default(false),
  roles: z.array(z.string()).min(1, { message: "At least one role is required." }),
});

const createFormSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  name: z
    .string()
    .min(1, { message: "Name is required." })
    .regex(/^[\p{L}\p{N}\p{S} ,.'-]+$/u, {
      message: "Name can only contain letters, numbers, spaces, and basic punctuation (,.'-)",
    }),
  roles: z.array(z.string()).min(1, { message: "At least one role is required." }),
});

/**
 * Generates a random secure password
 */
function generateRandomPassword(length: number = 12): string {
  const lowercase = "abcdefghijklmnopqrstuvwxyz";
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numbers = "0123456789";
  const special = "!@#$%^&*";
  const all = lowercase + uppercase + numbers + special;

  let password = "";
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += special[Math.floor(Math.random() * special.length)];

  for (let i = password.length; i < length; i++) {
    password += all[Math.floor(Math.random() * all.length)];
  }

  return password
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");
}

const CustomersPage = () => {
  const { toast } = useToast();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [generatedPassword, setGeneratedPassword] = useState<string>("");
  const [passwordCopied, setPasswordCopied] = useState(false);

  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [rolesLoading, setRolesLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const editForm = useForm<z.infer<typeof editFormSchema>>({
    resolver: zodResolver(editFormSchema),
    defaultValues: {
      name: "",
      disabled: false,
      roles: [],
    },
  });

  const createForm = useForm<z.infer<typeof createFormSchema>>({
    resolver: zodResolver(createFormSchema),
    defaultValues: {
      email: "",
      name: "",
      roles: [],
    },
  });

  // Fetch users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await userService.getAllUsers();
      setUsers(response.data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch users"));
    } finally {
      setLoading(false);
    }
  };

  // Fetch roles
  const fetchRoles = async () => {
    try {
      setRolesLoading(true);
      const response = await roleService.getAllRoles();
      setRoles(response.data);
    } catch (err) {
      console.error("Failed to fetch roles:", err);
      toast({
        title: "Warning",
        description: "Failed to load roles. Please try again.",
        variant: "destructive",
      });
    } finally {
      setRolesLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  const handleEdit = (user: any) => {
    setSelectedUser(user);

    // User roles come as role objects from backend with id and role fields
    // Extract the IDs to match with MultiSelect options
    const userRoleIds =
      user.roles
        ?.map((role: any) => {
          if (typeof role === "string") {
            // If it's a string, try to match by role name
            const matchingRole = roles.find((r) => r.role === role);
            return matchingRole?.id || matchingRole?._id;
          }
          // If it's an object, extract the ID
          return role.id || role._id;
        })
        .filter(Boolean) || [];

    editForm.reset({
      name: user.name || "",
      disabled: user.disabled || false,
      roles: userRoleIds,
    });
    setIsEditModalOpen(true);
  };

  const onEditSubmit = async (values: z.infer<typeof editFormSchema>) => {
    if (!selectedUser) return;
    console.log("values.roles", values.roles);
    try {
      await userService.updateUser(selectedUser._id || selectedUser.id, {
        name: values.name,
        roles: values.roles,
      });

      toast({
        title: "Success!",
        description: "User updated successfully.",
      });

      setIsEditModalOpen(false);
      fetchUsers();
    } catch (e) {
      console.error(e);
      toast({
        title: "Error!",
        description: "Failed to update user.",
        variant: "destructive",
      });
    }
  };

  const copyPasswordToClipboard = (password: string) => {
    navigator.clipboard.writeText(password);
    setPasswordCopied(true);
    setTimeout(() => setPasswordCopied(false), 2000); // Reset after 2 seconds
  };

  const onCreateSubmit = async (values: z.infer<typeof createFormSchema>) => {
    try {
      // Generate random password
      const password = generateRandomPassword();
      setGeneratedPassword(password);
      console.log("values.roles", values.roles);

      // Use REST API to create user
      await userService.register({
        name: values.name,
        email: values.email,
        password: password,
        roles: values.roles,
      });

      toast({
        title: "Success!",
        description: (
          <div className="flex flex-col gap-2">
            <p>User created successfully.</p>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">Password:</span>
              <div
                className="flex items-center gap-2 bg-muted p-2 rounded cursor-pointer hover:bg-muted/80 transition-colors"
                onClick={() => copyPasswordToClipboard(password)}
                title="Click to copy"
              >
                <code className="flex-1 font-mono text-sm font-semibold">{password}</code>
                {passwordCopied ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </div>
              {passwordCopied && (
                <span className="text-xs text-green-600 font-medium">Password copied!</span>
              )}
            </div>
          </div>
        ),
        duration: 15000, // Show for 15 seconds so admin can copy
      });

      createForm.reset();
      setIsCreateModalOpen(false);
      fetchUsers();
    } catch (e) {
      console.error(e);
      const errorMessage = e instanceof Error ? e.message : "Failed to create user";
      toast({
        title: "Error!",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 max-w-7xl">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-64" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 max-w-7xl">
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-destructive">Error loading customers: {error.message}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  console.log(users);

  return (
    <div className="container mx-auto py-8 max-w-7xl">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="font-headline text-2xl">Customers</CardTitle>
            <CardDescription>Manage customer accounts</CardDescription>
          </div>
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Customer
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Customer</DialogTitle>
              </DialogHeader>
              <Form {...createForm}>
                <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
                  <FormField
                    control={createForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="customer@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createForm.control}
                    name="roles"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Roles</FormLabel>
                        <FormControl>
                          <MultiSelect
                            options={roles.map((role) => ({
                              label: role.role,
                              value: role.id,
                            }))}
                            selected={field.value}
                            onChange={field.onChange}
                            placeholder="Select roles..."
                            disabled={rolesLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <p className="text-sm text-muted-foreground">
                    A random secure password will be generated automatically.
                  </p>
                  <div className="flex justify-end gap-2">
                    <DialogClose asChild>
                      <Button type="button" variant="outline">
                        Cancel
                      </Button>
                    </DialogClose>
                    <Button type="submit">Create Customer</Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Roles</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    No customers found.
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user: any) => (
                  <TableRow key={user._id}>
                    <TableCell className="font-medium">{user.email}</TableCell>
                    <TableCell>{user.name || "-"}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {user.roles && user.roles.length > 0 ? (
                          user.roles.map((role: any, index: number) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                            >
                              {typeof role === "string" ? role : role.role || role.name}
                            </span>
                          ))
                        ) : (
                          <span className="text-muted-foreground text-sm">No roles</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800`}
                      >
                        Active
                      </span>
                    </TableCell>
                    <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(user)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Customer</DialogTitle>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="roles"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Roles</FormLabel>
                    <FormControl>
                      <MultiSelect
                        options={roles.map((role) => ({
                          label: role.role,
                          value: role.id,
                        }))}
                        selected={field.value}
                        onChange={field.onChange}
                        placeholder="Select roles..."
                        disabled={rolesLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="disabled"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      value={field.value ? "disabled" : "active"}
                      onValueChange={(value) => field.onChange(value === "disabled")}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="disabled">Disabled</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-2">
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </DialogClose>
                <Button type="submit">Save Changes</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CustomersPage;
