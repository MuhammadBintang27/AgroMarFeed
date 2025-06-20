'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@/types';
import { getCurrentUser } from '@/lib/auth';

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
      console.log('Auth response:', response); // Debug log
      
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
        console.log('No user data found in response');
        setUser(null);
      }
    } catch (err) {
      console.error('Error fetching user:', err);
      setError('Failed to fetch user');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const value = {
    user,
    loading,
    error,
    refetch: fetchUser,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
} 