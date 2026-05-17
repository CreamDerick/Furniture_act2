import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, profileAPI, Profile } from '../services/api';

interface AuthContextType {
  user: Profile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, role: 'admin' | 'user') => Promise<string | null>;
  signUp: (username: string, email: string, password: string) => Promise<string | null>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<Omit<Profile, 'id' | 'role' | 'created_at'>>) => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Restore session on initial load
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const session = await authAPI.getCurrentSession();
        if (session) {
          // Fetch freshest profile metadata
          const freshProfile = await profileAPI.get(session.id);
          setUser(freshProfile);
        }
      } catch (err) {
        console.error('Failed to restore active session', err);
      } finally {
        setIsLoading(false);
      }
    };
    restoreSession();
  }, []);

  const login = async (email: string, password: string, role: 'admin' | 'user'): Promise<string | null> => {
    setIsLoading(true);
    try {
      const { user: loggedUser, error } = await authAPI.login(email, password, role);
      if (error) {
        setIsLoading(false);
        return error;
      }
      setUser(loggedUser);
      setIsLoading(false);
      return null;
    } catch (err: any) {
      setIsLoading(false);
      return err.message || 'Login attempt failed unexpectedly.';
    }
  };

  const signUp = async (username: string, email: string, password: string): Promise<string | null> => {
    setIsLoading(true);
    try {
      const { user: registeredUser, error } = await authAPI.signUp(username, email, password);
      if (error) {
        setIsLoading(false);
        return error;
      }
      setUser(registeredUser);
      setIsLoading(false);
      return null;
    } catch (err: any) {
      setIsLoading(false);
      return err.message || 'Registration failed unexpectedly.';
    }
  };

  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await authAPI.logout();
      setUser(null);
    } catch (err) {
      console.error('Logout error occurred', err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<Omit<Profile, 'id' | 'role' | 'created_at'>>): Promise<string | null> => {
    if (!user) return 'No authenticated session found.';
    
    try {
      const updatedProfile = await profileAPI.update(user.id, updates, user.role);
      setUser(updatedProfile);
      return null;
    } catch (err: any) {
      return err.message || 'Profile modification was rejected.';
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        signUp,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be called within an AuthProvider scope.');
  }
  return context;
};
