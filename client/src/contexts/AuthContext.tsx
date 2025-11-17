import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, apiClient } from '../api';

export type UserRole = 'doctor' | 'researcher' | 'patient' | 'admin';

interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  license_number?: string;
  institution?: string;
  specialization?: string;
}

interface SignupData {
  fullName: string;
  email: string;
  password: string;
  role: UserRole;
  licenseNumber?: string;
  institution?: string;
  specialization?: string;
}

interface LoginOptions {
  remember?: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role: UserRole, options?: LoginOptions) => Promise<boolean>;
  signup: (data: SignupData) => Promise<boolean>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Using the centralized API client from api.ts

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await authAPI.getCurrentUser();
        
        if (response.data && response.status === 200) {
          const userData = response.data;
          setUser({
            id: userData.id.toString(),
            email: userData.email,
            full_name: userData.full_name,
            role: userData.role as UserRole,
            license_number: userData.license_number,
            institution: userData.institution,
            specialization: userData.specialization
          });
        } else {
          apiClient.removeToken();
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        apiClient.removeToken();
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (
    email: string,
    password: string,
    role: UserRole,
    options?: LoginOptions
  ): Promise<boolean> => {
    try {
      const response = await authAPI.login({ email, password, role }, { persistSession: options?.remember });

      if (response.error) {
        console.error('Login failed:', response.error);
        throw new Error(response.error);
      }

      if (response.data?.access_token) {
        // Token is already set in authAPI.login, now fetch user data
        const userResponse = await authAPI.getCurrentUser();
        
        if (userResponse.data && userResponse.status === 200) {
          const userData = userResponse.data;
          setUser({
            id: userData.id.toString(),
            email: userData.email,
            full_name: userData.full_name,
            role: userData.role as UserRole,
            license_number: userData.license_number,
            institution: userData.institution,
            specialization: userData.specialization
          });
          return true;
        }
      }
      
      throw new Error('Failed to fetch user data');
    } catch (error) {
      console.error('Login failed:', error);
      throw error; // Re-throw to handle in component
    }
  };

  const signup = async (data: SignupData): Promise<boolean> => {
    try {
      const response = await authAPI.signup({
        email: data.email,
        full_name: data.fullName,
        password: data.password,
        role: data.role,
        license_number: data.licenseNumber,
        institution: data.institution,
        specialization: data.specialization
      });

      if (response.error) {
        console.error('Signup failed:', response.error);
        return false;
      }

      // After signup, log the user in
      return await login(data.email, data.password, data.role);
    } catch (error) {
      console.error('Signup failed:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      // Call logout API
      await authAPI.logout();
    } catch (error) {
      console.error('Logout API failed:', error);
    } finally {
      // Always clean up locally
      setUser(null);
      apiClient.removeToken();
    }
  };

  if (isLoading) {
    // You could return a loading component here
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{
      user,
      login,
      signup,
      logout,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
};