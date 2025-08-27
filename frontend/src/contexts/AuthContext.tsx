import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '../config/supabase';
import { verifySupabaseJWT, extractUserFromJWT } from '../utils/jwtVerification';

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
    if (!supabase) {
      console.error('Supabase client not initialized');
      return null;
    }
    
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
    if (!supabase) {
      return { error: { message: 'Authentication service not available' } as AuthError };
    }
    
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
    if (!supabase) {
      return { error: { message: 'Authentication service not available' } as AuthError };
    }
    
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
    if (!supabase) {
      // Just clear local state if no supabase client
      setUser(null);
      setProfile(null);
      setSession(null);
      localStorage.removeItem('authToken');
      sessionStorage.removeItem('authToken');
      return { error: undefined };
    }
    
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

    // Always try to save to Supabase first, fall back to localStorage if it fails
    if (supabase) {
      try {
        // First, check if profile exists in Supabase
        const { data: existingProfile } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('email', user.email || profile?.email)
          .single();

      if (existingProfile) {
        // Update existing profile
        const { error } = await supabase
          .from('user_profiles')
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq('email', user.email || profile?.email);

        if (!error) {
          setProfile({ ...profile, ...updates } as UserProfile);
          localStorage.setItem('userProfile', JSON.stringify({ ...profile, ...updates }));
          return { error: undefined };
        }
      } else {
        // Create new profile in Supabase
        const newProfile = {
          id: user.id,
          email: user.email || profile?.email || '',
          ...updates,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        const { error } = await supabase
          .from('user_profiles')
          .insert([newProfile]);

        if (!error) {
          setProfile(newProfile as UserProfile);
          localStorage.setItem('userProfile', JSON.stringify(newProfile));
          return { error: undefined };
        }
      }
      } catch (error) {
        console.log('Supabase save failed, using localStorage:', error);
      }
    }

    // Fallback to localStorage only
    const updatedProfile = { 
      ...profile, 
      ...updates,
      updated_at: new Date().toISOString() 
    };
    
    setProfile(updatedProfile as UserProfile);
    localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
    
    return { error: undefined };
  };

  useEffect(() => {
    // Check for stored direct access token first
    const storedToken = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    
    if (storedToken && storedToken.startsWith('eyJ')) { // JWT tokens start with eyJ
      // Verify the token properly using JWKS
      verifySupabaseJWT(storedToken).then(({ valid, payload, error }) => {
        if (valid && payload) {
          // Extract user from verified JWT
          const userInfo = extractUserFromJWT(payload);
          
          setUser({
            id: userInfo.id,
            email: userInfo.email,
            app_metadata: userInfo.app_metadata,
            user_metadata: userInfo.user_metadata,
            aud: 'authenticated',
            created_at: new Date().toISOString()
          } as any);
          
          // Check if we have a saved profile in localStorage
          const savedProfile = localStorage.getItem('userProfile');
          if (savedProfile) {
            try {
              const parsedProfile = JSON.parse(savedProfile);
              setProfile(parsedProfile);
            } catch {
              // Fallback to default profile
              setProfile({
                id: userInfo.id,
                email: userInfo.email,
                full_name: userInfo.user_metadata?.full_name || 'Direct Auth User',
                company_name: userInfo.user_metadata?.company_name || 'The Well',
                role: userInfo.role || 'authenticated',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              });
            }
          } else {
            // Try to fetch profile from Supabase first
            fetchProfile(userInfo.id).then(fetchedProfile => {
              if (fetchedProfile) {
                setProfile(fetchedProfile);
                localStorage.setItem('userProfile', JSON.stringify(fetchedProfile));
              } else {
                // Create default profile
                const defaultProfile = {
                  id: userInfo.id,
                  email: userInfo.email,
                  full_name: userInfo.user_metadata?.full_name || 'Direct Auth User',
                  company_name: userInfo.user_metadata?.company_name || 'The Well',
                  role: userInfo.role || 'authenticated',
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                };
                setProfile(defaultProfile);
                localStorage.setItem('userProfile', JSON.stringify(defaultProfile));
              }
            });
          }
          
          setLoading(false);
          return;
        } else {
          console.error('JWT verification failed:', error);
          // Clear invalid token
          localStorage.removeItem('authToken');
          sessionStorage.removeItem('authToken');
        }
      }).catch(error => {
        console.error('Error verifying JWT:', error);
      });
      
      // Don't continue to Supabase session check if we're processing a JWT
      return;
    }
    
    // Get initial session from Supabase if client is available
    if (supabase) {
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
    } else {
      // No supabase client - just mark as not loading
      setLoading(false);
    }
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