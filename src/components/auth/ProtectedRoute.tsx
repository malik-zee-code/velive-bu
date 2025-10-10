'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requireAdmin?: boolean;
}

export const ProtectedRoute = ({ children, requireAdmin = false }: ProtectedRouteProps) => {
    const router = useRouter();
    const { isAuthenticated, user, isLoading } = useAuth();

    useEffect(() => {
        if (!isLoading) {
            if (!isAuthenticated) {
                router.push('/auth/signin');
            } else if (requireAdmin) {
                const isAdmin = user?.roles?.includes('admin') || user?.roles?.includes('manager');
                if (!isAdmin) {
                    router.push('/portal/dashboard');
                }
            }
        }
    }, [isAuthenticated, user, isLoading, requireAdmin, router]);

    if (isLoading) {
        return (
            <div className="container mx-auto py-20 text-center max-w-7xl">
                <Skeleton className="h-64 w-full" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return null;
    }

    if (requireAdmin) {
        const isAdmin = user?.roles?.includes('admin') || user?.roles?.includes('manager');
        if (!isAdmin) {
            return null;
        }
    }

    return <>{children}</>;
};

