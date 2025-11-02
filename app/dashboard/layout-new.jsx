'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const UserContext = createContext(null);

export const useUser = () => {
  const context = useContext(UserContext);
  return context;
};

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (!res.ok) {
        router.push('/auth/login');
        return;
      }
      const data = await res.json();
      console.log('🔍 User data from API:', data.user);
      console.log('🔍 Display name:', data.user?.displayName);
      console.log('🔍 Email:', data.user?.email);
      setUser(data.user);
    } catch (error) {
      console.error('Auth check error:', error);
      router.push('/auth/login');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500 text-lg">Loading...</p>
      </div>
    );
  }

  // ✅ Use Context instead of cloneElement
  console.log('🔍 Layout providing user to context:', user);
  return (
    <UserContext.Provider value={user}>
      {children}
    </UserContext.Provider>
  );
}