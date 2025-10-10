
'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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
} from "@/components/ui/alert-dialog"
import { Pencil, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { useRouter } from 'next/navigation';
import { isAdmin } from '@/lib/jwt';
import { settingsService } from '@/lib/services';

const formSchema = z.object({
  title: z.string().min(1, "Setting title is required."),
  value: z.string().min(1, "Setting value is required."),
});

type Setting = {
  _id: string;
  title: string;
  value: string;
}

const SettingsPage = () => {
  const { toast } = useToast();
  const router = useRouter();
  const [editingSetting, setEditingSetting] = useState<Setting | null>(null);
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [addLoading, setAddLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);

  // Redirect non-admin users
  useEffect(() => {
    if (!isAdmin()) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access this page.",
        variant: "destructive",
      });
      router.push('/portal/dashboard');
    }
  }, [router, toast]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await settingsService.getAllSettings();
      setSettings(response.data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch settings'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleAddSetting = async (title: string, value: string) => {
    try {
      setAddLoading(true);
      await settingsService.createSetting({ title, value });
      toast({ title: "Success!", description: "Setting added successfully." });
      form.reset();
      setEditingSetting(null);
      fetchSettings();
    } catch (err) {
      toast({ title: "Error!", description: "Failed to add setting.", variant: "destructive" });
    } finally {
      setAddLoading(false);
    }
  };

  const handleUpdateSetting = async (id: string, title: string, value: string) => {
    try {
      setUpdateLoading(true);
      await settingsService.updateSetting(id, { title, value });
      toast({ title: "Success!", description: "Setting updated successfully." });
      form.reset();
      setEditingSetting(null);
      fetchSettings();
    } catch (err) {
      toast({ title: "Error!", description: "Failed to update setting.", variant: "destructive" });
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleDeleteSetting = async (id: string) => {
    try {
      await settingsService.deleteSetting(id);
      toast({ title: "Success!", description: "Setting deleted successfully." });
      fetchSettings();
    } catch (err) {
      toast({ title: "Error!", description: "Failed to delete setting.", variant: "destructive" });
    }
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { title: "", value: "" },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (editingSetting) {
      handleUpdateSetting(editingSetting._id, values.title, values.value);
    } else {
      handleAddSetting(values.title, values.value);
    }
  };

  const handleDelete = (id: string) => {
    handleDeleteSetting(id);
  };

  const handleEdit = (setting: Setting) => {
    setEditingSetting(setting);
    form.setValue("title", setting.title);
    form.setValue("value", setting.value);
  };

  const handleCancelEdit = () => {
    setEditingSetting(null);
    form.reset();
  };

  const isMutating = addLoading || updateLoading;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-4 md:p-0">
      <div className="md:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>{editingSetting ? 'Edit Setting' : 'Add Setting'}</CardTitle>
            <CardDescription>
              {editingSetting ? 'Update the setting title and value.' : 'Create a new application setting.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., contact_phone" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="value"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Value</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Enter the setting value" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex gap-2">
                  <Button type="submit" disabled={isMutating}>
                    {isMutating ? 'Saving...' : (editingSetting ? 'Update Setting' : 'Add Setting')}
                  </Button>
                  {editingSetting && (
                    <Button variant="outline" onClick={handleCancelEdit}>
                      Cancel
                    </Button>
                  )}
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
      <div className="md:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Existing Settings</CardTitle>
            <CardDescription>
              Here is a list of all your current application settings.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading && <p>Loading...</p>}
            {error && <p>Error loading settings: {error.message}</p>}
            {!loading && !error && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {settings.map((setting: Setting) => (
                    <TableRow key={setting._id}>
                      <TableCell className="font-mono text-xs">{setting.title}</TableCell>
                      <TableCell className="max-w-xs truncate">{setting.value}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(setting)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the setting.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(setting._id)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SettingsPage;
