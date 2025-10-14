"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from "react";
import { User } from "@/lib/services/userService";
import {
  getUser,
  isAuthenticated as checkAuth,
  logout as authLogout,
  shouldRefreshToken,
  refreshAccessToken,
} from "@/lib/auth";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  logout: () => void;
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const refreshUser = () => {
    const storedUser = getUser();
    const authenticated = checkAuth();

    setUser(storedUser);
    setIsAuthenticated(authenticated);
  };

  // Background token refresh
  const checkAndRefreshToken = async () => {
    if (shouldRefreshToken()) {
      console.log("Token is about to expire, refreshing...");
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        console.log("Token refreshed successfully");
        refreshUser();
      } else {
        console.log("Token refresh failed, logging out");
        logout();
      }
    }
  };

  useEffect(() => {
    refreshUser();
    setIsLoading(false);

    // Check token every minute
    refreshIntervalRef.current = setInterval(() => {
      checkAndRefreshToken();
    }, 60000); // Check every 60 seconds

    // Cleanup interval on unmount
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, []);

  const logout = () => {
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
    }
    authLogout();
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
