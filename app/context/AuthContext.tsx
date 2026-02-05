"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { login as apiLogin, logout as apiLogout, getProfile, type AuthUser } from "@/lib/api";
import { toast } from "sonner";
import Loading from "../components/Loading";

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  const checkAuth = async () => {
    try {
      setLoading(true);
      setError(null);
      const userData = await getProfile();
      setUser(userData);
    } catch (err) {
      setUser(null);
      setError(err instanceof Error ? err.message : "Not Authenticated. Please log in.");
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiLogin(email, password);
      setUser(response.user);
      toast.success("Login successful!");
      router.push("/");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login failed";
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      setError(null);
      await apiLogout();
      setUser(null);
      toast.success("You have been logged out.");
      router.push("/login");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Logout failed";
      setError(message);
      toast.error(message);
      setUser(null);
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (pathname !== "/login" && pathname !== "/register") {
      checkAuth();
    } else {
      setLoading(false);
    }
  }, [pathname]);

  const value: AuthContextType = {
    user,
    loading,
    error,
    login,
    logout,
    checkAuth,
  };

  if (loading) {
    return (
      <Loading />
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}