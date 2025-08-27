import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '../config/supabase';

interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  company_name: string | null;
  role: string;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  signInWithOTP: (email: string) => Promise<{ error?: AuthError }>;
  verifyOTP: (email: string, token: string) => Promise<{ error?: AuthError }>;
  signOut: () => Promise<{ error?: AuthError }>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error?: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }

      return data as UserProfile;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  };

  const signInWithOTP = async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
        data: {
          email: email
        }
      }
    });
    return { error: error || undefined };
  };

  const verifyOTP = async (email: string, token: string) => {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email'
    });
    
    // Store the access token in localStorage if authentication succeeds
    if (data?.session?.access_token) {
      localStorage.setItem('authToken', data.session.access_token);
      sessionStorage.setItem('authToken', data.session.access_token);
    }
    
    return { error: error || undefined };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      setUser(null);
      setProfile(null);
      setSession(null);
      // Clear auth tokens from storage
      localStorage.removeItem('authToken');
      sessionStorage.removeItem('authToken');
    }
    return { error: error || undefined };
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return { error: 'No user logged in' };

    const { error } = await supabase
      .from('user_profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', user.id);

    if (!error && profile) {
      setProfile({ ...profile, ...updates });
    }

    return { error };
  };

  useEffect(() => {
    // Check for stored direct access token first
    const storedToken = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    
    if (storedToken && storedToken.startsWith('eyJ')) { // JWT tokens start with eyJ
      // Try to decode the token to get user info
      try {
        const payload = JSON.parse(atob(storedToken.split('.')[1]));
        if (payload.exp && payload.exp > Date.now() / 1000) {
          // Token is valid, create a mock user
          setUser({
            id: payload.sub || 'direct-auth-user',
            email: payload.email || 'user@thewell.solutions',
            app_metadata: payload.app_metadata || {},
            user_metadata: payload.user_metadata || {},
            aud: payload.aud || 'authenticated',
            created_at: new Date().toISOString()
          } as any);
          
          setProfile({
            id: payload.sub || 'direct-auth-user',
            email: payload.email || 'user@thewell.solutions',
            full_name: 'Direct Auth User',
            company_name: 'The Well',
            role: 'authenticated',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
          
          setLoading(false);
          return;
        }
      } catch (e) {
        console.log('Invalid token format, checking Supabase session');
      }
    }
    
    // Get initial session from Supabase
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        // Store access token from existing session
        if (session.access_token) {
          localStorage.setItem('authToken', session.access_token);
          sessionStorage.setItem('authToken', session.access_token);
        }
        fetchProfile(session.user.id).then(setProfile);
      }
      
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        // Store access token when session changes
        if (session.access_token) {
          localStorage.setItem('authToken', session.access_token);
          sessionStorage.setItem('authToken', session.access_token);
        }
        
        const userProfile = await fetchProfile(session.user.id);
        setProfile(userProfile);
      } else {
        // Clear tokens on logout
        localStorage.removeItem('authToken');
        sessionStorage.removeItem('authToken');
        setProfile(null);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const value: AuthContextType = {
    user,
    profile,
    session,
    loading,
    signInWithOTP,
    verifyOTP,
    signOut,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};