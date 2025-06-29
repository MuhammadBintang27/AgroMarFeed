"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
} from "react";
import { User } from "@/types";
import { getCurrentUser, validateOAuthToken } from "@/lib/auth";

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
  const isOAuthProcessing = useRef(false);

  const fetchUser = async () => {
    // Prevent multiple simultaneous calls
    if (isFetching.current) return;

    try {
      isFetching.current = true;
      setLoading(true);
      setError(null);

      console.log("🔄 Fetching user data...");
      const response = await getCurrentUser();
      console.log("📡 User data response:", response);

      // Check different possible response structures
      if (response.success && response.user) {
        console.log("✅ User data found:", response.user);
        setUser(response.user);
        setError(null);
      } else if (response.success && response.data) {
        console.log("✅ User data found (data field):", response.data);
        setUser(response.data);
        setError(null);
      } else if (response.user) {
        console.log("✅ User data found (direct user):", response.user);
        setUser(response.user);
        setError(null);
      } else if (response.data) {
        console.log("✅ User data found (direct data):", response.data);
        setUser(response.data);
        setError(null);
      } else {
        console.log("❌ No user data found in response");
        setUser(null);
        setError("No user data found");
      }
    } catch (err) {
      console.error("❌ Failed to fetch user:", err);
      setError("Failed to fetch user");
      setUser(null);
    } finally {
      setLoading(false);
      isFetching.current = false;
    }
  };

  const refetch = async () => {
    // Reset fetching flag to allow immediate refetch
    isFetching.current = false;
    // Add a small delay before refetching to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 500));
    await fetchUser();
  };

  const clearUser = () => {
    setUser(null);
    setError(null);
    setLoading(false);
  };

  // Initial authentication check - only runs once and only if not processing OAuth
  useEffect(() => {
    if (!hasInitialized.current && !isOAuthProcessing.current) {
      hasInitialized.current = true;
      fetchUser();
    }
  }, []);

  // Handle OAuth redirect - only runs if there's an OAuth parameter
  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const isOAuthSuccess = urlParams.get("oauth") === "success";
      const oauthToken = urlParams.get("token");

      if (isOAuthSuccess && oauthToken) {
        console.log("🔄 OAuth redirect detected with token, validating...");
        isOAuthProcessing.current = true;

        // Remove the oauth parameters from URL
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete("oauth");
        newUrl.searchParams.delete("token");
        window.history.replaceState({}, "", newUrl.toString());

        // Validate OAuth token - single attempt
        const handleOAuthSuccess = async () => {
          try {
            console.log("🔄 Validating OAuth token...");
            const validationData = await validateOAuthToken(oauthToken);

            if (validationData.success && validationData.user) {
              console.log(
                "✅ OAuth token validation successful:",
                validationData.user
              );
              setUser(validationData.user);
              setError(null);
              setLoading(false);
              isOAuthProcessing.current = false;
              return;
            }

            // If token validation fails, try regular fetch once
            console.log("🔄 Token validation failed, trying regular fetch...");
            await fetchUser();
            isOAuthProcessing.current = false;
          } catch (error) {
            console.error("❌ OAuth handling error:", error);
            // Single fallback to regular fetch
            await fetchUser();
            isOAuthProcessing.current = false;
          }
        };

        // Start OAuth handling process
        handleOAuthSuccess();
      } else if (isOAuthSuccess) {
        // OAuth success but no token, try regular fetch once
        console.log(
          "🔄 OAuth redirect detected without token, trying regular fetch..."
        );
        isOAuthProcessing.current = true;

        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete("oauth");
        window.history.replaceState({}, "", newUrl.toString());

        // Single attempt to fetch user data
        fetchUser().finally(() => {
          isOAuthProcessing.current = false;
        });
      }
    }
  }, []);

  // Listen for storage events (when login/logout happens in another tab)
  useEffect(() => {
    const handleStorageChange = () => {
      fetchUser();
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const value = {
    user,
    loading,
    error,
    refetch,
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
