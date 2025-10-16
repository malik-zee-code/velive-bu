'use client';
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Header } from '@/components/landing/header';
import { Footer } from '@/components/landing/footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { userService } from '@/lib/services';
import { ArrowLeft, Lock, CheckCircle, AlertCircle } from 'lucide-react';

const formSchema = z.object({
    newPassword: z.string().min(8, { message: "Password must be at least 8 characters." }),
    confirmPassword: z.string().min(8, { message: "Password must be at least 8 characters." }),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

const ResetPasswordPage = () => {
    const { toast } = useToast();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isLoading, setIsLoading] = useState(false);
    const [resetSuccess, setResetSuccess] = useState(false);
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        document.title = 'Reset Password | VE LIVE';
        const tokenParam = searchParams.get('token');
        setToken(tokenParam);

        if (!tokenParam) {
            toast({
                title: "Invalid Link",
                description: "No reset token found. Please request a new password reset link.",
                variant: "destructive",
            });
        }
    }, [searchParams, toast]);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            newPassword: "",
            confirmPassword: "",
        },
    });

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        if (!token) {
            toast({
                title: "Error",
                description: "Invalid or missing reset token.",
                variant: "destructive",
            });
            return;
        }

        try {
            setIsLoading(true);

            const response = await userService.resetPassword({
                token,
                newPassword: values.newPassword,
            });

            setResetSuccess(true);

            toast({
                title: "Password Reset!",
                description: response.data.message || "Your password has been reset successfully.",
            });

            // Redirect to sign in after 3 seconds
            setTimeout(() => {
                router.push('/auth/signin');
            }, 3000);
        } catch (e: any) {
            console.error(e);
            toast({
                title: "Reset Failed",
                description: e?.message || 'Failed to reset password. The link may have expired.',
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="flex flex-col min-h-screen">
                <Header />
                <main className="flex-grow py-20 bg-background">
                    <div className="container mx-auto max-w-7xl flex items-center justify-center">
                        <Card className="max-w-md w-full">
                            <CardHeader>
                                <CardTitle className="font-headline text-2xl">Invalid Reset Link</CardTitle>
                                <CardDescription>This password reset link is invalid or has expired.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-6 text-center">
                                    <div className="flex justify-center">
                                        <div className="rounded-full bg-red-100 p-4">
                                            <AlertCircle className="h-12 w-12 text-red-600" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-sm text-muted-foreground">
                                            The password reset link you're trying to use is invalid or has expired.
                                            Please request a new password reset link.
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <Link href="/auth/forgot-password" className="block">
                                            <Button className="w-full">
                                                Request New Link
                                            </Button>
                                        </Link>
                                        <Link href="/auth/signin" className="block">
                                            <Button variant="ghost" className="w-full">
                                                <ArrowLeft className="mr-2 h-4 w-4" />
                                                Back to Sign In
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow py-20 bg-background">
                <div className="container mx-auto max-w-7xl flex items-center justify-center">
                    <Card className="max-w-md w-full">
                        <CardHeader>
                            <CardTitle className="font-headline text-2xl">Reset Your Password</CardTitle>
                            <CardDescription>
                                {resetSuccess
                                    ? "Your password has been reset successfully"
                                    : "Enter your new password below"
                                }
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {resetSuccess ? (
                                <div className="space-y-6 text-center">
                                    <div className="flex justify-center">
                                        <div className="rounded-full bg-green-100 p-4">
                                            <CheckCircle className="h-12 w-12 text-green-600" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="font-semibold text-lg">Password Reset Successfully!</h3>
                                        <p className="text-sm text-muted-foreground">
                                            Your password has been reset. You can now sign in with your new password.
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-2">
                                            Redirecting to sign in page...
                                        </p>
                                    </div>
                                    <Link href="/auth/signin" className="block">
                                        <Button className="w-full">
                                            Go to Sign In
                                        </Button>
                                    </Link>
                                </div>
                            ) : (
                                <>
                                    <Form {...form}>
                                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                            <FormField
                                                control={form.control}
                                                name="newPassword"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>New Password</FormLabel>
                                                        <FormControl>
                                                            <div className="relative">
                                                                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                                <Input
                                                                    type="password"
                                                                    placeholder="Enter new password"
                                                                    className="pl-10"
                                                                    {...field}
                                                                />
                                                            </div>
                                                        </FormControl>
                                                        <FormDescription className="text-xs">
                                                            Must be at least 8 characters long
                                                        </FormDescription>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="confirmPassword"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Confirm Password</FormLabel>
                                                        <FormControl>
                                                            <div className="relative">
                                                                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                                <Input
                                                                    type="password"
                                                                    placeholder="Confirm new password"
                                                                    className="pl-10"
                                                                    {...field}
                                                                />
                                                            </div>
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <Button type="submit" disabled={isLoading} className="w-full">
                                                {isLoading ? "Resetting Password..." : "Reset Password"}
                                            </Button>
                                        </form>
                                    </Form>
                                    <div className="mt-6 text-center">
                                        <Link href="/auth/signin" className="text-sm text-primary hover:underline inline-flex items-center">
                                            <ArrowLeft className="mr-1 h-4 w-4" />
                                            Back to Sign In
                                        </Link>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default ResetPasswordPage;

