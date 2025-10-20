'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/SupbaseClient';

type AuthContextType = {
  user: User | null;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      // Sync to localStorage
      if (currentUser) {
        localStorage.setItem(
          'fortiz_user_session',
          JSON.stringify({
            id: currentUser.id,
            email: currentUser.email,
            timestamp: Date.now(),
          })
        );
      } else {
        localStorage.removeItem('fortiz_user_session');
        localStorage.removeItem('fortiz_user');
      }

      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      // Sync to localStorage on auth change
      if (currentUser) {
        localStorage.setItem(
          'fortiz_user_session',
          JSON.stringify({
            id: currentUser.id,
            email: currentUser.email,
            timestamp: Date.now(),
          })
        );
      } else {
        localStorage.removeItem('fortiz_user_session');
        localStorage.removeItem('fortiz_user');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
