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

  const fetchUser = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getCurrentUser();
      console.log("Auth response:", response); // Debug log

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
        console.log("No user data found in response");
        setUser(null);
      }
    } catch (err) {
      console.error("Error fetching user:", err);
      setError("Failed to fetch user");
      setUser(null);
    } finally {
      setLoading(false);
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
        console.log("OAuth redirect detected, refreshing user data...");
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

  // Polling for authentication status (especially after OAuth)
  useEffect(() => {
    if (typeof window === "undefined") return; // Skip on server-side

    let interval: NodeJS.Timeout;

    // If user is null and we're not loading, start polling
    if (!user && !loading) {
      interval = setInterval(() => {
        console.log("Polling for user authentication...");
        fetchUser();
      }, 2000); // Check every 2 seconds
    }

    // Stop polling after 10 seconds or when user is found
    const timeout = setTimeout(() => {
      if (interval) {
        clearInterval(interval);
        console.log("Stopped polling for authentication");
      }
    }, 10000);

    return () => {
      if (interval) clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [user, loading]);

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
