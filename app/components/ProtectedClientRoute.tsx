"use client";

import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface ProtectedClientRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectTo?: string;
}

export function ProtectedClientRoute({
  children,
  fallback,
  redirectTo = "/login"
}: ProtectedClientRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push(redirectTo as any);
    }
  }, [user, loading, router, redirectTo]);

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  // Show fallback or nothing if not authenticated
  if (!user) {
    return fallback || null;
  }

  // Render children if authenticated
  return <>{children}</>;
}

// Hook for checking authentication status in client components
export function useAuthStatus() {
  const { user, loading, error } = useAuth();

  return {
    isAuthenticated: !!user,
    isLoading: loading,
    user,
    error,
    isAdmin: user?.role === 'admin',
    isDriver: user?.role === 'driver',
    isDispatcher: user?.role === 'dispatcher',
  };
}