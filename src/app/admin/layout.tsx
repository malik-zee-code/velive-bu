'use client';
import { SidebarProvider, Sidebar, SidebarTrigger, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import { Header } from '@/components/landing/header';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, MapPin, Tag, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthenticationStatus } from '@nhost/react';
import { Footer } from '@/components/landing/footer';

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
          <div className="flex-grow bg-background">
            <Header />
            <div className="container mx-auto py-20 text-center max-w-7xl">
              <p>Loading...</p>
            </div>
            <Footer />
          </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div className="flex-grow bg-background">
              <Header />
              <div className="container mx-auto py-20 text-center max-w-7xl">
                <h2 className="text-2xl font-bold">Unauthorized</h2>
                <p>You must be signed in to view this page.</p>
              </div>
              <Footer />
            </div>
          );
    }


    return (
        <SidebarProvider>
            <div className="flex flex-col min-h-screen bg-background">
                <Header />
                <div className="flex flex-1">
                    <Sidebar>
                        <SidebarMenu>
                            {navItems.map((item) => (
                                <SidebarMenuItem key={item.href}>
                                    <Link href={item.href} passHref>
                                        <SidebarMenuButton
                                            isActive={pathname === item.href}
                                            className="w-full justify-start"
                                        >
                                            <item.icon className="h-5 w-5 mr-3" />
                                            <span>{item.label}</span>
                                        </SidebarMenuButton>
                                    </Link>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </Sidebar>
                    <main className="flex-1 p-8 overflow-auto">
                        {children}
                    </main>
                </div>
            </div>
        </SidebarProvider>
    );
};

export default AdminLayout;
