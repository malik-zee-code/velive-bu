
'use client';
import { SidebarProvider, Sidebar, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarTrigger } from '@/components/ui/sidebar';
import { Header } from '@/components/landing/header';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MapPin, Tag, Building2, PanelLeft } from 'lucide-react';
import { useAuthenticationStatus } from '@nhost/react';
import { Footer } from '@/components/landing/footer';
import { Button } from '@/components/ui/button';

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
    const pathname = usePathname();
    const { isAuthenticated, isLoading } = useAuthenticationStatus();

    const navItems = [
        { href: '/admin/properties', label: 'Properties', icon: Building2 },
        { href: '/admin/categories', label: 'Categories', icon: Tag },
        { href: '/admin/locations', label: 'Locations', icon: MapPin },
    ];
    
    if (isLoading) {
        return (
          <div className="flex flex-col min-h-screen">
            <Header />
            <div className="flex-grow container mx-auto py-20 text-center max-w-7xl">
              <p>Loading...</p>
            </div>
            <Footer />
          </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div className="flex flex-col min-h-screen">
              <Header />
              <div className="flex-grow container mx-auto py-20 text-center max-w-7xl">
                <h2 className="text-2xl font-bold">Unauthorized</h2>
                <p>You must be signed in to view this page.</p>
              </div>
              <Footer />
            </div>
          );
    }


    return (
        <SidebarProvider>
            <div className="flex flex-col w-full min-h-screen bg-background">
                <Header />
                <div className="flex flex-1">
                    <Sidebar className='mt-20'>
                        <SidebarMenu className='pt-4'>
                            {navItems.map((item) => (
                                <SidebarMenuItem key={item.href} className="px-2 py-1">
                                    <Link href={item.href} passHref>
                                        <SidebarMenuButton
                                            isActive={pathname.startsWith(item.href)}
                                            className="w-full justify-start"
                                            tooltip={item.label}
                                        >
                                            <item.icon className="h-5 w-5 mr-3" />
                                            <span>{item.label}</span>
                                        </SidebarMenuButton>
                                    </Link>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </Sidebar>
                    <main className="flex-1 p-4 md:p-8 overflow-auto">
                        <div className="md:hidden mb-4">
                            <SidebarTrigger asChild>
                                <Button variant="outline" size="icon">
                                    <PanelLeft className="h-5 w-5" />
                                </Button>
                            </SidebarTrigger>
                        </div>
                        {children}
                    </main>
                </div>
            </div>
        </SidebarProvider>
    );
};

export default AdminLayout;
