"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User } from "@/types";
import { getCurrentUser } from "@/lib/auth";

interface UserContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);

  const fetchUser = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getCurrentUser();

      // Check different possible response structures
      if (response.success && response.user) {
        setUser(response.user);
      } else if (response.success && response.data) {
        setUser(response.data);
      } else if (response.user) {
        setUser(response.user);
      } else if (response.data) {
        setUser(response.data);
      } else {
        setUser(null);
      }
    } catch (err) {
      setError("Failed to fetch user");
      setUser(null);
    } finally {
      setLoading(false);
      setHasCheckedAuth(true);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  // Auto-refresh after OAuth redirect (client-side only)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const isOAuthRedirect = window.location.search.includes("oauth=success");

      if (isOAuthRedirect) {
        // Remove the oauth parameter from URL
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete("oauth");
        window.history.replaceState({}, "", newUrl.toString());

        // Fetch user data after a short delay
        setTimeout(() => {
          fetchUser();
        }, 1000);
      }
    }
  }, []);

  // Single retry after initial check if user is null (only once)
  useEffect(() => {
    if (hasCheckedAuth && !user && !loading && typeof window !== "undefined") {
      const timeout = setTimeout(() => {
        fetchUser();
      }, 3000); // Single retry after 3 seconds

      return () => clearTimeout(timeout);
    }
  }, [hasCheckedAuth, user, loading]);

  const value = {
    user,
    loading,
    error,
    refetch: fetchUser,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
