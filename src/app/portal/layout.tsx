"use client";
import {
  SidebarProvider,
  Sidebar,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Header } from "@/components/landing/header";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  MapPin,
  Tag,
  Building2,
  PanelLeft,
  Globe,
  LayoutDashboard,
  LogOut,
  Cog,
  Rss,
  Users,
  MessageSquare,
  Bell,
  FileText,
  DollarSign,
} from "lucide-react";
import { Footer } from "@/components/landing/footer";
import { Button } from "@/components/ui/button";
import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { userService } from "@/lib/services";

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const [userRole, setUserRole] = useState<string[]>([]);

  // Get user role from context
  useEffect(() => {
    if (user?.roles && user.roles.length > 0) {
      setUserRole(user.roles);
    }
  }, [user]);

  // All navigation items
  const allNavItems = [
    {
      href: "/portal/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      roles: ["rentee", "service", "manager", "owner"],
    },
    {
      href: "/portal/properties",
      label: "Properties",
      icon: Building2,
      roles: ["rentee", "manager", "owner"],
    },
    {
      href: "/portal/transactions",
      label: "Transactions",
      icon: DollarSign,
      roles: ["admin", "manager", "owner", "rentee"],
    },
    {
      href: "/portal/my-documents",
      label: "My Documents",
      icon: FileText,
      roles: ["rentee", "service", "owner"],
    },
    { href: "/portal/customers", label: "Customers", icon: Users, roles: ["manager"] },
    { href: "/portal/categories", label: "Categories", icon: Tag, roles: ["manager"] },
    { href: "/portal/locations", label: "Locations", icon: MapPin, roles: ["manager"] },
    { href: "/portal/countries", label: "Countries", icon: Globe, roles: ["manager"] },
    { href: "/portal/blogs", label: "Blogs", icon: Rss, roles: ["manager"] },
    {
      href: "/portal/feedbacks",
      label: "Feedbacks",
      icon: MessageSquare,
      roles: ["rentee", "service", "manager", "owner"],
    },
    {
      href: "/portal/manage-feedbacks",
      label: "Manage Feedbacks",
      icon: MessageSquare,
      roles: ["manager"],
    },
    {
      href: "/portal/news",
      label: "News & Alerts",
      icon: Bell,
      roles: ["rentee", "service", "manager", "owner"],
    },
    {
      href: "/portal/manage-news",
      label: "Manage News",
      icon: Bell,
      roles: ["manager"],
    },
    { href: "/portal/settings", label: "Settings", icon: Cog, roles: ["manager"] },
  ];

  // Filter nav items based on user role
  const navItems = useMemo(() => {
    if (!userRole) return [];

    return allNavItems.filter((item) => userRole.some((role) => item.roles.includes(role)));
  }, [userRole]);

  const handleSignOut = async () => {
    try {
      await userService.logout();
    } catch (err) {
      console.error("Logout error:", err);
    }
    logout();
    router.push("/");
  };

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/auth/signin");
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
          <Sidebar className="mt-20">
            <SidebarMenu className="pt-4 flex flex-col justify-between">
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
