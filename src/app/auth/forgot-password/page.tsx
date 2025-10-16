'use client';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import { Header } from '@/components/landing/header';
import { Footer } from '@/components/landing/footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { userService } from '@/lib/services';
import { ArrowLeft, Mail, CheckCircle } from 'lucide-react';

const formSchema = z.object({
    email: z.string().email({ message: "Invalid email address." }),
});

const ForgotPasswordPage = () => {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);

    React.useEffect(() => {
        document.title = 'Forgot Password | VE LIVE';
    }, []);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
        },
    });

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            setIsLoading(true);

            const response = await userService.forgotPassword(values.email);

            setEmailSent(true);

            toast({
                title: "Email Sent!",
                description: response.data.message || "Password reset instructions have been sent to your email.",
            });
        } catch (e: any) {
            console.error(e);
            toast({
                title: "Error",
                description: e?.message || 'Failed to send reset email. Please try again.',
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow py-20 bg-background">
                <div className="container mx-auto max-w-7xl flex items-center justify-center">
                    <Card className="max-w-md w-full">
                        <CardHeader>
                            <CardTitle className="font-headline text-2xl">Forgot Password</CardTitle>
                            <CardDescription>
                                {emailSent
                                    ? "Check your email for reset instructions"
                                    : "Enter your email to receive password reset instructions"
                                }
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {emailSent ? (
                                <div className="space-y-6 text-center">
                                    <div className="flex justify-center">
                                        <div className="rounded-full bg-green-100 p-4">
                                            <CheckCircle className="h-12 w-12 text-green-600" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="font-semibold text-lg">Email Sent!</h3>
                                        <p className="text-sm text-muted-foreground">
                                            We've sent password reset instructions to <strong>{form.getValues('email')}</strong>.
                                            Please check your inbox and spam folder.
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <Button
                                            variant="outline"
                                            className="w-full"
                                            onClick={() => setEmailSent(false)}
                                        >
                                            Try Another Email
                                        </Button>
                                        <Link href="/auth/signin" className="block">
                                            <Button variant="ghost" className="w-full">
                                                <ArrowLeft className="mr-2 h-4 w-4" />
                                                Back to Sign In
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <Form {...form}>
                                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                            <FormField
                                                control={form.control}
                                                name="email"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Email Address</FormLabel>
                                                        <FormControl>
                                                            <div className="relative">
                                                                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                                <Input
                                                                    type="email"
                                                                    placeholder="Enter your email"
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
                                                {isLoading ? "Sending..." : "Send Reset Instructions"}
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

export default ForgotPasswordPage;

