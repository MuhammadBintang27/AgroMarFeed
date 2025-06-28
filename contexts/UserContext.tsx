"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
} from "react";
import { User } from "@/types";
import { getCurrentUser } from "@/lib/auth";

interface UserContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  clearUser: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasInitialized = useRef(false);
  const isFetching = useRef(false);

  const fetchUser = async () => {
    // Prevent multiple simultaneous calls
    if (isFetching.current) return;

    try {
      isFetching.current = true;
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
      isFetching.current = false;
    }
  };

  const clearUser = () => {
    setUser(null);
    setError(null);
    setLoading(false);
  };

  // Initial authentication check - only runs once
  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      fetchUser();
    }
  }, []);

  // Handle OAuth redirect - only runs if there's an OAuth parameter
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

  const value = {
    user,
    loading,
    error,
    refetch: fetchUser,
    clearUser,
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
