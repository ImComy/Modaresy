import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '@/api/authentication'; // Import your real API
import { useToast } from '@/components/ui/use-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const { toast } = useToast();

  const [authState, setAuthState] = useState({
    isLoggedIn: false,
    userRole: null, // 'Student' or 'Teacher' or 'Admin'
    userId: null,
    userData: null, // full profile data
    loading: true,  // for global loading state
  });

  // Real login function using authService
  const login = async (email, password) => {
    try {
      await authService.login(email, password); // backend sets cookie

      const userData = await authService.getProfile(); // fetch user data
      setAuthState({
        isLoggedIn: true,
        userRole: userData?.type,
        userId: userData?._id,
        userData,
        loading: false,
      });

      toast({ title: 'Login Successful', description: `Welcome ${userData.name}` });

    } catch (err) {
      toast({
        title: 'Login Failed',
        description: err.message || 'Invalid credentials',
        variant: 'destructive',
      });
      throw err; // rethrow for form to handle
    }
  };

  const logout = async () => {
    try {
      await authService.logout(); // clear cookie on backend

      setAuthState({
        isLoggedIn: false,
        userRole: null,
        userId: null,
        userData: null,
        loading: false,
      });

      toast({ title: 'Logged out', description: 'You have been logged out' });

    } catch (err) {
      toast({
        title: 'Logout Failed',
        description: err.message || 'Please try again',
        variant: 'destructive',
      });
    }
  };

  // Auto-login on page reload (via cookie + API)
  useEffect(() => {
    const checkSession = async () => {
      try {
        const userData = await authService.getProfile();
        setAuthState({
          isLoggedIn: true,
          userRole: userData?.type,
          userId: userData?._id,
          userData,
          loading: false,
        });
      } catch {
        setAuthState(prev => ({ ...prev, loading: false }));
      }
    };

    checkSession();
  }, []);

  return (
    <AuthContext.Provider value={{ authState, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
