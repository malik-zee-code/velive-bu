
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Phone, Mail, MapPin, Send } from 'lucide-react';
import Image from 'next/image';

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  subject: z.string().min(1, 'Subject is required'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

const contactInfo = [
    { icon: <MapPin className="w-6 h-6 text-primary" />, title: "Our Location", value: "25/B Milford Road, Dubai, UAE" },
    { icon: <Mail className="w-6 h-6 text-primary" />, title: "Email Address", value: "info@example.com" },
    { icon: <Phone className="w-6 h-6 text-primary" />, title: "Phone Number", value: "+971 123 654 7898" },
];

export const ContactDetails = () => {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: '', email: '', subject: '', message: '' },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    console.log(values);
    toast({ title: 'Message Sent!', description: "We'll get back to you soon." });
    form.reset();
  };

  return (
    <section className="py-20">
      <div className="container mx-auto max-w-7xl">
        <div className="grid md:grid-cols-2 gap-12">
            <div>
                <Card>
                    <CardHeader>
                        <CardTitle>Get In Touch</CardTitle>
                        <CardDescription>Fill out the form below and we will get back to you as soon as possible.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid sm:grid-cols-2 gap-6">
                                <FormField control={form.control} name="name" render={({ field }) => (
                                    <FormItem><FormLabel>Your Name</FormLabel><FormControl><Input placeholder="John Doe" {...field} /></FormControl><FormMessage /></FormItem>
                                )}/>
                                <FormField control={form.control} name="email" render={({ field }) => (
                                    <FormItem><FormLabel>Your Email</FormLabel><FormControl><Input placeholder="john@example.com" {...field} /></FormControl><FormMessage /></FormItem>
                                )}/>
                            </div>
                            <FormField control={form.control} name="subject" render={({ field }) => (
                                <FormItem><FormLabel>Subject</FormLabel><FormControl><Input placeholder="Subject of your message" {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                            <FormField control={form.control} name="message" render={({ field }) => (
                                <FormItem><FormLabel>Message</FormLabel><FormControl><Textarea placeholder="Type your message here..." rows={5} {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                            <Button type="submit" size="lg" className="w-full" style={{ backgroundColor: 'hsl(var(--accent))', color: 'hsl(var(--accent-foreground))' }}>
                                <Send className="mr-2 h-5 w-5"/>
                                Send Message
                            </Button>
                        </form>
                        </Form>
                    </CardContent>
                </Card>
            </div>
            <div className="space-y-8">
                <div>
                    <h2 className="text-3xl font-bold font-headline text-foreground">Contact Information</h2>
                    <p className="mt-2 text-muted-foreground">Find us at the following address and contact details.</p>
                </div>
                <div className="space-y-6">
                    {contactInfo.map((info) => (
                        <div key={info.title} className="flex items-start gap-4">
                            <div className="bg-primary/10 p-4 rounded-lg">
                                {info.icon}
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg text-foreground">{info.title}</h3>
                                <p className="text-muted-foreground">{info.value}</p>
                            </div>
                        </div>
                    ))}
                </div>
                 <div className="mt-8">
                    <Image src="https://placehold.co/600x400.png" alt="Map" width={600} height={400} className="rounded-lg shadow-lg w-full" data-ai-hint="map location" />
                </div>
            </div>
        </div>
      </div>
    </section>
  );
};
