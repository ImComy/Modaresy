import React, { createContext, useState, useContext, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { studentService } from '@/api/student';
import { tutorService } from '@/api/tutor';
import { apiFetch } from '@/api/apiService';
import { useTranslation } from 'react-i18next';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const { toast } = useToast();
  const { t } = useTranslation();

  const [authState, setAuthState] = useState({
    isLoggedIn: false,
    userRole: null,
    userId: null,
    userData: null,
    isLoading: true,
  });

  const login = async (email, password) => {
    console.log('Login attempt with email:', email);
    try {
      const data = await apiFetch('/users/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      const { token } = data;
      if (!token) {
        console.error('Token missing in login response');
        throw new Error('Token missing from login response');
      }

      console.log('Storing token in localStorage:', token);
      localStorage.setItem('token', token);
      await new Promise(resolve => setTimeout(resolve, 0));

      console.log('Fetching user profile...');
      let userData = null;
      try {
        userData = await studentService.getProfile();
        console.log('Student profile fetched:', userData);
      } catch (err) {
        if (err.message?.includes("user isn't a student")) {
          console.log("Not a student, trying tutor profile...");
          userData = await tutorService.getProfile();
          console.log('Tutor profile fetched:', userData);
        } else {
          throw err;
        }
      }

      const role = userData?.type || userData?.user_type || 'student';
      const newState = {
        isLoggedIn: true,
        userRole: role,
        userId: userData?._id,
        userData,
        isLoading: false,
      };
      setAuthState(newState);
      console.log('Auth state updated:', newState);

      toast({
        title: t('auth.loginSuccessTitle', 'Login Successful'),
        description: t('auth.loginSuccessDescription', { name: userData?.name || '' }),
      });
    } catch (err) {
      console.error('Login failed:', err.message || 'Invalid credentials');
      toast({
        title: t('auth.loginFailedTitle', 'Login Failed'),
        description: err.message
          ? t('auth.loginFailedDescription', { message: err.message })
          : t('auth.invalidCredentials', 'Invalid credentials'),
        variant: 'destructive',
      });
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setAuthState({
      isLoggedIn: false,
      userRole: null,
      userId: null,
      userData: null,
      isLoading: false,
    });

    toast({
      title: t('auth.loggedOutTitle', 'Logged out'),
      description: t('auth.loggedOutDescription', 'You have been logged out'),
    });
  };

  const updatePassword = async (currentPassword, newPassword) => {
    try {
      const response = await apiFetch('/users/updatePassword', {
        method: 'POST',
        body: JSON.stringify({ currentPassword, newPassword }),
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      toast({
        title: t('auth.passwordUpdateSuccessTitle', 'Success'),
        description: response?.message
          ? response.message
          : t('auth.passwordUpdateSuccessDescription', 'Password updated successfully'),
      });
      return response;
    } catch (err) {
      console.error('Password update failed:', err.message);
      toast({
        title: t('auth.passwordUpdateFailedTitle', 'Password Update Failed'),
        description: err.message
          ? t('auth.passwordUpdateFailedDescription', { message: err.message })
          : t('auth.passwordUpdateFailedDescription', 'Failed to update password'),
        variant: 'destructive',
      });
      throw err;
    }
  };

  const updateUserData = (newUserData) => {
    setAuthState(prev => ({
      ...prev,
      userData: { ...prev.userData, ...newUserData },
    }));
    console.log('User data updated in authState:', newUserData);
  };

  useEffect(() => {
    const checkSession = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setAuthState(prev => ({ ...prev, isLoading: false }));
        return;
      }

      try {
        let userData = null;
        try {
          userData = await studentService.getProfile();
        } catch (err) {
          userData = await tutorService.getProfile();
        }

        const role = userData?.type || userData?.user_type || 'student';
        setAuthState({
          isLoggedIn: true,
          userRole: role,
          userId: userData?._id,
          userData,
          isLoading: false,
        });
        console.log('Session check completed, auth state:', { isLoggedIn: true, userRole: role, userId: userData?._id, userData });
      } catch (err) {
        console.error('Session check failed:', err);
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    };

    checkSession();
  }, []);

  return (
    <AuthContext.Provider value={{ authState, login, logout, updatePassword, updateUserData }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
