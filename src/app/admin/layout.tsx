
'use client';
import { SidebarProvider, Sidebar, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarTrigger } from '@/components/ui/sidebar';
import { Header } from '@/components/landing/header';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { MapPin, Tag, Building2, PanelLeft, Globe, LayoutDashboard, LogOut } from 'lucide-react';
import { useAuthenticationStatus, useSignOut } from '@nhost/nextjs';
import { Footer } from '@/components/landing/footer';
import { Button } from '@/components/ui/button';
import { useEffect } from 'react';

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
    const pathname = usePathname();
    const router = useRouter();
    const { isAuthenticated, isLoading } = useAuthenticationStatus();
    const { signOut } = useSignOut();

    const navItems = [
        { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/admin/properties', label: 'Properties', icon: Building2 },
        { href: '/admin/categories', label: 'Categories', icon: Tag },
        { href: '/admin/locations', label: 'Locations', icon: MapPin },
        { href: '/admin/countries', label: 'Countries', icon: Globe },
    ];

    const handleSignOut = async () => {
        await signOut();
        router.push('/');
    };
    
    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/auth/signin');
        }
    }, [isLoading, isAuthenticated, router]);

    if (isLoading || !isAuthenticated) {
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


    return (
        <SidebarProvider>
            <div className="flex flex-col w-full min-h-screen bg-background">
                <Header />
                <div className="flex flex-1">
                    <Sidebar className='mt-20'>
                        <SidebarMenu className='pt-4 flex flex-col justify-between'>
                            <div>
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
                            </div>
                             <div>
                                <SidebarMenuItem className="px-2 py-1 mt-auto">
                                    <SidebarMenuButton
                                        onClick={handleSignOut}
                                        className="w-full justify-start"
                                        tooltip="Sign Out"
                                    >
                                        <LogOut className="h-5 w-5 mr-3" />
                                        <span>Sign Out</span>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            </div>
                        </SidebarMenu>
                    </Sidebar>
                    <main className="flex-1 p-4 md:p-8 overflow-auto">
                        <div className="md:hidden mb-4">
                            <SidebarTrigger>
                                <PanelLeft className="h-5 w-5" />
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
